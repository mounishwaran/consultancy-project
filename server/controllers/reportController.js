import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

// Helper function to generate PDF
const generatePDF = (data, type, startDate, endDate) => {
  // This is a placeholder - in a real implementation, you'd use jsPDF
  // For now, we'll return a simple text-based PDF content
  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`
  const dateRange = startDate && endDate ? 
    `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 
    'All Time'
  
  let content = `${title}\n`
  content += `Date Range: ${dateRange}\n`
  content += `Generated: ${new Date().toLocaleString()}\n\n`
  
  if (type === 'sales') {
    content += `Total Records: ${data.totalRecords}\n`
    content += `Total Amount: ₹${data.totalAmount}\n`
    content += `Average Order: ₹${data.averageOrder}\n\n`
    content += `Sales by Product:\n`
    Object.entries(data.salesByProduct || {}).forEach(([product, info]) => {
      content += `- ${product}: ${info.quantity} units, ₹${info.revenue}\n`
    })
  } else if (type === 'orders') {
    content += `Total Orders: ${data.totalRecords}\n\n`
    content += `Orders by Status:\n`
    Object.entries(data.ordersByStatus || {}).forEach(([status, count]) => {
      content += `- ${status}: ${count}\n`
    })
    content += `\nOrders by Payment Method:\n`
    Object.entries(data.ordersByPaymentMethod || {}).forEach(([method, count]) => {
      content += `- ${method}: ${count}\n`
    })
  } else if (type === 'products') {
    content += `Total Products: ${data.totalRecords}\n`
    content += `Total Inventory Value: ₹${data.totalValue}\n\n`
    content += `Products by Category:\n`
    Object.entries(data.productsByCategory || {}).forEach(([category, count]) => {
      content += `- ${category}: ${count} products\n`
    })
  } else if (type === 'customers') {
    content += `Total Customers: ${data.totalRecords}\n`
    content += `New Customers: ${data.newCustomers}\n\n`
    content += `Customers by City:\n`
    Object.entries(data.customersByCity || {}).forEach(([city, count]) => {
      content += `- ${city}: ${count} customers\n`
    })
  } else if (type === 'inventory') {
    content += `Total Products: ${data.totalRecords}\n`
    content += `Low Stock Products: ${data.lowStockProducts}\n`
    content += `Out of Stock Products: ${data.outOfStockProducts}\n`
    content += `Total Inventory Value: ₹${data.totalInventoryValue}\n\n`
    content += `Inventory by Category:\n`
    Object.entries(data.inventoryByCategory || {}).forEach(([category, info]) => {
      content += `- ${category}: ${info.totalProducts} products, ${info.totalStock} units, ₹${info.totalValue}\n`
    })
  }
  
  return content
}

// Helper function to generate CSV
const generateCSV = (data, type) => {
  let csv = ''
  
  if (type === 'sales' && data.salesByProduct) {
    csv = 'Product,Quantity,Revenue\n'
    Object.entries(data.salesByProduct).forEach(([product, info]) => {
      csv += `"${product}",${info.quantity},${info.revenue}\n`
    })
  } else if (type === 'orders' && data.orders) {
    csv = 'Order ID,Date,Customer,Total,Status,Payment Method\n'
    data.orders.forEach(order => {
      csv += `${order.id},${order.date},${order.customer},${order.total},${order.status},${order.paymentMethod}\n`
    })
  } else if (type === 'products' && data.products) {
    csv = 'Product Name,Category,Price,Stock,In Stock\n'
    data.products.forEach(product => {
      csv += `"${product.name}","${product.category}",${product.price},${product.stock},${product.inStock}\n`
    })
  } else if (type === 'customers' && data.customers) {
    csv = 'Customer Name,Email,Phone,City,Joined Date\n'
    data.customers.forEach(customer => {
      csv += `"${customer.name}","${customer.email}","${customer.phone}","${customer.city}",${customer.joinedAt}\n`
    })
  } else if (type === 'inventory' && data.products) {
    csv = 'Product Name,Category,Stock,Price,Value,Status\n'
    data.products.forEach(product => {
      csv += `"${product.name}","${product.category}",${product.stock},${product.price},${product.value},"${product.status}"\n`
    })
  }
  
  return csv
}

export const generateSalesReport = async (startDate, endDate) => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: 'delivered'
    }).populate('items.product')

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Sales by product
    const salesByProduct = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const productName = item.product.name
          if (!salesByProduct[productName]) {
            salesByProduct[productName] = { quantity: 0, revenue: 0 }
          }
          salesByProduct[productName].quantity += item.quantity
          salesByProduct[productName].revenue += item.price * item.quantity
        }
      })
    })

    return {
      totalRecords: totalOrders,
      totalAmount: totalSales,
      averageOrder: averageOrderValue,
      salesByProduct
    }
  } catch (error) {
    throw new Error('Error generating sales report: ' + error.message)
  }
}

export const generateOrdersReport = async (startDate, endDate) => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('user items.product')

    const ordersByStatus = {}
    const ordersByPaymentMethod = {}

    orders.forEach(order => {
      // Group by status
      if (!ordersByStatus[order.status]) {
        ordersByStatus[order.status] = 0
      }
      ordersByStatus[order.status]++

      // Group by payment method
      if (!ordersByPaymentMethod[order.paymentMethod]) {
        ordersByPaymentMethod[order.paymentMethod] = 0
      }
      ordersByPaymentMethod[order.paymentMethod]++
    })

    return {
      totalRecords: orders.length,
      ordersByStatus,
      ordersByPaymentMethod,
      orders: orders.map(order => ({
        id: order._id,
        date: order.createdAt,
        customer: order.user?.name || 'Guest',
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod
      }))
    }
  } catch (error) {
    throw new Error('Error generating orders report: ' + error.message)
  }
}

export const generateProductsReport = async (startDate, endDate) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 })

    const productsByCategory = {}
    const productsByStock = { inStock: 0, outOfStock: 0 }

    products.forEach(product => {
      // Group by category
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = 0
      }
      productsByCategory[product.category]++

      // Group by stock status
      if (product.inStock) {
        productsByStock.inStock++
      } else {
        productsByStock.outOfStock++
      }
    })

    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)

    return {
      totalRecords: products.length,
      totalValue,
      productsByCategory,
      productsByStock,
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        inStock: product.inStock,
        createdAt: product.createdAt
      }))
    }
  } catch (error) {
    throw new Error('Error generating products report: ' + error.message)
  }
}

export const generateCustomersReport = async (startDate, endDate) => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const customers = await User.find({ role: 'user' }).sort({ createdAt: -1 })
    const newCustomers = await User.find({
      role: 'user',
      createdAt: { $gte: start, $lte: end }
    })

    const customersByCity = {}
    customers.forEach(customer => {
      const city = customer.address?.city || 'Unknown'
      if (!customersByCity[city]) {
        customersByCity[city] = 0
      }
      customersByCity[city]++
    })

    return {
      totalRecords: customers.length,
      newCustomers: newCustomers.length,
      customersByCity,
      customers: customers.map(customer => ({
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.address?.city || 'Unknown',
        joinedAt: customer.createdAt
      }))
    }
  } catch (error) {
    throw new Error('Error generating customers report: ' + error.message)
  }
}

export const generateInventoryReport = async (startDate, endDate) => {
  try {
    const products = await Product.find({})

    const lowStockProducts = products.filter(product => product.stock < 10 && product.stock > 0)
    const outOfStockProducts = products.filter(product => product.stock === 0)

    const inventoryByCategory = {}
    let totalInventoryValue = 0

    products.forEach(product => {
      if (!inventoryByCategory[product.category]) {
        inventoryByCategory[product.category] = {
          totalProducts: 0,
          totalStock: 0,
          totalValue: 0
        }
      }
      inventoryByCategory[product.category].totalProducts++
      inventoryByCategory[product.category].totalStock += product.stock
      inventoryByCategory[product.category].totalValue += product.price * product.stock
      totalInventoryValue += product.price * product.stock
    })

    return {
      totalRecords: products.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      totalInventoryValue,
      inventoryByCategory,
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        value: product.price * product.stock,
        status: product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'
      }))
    }
  } catch (error) {
    throw new Error('Error generating inventory report: ' + error.message)
  }
}
