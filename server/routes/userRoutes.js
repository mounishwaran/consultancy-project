import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', admin, getUsers);
router.get('/:id', admin, getUserById);
router.put('/:id', admin, updateUser);
router.delete('/:id', admin, deleteUser);

export default router;

