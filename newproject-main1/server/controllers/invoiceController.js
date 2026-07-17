const { Invoice, Order, EmailLog } = require('../models/Schemas');
const { generatePdfInvoiceBuffer } = require('../utils/invoiceGenerator');
const { sendInvoiceEmailWithRetry } = require('../services/emailService');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Helper to load fallback local database
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

// 1. GET ALL INVOICES WITH FILTERS
const getInvoices = async (req, res) => {
  try {
    const { search, customer, paymentStatus, emailStatus, dateRange, startDate, endDate } = req.query;
    
    let invoicesList = [];
    if (mongoose.connection.readyState === 1) {
      let query = {};
      
      if (search) {
        query.$or = [
          { invoiceNumber: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } }
        ];
      }
      if (customer) {
        query.customerName = { $regex: customer, $options: 'i' };
      }
      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }
      if (emailStatus) {
        query.emailStatus = emailStatus;
      }
      
      if (dateRange || (startDate && endDate)) {
        let start = new Date();
        let end = new Date();
        
        if (dateRange === 'today') {
          start.setHours(0,0,0,0);
          end.setHours(23,59,59,999);
        } else if (dateRange === 'yesterday') {
          start.setDate(start.getDate() - 1);
          start.setHours(0,0,0,0);
          end.setDate(end.getDate() - 1);
          end.setHours(23,59,59,999);
        } else if (dateRange === 'week') {
          start.setDate(start.getDate() - 7);
        } else if (dateRange === 'month') {
          start.setMonth(start.getMonth() - 1);
        } else if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        }
        query.createdAt = { $gte: start, $lte: end };
      }
      
      invoicesList = await Invoice.find(query).sort({ createdAt: -1 });
    } else {
      const db = loadFallbackDb();
      let list = db.invoices || [];
      
      if (search) {
        const clean = search.toLowerCase();
        list = list.filter(inv => 
          inv.invoiceNumber.toLowerCase().includes(clean) ||
          inv.email.toLowerCase().includes(clean) ||
          inv.customerName.toLowerCase().includes(clean)
        );
      }
      if (customer) {
        const clean = customer.toLowerCase();
        list = list.filter(inv => inv.customerName.toLowerCase().includes(clean));
      }
      if (paymentStatus) {
        list = list.filter(inv => inv.paymentStatus === paymentStatus);
      }
      if (emailStatus) {
        list = list.filter(inv => inv.emailStatus === emailStatus);
      }
      
      invoicesList = list;
    }
    
    res.json(invoicesList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET INVOICE BY ID
const getInvoiceById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      res.json(invoice);
    } else {
      const db = loadFallbackDb();
      const invoice = (db.invoices || []).find(inv => inv._id === req.params.id || inv.invoiceNumber === req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      res.json(invoice);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. STREAM & DOWNLOAD INVOICE PDF
const downloadInvoicePdf = async (req, res) => {
  try {
    let invoiceData;
    if (mongoose.connection.readyState === 1) {
      invoiceData = await Invoice.findById(req.params.id);
    } else {
      const db = loadFallbackDb();
      invoiceData = (db.invoices || []).find(inv => inv._id === req.params.id || inv.invoiceNumber === req.params.id);
    }
    
    if (!invoiceData) return res.status(404).json({ error: 'Invoice not found' });

    const pdfBuffer = await generatePdfInvoiceBuffer(invoiceData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceData.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. RESEND EMAIL INVOICE
const resendInvoice = async (req, res) => {
  try {
    let invoiceData;
    if (mongoose.connection.readyState === 1) {
      invoiceData = await Invoice.findById(req.params.id);
    } else {
      const db = loadFallbackDb();
      invoiceData = (db.invoices || []).find(inv => inv._id === req.params.id || inv.invoiceNumber === req.params.id);
    }

    if (!invoiceData) return res.status(404).json({ error: 'Invoice not found' });

    const pdfBuffer = await generatePdfInvoiceBuffer(invoiceData);
    const mailResult = await sendInvoiceEmailWithRetry(invoiceData, pdfBuffer);

    const newStatus = mailResult.success ? 'Success' : 'Failed';
    
    if (mongoose.connection.readyState === 1) {
      invoiceData.emailStatus = newStatus;
      invoiceData.updatedAt = new Date();
      await invoiceData.save();
    } else {
      const db = loadFallbackDb();
      const idx = (db.invoices || []).findIndex(inv => inv._id === invoiceData._id);
      if (idx !== -1) {
        db.invoices[idx].emailStatus = newStatus;
        db.invoices[idx].updatedAt = new Date().toISOString();
        saveFallbackDb(db);
      }
    }

    res.json({ success: true, emailStatus: newStatus, smtpResponse: mailResult.smtpResponse || mailResult.error });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. DELETE INVOICE
const deleteInvoice = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await Invoice.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
      res.json({ success: true, message: 'Invoice removed' });
    } else {
      const db = loadFallbackDb();
      const initialLength = (db.invoices || []).length;
      db.invoices = (db.invoices || []).filter(inv => inv._id !== req.params.id);
      if (db.invoices.length === initialLength) return res.status(404).json({ error: 'Invoice not found' });
      saveFallbackDb(db);
      res.json({ success: true, message: 'Invoice removed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  downloadInvoicePdf,
  resendInvoice,
  deleteInvoice
};
