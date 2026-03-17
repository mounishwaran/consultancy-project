import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-store';

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    const email = 'admin@gmail.com';
    const newPassword = 'admin123';

    const admin = await User.findOne({ email });
    if (!admin) {
      console.log('Admin user not found, creating new admin user');
      await User.create({
        name: 'Admin',
        email,
        password: newPassword,
        role: 'admin',
      });
    } else {
      admin.password = newPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('Admin password reset and role set to admin');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

resetAdminPassword();

