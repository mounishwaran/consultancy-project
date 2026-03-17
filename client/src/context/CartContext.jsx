import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/cart')
      setCart(res.data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    try {
      const res = await axios.post('/api/cart/add', {
        productId,
        quantity,
        size,
        color,
      })
      setCart(res.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to cart',
      }
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    try {
      const res = await axios.put(`/api/cart/${itemId}`, { quantity })
      setCart(res.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart',
      }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.delete(`/api/cart/${itemId}`)
      setCart(res.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from cart',
      }
    }
  }

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart')
      setCart({ items: [], totalPrice: 0 })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart',
      }
    }
  }

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

