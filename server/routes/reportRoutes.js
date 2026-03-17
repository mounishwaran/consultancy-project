import express from 'express'
import { generateSalesReport, generateOrdersReport, generateProductsReport, generateCustomersReport, generateInventoryReport } from '../controllers/reportController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { generatePDFReport } from '../utils/pdfGenerator.js'

const router = express.Router()

// All routes are protected and admin only
router.use(protect)
router.use(admin)

// Get all reports
router.get('/', async (req, res) => {
  try {
    // For now, return empty array - in a real app, fetch from database
    res.json([])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Generate new report
router.post('/generate', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body
    let reportData = {}

    switch (type) {
      case 'sales':
        reportData = await generateSalesReport(startDate, endDate)
        break
      case 'orders':
        reportData = await generateOrdersReport(startDate, endDate)
        break
      case 'products':
        reportData = await generateProductsReport(startDate, endDate)
        break
      case 'customers':
        reportData = await generateCustomersReport(startDate, endDate)
        break
      case 'inventory':
        reportData = await generateInventoryReport(startDate, endDate)
        break
      default:
        return res.status(400).json({ message: 'Invalid report type' })
    }

    // Generate a unique report ID
    const reportId = new Date().getTime().toString()
    
    res.json({
      id: reportId,
      type,
      startDate,
      endDate,
      ...reportData,
      createdAt: new Date()
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Download report
router.get('/:id/download', async (req, res) => {
  try {
    const { format } = req.query
    const reportId = req.params.id
    const { type, startDate, endDate } = req.query

    let reportData = {}

    // Generate real report data based on type
    try {
      switch (type) {
        case 'sales':
          reportData = await generateSalesReport(startDate, endDate)
          break
        case 'orders':
          reportData = await generateOrdersReport(startDate, endDate)
          break
        case 'products':
          reportData = await generateProductsReport(startDate, endDate)
          break
        case 'customers':
          reportData = await generateCustomersReport(startDate, endDate)
          break
        case 'inventory':
          reportData = await generateInventoryReport(startDate, endDate)
          break
        default:
          // Default to sales data if no type specified
          reportData = await generateSalesReport(startDate, endDate)
          break
      }
    } catch (error) {
      console.error('Error generating report data:', error)
      // Fallback to basic data
      reportData = {
        totalRecords: 0,
        totalAmount: 0,
        averageOrder: 0,
        salesByProduct: {}
      }
    }

    if (format === 'csv') {
      let csvContent = ''
      
      if (type === 'sales' && reportData.salesByProduct) {
        csvContent = 'Product,Quantity,Revenue\n'
        Object.entries(reportData.salesByProduct).forEach(([product, info]) => {
          csvContent += `"${product}",${info.quantity},${info.revenue}\n`
        })
      } else if (type === 'orders' && reportData.orders) {
        csvContent = 'Order ID,Date,Customer,Total,Status,Payment Method\n'
        reportData.orders.forEach(order => {
          csvContent += `${order.id},${order.date},${order.customer},${order.total},${order.status},${order.paymentMethod}\n`
        })
      } else if (type === 'products' && reportData.products) {
        csvContent = 'Product Name,Category,Price,Stock,In Stock\n'
        reportData.products.forEach(product => {
          csvContent += `"${product.name}","${product.category}",${product.price},${product.stock},${product.inStock}\n`
        })
      } else if (type === 'customers' && reportData.customers) {
        csvContent = 'Customer Name,Email,Phone,City,Joined Date\n'
        reportData.customers.forEach(customer => {
          csvContent += `"${customer.name}","${customer.email}","${customer.phone}","${customer.city}",${customer.joinedAt}\n`
        })
      } else if (type === 'inventory' && reportData.products) {
        csvContent = 'Product Name,Category,Stock,Price,Value,Status\n'
        reportData.products.forEach(product => {
          csvContent += `"${product.name}","${product.category}",${product.stock},${product.price},${product.value},"${product.status}"\n`
        })
      } else {
        // Default CSV content
        csvContent = 'Type,Date,Amount,Status\nSales,' + new Date().toLocaleDateString() + ',0,No Data'
      }
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.csv"`)
      res.send(csvContent)
    } else if (format === 'pdf') {
      try {
        // Generate proper PDF using jsPDF
        const doc = generatePDFReport(reportData, type || 'sales', startDate, endDate)
        const pdfBuffer = doc.output('arraybuffer')
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.pdf"`)
        res.send(Buffer.from(pdfBuffer))
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError)
        // Fallback to text file if PDF generation fails
        const textContent = `${type || 'Sales'} Report\nDate Range: ${startDate || 'All Time'} - ${endDate || 'All Time'}\nGenerated: ${new Date().toLocaleString()}\n\nTotal Records: ${reportData.totalRecords || 0}\nTotal Amount: ₹${reportData.totalAmount || 0}`
        
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.txt"`)
        res.send(textContent)
      }
    } else if (format === 'excel') {
      // Generate CSV for Excel (Excel can open CSV files)
      let excelContent = ''
      
      if (type === 'sales' && reportData.salesByProduct) {
        excelContent = 'Product,Quantity,Revenue\n'
        Object.entries(reportData.salesByProduct).forEach(([product, info]) => {
          excelContent += `"${product}",${info.quantity},${info.revenue}\n`
        })
      } else {
        // Default Excel content
        excelContent = 'Type,Date,Amount,Status\nSales,' + new Date().toLocaleDateString() + ',0,No Data'
      }
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.csv"`)
      res.send(excelContent)
    } else {
      res.status(400).json({ message: 'Invalid format' })
    }
  } catch (error) {
    console.error('Error downloading report:', error)
    res.status(500).json({ message: 'Failed to download report: ' + error.message })
  }
})

export default router
