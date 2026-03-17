import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Shield } from 'lucide-react'

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, logout } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Attempting admin login with:', formData.email)
    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      console.log('Login successful, checking admin role...')
      // Wait a moment for the user state to be set
      setTimeout(async () => {
        try {
          const userRes = await axios.get('/api/auth/me')
          console.log('User data:', userRes.data)
          if (userRes.data.role === 'admin') {
            console.log('Admin role confirmed, redirecting to dashboard...')
            navigate('/admin/dashboard')
          } else {
            console.log('Not an admin user:', userRes.data.role)
            setError('Access denied. Admin privileges required.')
            logout()
          }
        } catch (error) {
          console.error('Error verifying admin access:', error)
          setError('Error verifying admin access')
        } finally {
          setLoading(false)
        }
      }, 500)
    } else {
      console.log('Login failed:', result.message)
      setError(result.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <Shield className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold">Admin Login</h2>
          <p className="text-gray-600 mt-2">Jolly Enterprises Admin Panel</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="admin@gmail.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin

