import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Package, Download } from 'lucide-react'
import { getImageUrl } from '../utils/imageHelper'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/myorders')
      setOrders(res.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadBill = async (orderId) => {
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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your orders</h2>
        <Link to="/login" className="btn-primary inline-block">
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package size={64} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <Link to="/products" className="btn-primary inline-block">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Order #{order._id.slice(-8)}</h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">₹{order.totalPrice.toFixed(2)}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.orderStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.orderItems.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">₹{item.price}</p>
                    </div>
                  </div>
                ))}
                {order.orderItems.length > 2 && (
                  <p className="text-sm text-gray-600">
                    +{order.orderItems.length - 2} more items
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <button
                onClick={() => downloadBill(order._id)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download size={14} />
                Download Bill
              </button>
              <Link
                to={`/track-order?id=${order._id}`}
                className="text-black hover:underline font-semibold"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrders

