import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  clearAllProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.array('images', 10), createProduct);
router.put('/:id', protect, admin, upload.array('images', 10), updateProduct);
router.delete('/clear-all', protect, admin, clearAllProducts);
router.delete('/:id', protect, admin, deleteProduct);

export default router;

