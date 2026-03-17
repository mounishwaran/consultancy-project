import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getUserOrders,
  getOrderByPartialId,
  downloadOrderBill,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getUserOrders);
router.get('/search/:partialId', getOrderByPartialId);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.get('/', protect, admin, getOrders);

// Public download route (handles auth internally)
const downloadRouter = express.Router();
downloadRouter.get('/:id/download-bill', downloadOrderBill);

export { router, downloadRouter };
export default router;

