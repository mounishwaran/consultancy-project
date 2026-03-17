import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-store';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin123', // Change this password after first login
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();

