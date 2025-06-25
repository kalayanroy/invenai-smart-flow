
import jsPDF from 'jspdf';

export const generatePurchaseInvoicePDF = (purchase: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('PURCHASE INVOICE', 105, 20, { align: 'center' });
  
  // Company info
  doc.setFontSize(12);
  doc.text('Your Company Name', 20, 40);
  doc.text('Your Company Address', 20, 50);
  doc.text('Phone: Your Phone Number', 20, 60);
  
  // Invoice details
  doc.text(`Invoice ID: ${purchase.id}`, 140, 40);
  doc.text(`Date: ${purchase.date}`, 140, 50);
  doc.text(`Status: ${purchase.status}`, 140, 60);
  
  // Supplier
  doc.text(`Supplier: ${purchase.supplier}`, 20, 80);
  
  // Items table header
  doc.setFontSize(10);
  doc.text('Product', 20, 100);
  doc.text('Quantity', 70, 100);
  doc.text('Unit Price', 100, 100);
  doc.text('Total', 140, 100);
  
  // Table line
  doc.line(20, 105, 190, 105);
  
  let yPosition = 115;
  
  if (purchase.items && purchase.items.length > 0) {
    // Multiple items
    purchase.items.forEach((item: any) => {
      doc.text(item.productName, 20, yPosition);
      doc.text(item.quantity.toString(), 70, yPosition);
      doc.text(`৳${item.unitPrice.toFixed(2)}`, 100, yPosition);
      doc.text(`৳${item.totalAmount.toFixed(2)}`, 140, yPosition);
      yPosition += 10;
    });
  } else {
    // Single item
    doc.text(purchase.productName || 'N/A', 20, yPosition);
    doc.text(purchase.quantity?.toString() || '0', 70, yPosition);
    const unitPrice = typeof purchase.unitPrice === 'string' 
      ? parseFloat(purchase.unitPrice.replace('৳', '').replace(',', '')) 
      : purchase.unitPrice || 0;
    doc.text(`৳${unitPrice.toFixed(2)}`, 100, yPosition);
    const totalAmount = typeof purchase.totalAmount === 'string'
      ? parseFloat(purchase.totalAmount.replace('৳', '').replace(',', ''))
      : purchase.totalAmount || 0;
    doc.text(`৳${totalAmount.toFixed(2)}`, 140, yPosition);
    yPosition += 10;
  }
  
  // Total line
  doc.line(20, yPosition + 5, 190, yPosition + 5);
  
  // Calculate and display total
  let grandTotal = 0;
  if (purchase.items && purchase.items.length > 0) {
    grandTotal = purchase.items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);
  } else {
    grandTotal = typeof purchase.totalAmount === 'string'
      ? parseFloat(purchase.totalAmount.replace('৳', '').replace(',', ''))
      : purchase.totalAmount || 0;
  }
  
  doc.setFontSize(12);
  doc.text(`Total Amount: ৳${grandTotal.toFixed(2)}`, 140, yPosition + 20);
  
  if (purchase.notes) {
    doc.text(`Notes: ${purchase.notes}`, 20, yPosition + 40);
  }
  
  doc.save(`purchase-invoice-${purchase.id}.pdf`);
};

export const generatePInvoicePDF = (purchase: any) => {
  const doc = new jsPDF();
  
  // Header with company logo area
  doc.setFontSize(20);
  doc.text('PURCHASE ORDER', 105, 30, { align: 'center' });
  
  // Company info (left side)
  doc.setFontSize(12);
  doc.text('Nahar Enterprise', 20, 50);
  doc.text('Abdul Kadar market, member bari road,', 20, 60);
  doc.text('National University, gazipur city corporation.', 20, 70);
  doc.text('Phone: 01712014171', 20, 80);
  
  // Purchase Order details (right side)
  doc.text(`Purchase Order ID: ${purchase.id}`, 120, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 60);
  doc.text(`Status: ${purchase.status}`, 120, 70);
  
  // Supplier info
  doc.text('Supplier:', 20, 100);
  doc.text(purchase.supplier, 20, 110);
  
  // Items table header
  doc.setFontSize(10);
  doc.text('Product', 20, 130);
  doc.text('Quantity', 80, 130);
  doc.text('Unit Price', 120, 130);
  doc.text('Total', 160, 130);
  
  // Table line
  doc.line(20, 135, 190, 135);
  
  let yPosition = 145;
  let grandTotal = 0;
  
  if (purchase.items && purchase.items.length > 0) {
    // Multiple items from purchase order
    purchase.items.forEach((item: any) => {
      doc.text(item.productName, 20, yPosition);
      doc.text(item.quantity.toString(), 80, yPosition);
      doc.text(item.unitPrice.toFixed(2), 120, yPosition);
      doc.text(item.totalAmount.toFixed(2), 160, yPosition);
      grandTotal += item.totalAmount;
      yPosition += 10;
    });
  } else {
    // Single item fallback
    doc.text(purchase.productName || 'N/A', 20, yPosition);
    doc.text(purchase.quantity?.toString() || '0', 80, yPosition);
    const unitPrice = typeof purchase.unitPrice === 'string' 
      ? parseFloat(purchase.unitPrice.replace('৳', '').replace(',', '')) 
      : purchase.unitPrice || 0;
    doc.text(unitPrice.toFixed(2), 120, yPosition);
    const totalAmount = typeof purchase.totalAmount === 'string'
      ? parseFloat(purchase.totalAmount.replace('৳', '').replace(',', ''))
      : purchase.totalAmount || 0;
    doc.text(totalAmount.toFixed(2), 160, yPosition);
    grandTotal = totalAmount;
    yPosition += 10;
  }
  
  // Total line
  doc.line(20, yPosition + 10, 190, yPosition + 10);
  
  // Total Amount with proper currency symbol
  doc.setFontSize(14);
  doc.text(`Total Amount: ৳${grandTotal.toFixed(2)}`, 120, yPosition + 25);
  
  if (purchase.notes) {
    doc.setFontSize(10);
    doc.text(`Notes: ${purchase.notes}`, 20, yPosition + 45);
  }
  
  doc.save(`purchase-order-${purchase.id}.pdf`);
};
