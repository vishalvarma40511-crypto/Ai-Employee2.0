const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Customer, Product, Order, SMSLog, SMSTemplate, Settings } = require('../models/Schemas');
const invoiceRouter = require('./invoices');
router.use('/invoice', invoiceRouter);
const { processAutomaticInvoicing } = require('../utils/invoiceProcessor');

// ─── Fallback DB Helpers ────────────────────────────────────────────────────
const FALLBACK_DB_PATH = path.join(__dirname, '../db_fallback.json');

function loadFallbackDb() {
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    const defaultData = {
      customers: [
        {
          _id: "c-default-1",
          name: "Vishal",
          email: "vishal@gmail.com",
          password: "password123",
          phone: "+91 98765 43210",
          address: "Sector 62, Noida, UP, India",
          rewardsPoints: 250,
          wishlist: []
        }
      ],
      products: [
        {
          _id: "p-default-1",
          name: 'Wireless Earbuds X1',
          category: 'Electronics',
          stock: 45,
          minStock: 8,
          price: 2499,
          cost: 1100,
          sku: 'SKU-ELECT-E12',
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
          rating: 4.8
        },
        {
          _id: "p-default-2",
          name: 'Classic Running Shoes',
          category: 'Apparel',
          stock: 12,
          minStock: 5,
          price: 3999,
          cost: 1600,
          sku: 'SKU-APP-SH04',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
          rating: 4.6
        },
        {
          _id: "p-default-3",
          name: 'Organic Green Tea Bag Pack',
          category: 'Groceries',
          stock: 150,
          minStock: 20,
          price: 299,
          cost: 100,
          sku: 'SKU-GROC-GT55',
          image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80',
          rating: 4.5
        },
        {
          _id: "p-default-4",
          name: 'Paracetamol 650mg Sterile Pack',
          category: 'Medical',
          stock: 80,
          minStock: 15,
          price: 49,
          cost: 12,
          sku: 'SKU-MED-P098',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
          rating: 4.7
        }
      ],
      orders: [],
      smslogs: [],
      smstemplates: [
        {
          category: 'order_placed',
          templateText: 'AI Employee: Hello {{customer}}, your order {{order}} has been placed successfully. Items: {{items}} - Total: ₹{{amount}}. Estimated Delivery: {{delivery}}. Track your order: {{tracking}}'
        },
        {
          category: 'order_shipped',
          templateText: 'Your order {{order}} has been shipped via Blue Dart. Courier: Blue Dart. Tracking ID: {{tracking}}'
        },
        {
          category: 'out_for_delivery',
          templateText: 'Good News! Your order {{order}} is Out For Delivery today. Expected today before 8 PM. Track: {{tracking}}'
        },
        {
          category: 'order_delivered',
          templateText: 'Your order {{order}} has been delivered successfully. Thank you for shopping with Quantum Stores. Please rate your review experience: {{tracking}}'
        },
        {
          category: 'offline_billing',
          templateText: 'Thank you for shopping at AI Employee Store. Invoice: {{order}}. Amount: ₹{{amount}}. Items: {{items}}. Visit Again!'
        }
      ]
    };
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(FALLBACK_DB_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveFallbackDb(data) {
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}


// ─── GET Email Settings ────────────────────────────────────────────────
router.get('/settings/email', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let settings = await Settings.findOne({ key: 'store' });
      if (!settings) settings = { ownerEmail: '', storeName: '', storePhone: '', storeAddress: '', websiteUrl: '', emailConfigured: false };
      return res.json({
        ownerEmail: settings.ownerEmail || '',
        storeName: settings.storeName || '',
        storePhone: settings.storePhone || '',
        storeAddress: settings.storeAddress || '',
        websiteUrl: settings.websiteUrl || '',
        emailConfigured: !!(settings.ownerEmail && settings.ownerEmailPass)
      });
    }
    // Fallback DB
    const db = loadFallbackDb();
    const s = db.settings || {};
    return res.json({
      ownerEmail: s.ownerEmail || '',
      storeName: s.storeName || '',
      storePhone: s.storePhone || '',
      storeAddress: s.storeAddress || '',
      websiteUrl: s.websiteUrl || '',
      emailConfigured: !!(s.ownerEmail && s.ownerEmailPass)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SAVE Email Settings ───────────────────────────────────────────────
router.post('/settings/email', async (req, res) => {
  try {
    const { ownerEmail, ownerEmailPass, storeName, storePhone, storeAddress, websiteUrl } = req.body;
    if (!ownerEmail) return res.status(400).json({ error: 'Owner email is required' });

    const update = {
      ownerEmail,
      storeName: storeName || 'Alfa Store',
      storePhone: storePhone || '',
      storeAddress: storeAddress || '',
      websiteUrl: websiteUrl || process.env.SITE_URL || process.env.WEBSITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''),
      updatedAt: new Date()
    };
    if (ownerEmailPass) update.ownerEmailPass = ownerEmailPass; // Only update if provided

    if (mongoose.connection.readyState === 1) {
      await Settings.findOneAndUpdate({ key: 'store' }, update, { upsert: true, new: true });
    } else {
      const db = loadFallbackDb();
      db.settings = { ...(db.settings || {}), key: 'store', ...update };
      saveFallbackDb(db);
    }

    return res.json({ success: true, message: 'Email settings saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TEST Email Settings ───────────────────────────────────────────────
router.post('/settings/email/test', async (req, res) => {
  try {
    const nodemailerLib = require('nodemailer');
    const { getEmailCredentials } = require('../services/emailService');
    const creds = await getEmailCredentials();

    if (!creds.email || !creds.pass) {
      return res.status(400).json({ error: 'Email credentials not configured. Please save your Gmail and App Password first.' });
    }

    let transporter;
    if (creds.host === 'smtp.gmail.com') {
      transporter = nodemailerLib.createTransport({
        service: 'gmail',
        auth: { user: creds.email, pass: creds.pass }
      });
    } else {
      transporter = nodemailerLib.createTransport({
        host: creds.host,
        port: creds.port,
        secure: creds.port === 465,
        auth: { user: creds.email, pass: creds.pass },
        tls: { rejectUnauthorized: false }
      });
    }

    await transporter.sendMail({
      from: `"${creds.storeName}" <${creds.email}>`,
      to: creds.email,
      subject: `✅ Test Email — ${creds.storeName} Invoice System`,
      html: `<div style="font-family:sans-serif;padding:20px;"><h2 style="color:#06b6d4;">Email System Working!</h2><p>Your <strong>${creds.storeName}</strong> invoice email system is correctly configured.</p><p>All future customer invoices will be sent automatically from <strong>${creds.email}</strong>.</p></div>`
    });

    return res.json({ success: true, message: `Test email sent to ${creds.email}. Please check your inbox.` });
  } catch (err) {
    return res.status(500).json({ error: `SMTP Error: ${err.message}` });
  }
});

// ─── RESET SYSTEM DATA ────────────────────────────────────────────────
router.post('/settings/reset', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.model('Settings').deleteMany({});
      await mongoose.model('Invoice').deleteMany({});
      await mongoose.model('EmailLog').deleteMany({});
      await mongoose.model('Counter').deleteMany({});
      await mongoose.model('Order').deleteMany({});
      await mongoose.model('Product').deleteMany({});
      await mongoose.model('SMSLog').deleteMany({});
    }

    // Clean generated invoice PDFs
    const pdfDir = path.join(__dirname, '../public/uploads/pdf');
    if (fs.existsSync(pdfDir)) {
      const files = fs.readdirSync(pdfDir);
      for (const file of files) {
        try { fs.unlinkSync(path.join(pdfDir, file)); } catch {}
      }
    }

    // Restore fallback JSON database
    const defaultData = {
      customers: [
        {
          _id: "c-default-1",
          name: "Vishal",
          email: "vishal@gmail.com",
          password: "password123",
          phone: "+91 98765 43210",
          address: "Sector 62, Noida, UP, India",
          rewardsPoints: 250,
          wishlist: []
        }
      ],
      products: [
        {
          _id: "p-default-1",
          name: 'Wireless Earbuds X1',
          category: 'Electronics',
          stock: 45,
          minStock: 8,
          price: 2499,
          cost: 1100,
          sku: 'SKU-ELECT-E12',
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
          rating: 4.8
        },
        {
          _id: "p-default-2",
          name: 'Classic Running Shoes',
          category: 'Apparel',
          stock: 12,
          minStock: 5,
          price: 3999,
          cost: 1600,
          sku: 'SKU-APP-SH04',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
          rating: 4.6
        },
        {
          _id: "p-default-3",
          name: 'Organic Green Tea Bag Pack',
          category: 'Groceries',
          stock: 150,
          minStock: 20,
          price: 299,
          cost: 100,
          sku: 'SKU-GROC-GT55',
          image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80',
          rating: 4.5
        },
        {
          _id: "p-default-4",
          name: 'Paracetamol 650mg Sterile Pack',
          category: 'Medical',
          stock: 80,
          minStock: 15,
          price: 49,
          cost: 12,
          sku: 'SKU-MED-P098',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
          rating: 4.7
        }
      ],
      orders: [],
      smslogs: [],
      smstemplates: [
        {
          category: 'order_placed',
          templateText: 'AI Employee: Hello {{customer}}, your order {{order}} has been placed successfully. Items: {{items}} - Total: ₹{{amount}}. Estimated Delivery: {{delivery}}. Track your order: {{tracking}}'
        },
        {
          category: 'order_shipped',
          templateText: 'Your order {{order}} has been shipped via Blue Dart. Courier: Blue Dart. Tracking ID: {{tracking}}'
        },
        {
          category: 'out_for_delivery',
          templateText: 'Good News! Your order {{order}} is Out For Delivery today. Expected today before 8 PM. Track: {{tracking}}'
        },
        {
          category: 'order_delivered',
          templateText: 'Your order {{order}} has been delivered successfully. Thank you for shopping with Quantum Stores. Please rate your review experience: {{tracking}}'
        },
        {
          category: 'offline_billing',
          templateText: 'Thank you for shopping at AI Employee Store. Invoice: {{order}}. Amount: ₹{{amount}}. Items: {{items}}. Visit Again!'
        }
      ]
    };
    saveFallbackDb(defaultData);

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order_created', null); // Trigger reload in frontend listeners
      io.emit('db_updated');
    }

    res.json({ success: true, message: 'System data reset to initial state successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicates removed. loadFallbackDb and saveFallbackDb are declared at the top.

// Helper to compile SMS text replacements from templates
async function sendSmsNotification(phone, category, replacements, io) {
  try {
    let templateText = `Category: ${category}. Details: {{order}}`;
    
    // Get custom template
    if (mongoose.connection.readyState === 1) {
      const template = await SMSTemplate.findOne({ category });
      if (template) templateText = template.templateText;
    } else {
      const db = loadFallbackDb();
      const template = db.smstemplates.find(t => t.category === category);
      if (template) templateText = template.templateText;
    }

    let msg = templateText;
    Object.entries(replacements).forEach(([key, val]) => {
      msg = msg.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });

    let cleanPhone = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }
    if (formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone;
    } else if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!phone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    } else {
      formattedPhone = phone.trim();
    }

    let smsStatus = 'Sent';
    let details = 'Delivered via Local SMS Gateway Simulator';

    // Twilio configurations
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (sid && token && fromPhone && formattedPhone.startsWith('+')) {
      try {
        const client = twilio(sid, token);
        const twilioMsg = await client.messages.create({
          body: msg,
          from: fromPhone,
          to: formattedPhone
        });
        smsStatus = 'Delivered';
        details = `Twilio Message SID: ${twilioMsg.sid}`;
      } catch (err) {
        smsStatus = 'Failed';
        details = `Twilio Error: ${err.message}`;
      }
    } else {
      // Textbelt free carrier fallback
      if (formattedPhone.startsWith('+')) {
        try {
          const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
          const res = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              number: formattedPhone,
              message: msg,
              key: 'textbelt'
            })
          });
          const textbeltData = await res.json();
          if (textbeltData.success) {
            smsStatus = 'Delivered';
            details = `Textbelt Free route. Quota left: ${textbeltData.quotaRemaining}`;
          } else {
            smsStatus = 'Rate Limited';
            details = `Textbelt limits: ${textbeltData.error}`;
          }
        } catch (e) {
          smsStatus = 'Simulator';
          details = `Gateway error: ${e.message}`;
        }
      }
    }

    // Save logs to database
    if (mongoose.connection.readyState === 1) {
      const logEntry = new SMSLog({
        recipient: formattedPhone,
        message: msg,
        status: smsStatus,
        details
      });
      await logEntry.save();
      if (io) io.emit('sms_log_added', logEntry);
    } else {
      const db = loadFallbackDb();
      const logEntry = {
        _id: 'l-' + Date.now(),
        recipient: formattedPhone,
        message: msg,
        status: smsStatus,
        details,
        timestamp: new Date().toISOString()
      };
      db.smslogs.unshift(logEntry);
      saveFallbackDb(db);
      if (io) io.emit('sms_log_added', logEntry);
    }

    // Slide-in floating smartphone widget notify trigger
    if (io) {
      io.emit('sms_received', { phone: formattedPhone, body: msg });
    }
  } catch (error) {
    console.error('SMS notification error:', error);
  }
}

// Helper to generate a PDF invoice in-memory buffer using pdfkit
function generatePdfInvoiceBuffer(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header block
      doc.fontSize(20).text('QUANTUM STORES', { align: 'center' });
      doc.fontSize(10).text('DLF CyberCity, Gurgaon, Haryana, India', { align: 'center' });
      doc.moveDown(2);

      // Metadata block
      doc.fontSize(12).text(`Invoice Number: ${order.orderNumber || 'N/A'}`, { bold: true });
      doc.text(`Date & Time: ${new Date(order.timestamp).toLocaleString()}`);
      doc.text(`Payment Mode: ${order.paymentMethod || 'N/A'}`);
      doc.text(`Courier Service: ${order.courier || 'In-Store Pickup'}`);
      doc.moveDown(1.5);

      // Customer Details
      doc.fontSize(11).text('Billed To:', { underline: true });
      doc.text(`Name: ${order.customerName}`);
      doc.text(`Phone: ${order.phone || 'N/A'}`);
      doc.text(`Email: ${order.email || 'N/A'}`);
      if (order.address) {
        doc.text(`Address: ${order.address}`);
      }
      doc.moveDown(2);

      // Table Header row
      let y = doc.y;
      doc.fontSize(10).text('Description', 50, y, { bold: true });
      doc.text('Qty', 280, y, { bold: true });
      doc.text('Price', 350, y, { bold: true, align: 'right', width: 60 });
      doc.text('Total', 430, y, { bold: true, align: 'right', width: 80 });
      doc.moveDown();
      doc.strokeColor('#ddd').moveTo(50, doc.y).lineTo(510, doc.y).stroke();
      doc.moveDown(0.5);

      // Items list
      order.products.forEach(item => {
        y = doc.y;
        doc.fontSize(10).text(item.productName, 50, y);
        doc.text(item.quantity.toString(), 280, y);
        doc.text(`Rs.${item.price.toFixed(2)}`, 350, y, { align: 'right', width: 60 });
        doc.text(`Rs.${(item.price * item.quantity).toFixed(2)}`, 430, y, { align: 'right', width: 80 });
        doc.moveDown();
      });

      doc.moveDown(1.5);
      doc.strokeColor('#ddd').moveTo(50, doc.y).lineTo(510, doc.y).stroke();
      doc.moveDown(1.5);

      // Totals block
      const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const tax = subtotal * 0.18;
      const grandTotal = subtotal + tax;

      doc.text(`Subtotal: Rs.${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, { align: 'right' });
      doc.text(`CGST/SGST Tax (18%): Rs.${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, { align: 'right' });
      doc.fontSize(12).text(`Grand Total: Rs.${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, { align: 'right', bold: true });

      doc.moveDown(3);
      doc.fontSize(9).text('--- Store Contact Info ---', { align: 'center', color: '#666' });
      doc.text('Phone: +91 124 456 7890 | Email: support@quantumstores.com', { align: 'center' });
      doc.text('Thank you for shopping with Quantum Stores. Visit Again!', { align: 'center', bold: true });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// Helper to send invoice email with PDF attachment using nodemailer
async function _sendInvoiceEmail(order) {
  const emailUser = process.env.EMAIL_USER || 'vishal.quantum@gmail.com';
  const emailPass = process.env.EMAIL_PASS;

  const itemsHtml = order.products.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const emailBodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; border-bottom: 2px solid #06b6d4; padding-bottom: 20px;">
        <h2 style="color: #06b6d4; margin: 0; font-size: 24px; text-transform: uppercase;">Quantum Stores Invoice</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">DLF CyberCity, Gurgaon, Haryana, India</p>
      </div>

      <div style="margin: 20px 0; color: #444; font-size: 14px; line-height: 1.5;">
        <p>Dear <strong>${order.customerName}</strong>,</p>
        <p>Thank you for shopping at Quantum Stores! Your transaction has been processed successfully. Below is the invoice details for your records.</p>
        
        <table style="width: 100%; font-size: 13px; margin: 15px 0; color: #555;">
          <tr><td><strong>Order/Invoice ID:</strong></td><td>${order.orderNumber}</td></tr>
          <tr><td><strong>Date & Time:</strong></td><td>${new Date(order.timestamp).toLocaleString()}</td></tr>
          <tr><td><strong>Payment Mode:</strong></td><td>${order.paymentMethod}</td></tr>
          <tr><td><strong>Courier Channel:</strong></td><td>${order.courier || 'In-Store Pickup'}</td></tr>
        </table>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; color: #444;">
        <thead>
          <tr style="background-color: #f9f9f9;">
            <th style="padding: 8px; border-bottom: 2px solid #ddd;">Description</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
            <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right; font-size: 13px; color: #555;">
        <p style="margin: 5px 0;">Subtotal: <strong>₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
        <p style="margin: 5px 0;">CGST/SGST Taxes (18%): <strong>₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
        <p style="margin: 5px 0; font-size: 16px; color: #06b6d4;">Grand Total: <strong>₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #777; text-align: center; line-height: 1.5;">
        <p><strong>Store Contact Info:</strong></p>
        <p>📞 Phone: +91 124 456 7890 | ✉️ Email: support@quantumstores.com</p>
        <p>📍 Location: Building 10, Tower B, Phase 3, Gurgaon, Haryana, India</p>
        <p style="color: #22c55e; font-weight: bold; margin-top: 10px;">★ Thank you for choosing Quantum Stores! Visit Again! ★</p>
      </div>
    </div>
  `;

  let transporter;

  if (emailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  } else {
    console.log(`[Email Simulator] No EMAIL_PASS set in .env. Mocking SMTP message send to ${order.email || 'buyer@gmail.com'}...`);
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch {
      console.log('[Email Simulator] Ethereal fallback failed. Outputting mock logs.');
      return;
    }
  }

  try {
    const pdfBuffer = await generatePdfInvoiceBuffer(order);
    const mailOptions = {
      from: `"Quantum Stores Invoicing" <${emailUser}>`,
      to: order.email || 'buyer@gmail.com',
      cc: emailUser,
      subject: `Receipt for Order ${order.orderNumber} - Quantum Stores`,
      html: emailBodyHtml,
      attachments: [
        {
          filename: `invoice-${order.orderNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Gateway] Message sent successfully: ${info.messageId}`);
    if (!emailPass) {
      console.log(`[Email Simulator] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('[Email Gateway] Error occurred while sending email:', error);
  }
}

// 1. CUSTOMER PORTAL AUTHENTICATION
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      const existing = db.customers.find(c => c.email === email);
      if (existing) return res.status(400).json({ error: 'Customer already registered.' });

      const customer = {
        _id: 'c-' + Date.now(),
        name,
        email,
        password,
        phone: phone || '+91 99999 88888',
        address: address || 'Sector 62, Noida, India',
        rewardsPoints: 250,
        wishlist: []
      };
      db.customers.push(customer);
      saveFallbackDb(db);

      const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'secret');
      return res.json({ token, customer });
    }

    const existing = await Customer.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Customer already registered.' });

    const customer = new Customer({ name, email, password, phone, address });
    await customer.save();

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      const customer = db.customers.find(c => c.email === email && c.password === password);
      if (!customer) return res.status(401).json({ error: 'Invalid coordinates' });

      const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'secret');
      return res.json({ token, customer });
    }

    const customer = await Customer.findOne({ email });
    if (!customer || customer.password !== password) {
      return res.status(401).json({ error: 'Invalid coordinates' });
    }

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/social', async (req, res) => {
  try {
    const { email, name, provider, socialId } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing social profile coordinates.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      let customer = db.customers.find(c => c.email === email);
      if (!customer) {
        customer = {
          _id: 'c-' + Date.now(),
          name,
          email,
          password: `${provider}-auth-bypass-${socialId}`,
          phone: '+91 99999 88888',
          address: 'Sector 62, Noida, India',
          rewardsPoints: 250,
          wishlist: []
        };
        db.customers.push(customer);
        saveFallbackDb(db);
      }

      const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'secret');
      return res.json({ token, customer });
    }

    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = new Customer({
        name,
        email,
        password: `${provider}-auth-bypass-${socialId}`,
        phone: '+91 99999 88888',
        address: 'Sector 62, Noida, India'
      });
      await customer.save();
    }

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. PRODUCTS CATALOG
router.get('/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      return res.json(db.products);
    }
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Request body must be an array of products' });
    }

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      db.products = products;
      saveFallbackDb(db);

      const io = req.app.get('socketio');
      if (io) io.emit('db_updated');

      return res.json({ success: true, message: 'Products persisted in fallback database', count: products.length });
    }

    // Sync products in MongoDB via upsert by SKU or Name
    for (const p of products) {
      await Product.findOneAndUpdate(
        { sku: p.sku },
        {
          name: p.name,
          category: p.category,
          stock: p.stock,
          minStock: p.minStock || 5,
          price: p.price,
          cost: p.cost,
          expiryDate: p.expiryDate,
          salesCount: p.salesCount || 0,
          overstock: p.overstock || false,
          image: p.image || '',
          rating: p.rating || 4.5
        },
        { upsert: true, new: true }
      );
    }

    const io = req.app.get('socketio');
    if (io) io.emit('db_updated');

    res.json({ success: true, message: 'Products synced in MongoDB database', count: products.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 3. ORDERS LIFECYCLE
router.get('/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      return res.json(db.orders);
    }
    const orders = await Order.find({}).sort({ timestamp: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { customerName, phone, email, address, products, total, paymentMethod } = req.body;
    const orderNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      
      // Stock updates
      products.forEach(item => {
        const prod = db.products.find(p => p.name === item.productName);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          prod.salesCount = (prod.salesCount || 0) + item.quantity;
        }
      });

      const order = {
        _id: 'o-' + Date.now(),
        orderNumber: orderNum,
        customerName,
        phone,
        email,
        address,
        products,
        total,
        paymentMethod,
        shippingStatus: 'placed',
        courier: 'Blue Dart',
        trackingId: `BD-${Math.floor(1000000 + Math.random() * 9000000)}`,
        deliveryPerson: 'Cargo Drone #098',
        timestamp: new Date().toISOString()
      };
      db.orders.unshift(order);
      saveFallbackDb(db);

      const io = req.app.get('socketio');
      if (io) {
        io.emit('order_created', order);
        io.emit('db_updated');
      }

      await sendSmsNotification(phone, 'order_placed', {
        customer: customerName,
        order: orderNum,
        amount: total.toFixed(0),
        delivery: 'Tomorrow before 8 PM',
        tracking: `http://localhost:5173/track/${orderNum}`
      }, io);

      processAutomaticInvoicing(order).catch(err => console.error('Error processing online fallback invoice:', err));

      return res.json(order);
    }

    // Deduct stock in MongoDB
    for (const item of products) {
      const prod = await Product.findOne({ name: item.productName });
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.salesCount += item.quantity;
        await prod.save();
      }
    }

    const order = new Order({
      orderNumber: orderNum,
      customerName,
      phone,
      email,
      address,
      products,
      total,
      paymentMethod,
      shippingStatus: 'placed',
      courier: 'Blue Dart',
      trackingId: `BD-${Math.floor(1000000 + Math.random() * 9000000)}`,
      deliveryPerson: 'Cargo Drone #098'
    });
    await order.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order_created', order);
      io.emit('db_updated');
    }

    await sendSmsNotification(phone, 'order_placed', {
      customer: customerName,
      order: orderNum,
      amount: total.toFixed(0),
      delivery: 'Tomorrow before 8 PM',
      tracking: `http://localhost:5173/track/${orderNum}`
    }, io);

    processAutomaticInvoicing(order).catch(err => console.error('Error processing online mongo invoice:', err));

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { shippingStatus } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      const order = db.orders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      order.shippingStatus = shippingStatus;
      saveFallbackDb(db);

      const io = req.app.get('socketio');
      if (io) {
        io.emit('order_status_updated', order);
        io.emit('db_updated');
      }

      if (shippingStatus !== 'cancelled') {
        let templateCategory = 'order_placed';
        if (shippingStatus === 'shipped') templateCategory = 'order_shipped';
        else if (shippingStatus === 'out_for_delivery') templateCategory = 'out_for_delivery';
        else if (shippingStatus === 'delivered') templateCategory = 'order_delivered';

        await sendSmsNotification(order.phone, templateCategory, {
          customer: order.customerName,
          order: order.orderNumber,
          amount: order.total.toFixed(0),
          delivery: 'Today before 8 PM',
          tracking: `http://localhost:5173/track/${order.orderNumber}`
        }, io);
      }

      return res.json(order);
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.shippingStatus = shippingStatus;
    await order.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order_status_updated', order);
      io.emit('db_updated');
    }

    if (shippingStatus !== 'cancelled') {
      let templateCategory = 'order_placed';
      if (shippingStatus === 'shipped') templateCategory = 'order_shipped';
      else if (shippingStatus === 'out_for_delivery') templateCategory = 'out_for_delivery';
      else if (shippingStatus === 'delivered') templateCategory = 'order_delivered';

      await sendSmsNotification(order.phone, templateCategory, {
        customer: order.customerName,
        order: order.orderNumber,
        amount: order.total.toFixed(0),
        delivery: 'Today before 8 PM',
        tracking: `http://localhost:5173/track/${order.orderNumber}`
      }, io);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders/:id/review', async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      const order = db.orders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      order.rating = rating;
      order.review = review;

      order.products.forEach(item => {
        const prod = db.products.find(p => p.name === item.productName);
        if (prod) {
          const oldRating = prod.rating || 4.5;
          prod.rating = parseFloat(((oldRating * 4 + rating) / 5).toFixed(1));
        }
      });
      saveFallbackDb(db);

      const io = req.app.get('socketio');
      if (io) {
        io.emit('review_added', order);
        io.emit('db_updated');
      }

      return res.json(order);
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.rating = rating;
    order.review = review;
    await order.save();

    for (const item of order.products) {
      const prod = await Product.findOne({ name: item.productName });
      if (prod) {
        const oldRating = prod.rating || 4.5;
        prod.rating = parseFloat(((oldRating * 4 + rating) / 5).toFixed(1));
        await prod.save();
      }
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('review_added', order);
      io.emit('db_updated');
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POS OFFLINE BILLING RECEIPT COUNTER
router.post('/billing/pos', async (req, res) => {
  try {
    const { customerName, phone, email, products, total, paymentMethod } = req.body;
    const orderNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();

      products.forEach(item => {
        const prod = db.products.find(p => p.name === item.productName);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          prod.salesCount = (prod.salesCount || 0) + item.quantity;
        }
      });

      const order = {
        _id: 'o-' + Date.now(),
        orderNumber: orderNum,
        customerName: customerName || 'Walk-In Guest',
        phone,
        email: email || 'buyer@gmail.com',
        products,
        total,
        paymentMethod,
        shippingStatus: 'delivered',
        courier: 'In-Store Pickup',
        trackingId: 'N/A',
        timestamp: new Date().toISOString()
      };
      db.orders.unshift(order);
      saveFallbackDb(db);

      const io = req.app.get('socketio');
      if (io) {
        io.emit('order_created', order);
        io.emit('db_updated');
      }

      const itemsSummary = products.map(p => `${p.quantity}x ${p.productName}`).join(', ');
      await sendSmsNotification(phone, 'offline_billing', {
        customer: customerName || 'Walk-In Guest',
        order: orderNum,
        amount: total.toFixed(0),
        items: itemsSummary
      }, io);

      processAutomaticInvoicing(order).catch(err => console.error('Error processing offline fallback invoice:', err));

      return res.json(order);
    }

    // Deduct stock in MongoDB
    for (const item of products) {
      const prod = await Product.findOne({ name: item.productName });
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.salesCount += item.quantity;
        await prod.save();
      }
    }

    const order = new Order({
      orderNumber: orderNum,
      customerName: customerName || 'Walk-In Guest',
      phone,
      email: email || 'buyer@gmail.com',
      products,
      total,
      paymentMethod,
      shippingStatus: 'delivered',
      courier: 'In-Store Pickup',
      trackingId: 'N/A'
    });
    await order.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order_created', order);
      io.emit('db_updated');
    }

    const itemsSummary = products.map(p => `${p.quantity}x ${p.productName}`).join(', ');
    await sendSmsNotification(phone, 'offline_billing', {
      customer: customerName || 'Walk-In Guest',
      order: orderNum,
      amount: total.toFixed(0),
      items: itemsSummary
    }, io);

    processAutomaticInvoicing(order).catch(err => console.error('Error processing offline mongo invoice:', err));

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PDF INVOICE DOWNLOAD STREAM (PDFKIT)
router.get('/orders/:id/invoice', async (req, res) => {
  try {
    let order;

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      order = db.orders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
    } else {
      order = await Order.findById(req.params.id);
    }

    if (!order) return res.status(404).send('Order not found');

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('QUANTUM STORES INC.', { align: 'center' });
    doc.fontSize(8).text('DLF CyberCity, Gurgaon, India | Tel: +91 124 456 7890', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(`INVOICE RECEIPT: ${order.orderNumber}`, { bold: true });
    doc.fontSize(10).text(`Timestamp: ${new Date(order.timestamp).toLocaleString()}`);
    doc.text(`Customer Name: ${order.customerName}`);
    doc.text(`Contact Phone: ${order.phone}`);
    doc.text(`Billing email: ${order.email}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.moveDown(1.5);

    doc.font('Helvetica-Bold');
    doc.text('Item Description', 50, doc.y, { width: 250, continued: true });
    doc.text('Qty', { width: 50, align: 'center', continued: true });
    doc.text('Unit Price', { width: 100, align: 'right', continued: true });
    doc.text('Total', { width: 100, align: 'right' });
    doc.font('Helvetica');
    doc.moveDown(0.5);

    order.products.forEach((item) => {
      doc.text(item.productName, 50, doc.y, { width: 250, continued: true });
      doc.text(item.quantity.toString(), { width: 50, align: 'center', continued: true });
      doc.text(`INR ${(item.price).toFixed(0)}`, { width: 100, align: 'right', continued: true });
      doc.text(`INR ${(item.price * item.quantity).toFixed(0)}`, { width: 100, align: 'right' });
      doc.moveDown(0.2);
    });

    doc.moveDown(1.5);
    doc.text('-------------------------------------------------------------------------------------------------------');
    
    doc.font('Helvetica-Bold');
    doc.text(`Grand Total: INR ${order.total.toLocaleString('en-IN')}`, { align: 'right' });

    doc.moveDown(3);
    doc.font('Helvetica-Oblique').fontSize(9).text('Secure transaction verified. Invoiced items are packed and scheduled for automated cargo drone delivery. Thank you for your business!', { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 6. SMS LOGS & TEMPLATE AUDITING
router.get('/sms-logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      return res.json(db.smslogs || []);
    }
    const logs = await SMSLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sms-templates', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      return res.json(db.smstemplates || []);
    }
    const templates = await SMSTemplate.find({});
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/sms-templates/:category', async (req, res) => {
  try {
    const { templateText } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const db = loadFallbackDb();
      const idx = db.smstemplates.findIndex(t => t.category === req.params.category);
      if (idx !== -1) {
        db.smstemplates[idx].templateText = templateText;
      } else {
        db.smstemplates.push({ category: req.params.category, templateText });
      }
      saveFallbackDb(db);
      return res.json({ category: req.params.category, templateText });
    }

    const template = await SMSTemplate.findOneAndUpdate(
      { category: req.params.category },
      { templateText },
      { new: true, upsert: true }
    );
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
