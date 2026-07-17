const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');

async function generatePdfInvoiceBuffer(invoiceData) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Fetch Store Info from env
      const storeName = process.env.STORE_NAME || 'Alfa Store';
      const storeAddress = process.env.STORE_ADDRESS || 'Near Vijayawada';
      const storePhone = process.env.STORE_PHONE || '6281823557';
      const storeEmail = process.env.STORE_EMAIL || 'vishalvarma40511@gmail.com';
      const websiteUrl = process.env.SITE_URL || process.env.WEBSITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-app.vercel.app');

      // Design Header
      doc.fontSize(20).fillColor('#06b6d4').text(storeName.toUpperCase(), { bold: true });
      doc.fontSize(8).fillColor('#666666')
         .text(storeAddress)
         .text(`Phone: ${storePhone} | Email: ${storeEmail}`)
         .text(`Website: ${websiteUrl}`);
         
      doc.moveDown(1);
      doc.strokeColor('#ddd').moveTo(40, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(1.5);

      // Metadata block
      let y = doc.y;
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 40, y, { bold: true });
      doc.text(`Date & Time: ${new Date(invoiceData.createdAt).toLocaleString()}`, 40, doc.y);
      doc.text(`Payment Status: ${invoiceData.paymentStatus}`, 40, doc.y);
      doc.text(`Payment Mode: ${invoiceData.paymentMethod}`, 40, doc.y);

      doc.text('Billed To:', 320, y, { bold: true, underline: true });
      doc.text(`Name: ${invoiceData.customerName}`, 320, doc.y);
      doc.text(`Email: ${invoiceData.email}`, 320, doc.y);
      if (invoiceData.phone) doc.text(`Phone: ${invoiceData.phone}`, 320, doc.y);

      doc.moveDown(2);

      // Barcode generation using bwip-js
      try {
        const barcodePng = await new Promise((res, rej) => {
          bwipjs.toBuffer({
            bcid: 'code128',
            text: invoiceData.invoiceNumber,
            scale: 2,
            height: 10,
            includetext: false,
            textalign: 'center',
          }, (err, png) => {
            if (err) rej(err);
            else res(png);
          });
        });
        doc.image(barcodePng, 40, doc.y, { width: 140, height: 35 });
      } catch (err) {
        console.error('Barcode generation failed:', err);
      }

      doc.moveDown(3);

      // Draw table header
      y = doc.y;
      doc.fontSize(9).fillColor('#06b6d4');
      doc.text('Description', 40, y, { bold: true });
      doc.text('Qty', 280, y, { bold: true });
      doc.text('Unit Price', 360, y, { bold: true, align: 'right', width: 80 });
      doc.text('Total', 470, y, { bold: true, align: 'right', width: 100 });
      doc.moveDown(0.5);
      doc.strokeColor('#ddd').moveTo(40, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(0.5);

      // Draw items
      doc.fontSize(9).fillColor('#333333');
      invoiceData.products.forEach(item => {
        y = doc.y;
        doc.text(item.productName, 40, y, { width: 230 });
        doc.text(item.quantity.toString(), 280, y);
        doc.text(`Rs.${item.price.toFixed(2)}`, 360, y, { align: 'right', width: 80 });
        doc.text(`Rs.${(item.price * item.quantity).toFixed(2)}`, 470, y, { align: 'right', width: 100 });
        doc.moveDown(1.2);
      });

      doc.moveDown(1);
      doc.strokeColor('#ddd').moveTo(40, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(1);

      // Draw totals
      y = doc.y;
      doc.fontSize(9).fillColor('#555555');
      doc.text(`Subtotal: Rs.${invoiceData.subtotal.toFixed(2)}`, 360, y, { align: 'right', width: 210 });
      doc.text(`Discount: -Rs.${(invoiceData.discount || 0).toFixed(2)}`, 360, doc.y, { align: 'right', width: 210 });
      doc.text(`GST (Tax 18% Included): Rs.${(invoiceData.gst || 0).toFixed(2)}`, 360, doc.y, { align: 'right', width: 210 });
      doc.fontSize(12).fillColor('#06b6d4').text(`Grand Total: Rs.${invoiceData.total.toFixed(2)}`, 360, doc.y, { align: 'right', width: 210, bold: true });

      // Add QR Code at the bottom left
      try {
        const qrData = `Invoice: ${invoiceData.invoiceNumber} | Total: Rs.${invoiceData.total.toFixed(2)} | Web: ${websiteUrl}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);
        doc.image(qrCodeDataUrl, 40, y, { width: 80, height: 80 });
      } catch (err) {
        console.error('QR code generation failed:', err);
      }

      doc.moveDown(4);

      // Terms & Conditions block
      doc.fontSize(8).fillColor('#888888').text('Terms & Conditions:', 40, doc.y, { bold: true });
      doc.text('1. All sales are final. Items can only be exchanged within 7 days in original condition.');
      doc.text('2. Please keep this invoice receipt for any future warranty claims.');
      doc.text('3. For support queries, contact support@alfastore.com.');
      
      // Footer text
      doc.moveDown(2);
      doc.fontSize(9).fillColor('#06b6d4').text('★ Thank you for choosing Quantum Stores! Visit Again! ★', { align: 'center', bold: true });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePdfInvoiceBuffer };
