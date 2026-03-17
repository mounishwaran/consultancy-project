import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const generateOrderBill = async (order, user) => {
  const doc = new jsPDF()
  
  // Company Header
  doc.setFontSize(24)
  doc.text('Jolly Enterprises', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text('Fashion & Clothing Store', 105, 28, { align: 'center' })
  doc.text('Email: info@jollyenterprises.com | Phone: +91 98765 43210', 105, 35, { align: 'center' })
  
  // Bill Title
  doc.setFontSize(18)
  doc.text('INVOICE / BILL', 105, 50, { align: 'center' })
  
  // Bill Details
  doc.setFontSize(12)
  doc.text(`Bill No: #${order._id.toString().slice(-8).toUpperCase()}`, 20, 70)
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 80)
  doc.text(`Order Status: ${order.orderStatus.toUpperCase()}`, 20, 90)
  
  // Customer Details
  doc.text('Bill To:', 20, 110)
  doc.setFontSize(10)
  doc.text(`${user.name}`, 20, 120)
  doc.text(`${user.email}`, 20, 128)
  doc.text(`${user.phone || 'N/A'}`, 20, 136)
  
  if (order.shippingAddress) {
    doc.text(`${order.shippingAddress.street}`, 20, 144)
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 20, 152)
    doc.text(`${order.shippingAddress.country}`, 20, 160)
  }
  
  // Items Table Header
  let yPosition = 180
  doc.setFontSize(12)
  doc.text('Order Items:', 20, yPosition)
  yPosition += 10
  
  // Table Headers
  doc.setFontSize(10)
  doc.text('Product', 20, yPosition)
  doc.text('Qty', 100, yPosition)
  doc.text('Price', 120, yPosition)
  doc.text('Total', 150, yPosition)
  yPosition += 5
  
  // Line under headers
  doc.line(20, yPosition, 180, yPosition)
  yPosition += 10
  
  // Order Items
  doc.setFontSize(9)
  order.orderItems.forEach((item, index) => {
    const productName = item.name || item.product?.name || 'Product'
    const truncatedName = productName.length > 25 ? productName.substring(0, 22) + '...' : productName
    
    doc.text(truncatedName, 20, yPosition)
    doc.text(item.quantity.toString(), 100, yPosition)
    doc.text(`₹${item.price}`, 120, yPosition)
    doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 150, yPosition)
    yPosition += 8
    
    // Add size and color if available
    if (item.size || item.color) {
      doc.setFontSize(8)
      doc.text(`Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}`, 25, yPosition)
      yPosition += 6
      doc.setFontSize(9)
    }
  })
  
  // Line above totals
  yPosition += 5
  doc.line(20, yPosition, 180, yPosition)
  yPosition += 10
  
  // Totals
  doc.setFontSize(11)
  doc.text(`Subtotal:`, 120, yPosition)
  doc.text(`₹${order.totalPrice.toFixed(2)}`, 150, yPosition)
  yPosition += 8
  
  doc.text(`Tax (0%):`, 120, yPosition)
  doc.text('₹0.00', 150, yPosition)
  yPosition += 8
  
  doc.setFontSize(12)
  doc.text('Total Amount:', 120, yPosition)
  doc.text(`₹${order.totalPrice.toFixed(2)}`, 150, yPosition)
  yPosition += 8
  
  // Payment Information
  yPosition += 15
  doc.setFontSize(10)
  doc.text(`Payment Method: ${order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}`, 20, yPosition)
  yPosition += 8
  doc.text(`Payment Status: ${order.isPaid ? 'Paid' : 'Pending'}`, 20, yPosition)
  if (order.paidAt) {
    yPosition += 8
    doc.text(`Paid On: ${new Date(order.paidAt).toLocaleDateString()}`, 20, yPosition)
  }
  
  // Shipping Information
  yPosition += 15
  doc.text('Shipping Address:', 20, yPosition)
  yPosition += 8
  if (order.shippingAddress) {
    doc.setFontSize(9)
    doc.text(`${order.shippingAddress.street}`, 20, yPosition)
    yPosition += 6
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`, 20, yPosition)
    yPosition += 6
    doc.text(`${order.shippingAddress.country}`, 20, yPosition)
  }
  
  // Footer
  const footerY = 270
  doc.setFontSize(8)
  doc.text('Thank you for shopping with Jolly Enterprises!', 105, footerY, { align: 'center' })
  doc.text('This is a computer-generated bill and does not require signature.', 105, footerY + 5, { align: 'center' })
  doc.text('For any queries, contact: info@jollyenterprises.com | +91 98765 43210', 105, footerY + 10, { align: 'center' })
  
  return doc
}

export const saveBillToFile = async (order, user) => {
  try {
    const doc = await generateOrderBill(order, user)
    
    // Create bills directory if it doesn't exist
    const billsDir = path.join(__dirname, '../bills')
    if (!fs.existsSync(billsDir)) {
      fs.mkdirSync(billsDir, { recursive: true })
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `bill-${order._id}-${timestamp}.pdf`
    const filepath = path.join(billsDir, filename)
    
    // Save PDF to file
    const pdfBuffer = doc.output('arraybuffer')
    fs.writeFileSync(filepath, Buffer.from(pdfBuffer))
    
    return `/bills/${filename}`
  } catch (error) {
    console.error('Error saving bill to file:', error)
    throw error
  }
}
