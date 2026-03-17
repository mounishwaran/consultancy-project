import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'

const Wishlist = () => {
  const { wishlistIds } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!wishlistIds.length) {
        setProducts([])
        return
      }
      try {
        setLoading(true)
        const res = await axios.get('/api/products', {
          params: { ids: wishlistIds.join(',') },
        })
        setProducts(res.data.products || [])
      } catch (err) {
        console.error('Failed to load wishlist products', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [wishlistIds])

  if (!wishlistIds.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Heart size={48} className="mx-auto mb-4 text-gray-700" />
          <h1 className="text-3xl font-semibold mb-2 tracking-wide">
            Your Favourites
          </h1>
          <p className="text-gray-600 mb-2">
            Tap the heart icon on any product to save it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Heart size={28} className="text-red-500" />
        <h1 className="text-3xl font-semibold">Your Favourites</h1>
      </div>
      {loading ? (
        <p>Loading your liked products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist


