import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CheckCircle, MapPin, CreditCard, Download } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getImageUrl } from '../utils/imageHelper'

const Checkout = () => {
  const { cart, loading: cartLoading, fetchCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [orderTotal, setOrderTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const downloadBill = async () => {
    if (!orderId) return
    
    try {
      // Get authentication token
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to download bill')
        return
      }
      
      // Create download URL with token
      const downloadUrl = `/api/orders/${orderId}/download-bill?token=${token}`
      
      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `bill-${orderId}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading bill:', error)
      alert('Failed to download bill')
    }
  }
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    paymentMethod: 'cash',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        street: user.address?.street || prev.street,
        city: user.address?.city || prev.city,
        state: user.address?.state || prev.state,
        zipCode: user.address?.zipCode || prev.zipCode,
        country: user.address?.country || prev.country,
      }))
    }
  }, [user])

  if (!isAuthenticated) {
    return null
  }

  // Show order confirmation first if order was placed
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
          <h1 className="text-3xl font-bold mb-4 text-green-600">Your Order Has Been Placed!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your purchase. We've received your order and will process it shortly.
          </p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Order ID</p>
              <p className="text-xl font-bold">{orderId.slice(-8).toUpperCase()}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Total</span>
              <span className="font-bold text-lg">₹{orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment Method</span>
              <span className="capitalize">{formData.paymentMethod}</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/my-orders')}
              className="btn-primary"
            >
              View My Orders
            </button>
            <button
              onClick={downloadBill}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              Download Bill
            </button>
            <button
              onClick={() => navigate('/products')}
              className="btn-secondary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (cartLoading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    )
  }

  const shippingPrice = cart.totalPrice >= 10000 ? 0 : 100
  const finalTotal = cart.totalPrice + shippingPrice

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const shippingAddress = {
        name: formData.name,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      }

      // Calculate total before clearing cart
      const shippingPrice = cart.totalPrice >= 10000 ? 0 : 100
      const finalTotal = cart.totalPrice + shippingPrice

      const res = await axios.post('/api/orders', {
        shippingAddress,
        paymentMethod: formData.paymentMethod,
      })

      // Set order placed state and store total BEFORE clearing cart
      setOrderId(res.data._id)
      setOrderTotal(finalTotal)
      setOrderPlaced(true)
      
      // Refresh cart to clear it (but don't wait for it)
      fetchCart().catch(err => console.error('Error clearing cart:', err))
    } catch (error) {
      setError(error.response?.data?.message || 'Error placing order. Please try again.')
      setLoading(false)
    }
  }

  // Checkout Form View
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={24} />
                <h2 className="text-xl font-bold">Shipping Address</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={24} />
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-semibold">Cash on Delivery</span>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-semibold">Credit/Debit Card</span>
                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-semibold">UPI</span>
                    <p className="text-sm text-gray-600">Pay using UPI apps</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3 pb-3 border-b">
                    <img
                      src={getImageUrl(item.product?.images?.[0])}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:bg-gray-400"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout

