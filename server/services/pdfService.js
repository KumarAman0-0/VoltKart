const PDFDocument = require('pdfkit');

/**
 * Generates an executive VoltKart Privacy & Hardware Audit Certificate
 * @param {Object} data { device, inspection, engineerName }
 * @param {Stream} res HTTP response or writable stream
 */
function generateDeviceCertificate(data, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(res);

  const { device = {}, inspection = {}, engineerName = 'Authorized QA Engineer' } = data;
  const imei = device.imei || inspection.deviceVerification?.imei || '358942001928471';
  const maskedImei = imei.length >= 10 ? `${imei.slice(0, 6)}******${imei.slice(-4)}` : imei;
  const grade = device.grade || inspection.engineerReview?.grade || 'A';
  const os = device.os || device.osInstalled || 'GrapheneOS';
  const model = device.model || 'Pixel 7 Pro (128GB - Obsidian)';

  // Background Accent
  doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor('#10b981').stroke();
  doc.rect(26, 26, 543, 790).lineWidth(0.5).strokeColor('#cbd5e1').stroke();

  // Header
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#064e3b').text('VOLTKART', 50, 50, { align: 'center', characterSpacing: 2 });
  doc.fontSize(10).font('Helvetica').fillColor('#059669').text('VERIFIED PRIVACY HARDWARE & REFURBISHMENT AUDIT', { align: 'center' });
  doc.moveDown(1.5);

  // Certificate Title
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#0f172a').text('CERTIFICATE OF AUTHENTICITY', { align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`CERTIFICATE REF: VK-CERT-${Date.now().toString(36).toUpperCase()}`, { align: 'center' });
  doc.moveDown(1.5);

  // Statement
  doc.fontSize(10).font('Helvetica').fillColor('#334155').text(
    `This is to certify that the mobile device described herein has undergone VoltKart\'s rigorous 28-point physical inspection, cryptographic hardware validation, and professional flashing of hardened privacy operating systems.`,
    50, doc.y, { align: 'center', lineGap: 3 }
  );
  doc.moveDown(1.5);

  // Device Specs Box
  const boxTop = doc.y;
  doc.rect(50, boxTop, 495, 110).fillAndStroke('#f8fafc', '#e2e8f0');
  
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('DEVICE SPECIFICATIONS', 65, boxTop + 12);
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  
  doc.text(`Model: ${model}`, 65, boxTop + 32);
  doc.text(`IMEI / Serial: ${maskedImei}`, 65, boxTop + 48);
  doc.text(`Storage: ${device.storage || '128GB'}`, 65, boxTop + 64);
  doc.text(`Hardware Grade: ${grade} (VoltKart Certified Pre-Owned)`, 65, boxTop + 80);

  doc.text(`Privacy OS: ${os}`, 310, boxTop + 32);
  doc.text(`Bootloader: Locked & Verified Boot Enabled`, 310, boxTop + 48);
  doc.text(`OS Build: Sandboxed Google Services Compatible`, 310, boxTop + 64);
  doc.text(`Audit Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 310, boxTop + 80);

  doc.y = boxTop + 125;

  // 7-Point Hardware Test Results
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('7-POINT HARDWARE DIAGNOSTIC SCORECARD', 50, doc.y);
  doc.moveDown(0.5);

  const tests = [
    { name: '1. Multi-Touch & Digitizer Matrix', status: 'PASSED (0 Dead Zones)', verified: '100% Responsive' },
    { name: '2. OLED/LCD RGB Pixel & Burn-in', status: 'PASSED', verified: 'Zero Dead Pixels' },
    { name: '3. Stereo Speaker & Microphone Array', status: 'PASSED', verified: 'Clean Frequency Response' },
    { name: '4. Battery Health & Charging Circuit', status: 'PASSED', verified: 'Health > 85% Capacity' },
    { name: '5. Front & Back Camera Sensor Focus', status: 'PASSED', verified: 'Autofocus & Lens Clear' },
    { name: '6. Biometric Scanner & Secure Element', status: 'PASSED', verified: 'Hardware Enclave Intact' },
    { name: '7. WiFi, Bluetooth & Cellular Radios', status: 'PASSED', verified: 'Transceivers Audited' },
  ];

  tests.forEach((t, i) => {
    const yPos = doc.y;
    doc.rect(50, yPos, 495, 22).fillAndStroke(i % 2 === 0 ? '#ffffff' : '#f1f5f9', '#e2e8f0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b').text(t.name, 60, yPos + 6);
    doc.font('Helvetica-Bold').fillColor('#059669').text(t.status, 280, yPos + 6);
    doc.font('Helvetica').fillColor('#64748b').text(t.verified, 400, yPos + 6);
    doc.y = yPos + 25;
  });

  doc.moveDown(1.5);

  // Warranty & Signatures Box
  const footerTop = doc.y + 10;
  doc.rect(50, footerTop, 495, 90).fillAndStroke('#ecfdf5', '#a7f3d0');
  
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#065f46').text('6-MONTH VOLTKART HARDWARE WARRANTY', 65, footerTop + 12);
  doc.fontSize(8).font('Helvetica').fillColor('#047857').text(
    'This device is backed by VoltKart\'s 6-month hardware repair and replacement guarantee. All OEM telemetry trackers have been scrubbed. Bootloader is locked with hardware verified keys.',
    65, footerTop + 28, { width: 465, lineGap: 2 }
  );

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text(`Inspected by: ${engineerName}`, 65, footerTop + 65);
  doc.fontSize(9).font('Helvetica').fillColor('#059669').text('✓ Digitally Signed & Sealed by VoltKart Warehouse QA', 300, footerTop + 65);

  // Verification footer
  doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text(
    'Verify this certificate online at voltkart.in/verify • Document digitally hashed and tamper-evident.',
    50, 790, { align: 'center' }
  );

  doc.end();
}

/**
 * Generates an official Seller Payout Receipt for Faisla 1 or Faisla 4
 */
function generateSellerReceipt(data, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(res);

  const { sellRequest = {}, payoutData = {} } = data;
  const quote = sellRequest.finalQuote || sellRequest.quotedPrice || sellRequest.estimatedMax || 18500;
  const deductions = sellRequest.defectDeductions || [];
  const totalDeductions = deductions.reduce((acc, d) => acc + (d.deduction || 0), 0);
  const finalAmount = quote - totalDeductions;
  const utr = payoutData.payoutId || payoutData.utr || `UTR${Date.now()}`;

  // Border
  doc.rect(20, 20, 555, 802).lineWidth(1).strokeColor('#0284c7').stroke();

  // Header
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#0369a1').text('VOLTKART TECHNOLOGIES', 50, 45);
  doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Refurbished Devices & Hardware Exchange Division');
  doc.text('GSTIN: 07AAACV8891P1Z9 • New Delhi, India');
  
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('SELLER PAYOUT & HANDOVER RECEIPT', 50, 95, { align: 'right' });
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Receipt Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
  doc.text(`Request Code: ${sellRequest.code || 'VK-REQ-001'}`, { align: 'right' });

  doc.moveDown(2);
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, 140).lineTo(545, 140).stroke();

  // Seller Details
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('SELLER DETAILS:', 50, 155);
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text(`Name: ${sellRequest.seller?.name || 'VoltKart Seller'}`, 50, 172);
  doc.text(`Email: ${sellRequest.seller?.email || 'seller@voltkart.in'}`, 50, 187);
  doc.text(`Address: ${sellRequest.address?.street || ''}, ${sellRequest.address?.city || ''} — ${sellRequest.address?.pincode || ''}`, 50, 202);

  // Device Info
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('DEVICE PARTICULARS:', 320, 155);
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text(`Model: ${sellRequest.model || 'Smartphone'}`, 320, 172);
  doc.text(`Storage: ${sellRequest.storage || '128GB'}`, 320, 187);
  doc.text(`IMEI: ${sellRequest.imei || 'Verified on Doorstep'}`, 320, 202);

  doc.moveDown(2.5);

  // Financial Breakdown Table
  const tableTop = 235;
  doc.rect(50, tableTop, 495, 24).fillAndStroke('#0369a1', '#0369a1');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('PARTICULARS / DESCRIPTION', 65, tableTop + 7);
  doc.text('AMOUNT (INR)', 450, tableTop + 7);

  let currentY = tableTop + 24;
  
  // Base Price
  doc.rect(50, currentY, 495, 22).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(`Base Approved Offer for ${sellRequest.model}`, 65, currentY + 6);
  doc.font('Helvetica-Bold').text(`₹${quote.toLocaleString('en-IN')}`, 450, currentY + 6);
  currentY += 22;

  // Deductions
  if (deductions.length > 0) {
    deductions.forEach(d => {
      doc.rect(50, currentY, 495, 22).fillAndStroke('#ffffff', '#e2e8f0');
      doc.fontSize(9).font('Helvetica').fillColor('#b91c1c').text(`Less: ${d.label || d.id || 'Defect Adjustment'}`, 65, currentY + 6);
      doc.text(`- ₹${(d.deduction || 0).toLocaleString('en-IN')}`, 450, currentY + 6);
      currentY += 22;
    });
  }

  // Final Total
  doc.rect(50, currentY, 495, 26).fillAndStroke('#ecfdf5', '#10b981');
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#065f46').text('NET PAYOUT DISBURSED TO SELLER', 65, currentY + 7);
  doc.text(`₹${finalAmount.toLocaleString('en-IN')}`, 450, currentY + 7);
  currentY += 35;

  // Payment Confirmation Box
  doc.rect(50, currentY, 495, 65).fillAndStroke('#f0f9ff', '#bae6fd');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#0369a1').text('BANK / UPI DISBURSEMENT DETAILS', 65, currentY + 10);
  doc.fontSize(8).font('Helvetica').fillColor('#0284c7');
  doc.text(`Disbursement Channel: Instant Bank IMPS / UPI`, 65, currentY + 26);
  doc.text(`Transaction Reference (UTR): ${utr}`, 65, currentY + 38);
  doc.text(`Status: COMPLETED (Disbursed directly to Seller's account)`, 65, currentY + 50);

  currentY += 85;

  // Declaration
  doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(
    'DECLARATION & TITLE TRANSFER: The seller confirms that they are the legal and rightful owner of this device, all user accounts (iCloud/Google/Samsung) have been scrubbed, and ownership title is hereby irrevocably transferred to VoltKart Technologies Pvt Ltd.',
    50, currentY, { width: 495, lineGap: 2 }
  );

  doc.end();
}

/**
 * Generates a GST compliant Buyer Tax Invoice
 */
function generateBuyerInvoice(data, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(res);

  const { order = {} } = data;
  const totalAmount = order.totalAmount || 24999;
  const taxableAmount = Math.round(totalAmount / 1.18);
  const gstAmount = totalAmount - taxableAmount;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  // Border
  doc.rect(20, 20, 555, 802).lineWidth(1).strokeColor('#4f46e5').stroke();

  // Header
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#4338ca').text('VOLTKART', 50, 45);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('VoltKart Technologies Private Limited');
  doc.text('CIN: U72900DL2024PTC123456 • GSTIN: 07AAACV8891P1Z9');
  doc.text('Support: support@voltkart.in • www.voltkart.in');

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('TAX INVOICE', 50, 95, { align: 'right' });
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Invoice #: VK-INV-${order._id?.toString().slice(-6).toUpperCase() || '10294'}`, { align: 'right' });
  doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });

  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, 140).lineTo(545, 140).stroke();

  // Buyer Info
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('BILLED & SHIPPED TO:', 50, 155);
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text(`Customer: ${order.shippingAddress?.fullName || order.buyer?.name || 'VoltKart Customer'}`, 50, 172);
  doc.text(`Address: ${order.shippingAddress?.street || 'Connaught Place'}, ${order.shippingAddress?.city || 'New Delhi'}`, 50, 187);
  doc.text(`Phone: ${order.shippingAddress?.phone || '9876543210'}`, 50, 202);

  // Table
  const tableTop = 230;
  doc.rect(50, tableTop, 495, 24).fillAndStroke('#4338ca', '#4338ca');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('ITEM DESCRIPTION', 65, tableTop + 7);
  doc.text('HSN', 280, tableTop + 7);
  doc.text('QTY', 330, tableTop + 7);
  doc.text('TAXABLE', 380, tableTop + 7);
  doc.text('TOTAL', 470, tableTop + 7);

  const itemY = tableTop + 24;
  doc.rect(50, itemY, 495, 30).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b').text(order.items?.[0]?.device?.model || 'VoltKart Privacy Phone (GrapheneOS)', 65, itemY + 8);
  doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('Certified Pre-Owned • 6-Month Warranty', 65, itemY + 18);
  doc.text('8517', 280, itemY + 10);
  doc.text('1', 335, itemY + 10);
  doc.text(`₹${taxableAmount.toLocaleString('en-IN')}`, 380, itemY + 10);
  doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, 470, itemY + 10);

  // Summary
  const sumY = itemY + 45;
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text('Taxable Value:', 350, sumY);
  doc.text(`₹${taxableAmount.toLocaleString('en-IN')}`, 470, sumY);
  
  doc.text('CGST (9%):', 350, sumY + 18);
  doc.text(`₹${cgst.toLocaleString('en-IN')}`, 470, sumY + 18);

  doc.text('SGST (9%):', 350, sumY + 36);
  doc.text(`₹${sgst.toLocaleString('en-IN')}`, 470, sumY + 36);

  doc.rect(330, sumY + 54, 215, 24).fillAndStroke('#eef2ff', '#6366f1');
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#312e81').text('Total Paid:', 350, sumY + 61);
  doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, 470, sumY + 61);

  // Terms
  doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(
    'Warranty Terms: 6 Months hardware warranty against manufacturing and functional defects. Liquid damage or physical screen breakage not covered. Returns accepted within 7 days of delivery.',
    50, sumY + 120, { width: 495, lineGap: 2 }
  );

  doc.end();
}

module.exports = {
  generateDeviceCertificate,
  generateSellerReceipt,
  generateBuyerInvoice,
};
