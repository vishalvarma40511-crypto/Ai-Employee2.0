const { Invoice, Counter } = require('../models/Schemas');
const { generatePdfInvoiceBuffer } = require('./invoiceGenerator');
const { sendInvoiceEmailWithRetry } = require('../services/emailService');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Fallback helper
const FALLBACK_DB_PATH = path.join(__dirname, '../db_fallback.json');
function loadFallbackDb() {
  if (fs.existsSync(FALLBACK_DB_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(FALLBACK_DB_PATH, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveFallbackDb(data) {
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Generate sequential Invoice number: INV-YYYY-000001
async function getNextInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  if (mongoose.connection.readyState === 1) {
    const counter = await Counter.findOneAndUpdate(
      { year: currentYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seqStr = counter.seq.toString().padStart(6, '0');
    return `INV-${currentYear}-${seqStr}`;
  } else {
    const db = loadFallbackDb();
    if (!db.invoiceCounter) db.invoiceCounter = {};
    if (!db.invoiceCounter[currentYear]) db.invoiceCounter[currentYear] = 0;
    db.invoiceCounter[currentYear]++;
    saveFallbackDb(db);
    const seqStr = db.invoiceCounter[currentYear].toString().padStart(6, '0');
    return `INV-${currentYear}-${seqStr}`;
  }
}

async function processAutomaticInvoicing(order) {
  try {
    const invoiceNumber = await getNextInvoiceNumber();
    
    const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const gst = subtotal * 0.18; // 18% GST estimate
    const discount = order.discount || 0;
    const total = order.total;

    const invoiceData = {
      _id: 'i-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      invoiceNumber,
      customerName: order.customerName,
      email: order.email || 'buyer@gmail.com',
      phone: order.phone,
      orderId: order.orderNumber || order._id,
      products: order.products,
      subtotal,
      gst,
      discount,
      total,
      paymentMethod: order.paymentMethod,
      paymentStatus: 'Paid',
      pdfPath: '',
      emailStatus: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save PDF layout
    let pdfBuffer;
    try {
      pdfBuffer = await generatePdfInvoiceBuffer(invoiceData);
      
      // Save locally to public/uploads/pdf/
      const pdfDir = path.join(__dirname, '../public/uploads/pdf');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      const pdfFilename = `invoice-${invoiceNumber}.pdf`;
      const pdfFilePath = path.join(pdfDir, pdfFilename);
      fs.writeFileSync(pdfFilePath, pdfBuffer);
      invoiceData.pdfPath = `/uploads/pdf/${pdfFilename}`;
    } catch (pdfErr) {
      console.error('[Invoicing Processor] PDF Compilation error:', pdfErr);
    }

    // Save to Database
    if (mongoose.connection.readyState === 1) {
      const invoiceDoc = new Invoice(invoiceData);
      await invoiceDoc.save();
    } else {
      const db = loadFallbackDb();
      if (!db.invoices) db.invoices = [];
      db.invoices.unshift(invoiceData);
      saveFallbackDb(db);
    }

    // Email Dispatch
    if (pdfBuffer) {
      const mailResult = await sendInvoiceEmailWithRetry(invoiceData, pdfBuffer);
      const emailStatus = mailResult.success ? 'Success' : 'Failed';
      
      // Update email status
      if (mongoose.connection.readyState === 1) {
        await Invoice.updateOne({ invoiceNumber }, { emailStatus });
      } else {
        const db = loadFallbackDb();
        const found = db.invoices.find(inv => inv.invoiceNumber === invoiceNumber);
        if (found) {
          found.emailStatus = emailStatus;
          saveFallbackDb(db);
        }
      }
    }

    console.log(`[Invoicing Processor] Automatic Invoicing completed for ${invoiceNumber}`);
  } catch (err) {
    console.error('[Invoicing Processor] Execution error:', err);
  }
}

module.exports = { processAutomaticInvoicing, getNextInvoiceNumber };
