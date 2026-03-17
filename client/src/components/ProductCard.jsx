import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { getImageUrl } from '../utils/imageHelper'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }
    await addToCart(product._id, 1)
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    toggleWishlist(product._id)
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Link to={`/product/${product._id}`} className="product-card block">
      <div className="relative">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        {discountPercentage > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            -{discountPercentage}%
          </span>
        )}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 hover:bg-black hover:text-white transition"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={18}
            className={isInWishlist(product._id) ? 'fill-current text-red-500' : ''}
          />
        </button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-gray-500 line-through text-sm">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </Link>
  )
}

export default ProductCard

