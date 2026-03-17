import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Search, Filter, Eye, Edit2, Trash2, Package, ChevronLeft, ChevronRight, FileText, DollarSign } from 'lucide-react'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })
  
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  })

  const [trackingData, setTrackingData] = useState({
    trackingId: '',
    courier: ''
  })

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchOrders()
  }, [user, navigate, pagination.currentPage, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      })

      const res = await axios.get(`/api/admin/orders?${params}`)
      setOrders(res.data.orders)
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.totalPages,
        total: res.data.total
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${selectedOrder._id}/status`, { status: newStatus })
      fetchOrders()
      setShowStatusModal(false)
      setSelectedOrder(null)
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleTrackingUpdate = async () => {
    try {
      await axios.put(`/api/admin/orders/${selectedOrder._id}/tracking`, trackingData)
      fetchOrders()
      setShowTrackingModal(false)
      setSelectedOrder(null)
      setTrackingData({ trackingId: '', courier: '' })
    } catch (error) {
      alert('Error updating tracking: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? Stock will be restored.')) return

    try {
      await axios.delete(`/api/admin/orders/${orderId}`)
      fetchOrders()
      setShowDetails(false)
    } catch (error) {
      alert('Error deleting order: ' + (error.response?.data?.message || error.message))
    }
  }

  const handlePaymentStatusUpdate = async (isPaid) => {
    try {
      await axios.put(`/api/admin/orders/${selectedOrder._id}/payment`, { isPaid })
      fetchOrders()
      setShowPaymentModal(false)
    } catch (error) {
      alert('Error updating payment status: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleGenerateInvoice = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate invoice')
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Check if blob is actually a PDF
      if (blob.type !== 'application/pdf') {
        throw new Error('Invalid response format')
      }
      
      // Create download URL
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link element
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      a.remove()
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Invoice download error:', error)
      alert('Error generating invoice: ' + error.message)
    }
  }

  const viewOrderDetails = async (order) => {
    try {
      const res = await axios.get(`/api/admin/orders/${order._id}`)
      setSelectedOrder(res.data)
      setShowDetails(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Order Management</h1>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Order ID or Email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-sm text-gray-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₹{order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowStatusModal(true)
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Update Status"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowTrackingModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-800"
                          title="Update Tracking"
                        >
                          <Package size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowPaymentModal(true)
                          }}
                          className="text-orange-600 hover:text-orange-800"
                          title="Update Payment Status"
                        >
                          <DollarSign size={18} />
                        </button>
                        <button
                          onClick={() => handleGenerateInvoice(order._id)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Download Invoice"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-2 border border-gray-300 rounded-md">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span></p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Paid:</strong> {selectedOrder.isPaid ? 'Yes' : 'No'}</p>
                  {selectedOrder.trackingId && (
                    <p><strong>Tracking ID:</strong> {selectedOrder.trackingId}</p>
                  )}
                  {selectedOrder.courier && (
                    <p><strong>Courier:</strong> {selectedOrder.courier}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                  <p><strong>Address:</strong></p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress?.street}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                    {selectedOrder.shippingAddress?.zipCode}<br />
                    {selectedOrder.shippingAddress?.country}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Product</th>
                        <th className="px-4 py-2 text-left">Size</th>
                        <th className="px-4 py-2 text-left">Color</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-center">Quantity</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.orderItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{item.size || '-'}</td>
                          <td className="px-4 py-2">{item.color || '-'}</td>
                          <td className="px-4 py-2 text-right">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 font-semibold">Subtotal</td>
                        <td colSpan="2" className="px-4 py-2 text-right">₹{selectedOrder.itemsPrice?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 font-semibold">Shipping</td>
                        <td colSpan="2" className="px-4 py-2 text-right">₹{selectedOrder.shippingPrice?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 font-bold">Total</td>
                        <td colSpan="2" className="px-4 py-2 text-right font-bold">₹{selectedOrder.totalPrice?.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Status History</h3>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)}`}>
                          {history.status}
                        </span>
                        <span className="text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                        <span className="text-gray-600">{history.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
              <div className="space-y-3">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      selectedOrder.orderStatus === status 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{status}</span>
                      {selectedOrder.orderStatus === status && (
                        <span className="text-blue-600">Current</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Update Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Tracking Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tracking ID</label>
                  <input
                    type="text"
                    value={trackingData.trackingId}
                    onChange={(e) => setTrackingData(prev => ({ ...prev, trackingId: e.target.value }))}
                    placeholder="Enter tracking ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Courier</label>
                  <input
                    type="text"
                    value={trackingData.courier}
                    onChange={(e) => setTrackingData(prev => ({ ...prev, courier: e.target.value }))}
                    placeholder="Enter courier name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleTrackingUpdate}
                  className="btn-primary flex-1"
                >
                  Update Tracking
                </button>
                <button
                  onClick={() => {
                    setShowTrackingModal(false)
                    setTrackingData({ trackingId: '', courier: '' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Update Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Payment Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Status</label>
                  <div className={`px-4 py-2 rounded-md text-center font-medium ${
                    selectedOrder.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Status</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePaymentStatusUpdate(true)}
                      disabled={selectedOrder.isPaid}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => handlePaymentStatusUpdate(false)}
                      disabled={!selectedOrder.isPaid}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Mark as Unpaid
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
