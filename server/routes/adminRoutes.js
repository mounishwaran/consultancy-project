import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { 
  getDashboardStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderTracking,
  updatePaymentStatus,
  deleteOrder,
  getAllUsers,
  getUserById,
  blockUser,
  deleteUser,
  generateInvoicePDF
} from '../controllers/adminController.js';
import generateInvoice from '../utils/invoiceGenerator.js';
import Order from '../models/Order.js';

const router = express.Router();

// Test route for debugging (no auth required)
router.get('/test-invoice/:id', async (req, res) => {
  try {
    console.log('=== TEST INVOICE GENERATION START ===');
    console.log('Order ID:', req.params.id);
    
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
    console.error('=== TEST INVOICE GENERATION ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate invoice' });
    }
  }
});

// All routes are protected and admin only
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Order Management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/tracking', updateOrderTracking);
router.put('/orders/:id/payment', updatePaymentStatus);
router.delete('/orders/:id', deleteOrder);
router.get('/orders/:id/invoice', generateInvoicePDF);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);

export default router;

