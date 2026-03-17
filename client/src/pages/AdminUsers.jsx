import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Search, Eye, Ban, Trash2, User, ChevronLeft, ChevronRight } from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })
  
  const [search, setSearch] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    fetchUsers()
  }, [user, navigate, pagination.currentPage, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...(search && { search })
      })

      const res = await axios.get(`/api/admin/users?${params}`)
      setUsers(res.data.users)
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.totalPages,
        total: res.data.total
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/block`)
      fetchUsers()
    } catch (error) {
      alert('Error updating user status: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      await axios.delete(`/api/admin/users/${userId}`)
      fetchUsers()
    } catch (error) {
      alert('Error deleting user: ' + (error.response?.data?.message || error.message))
    }
  }

  const viewUserDetails = async (user) => {
    try {
      const res = await axios.get(`/api/admin/users/${user._id}`)
      setSelectedUser(res.data)
      setShowDetails(true)
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
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
            <h1 className="text-2xl font-bold">User Management</h1>
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
        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination(prev => ({ ...prev, currentPage: 1 }))
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={16} className="text-gray-600" />
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleBlockUser(user._id)}
                          className={`${user.isBlocked ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'}`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          <Ban size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
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

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">User Details</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedUser.user.name}</p>
                    <p><strong>Email:</strong> {selectedUser.user.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.user.phone || 'Not provided'}</p>
                    <p><strong>Role:</strong> {selectedUser.user.role}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.user.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedUser.user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </p>
                    <p><strong>Joined:</strong> {new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(selectedUser.user.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Address Information</h3>
                  <div className="space-y-2">
                    {selectedUser.user.address ? (
                      <>
                        <p><strong>Street:</strong> {selectedUser.user.address.street || 'Not provided'}</p>
                        <p><strong>City:</strong> {selectedUser.user.address.city || 'Not provided'}</p>
                        <p><strong>State:</strong> {selectedUser.user.address.state || 'Not provided'}</p>
                        <p><strong>Zip Code:</strong> {selectedUser.user.address.zipCode || 'Not provided'}</p>
                        <p><strong>Country:</strong> {selectedUser.user.address.country || 'Not provided'}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">No address information available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* User Orders */}
              <div>
                <h3 className="font-semibold mb-3">Recent Orders</h3>
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Order ID</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedUser.orders.map((order) => (
                          <tr key={order._id}>
                            <td className="px-4 py-2 font-mono text-sm">
                              {order._id.slice(-8)}
                            </td>
                            <td className="px-4 py-2">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              ₹{order.totalPrice?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No orders found for this user</p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleBlockUser(selectedUser.user._id)}
                  className={`px-4 py-2 rounded-md font-medium ${
                    selectedUser.user.isBlocked 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {selectedUser.user.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
