import { useState, useEffect } from 'react'
import axios from 'axios'
import { Sparkles, Gift, Tag } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import festivalMain from '../../pic1.jpg'
import festivalOffer1 from '../../istockphoto-1201024668-612x612.jpg'
import festivalOffer2 from '../../istockphoto-1300966679-612x612.jpg'
import festivalOffer3 from '../../istockphoto-1409728562-612x612.jpg'

const FestivalOffers = () => {
  const [selectedFestival, setSelectedFestival] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const festivals = [
    {
      id: 'diwali',
      name: 'Diwali',
      description: 'Light up your wardrobe with festive offers',
      icon: '🪔',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'christmas',
      name: 'Christmas',
      description: 'Celebrate with special holiday discounts',
      icon: '🎄',
      color: 'from-green-500 to-red-500',
    },
    {
      id: 'newyear',
      name: 'New Year',
      description: 'Start the year with amazing deals',
      icon: '🎉',
      color: 'from-blue-500 to-purple-500',
    },
    {
      id: 'eid',
      name: 'Eid',
      description: 'Festive shopping with exclusive offers',
      icon: '🌙',
      color: 'from-green-400 to-emerald-600',
    },
    {
      id: 'pongal',
      name: 'Pongal',
      description: 'Traditional celebrations, modern deals',
      icon: '🌾',
      color: 'from-yellow-400 to-orange-600',
    },
    {
      id: 'holi',
      name: 'Holi',
      description: 'Colorful offers for the festival of colors',
      icon: '🌈',
      color: 'from-pink-500 to-purple-500',
    },
  ]

  useEffect(() => {
    fetchOffers()
  }, [selectedFestival])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      // Fetch products with discounts (offers)
      // In a real app, you might filter by festival tag or fetch festival-specific products
      const url = selectedFestival 
        ? `/api/products?discount=true&festival=${selectedFestival}`
        : '/api/products?discount=true'
      
      const res = await axios.get(url)
      // Filter products that have discounts/offers
      const productsWithOffers = (res.data.products || []).filter(
        product => product.originalPrice && product.originalPrice > product.price
      )
      setProducts(productsWithOffers)
    } catch (error) {
      console.error('Error fetching festival offers:', error)
      // Fallback: fetch all products and filter client-side
      try {
        const res = await axios.get('/api/products')
        const productsWithOffers = (res.data.products || []).filter(
          product => product.originalPrice && product.originalPrice > product.price
        )
        setProducts(productsWithOffers)
      } catch (fallbackError) {
        console.error('Error in fallback fetch:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const currentFestival = festivals[0] // Default to first festival (Diwali)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${currentFestival.color} rounded-lg shadow-lg p-8 mb-8 text-white`}>
        <div className="grid lg:grid-cols-[2fr,3fr] gap-8 items-center">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{currentFestival.icon}</span>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {currentFestival.name} Special Offers
                </h1>
                <p className="text-xl">{currentFestival.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Tag size={24} />
              <span className="text-lg font-semibold">
                Up to 50% OFF on Selected Items
              </span>
            </div>
          </div>
          <div className="relative">
            <img
              src={festivalMain}
              alt="Festival special offer banner"
              className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-xl shadow-xl border-4 border-white/70"
            />
            <div className="hidden md:flex gap-3 absolute -bottom-4 left-4">
              <img
                src={festivalOffer1}
                alt="Festive fashion offer 1"
                className="w-24 h-24 object-cover rounded-lg shadow-lg border-2 border-white/80"
              />
              <img
                src={festivalOffer2}
                alt="Festive fashion offer 2"
                className="w-24 h-24 object-cover rounded-lg shadow-lg border-2 border-white/80"
              />
              <img
                src={festivalOffer3}
                alt="Festive fashion offer 3"
                className="w-24 h-24 object-cover rounded-lg shadow-lg border-2 border-white/80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Festival Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Gift size={28} />
          Browse Offers by Festival
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setSelectedFestival(null)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedFestival === null
                ? 'border-black bg-black text-white'
                : 'border-gray-300 hover:border-black bg-white'
            }`}
          >
            <div className="text-3xl mb-2">🎁</div>
            <div className="font-semibold">All Offers</div>
          </button>
          {festivals.map((festival) => (
            <button
              key={festival.id}
              onClick={() => setSelectedFestival(festival.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFestival === festival.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-black bg-white'
              }`}
            >
              <div className="text-3xl mb-2">{festival.icon}</div>
              <div className="font-semibold">{festival.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Offers Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={24} className="text-black" />
          <h2 className="text-3xl font-bold">
            {selectedFestival
              ? `${festivals.find(f => f.id === selectedFestival)?.name} Offers`
              : 'All Festival Offers'}
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          {selectedFestival
            ? `Discover amazing deals and discounts for ${festivals.find(f => f.id === selectedFestival)?.name}. Shop now and save big!`
            : 'Explore our collection of festival offers and grab the best deals on premium clothing and accessories.'}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading offers...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Gift size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold mb-2">No Offers Available</h3>
          <p className="text-gray-600">
            {selectedFestival
              ? `We don't have any ${festivals.find(f => f.id === selectedFestival)?.name} offers at the moment. Check back soon!`
              : 'There are no active offers at the moment. Check back later for amazing deals!'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {products.length} {products.length === 1 ? 'offer' : 'offers'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const discountPercentage = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0
              
              return (
                <div key={product._id} className="relative">
                  {discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {discountPercentage}% OFF
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Special Offer Banner */}
      {products.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-lg p-6 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Limited Time Offer!</h3>
          <p className="text-lg mb-4">
            Get additional 10% off on orders above ₹2000. Use code: <span className="font-bold">FESTIVAL10</span>
          </p>
          <p className="text-sm opacity-90">*Terms and conditions apply</p>
        </div>
      )}
    </div>
  )
}

export default FestivalOffers
