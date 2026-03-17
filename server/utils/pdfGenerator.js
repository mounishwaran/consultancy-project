import { jsPDF } from 'jspdf'

export const generatePDFReport = (data, type, startDate, endDate) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 20, 20)
  
  // Add date range
  doc.setFontSize(12)
  const dateRange = startDate && endDate ? 
    `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 
    'All Time'
  doc.text(`Date Range: ${dateRange}`, 20, 30)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40)
  
  let yPosition = 60
  
  // Add summary statistics
  doc.setFontSize(14)
  doc.text('Summary', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  doc.text(`Total Records: ${data.totalRecords || 0}`, 20, yPosition)
  yPosition += 8
  
  if (data.totalAmount !== undefined) {
    doc.text(`Total Amount: ₹${data.totalAmount}`, 20, yPosition)
    yPosition += 8
  }
  
  if (data.averageOrder !== undefined) {
    doc.text(`Average Order: ₹${data.averageOrder}`, 20, yPosition)
    yPosition += 8
  }
  
  if (data.newCustomers !== undefined) {
    doc.text(`New Customers: ${data.newCustomers}`, 20, yPosition)
    yPosition += 8
  }
  
  if (data.lowStockProducts !== undefined) {
    doc.text(`Low Stock Products: ${data.lowStockProducts}`, 20, yPosition)
    yPosition += 8
  }
  
  if (data.outOfStockProducts !== undefined) {
    doc.text(`Out of Stock Products: ${data.outOfStockProducts}`, 20, yPosition)
    yPosition += 8
  }
  
  if (data.totalInventoryValue !== undefined) {
    doc.text(`Total Inventory Value: ₹${data.totalInventoryValue}`, 20, yPosition)
    yPosition += 8
  }
  
  yPosition += 10
  
  // Add detailed data
  doc.setFontSize(14)
  doc.text('Details', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  
  // Add sales by product
  if (data.salesByProduct) {
    doc.text('Sales by Product:', 20, yPosition)
    yPosition += 8
    Object.entries(data.salesByProduct).forEach(([product, info]) => {
      doc.text(`- ${product}: ${info.quantity} units, ₹${info.revenue}`, 25, yPosition)
      yPosition += 6
    })
    yPosition += 5
  }
  
  // Add orders by status
  if (data.ordersByStatus) {
    doc.text('Orders by Status:', 20, yPosition)
    yPosition += 8
    Object.entries(data.ordersByStatus).forEach(([status, count]) => {
      doc.text(`- ${status}: ${count}`, 25, yPosition)
      yPosition += 6
    })
    yPosition += 5
  }
  
  // Add orders by payment method
  if (data.ordersByPaymentMethod) {
    doc.text('Orders by Payment Method:', 20, yPosition)
    yPosition += 8
    Object.entries(data.ordersByPaymentMethod).forEach(([method, count]) => {
      doc.text(`- ${method}: ${count}`, 25, yPosition)
      yPosition += 6
    })
    yPosition += 5
  }
  
  // Add products by category
  if (data.productsByCategory) {
    doc.text('Products by Category:', 20, yPosition)
    yPosition += 8
    Object.entries(data.productsByCategory).forEach(([category, count]) => {
      doc.text(`- ${category}: ${count} products`, 25, yPosition)
      yPosition += 6
    })
    yPosition += 5
  }
  
  // Add customers by city
  if (data.customersByCity) {
    doc.text('Customers by City:', 20, yPosition)
    yPosition += 8
    Object.entries(data.customersByCity).forEach(([city, count]) => {
      doc.text(`- ${city}: ${count} customers`, 25, yPosition)
      yPosition += 6
    })
    yPosition += 5
  }
  
  // Add inventory by category
  if (data.inventoryByCategory) {
    doc.text('Inventory by Category:', 20, yPosition)
    yPosition += 8
    Object.entries(data.inventoryByCategory).forEach(([category, info]) => {
      doc.text(`- ${category}: ${info.totalProducts} products, ${info.totalStock} units, ₹${info.totalValue}`, 25, yPosition)
      yPosition += 6
    })
  }
  
  // Add table data if available
  if (data.products && data.products.length > 0) {
    yPosition += 10
    doc.text('Product Details:', 20, yPosition)
    yPosition += 8
    
    // Table headers
    doc.text('Name', 20, yPosition)
    doc.text('Category', 60, yPosition)
    doc.text('Price', 100, yPosition)
    doc.text('Stock', 130, yPosition)
    yPosition += 6
    
    // Table rows (limit to first 10 products to fit on page)
    data.products.slice(0, 10).forEach(product => {
      doc.text(product.name?.substring(0, 15) || '', 20, yPosition)
      doc.text(product.category?.substring(0, 10) || '', 60, yPosition)
      doc.text(`₹${product.price || 0}`, 100, yPosition)
      doc.text(`${product.stock || 0}`, 130, yPosition)
      yPosition += 6
    })
  }
  
  return doc
}
