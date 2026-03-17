import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { getImageUrl } from '../utils/imageHelper'

const TrackOrder = () => {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()

  // Check for order ID in URL params or sessionStorage and auto-track
  useEffect(() => {
    const urlOrderId = searchParams.get('id')
    const storedOrderId = sessionStorage.getItem('trackOrderId')
    
    if (urlOrderId && isAuthenticated) {
      setOrderId(urlOrderId)
      sessionStorage.removeItem('trackOrderId')
      // Auto-track the order
      const trackOrder = async () => {
        setLoading(true)
        setError('')
        try {
          const res = await axios.get(`/api/orders/${urlOrderId.trim()}`)
          setOrder(res.data)
        } catch (error) {
          setError(error.response?.data?.message || 'Order not found')
          setOrder(null)
        } finally {
          setLoading(false)
        }
      }
      trackOrder()
    } else if (storedOrderId && isAuthenticated) {
      setOrderId(storedOrderId)
      sessionStorage.removeItem('trackOrderId')
      // Auto-track the order
      const trackOrder = async () => {
        setLoading(true)
        setError('')
        try {
          const res = await axios.get(`/api/orders/${storedOrderId.trim()}`)
          setOrder(res.data)
        } catch (error) {
          setError(error.response?.data?.message || 'Order not found')
          setOrder(null)
        } finally {
          setLoading(false)
        }
      }
      trackOrder()
    }
  }, [searchParams, isAuthenticated])

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!orderId.trim()) {
      setError('Please enter an order ID')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Try to get order - backend will handle both full ObjectId and partial ID
      const res = await axios.get(`/api/orders/${orderId.trim()}`)
      setOrder(res.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Order not found')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-500" size={24} />
      case 'shipped':
        return <Truck className="text-blue-500" size={24} />
      case 'processing':
        return <Package className="text-yellow-500" size={24} />
      default:
        return <Clock className="text-gray-500" size={24} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Track Your Order</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleTrack} className="flex gap-4">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your order ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button type="submit" className="btn-primary px-8" disabled={loading}>
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h2>
              <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(order.orderStatus)}
              <p className="text-gray-600">
                Order placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            {order.trackingNumber && (
              <p className="text-gray-600">Tracking Number: {order.trackingNumber}</p>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                    {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="font-semibold mt-1">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items Price</span>
                <span>₹{order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-lg mb-4">Shipping Address</h3>
              <p className="text-gray-600">
                {order.shippingAddress.name}<br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4">
          <p>For faster tracking, please <a href="/login" className="underline font-semibold">sign in</a> to view all your orders.</p>
        </div>
      )}
    </div>
  )
}

export default TrackOrder

