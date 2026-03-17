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
    doc.text(`Total Amount: Rs. ${data.totalAmount}`, 20, yPosition)
    yPosition += 8
  }
  
  if (data.averageOrder !== undefined) {
    doc.text(`Average Order: Rs. ${data.averageOrder}`, 20, yPosition)
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
    doc.text(`Total Inventory Value: Rs. ${data.totalInventoryValue}`, 20, yPosition)
    yPosition += 8
  }
  
  yPosition += 10
  
  // Add detailed data table for sales and orders
  if (data.detailedData && data.detailedData.length > 0) {
    doc.setFontSize(14)
    doc.text('Detailed Data', 20, yPosition)
    yPosition += 15
    
    // Table headers
    doc.setFontSize(10)
    const headers = ['Date', 'Order ID', 'Customer', 'Product', 'Quantity', 'Revenue']
    const colWidths = [25, 30, 40, 50, 20, 25]
    let xPos = 20
    
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPosition)
      xPos += colWidths[i]
    })
    yPosition += 8
    
    // Table rows (limit to first 20 entries to fit on page)
    data.detailedData.slice(0, 20).forEach((item) => {
      xPos = 20
      const rowData = [
        item.date || '',
        item.orderId || '',
        item.customer ? (item.customer.length > 20 ? item.customer.substring(0, 20) + '...' : item.customer) : 'N/A',
        item.product ? (item.product.length > 25 ? item.product.substring(0, 25) + '...' : item.product) : 'N/A',
        (item.quantity || 0).toString(),
        `Rs. ${item.revenue || 0}`
      ]
      
      rowData.forEach((data, i) => {
        doc.text(data, xPos, yPosition)
        xPos += colWidths[i]
      })
      yPosition += 7
    })
    
    if (data.detailedData.length > 20) {
      doc.text(`... and ${data.detailedData.length - 20} more records`, 20, yPosition + 5)
    }
    yPosition += 15
  }
  
  // Add aggregated data
  doc.setFontSize(14)
  doc.text('Aggregated Data', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  
  // Add sales by product
  if (data.salesByProduct) {
    doc.text('Sales by Product:', 20, yPosition)
    yPosition += 8
    Object.entries(data.salesByProduct).forEach(([product, info]) => {
      doc.text(`- ${product}: ${info.quantity} units, Rs. ${info.revenue}`, 25, yPosition)
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
      doc.text(`- ${category}: ${info.totalProducts} products, ${info.totalStock} units, Rs. ${info.totalValue}`, 25, yPosition)
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
      doc.text(`Rs. ${product.price || 0}`, 100, yPosition)
      doc.text(`${product.stock || 0}`, 130, yPosition)
      yPosition += 6
    })
  }
  
  return doc
}
