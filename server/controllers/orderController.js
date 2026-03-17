import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { saveBillToFile } from '../utils/billGenerator.js';

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
      image: item.product.images[0] || '',
    }));

    const itemsPrice = cart.totalPrice;
    const shippingPrice = itemsPrice >= 10000 ? 0 : 100; // Free shipping above 10000
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    // Decrease product stock / size-wise stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) continue;

      // Handle size-wise stock if configured
      if (product.sizeStock && product.sizeStock.length > 0 && item.size) {
        const entry = product.sizeStock.find((s) => s.size === item.size);
        if (entry) {
          entry.stock = Math.max(0, (entry.stock || 0) - item.quantity);
        }
        // Recalculate total stock and inStock flag in pre-save hook
      } else if (typeof product.stock === 'number') {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.inStock = product.stock > 0;
      }

      await product.save();
    }

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    // Generate bill for the order
    try {
      const user = await User.findById(req.user._id);
      const billUrl = await saveBillToFile(order, user);
      
      // Update order with bill information
      order.billGenerated = true;
      order.billGeneratedAt = new Date();
      order.billUrl = billUrl;
      await order.save();
      
      console.log('Bill generated successfully:', billUrl);
    } catch (billError) {
      console.error('Error generating bill:', billError);
      // Don't fail the order if bill generation fails
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadOrderBill = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token } = req.query;
    
    // Find the order
    const order = await Order.findById(orderId).populate('user');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check authentication - either via middleware or token parameter
    let userId = req.user?._id;
    
    // If no user from middleware, try token from query
    if (!userId && token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (tokenError) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
    
    // Check if user owns the order or is admin
    const userRole = req.user?.role;
    if (order.user._id.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this bill' });
    }
    
    // Generate bill if not already generated
    let billUrl = order.billUrl;
    if (!order.billGenerated || !billUrl) {
      try {
        const { saveBillToFile } = await import('../utils/billGenerator.js');
        billUrl = await saveBillToFile(order, order.user);
        order.billGenerated = true;
        order.billGeneratedAt = new Date();
        order.billUrl = billUrl;
        await order.save();
      } catch (billError) {
        console.error('Error generating bill:', billError);
        return res.status(500).json({ message: 'Failed to generate bill' });
      }
    }
    
    // Serve the bill file
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const billPath = path.join(__dirname, '..', billUrl);
    
    if (!fs.existsSync(billPath)) {
      return res.status(404).json({ message: 'Bill file not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="bill-${orderId}.pdf"; filename*=UTF-8''bill-${orderId}.pdf`)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.sendFile(billPath);
    
  } catch (error) {
    console.error('Error downloading bill:', error);
    res.status(500).json({ message: 'Failed to download bill' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    // Check if it's a valid ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    if (!isValidObjectId) {
      // If not valid ObjectId, try to find by partial ID
      const partialId = req.params.id.toLowerCase();
      
      // Find all user orders
      const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');

      // Find order by matching last 8 characters
      const order = orders.find(
        o => o._id.toString().slice(-8).toLowerCase() === partialId
      );

      if (order) {
        return res.json(order);
      } else {
        return res.status(404).json({ message: 'Order not found' });
      }
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product');

    if (order) {
      // Check if user owns the order or is admin
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderByPartialId = async (req, res) => {
  try {
    const partialId = (req.params.partialId || req.params.id).toLowerCase();

    // Find all user orders
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');

    // Find order by matching last 8 characters
    const order = orders.find(
      o => o._id.toString().slice(-8).toLowerCase() === partialId
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = req.body;
      order.orderStatus = 'processing';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.orderStatus = 'delivered';
      order.trackingNumber = req.body.trackingNumber;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

