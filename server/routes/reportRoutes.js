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
router.get('/download', async (req, res) => {
  try {
    const { format } = req.query
    const { type, startDate, endDate } = req.query

    // Validate input parameters
    if (!type) {
      return res.status(400).json({ message: 'Report type is required' })
    }

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
        detailedData: []
      }
    }

    // Validate data before export
    if (!reportData || (reportData.detailedData && reportData.detailedData.length === 0)) {
      return res.status(400).json({ message: 'No data available for report' })
    }

    // Generate unique filename based on timestamp
    const timestamp = new Date().getTime()
    const filename = `report-${timestamp}`

    if (format === 'csv') {
      let csvContent = ''
      
      if (type === 'sales' && reportData.detailedData) {
        csvContent = 'Date,Order ID,Customer,Product,Quantity,Revenue\n'
        reportData.detailedData.forEach(item => {
          csvContent += `${item.date || ''},${item.orderId || ''},"${item.customer || 'N/A'}","${item.product || 'N/A'}",${item.quantity || 0},${item.revenue || 0}\n`
        })
      } else if (type === 'orders' && reportData.detailedData) {
        csvContent = 'Date,Order ID,Customer,Product,Quantity,Revenue\n'
        reportData.detailedData.forEach(item => {
          csvContent += `${item.date || ''},${item.orderId || ''},"${item.customer || 'N/A'}","${item.product || 'N/A'}",${item.quantity || 0},${item.revenue || 0}\n`
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
        csvContent = 'Date,Order ID,Customer,Product,Quantity,Revenue\nNo Data,No Data,No Data,No Data,0,0'
      }
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
      res.send(csvContent)
    } else if (format === 'pdf') {
      try {
        // Generate proper PDF using jsPDF
        const doc = generatePDFReport(reportData, type || 'sales', startDate, endDate)
        const pdfBuffer = doc.output('arraybuffer')
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`)
        res.send(Buffer.from(pdfBuffer))
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError)
        // Fallback to text file if PDF generation fails
        const textContent = `${type || 'Sales'} Report\nDate Range: ${startDate || 'All Time'} - ${endDate || 'All Time'}\nGenerated: ${new Date().toLocaleString()}\n\nTotal Records: ${reportData.totalRecords || 0}\nTotal Amount: Rs. ${reportData.totalAmount || 0}`
        
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`)
        res.send(textContent)
      }
    } else if (format === 'excel') {
      // Generate CSV for Excel (Excel can open CSV files)
      let excelContent = ''
      
      if (type === 'sales' && reportData.detailedData) {
        excelContent = 'Date,Order ID,Customer,Product,Quantity,Revenue\n'
        reportData.detailedData.forEach(item => {
          excelContent += `${item.date || ''},${item.orderId || ''},"${item.customer || 'N/A'}","${item.product || 'N/A'}",${item.quantity || 0},${item.revenue || 0}\n`
        })
      } else if (type === 'orders' && reportData.detailedData) {
        excelContent = 'Date,Order ID,Customer,Product,Quantity,Revenue\n'
        reportData.detailedData.forEach(item => {
          excelContent += `${item.date || ''},${item.orderId || ''},"${item.customer || 'N/A'}","${item.product || 'N/A'}",${item.quantity || 0},${item.revenue || 0}\n`
        })
      } else {
        // Default Excel content
        excelContent = 'Date,Order ID,Customer,Product,Quantity,Revenue\nNo Data,No Data,No Data,No Data,0,0'
      }
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
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
