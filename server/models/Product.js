import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'T-Shirt',
      'Pant/Track',
      'Pant / Track',
      'Co-Ord Set',
      'Shirt',
      'Hoodies',
      'Shoes',
      'Slipper',
      'Perfume',
    ],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  images: [
    {
      type: String,
    },
  ],
  // Simple list of sizes that are available (for filters / display)
  sizes: [
    {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'],
    },
  ],
  // Size-wise stock, e.g. { size: 'M', stock: 60 }
  sizeStock: [
    {
      size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'],
      },
      stock: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
  ],
  colors: [
    {
      type: String,
    },
  ],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  newArrival: {
    type: Boolean,
    default: false,
  },
  backInStock: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate discount percentage and aggregate stock from sizeStock if present
productSchema.pre('save', function (next) {
  if (this.originalPrice && this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  if (this.sizeStock && this.sizeStock.length > 0) {
    const total = this.sizeStock.reduce((sum, entry) => sum + (entry.stock || 0), 0);
    this.stock = total;
    this.inStock = total > 0;
  }

  next();
});

// Pre-save middleware to normalize category names
productSchema.pre('save', function(next) {
  if (this.category) {
    // Normalize Pant/Track variations
    if (this.category === 'Pant / Track' || this.category === 'Pant/Track') {
      this.category = 'Pant/Track';
    }
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;

