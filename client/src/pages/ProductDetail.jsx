import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { getImageUrl } from '../utils/imageHelper'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { toggleWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`)
      setProduct(res.data)
      if (res.data.sizes && res.data.sizes.length > 0) {
        setSelectedSize(res.data.sizes[0])
      }
      if (res.data.colors && res.data.colors.length > 0) {
        setSelectedColor(res.data.colors[0])
        // Assume color order matches image order (Blue -> first image, Red -> second, etc.)
        setSelectedImage(0)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!product.inStock) {
      alert('Product is out of stock')
      return
    }

    const result = await addToCart(product._id, quantity, selectedSize, selectedColor)
    if (result.success) {
      alert('Product added to cart!')
    } else {
      alert(result.message || 'Failed to add to cart')
    }
  }

  const handleToggleWishlist = () => {
    if (!product) return
    toggleWishlist(product._id)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center">Product not found</div>
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="mb-4">
            <img
              src={getImageUrl(product.images?.[selectedImage])}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === idx ? 'border-black' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-20 h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-800 hover:bg-black hover:text-white transition"
              aria-label="Toggle wishlist"
            >
              <Heart
                size={18}
                className={isInWishlist(product._id) ? 'fill-current text-red-500' : ''}
              />
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
                {discountPercentage > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    -{discountPercentage}%
                  </span>
                )}
              </>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="block font-medium mb-2">Size</label>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <label className="block font-medium mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color)
                      const idx = product.colors.indexOf(color)
                      if (product.images && product.images[idx]) {
                        setSelectedImage(idx)
                      }
                    }}
                    className={`px-4 py-2 border rounded-md ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed py-3 text-lg"
          >
            <ShoppingCart size={20} />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>

          {!product.inStock && (
            <p className="mt-4 text-red-500 text-center">This product is currently out of stock</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

