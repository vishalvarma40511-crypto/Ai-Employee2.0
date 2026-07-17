const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { EmailLog, Settings } = require('../models/Schemas');
const fs = require('fs');
const path = require('path');

// Fallback DB helper
const FALLBACK_DB_PATH = path.join(__dirname, '../db_fallback.json');
function loadFallbackDb() {
  if (fs.existsSync(FALLBACK_DB_PATH)) {
    try { return JSON.parse(fs.readFileSync(FALLBACK_DB_PATH, 'utf8')); }
    catch (e) { return {}; }
  }
  return {};
}
function saveFallbackDb(data) {
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Load email credentials from MongoDB Settings (preferred) or .env fallback
 */
async function getEmailCredentials() {
  try {
    if (mongoose.connection.readyState === 1) {
      const settings = await Settings.findOne({ key: 'store' });
      if (settings && settings.ownerEmail && settings.ownerEmailPass) {
        return {
          email: settings.ownerEmail,
          pass: settings.ownerEmailPass,
          host: settings.smtpHost || 'smtp.gmail.com',
          port: settings.smtpPort || 587,
          storeName: settings.storeName || process.env.STORE_NAME || 'Alfa Store',
          storePhone: settings.storePhone || process.env.STORE_PHONE || '',
          storeAddress: settings.storeAddress || process.env.STORE_ADDRESS || '',
          websiteUrl: settings.websiteUrl || process.env.SITE_URL || process.env.WEBSITE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'https://your-app.vercel.app'
        };
      }
    } else {
      // Try fallback DB
      const db = loadFallbackDb();
      const settings = db.settings;
      if (settings && settings.ownerEmail && settings.ownerEmailPass) {
        return {
          email: settings.ownerEmail,
          pass: settings.ownerEmailPass,
          host: settings.smtpHost || 'smtp.gmail.com',
          port: settings.smtpPort || 587,
          storeName: settings.storeName || process.env.STORE_NAME || 'Alfa Store',
          storePhone: settings.storePhone || process.env.STORE_PHONE || '',
          storeAddress: settings.storeAddress || process.env.STORE_ADDRESS || '',
          websiteUrl: settings.websiteUrl || process.env.SITE_URL || process.env.WEBSITE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'https://your-app.vercel.app'
        };
      }
    }
  } catch (e) {
    console.error('[Email Service] Failed to load credentials from DB:', e.message);
  }

  // Fallback to .env values
  return {
    email: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    storeName: process.env.STORE_NAME || 'Alfa Store',
    storePhone: process.env.STORE_PHONE || '',
    storeAddress: process.env.STORE_ADDRESS || '',
    websiteUrl: process.env.SITE_URL || process.env.WEBSITE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'https://your-app.vercel.app'
  };
}

/**
 * Send invoice email with automatic 3x retry.
 * Reads SMTP credentials from MongoDB Settings at runtime.
 */
async function sendInvoiceEmailWithRetry(invoiceData, pdfBuffer, retryCount = 0) {
  const creds = await getEmailCredentials();
  const { email: emailUser, pass: emailPass, host, port, storeName, storePhone, storeAddress, websiteUrl } = creds;

  if (!emailUser) {
    console.warn('[Email Service] No owner email configured. Skipping email dispatch.');
    return { success: false, error: 'Owner email not configured. Please set up email in the Invoice Settings.' };
  }

  // Construct styled HTML email body
  const itemsHtml = invoiceData.products.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${item.productName}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#1f2937;text-align:center;">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#1f2937;text-align:right;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#1f2937;text-align:right;">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailBodyHtml = `
    <div style="font-family:'Segoe UI',Tahoma,Verdana,sans-serif;background:#f3f4f6;padding:30px;margin:0;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">

        <!-- Dark Header -->
        <div style="background:#111827;padding:30px 40px;text-align:center;border-bottom:4px solid #06b6d4;">
          <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:3px;text-transform:uppercase;">${storeName}</h1>
          <p style="color:#9ca3af;margin:6px 0 0;font-size:11px;letter-spacing:1px;">ELECTRONIC INVOICE RECEIPT</p>
        </div>

        <!-- Body -->
        <div style="padding:35px 40px;">
          <h2 style="color:#111827;margin-top:0;font-size:18px;">Hello ${invoiceData.customerName},</h2>
          <p style="color:#4b5563;font-size:14px;line-height:1.7;">Thank you for shopping with <strong>${storeName}</strong>! Your order has been confirmed and your invoice is ready. Please find the PDF attached to this email.</p>

          <!-- Invoice Details Card -->
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:25px 0;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#4b5563;">
              <tr>
                <td style="padding:5px 0;"><strong>Invoice Number:</strong></td>
                <td style="padding:5px 0;text-align:right;color:#06b6d4;font-weight:bold;font-family:monospace;">${invoiceData.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;"><strong>Date:</strong></td>
                <td style="padding:5px 0;text-align:right;">${new Date(invoiceData.createdAt).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;"><strong>Payment Method:</strong></td>
                <td style="padding:5px 0;text-align:right;">${invoiceData.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;"><strong>Payment Status:</strong></td>
                <td style="padding:5px 0;text-align:right;color:#10b981;font-weight:bold;">✔ ${invoiceData.paymentStatus}</td>
              </tr>
            </table>
          </div>

          <!-- Product Table -->
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin:20px 0;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:10px;border-bottom:2px solid #e5e7eb;text-align:left;color:#374151;font-size:11px;text-transform:uppercase;">Product</th>
                <th style="padding:10px;border-bottom:2px solid #e5e7eb;text-align:center;color:#374151;font-size:11px;text-transform:uppercase;width:50px;">Qty</th>
                <th style="padding:10px;border-bottom:2px solid #e5e7eb;text-align:right;color:#374151;font-size:11px;text-transform:uppercase;width:90px;">Rate</th>
                <th style="padding:10px;border-bottom:2px solid #e5e7eb;text-align:right;color:#374151;font-size:11px;text-transform:uppercase;width:100px;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Financial Summary -->
          <div style="border-top:2px dashed #e5e7eb;padding-top:15px;margin-top:15px;text-align:right;font-size:13px;color:#4b5563;">
            <p style="margin:5px 0;">Subtotal: <strong>₹${Number(invoiceData.subtotal).toFixed(2)}</strong></p>
            <p style="margin:5px 0;">Discount: <strong style="color:#ef4444;">-₹${Number(invoiceData.discount || 0).toFixed(2)}</strong></p>
            <p style="margin:5px 0;">GST (18%): <strong>₹${Number(invoiceData.gst || 0).toFixed(2)}</strong></p>
            <p style="margin:10px 0 0;font-size:20px;color:#06b6d4;">Grand Total: <strong style="font-family:monospace;">₹${Number(invoiceData.total).toFixed(2)}</strong></p>
          </div>

          <!-- Download Button + Shop Again -->
          <div style="text-align:center;margin:30px 0 10px;">
            <span style="display:inline-block;background:#06b6d4;color:#ffffff;font-weight:bold;padding:13px 32px;border-radius:10px;font-size:14px;letter-spacing:0.5px;">📎 Invoice PDF Attached</span>
            ${websiteUrl ? `
            <div style="margin-top:16px;">
              <a href="${websiteUrl}" style="display:inline-block;background:#1f2937;color:#06b6d4;font-weight:bold;padding:11px 28px;border-radius:10px;font-size:13px;text-decoration:none;border:1px solid #06b6d4;letter-spacing:0.5px;">🛍️ Shop Again at ${storeName}</a>
            </div>` : ''}
          </div>
        </div>

        <!-- Dark Footer -->
        <div style="background:#111827;padding:25px 40px;font-size:11px;color:#9ca3af;text-align:center;line-height:1.8;border-top:1px solid #1f2937;">
          <p style="margin:0;font-weight:bold;color:#ffffff;font-size:13px;">${storeName}</p>
          ${storeAddress ? `<p style="margin:4px 0;">📍 ${storeAddress}</p>` : ''}
          ${storePhone ? `<p style="margin:4px 0;">📞 ${storePhone}</p>` : ''}
          <p style="margin:4px 0;">✉️ ${emailUser}</p>
          ${websiteUrl ? `<p style="margin:4px 0;">🌐 <a href="${websiteUrl}" style="color:#06b6d4;text-decoration:none;font-weight:bold;">${websiteUrl}</a></p>` : ''}
          <p style="margin:15px 0 0;color:#4b5563;font-size:10px;">&copy; ${new Date().getFullYear()} ${storeName}. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  `;

  let transporter;

  if (emailPass) {
    // Real Gmail SMTP
    if (host === 'smtp.gmail.com') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user: emailUser, pass: emailPass },
        tls: { rejectUnauthorized: false }
      });
    }
  } else {
    // Mock Ethereal email (no real credentials)
    console.log(`[Email Service] EMAIL_PASS not configured. Using Ethereal mock for ${invoiceData.email}...`);
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } catch (e) {
      return { success: false, error: 'Ethereal mock failed: ' + e.message };
    }
  }

  const mailOptions = {
    from: `"${storeName}" <${emailUser}>`,
    to: invoiceData.email,           // Customer's email
    cc: emailUser,                    // CC to store owner
    subject: `Your Invoice from ${storeName} — ${invoiceData.invoiceNumber}`,
    html: emailBodyHtml,
    attachments: [
      {
        filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
        content: pdfBuffer
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service ✅] Invoice sent to ${invoiceData.email} | Message ID: ${info.messageId}`);

    if (!emailPass) {
      console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    // Log success to DB
    if (mongoose.connection.readyState === 1) {
      await new EmailLog({
        email: invoiceData.email,
        orderNumber: invoiceData.invoiceNumber,
        status: 'Success',
        smtpResponse: info.messageId,
        retryCount
      }).save();
    }

    return { success: true, smtpResponse: info.messageId };
  } catch (err) {
    console.error(`[Email Service ❌] Failed (attempt ${retryCount + 1}/3): ${err.message}`);

    if (retryCount < 2) {
      // Auto-retry up to 3 times
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return sendInvoiceEmailWithRetry(invoiceData, pdfBuffer, retryCount + 1);
    }

    // Log failure to DB
    if (mongoose.connection.readyState === 1) {
      await new EmailLog({
        email: invoiceData.email,
        orderNumber: invoiceData.invoiceNumber,
        status: 'Failed',
        smtpResponse: err.message,
        retryCount
      }).save();
    }

    return { success: false, error: err.message };
  }
}

module.exports = { sendInvoiceEmailWithRetry, getEmailCredentials };
