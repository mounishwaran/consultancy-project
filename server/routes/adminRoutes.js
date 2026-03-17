import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);

export default router;

