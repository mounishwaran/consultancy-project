import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import generateInvoice from '../utils/invoiceGenerator.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', totalSold: { $sum: '$orderItems.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalSold: 1, _id: 1 } }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      $or: [
        { stock: { $lt: 10 } },
        { 'sizeStock.stock': { $lt: 5 } }
      ]
    }).select('name stock sizeStock').limit(10);

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
      topProducts,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
    const query = {};

    // Filter by status
    if (status) {
      query.orderStatus = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search by order ID or user email
    if (search) {
      query.$or = [
        { _id: search },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Status updated to ${status} by admin`,
    });

    order.orderStatus = status;

    // Update delivered status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderTracking = async (req, res) => {
  try {
    const { trackingId, courier } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.trackingId = trackingId;
    order.courier = courier;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restore stock if order is cancelled
    if (order.orderStatus !== 'delivered') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          // Handle size-wise stock
          if (product.sizeStock && product.sizeStock.length > 0 && item.size) {
            const entry = product.sizeStock.find((s) => s.size === item.size);
            if (entry) {
              entry.stock = (entry.stock || 0) + item.quantity;
            }
          } else if (typeof product.stock === 'number') {
            product.stock += item.quantity;
            product.inStock = product.stock > 0;
          }
          await product.save();
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ user, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ 
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      isBlocked: user.isBlocked 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has orders
    const orderCount = await Order.countDocuments({ user: user._id });
    if (orderCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing orders. Consider blocking the user instead.' 
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { isPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = isPaid;
    if (isPaid) {
      order.paidAt = new Date();
    } else {
      order.paidAt = null;
    }

    const updatedOrder = await order.save();
    res.json({
      message: `Payment status updated to ${isPaid ? 'paid' : 'unpaid'}`,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateInvoicePDF = async (req, res) => {
  try {
    console.log('=== INVOICE GENERATION START ===');
    console.log('Order ID:', req.params.id);
    
    // Test basic response first
    if (req.params.id === 'test') {
      return res.json({ message: 'Route is working' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('orderItems.product');

    console.log('Order found:', !!order);
    console.log('User found:', !!order?.user);

    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('About to call generateInvoice...');
    
    // Generate and stream PDF directly
    generateInvoice(order, order.user, res);
    
    console.log('generateInvoice called successfully');
    
  } catch (error) {
    console.error('=== INVOICE GENERATION ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate invoice' });
    }
  }
};
