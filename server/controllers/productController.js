import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper function to normalize category names
const normalizeCategory = (category) => {
  if (!category) return category;
  // Normalize Pant/Track variations
  if (category === 'Pant / Track' || category === 'Pant/Track') {
    return 'Pant/Track';
  }
  return category;
};

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      featured,
      newArrival,
      backInStock,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    // Debug logging
    console.log('API Request - Original category:', category);
    const normalizedCategory = normalizeCategory(category);
    console.log('API Request - Normalized category:', normalizedCategory);

    const query = {};

    if (category) query.category = normalizedCategory;
    if (subcategory) query.subcategory = subcategory;
    if (featured === 'true') query.featured = true;
    if (newArrival === 'true') query.newArrival = true;
    if (backInStock === 'true') query.backInStock = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {};
    if (sort === 'price-low') sortOptions.price = 1;
    if (sort === 'price-high') sortOptions.price = -1;
    if (sort === 'newest') sortOptions.createdAt = -1;
    if (sort === 'rating') sortOptions.rating = -1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Normalize category name
    if (productData.category) {
      productData.category = normalizeCategory(productData.category);
    }
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      // If images are passed as URLs
      productData.images = Array.isArray(req.body.images) 
        ? req.body.images 
        : [req.body.images];
    }

    // Parse sizes, sizeStock and colors if they're strings
    if (typeof productData.sizes === 'string') {
      productData.sizes = productData.sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    if (typeof productData.sizeStock === 'string') {
      try {
        productData.sizeStock = JSON.parse(productData.sizeStock);
      } catch {
        productData.sizeStock = [];
      }
    }
    if (typeof productData.colors === 'string') {
      productData.colors = productData.colors
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      // Merge with existing images if any
      if (productData.images) {
        const existingImages = Array.isArray(productData.images) 
          ? productData.images 
          : [productData.images];
        productData.images = [...existingImages, ...newImages];
      } else {
        productData.images = newImages;
      }
    } else if (req.body.images) {
      productData.images = Array.isArray(req.body.images) 
        ? req.body.images 
        : [req.body.images];
    }

    // Parse sizes, sizeStock and colors if they're strings
    if (typeof productData.sizes === 'string') {
      productData.sizes = productData.sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    if (typeof productData.sizeStock === 'string') {
      try {
        productData.sizeStock = JSON.parse(productData.sizeStock);
      } catch {
        productData.sizeStock = [];
      }
    }
    if (typeof productData.colors === 'string') {
      productData.colors = productData.colors
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: delete all products and clear uploaded images
export const clearAllProducts = async (req, res) => {
  try {
    // Delete all product documents
    await Product.deleteMany({});

    // Resolve uploads directory (same as in upload.js)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, '../uploads');

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to delete file:', filePath, err);
        }
      }
    }

    res.json({ message: 'All products and uploaded images have been cleared.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

