import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/admin/login')
      } else if (user?.role !== 'admin') {
        navigate('/admin/login')
      }
    }
  }, [user, isAuthenticated, loading, navigate])

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return children
}

export default AdminRoute

