<<<<<<< HEAD
# Jolly Enterprises - MERN Stack Clothing E-commerce Website

A full-stack e-commerce website built with MongoDB, Express, React, and Node.js.

## Features

- 🛍️ Product browsing and search
- 🛒 Shopping cart functionality
- 👤 User authentication (Register/Login)
- 📦 Order management and tracking
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔍 Product filtering and sorting
- 📱 Mobile-friendly design

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
clothing-website-mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (Auth, Cart)
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── package.json
└── package.json            # Root package.json
```

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or install separately:
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

   For MongoDB Atlas, use:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clothing-store?retryWrites=true&w=majority
   ```

## Running the Project

### Development Mode (Both Frontend and Backend)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
npm run server
# or
cd server
npm run dev
```

**Frontend only:**
```bash
npm run client
# or
cd client
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/:itemId` - Update cart item (protected)
- `DELETE /api/cart/:itemId` - Remove item from cart (protected)
- `DELETE /api/cart` - Clear cart (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/myorders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `PUT /api/orders/:id/pay` - Update order payment (protected)
- `PUT /api/orders/:id/deliver` - Update order delivery (admin only)

## MongoDB Models

- **User**: User accounts with authentication
- **Product**: Product catalog with categories, prices, images
- **Cart**: Shopping cart items for each user
- **Order**: Order history and tracking

## Production Build

Build the frontend for production:
```bash
cd client
npm run build
```

The built files will be in `client/dist/`. The Express server is configured to serve these files in production mode.

## Notes

- Make sure MongoDB is running or you have a valid MongoDB Atlas connection string
- Update the JWT_SECRET in production with a strong, random string
- The free shipping threshold is set to ₹10,000 (can be modified in orderController.js)

## License

ISC

=======
# Consultancy-project
The commiting starts from 20.01.2026
>>>>>>> 1cf0c4f97bb1a7eeb0e004d2e1440f771d8148bb
