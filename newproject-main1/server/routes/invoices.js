const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  downloadInvoicePdf,
  resendInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

// Define api/invoice routes
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.get('/download/:id', downloadInvoicePdf);
router.post('/resend/:id', resendInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
