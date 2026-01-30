import jsPDF from 'jspdf';
// Import jspdf-autotable as side effect - it extends jsPDF prototype
import 'jspdf-autotable';

/**
 * Helper to create a simple table manually if autoTable is not available
 */
const createSimpleTable = (doc, data, startX, startY, colWidths, headStyles = {}, bodyStyles = {}) => {
  const rowHeight = 8;
  const fontSize = 10;
  let currentY = startY;
  
  // Draw header
  if (data.length > 0 && Array.isArray(data[0])) {
    const header = data[0];
    let currentX = startX;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    header.forEach((cell, i) => {
      const width = colWidths[i] || 50;
      doc.setFillColor(229, 57, 53);
      doc.rect(currentX, currentY, width, rowHeight, 'F');
      // Center text in header
      const textWidth = doc.getTextWidth(String(cell));
      doc.text(String(cell), currentX + (width - textWidth) / 2, currentY + 5.5);
      currentX += width;
    });
    
    currentY += rowHeight;
    
    // Draw body
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      let rowX = startX;
      const rowY = currentY;
      let maxRowHeight = rowHeight;
      
      row.forEach((cell, i) => {
        const width = colWidths[i] || 50;
        const cellText = String(cell || '');
        
        // Handle text wrapping for long content
        const maxWidth = width - 4;
        const lines = doc.splitTextToSize(cellText, maxWidth);
        const cellHeight = Math.max(rowHeight, lines.length * 4 + 2);
        maxRowHeight = Math.max(maxRowHeight, cellHeight);
        
        doc.setFillColor(255, 255, 255);
        doc.rect(rowX, rowY, width, cellHeight, 'FD');
        
        // Draw text lines
        lines.forEach((line, lineIdx) => {
          doc.text(line, rowX + 2, rowY + 4 + (lineIdx * 4));
        });
        
        rowX += width;
      });
      
      currentY += maxRowHeight;
    }
  }
  
  return currentY;
};

/**
 * Helper function to call autoTable with fallback
 */
const callAutoTable = (doc, options) => {
  // Try autoTable first (preferred method)
  if (typeof doc.autoTable === 'function') {
    return doc.autoTable(options);
  }
  
  // Check prototype
  const proto = Object.getPrototypeOf(doc);
  if (typeof proto.autoTable === 'function') {
    return proto.autoTable.call(doc, options);
  }
  
  // Fallback: create simple table manually
  console.warn('jspdf-autotable not available, using fallback table rendering');
  
  const { head = [], body = [], startY = 20, margin = { left: 14, right: 14 } } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const availableWidth = pageWidth - margin.left - margin.right;
  const colCount = head.length || (body[0] ? body[0].length : 2);
  
  // For Field/Value tables, make Value column wider
  if (colCount === 2 && head[0] && (head[0][0] === 'Field' || head[0][0] === '#')) {
    const colWidths = [availableWidth * 0.35, availableWidth * 0.65]; // Field: 35%, Value: 65%
    const tableData = head.length > 0 ? [head, ...body] : body;
    const finalY = createSimpleTable(doc, tableData, margin.left, startY, colWidths);
    doc.lastAutoTable = { finalY };
    return doc;
  }
  
  // For other tables, distribute evenly
  const colWidth = availableWidth / colCount;
  const colWidths = Array(colCount).fill(colWidth);
  
  // Combine head and body
  const tableData = head.length > 0 ? [head, ...body] : body;
  
  const finalY = createSimpleTable(doc, tableData, margin.left, startY, colWidths);
  
  // Store finalY for compatibility
  doc.lastAutoTable = { finalY };
  
  return doc;
};

/**
 * Generate PDF for Installments List
 */
export const generateInstallmentsPDF = (installments, filters = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('MADADGAAR', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Installment Plans Report', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Report Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Installment Plans: ${installments.length}`, 14, yPosition);
  yPosition += 8;

  // Summary Statistics
  const categoryCounts = {};
  const statusCounts = {};
  installments.forEach(item => {
    const category = item.category || 'Uncategorized';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    const status = (item.status || 'pending').toUpperCase();
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Summary Statistics', 14, yPosition);
  yPosition += 8;

  const summaryData = Object.entries(statusCounts).map(([status, count]) => [status, count.toString()]);

  callAutoTable(doc, {
    startY: yPosition,
    head: [['Status', 'Count']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Installments Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Installment Plans List', 14, yPosition);
  yPosition += 8;

  const tableData = installments.map((item, index) => [
    (index + 1).toString(),
    item.productName || 'N/A',
    item.companyName || 'N/A',
    item.category || 'N/A',
    `PKR ${(item.price || 0).toLocaleString()}`,
    item.paymentPlans?.length || 0,
    (item.status || 'pending').toUpperCase(),
    item.city || 'N/A',
  ]);

  callAutoTable(doc, {
    startY: yPosition,
    head: [['#', 'Product Name', 'Company', 'Category', 'Price', 'Plans', 'Status', 'City']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const filename = `Installments_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Generate PDF for Properties List
 */
export const generatePropertiesPDF = (properties, filters = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('MADADGAAR', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Properties Report', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  doc.text(`Total Properties: ${properties.length}`, 14, yPosition);
  yPosition += 8;

  // Properties Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Properties List', 14, yPosition);
  yPosition += 8;

  const getPropertyData = (property) => {
    if (property.type === 'Project' && property.project) {
      return {
        title: property.project.projectName || 'Untitled',
        location: `${property.project.area || ''}, ${property.project.city || ''}`.trim() || 'N/A',
        price: property.project.transaction?.price || property.project.transaction?.totalPayable || 0,
        type: 'Project',
      };
    } else if (property.type === 'Individual' && property.individualProperty) {
      return {
        title: property.individualProperty.title || 'Untitled',
        location: `${property.individualProperty.location || ''}, ${property.individualProperty.city || ''}`.trim() || 'N/A',
        price: property.individualProperty.transaction?.price || property.individualProperty.transaction?.totalPayable || 0,
        type: 'Individual',
      };
    }
    return { title: 'N/A', location: 'N/A', price: 0, type: 'N/A' };
  };

  const tableData = properties.map((property, index) => {
    const data = getPropertyData(property);
    return [
      (index + 1).toString(),
      data.title,
      data.type,
      data.location,
      `PKR ${data.price.toLocaleString()}`,
    ];
  });

  callAutoTable(doc, {
    startY: yPosition,
    head: [['#', 'Title', 'Type', 'Location', 'Price']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const filename = `Properties_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Generate PDF for Loans List
 */
export const generateLoansPDF = (loans, filters = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('MADADGAAR', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Loan Plans Report', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  doc.text(`Total Loan Plans: ${loans.length}`, 14, yPosition);
  yPosition += 8;

  // Loans Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Loan Plans List', 14, yPosition);
  yPosition += 8;

  const tableData = loans.map((loan, index) => [
    (index + 1).toString(),
    loan.productName || 'N/A',
    loan.bankName || 'N/A',
    loan.majorCategory || 'N/A',
    loan.planId || 'N/A',
    loan.status === 'active' ? 'ACTIVE' : 'INACTIVE',
  ]);

  callAutoTable(doc, {
    startY: yPosition,
    head: [['#', 'Product Name', 'Bank Name', 'Category', 'Plan ID', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const filename = `Loans_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Generate PDF for Users List
 */
export const generateUsersPDF = (users, filters = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(229, 57, 53);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('MADADGAAR', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Users Report', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  doc.text(`Total Users: ${users.length}`, 14, yPosition);
  yPosition += 8;

  // Summary Statistics
  const typeCounts = {};
  const statusCounts = {};
  users.forEach(user => {
    const type = (user.UserType || 'user').toUpperCase();
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    const status = user.isBlocked ? 'BLOCKED' : (user.isVerified ? 'VERIFIED' : 'UNVERIFIED');
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Summary Statistics', 14, yPosition);
  yPosition += 8;

  const summaryData = Object.entries(typeCounts).map(([type, count]) => [type, count.toString()]);

  callAutoTable(doc, {
    startY: yPosition,
    head: [['User Type', 'Count']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Users Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53);
  doc.text('Users List', 14, yPosition);
  yPosition += 8;

  const tableData = users.map((user, index) => [
    (index + 1).toString(),
    user.name || 'N/A',
    user.email || 'N/A',
    (user.UserType || 'user').toUpperCase(),
    user.isVerified ? 'VERIFIED' : 'UNVERIFIED',
    user.isBlocked ? 'BLOCKED' : 'ACTIVE',
    user.phoneNumber || 'N/A',
  ]);

  callAutoTable(doc, {
    startY: yPosition,
    head: [['#', 'Name', 'Email', 'Type', 'Verification', 'Status', 'Phone']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [229, 57, 53], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const filename = `Users_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
