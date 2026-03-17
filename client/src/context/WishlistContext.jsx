import { createContext, useContext, useEffect, useState } from 'react'

const WishlistContext = createContext()

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return ctx
}

const STORAGE_KEY = 'wishlist_product_ids'

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setWishlistIds(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds))
    } catch {
      // ignore
    }
  }, [wishlistIds])

  const toggleWishlist = (productId) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const isInWishlist = (productId) => wishlistIds.includes(productId)

  const value = {
    wishlistIds,
    toggleWishlist,
    isInWishlist,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

