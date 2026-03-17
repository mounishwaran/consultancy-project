import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getImageUrl } from '../utils/imageHelper'

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, fetchCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2>
        <Link to="/login" className="btn-primary inline-block">
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const shippingPrice = cart.totalPrice >= 10000 ? 0 : 100
  const finalTotal = cart.totalPrice + shippingPrice

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    await updateCartItem(itemId, newQuantity)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-4 pb-6 mb-6 border-b last:border-b-0">
                <img
                  src={getImageUrl(item.product?.images?.[0])}
                  alt={item.product?.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <Link
                    to={`/product/${item.product?._id}`}
                    className="font-semibold text-lg hover:text-gray-600"
                  >
                    {item.product?.name}
                  </Link>
                  {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                  {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                  <p className="font-bold mt-2">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
              </div>
              {cart.totalPrice < 10000 && (
                <p className="text-sm text-gray-600">
                  Spend ₹{(10000 - cart.totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full btn-primary text-center py-3"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/products"
              className="block w-full btn-secondary text-center py-3 mt-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

