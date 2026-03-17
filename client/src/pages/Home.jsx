import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { getImageUrl } from '../utils/imageHelper'
import {
  ShoppingBag,
  Truck,
  Shield,
  Star,
  Sparkles,
  Gift,
  Tag,
  ArrowRight,
} from 'lucide-react'

// Default hero image for home page
const defaultHeroImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'

// Simple placeholder images for each category
const categoryImages = {
  'T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
  'Pant/Track': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop',
  'Co-Ord Set': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop',
  'Shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=200&fit=crop',
  'Hoodies': 'https://images.unsplash.com/photo-1556821840-9a63fde16c8f?w=300&h=200&fit=crop',
  'Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
  'Slipper': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
  'Perfume': 'https://images.unsplash.com/photo-1528740561696-85021de34420?w=300&h=200&fit=crop',
}

const festivalHighlights = [
  { id: 'diwali', name: 'Diwali', icon: '🪔', color: 'from-yellow-500 to-orange-500' },
  { id: 'christmas', name: 'Christmas', icon: '🎄', color: 'from-green-500 to-red-500' },
  { id: 'newyear', name: 'New Year', icon: '🎉', color: 'from-blue-500 to-purple-500' },
  { id: 'eid', name: 'Eid', icon: '🌙', color: 'from-green-400 to-emerald-600' },
  { id: 'pongal', name: 'Pongal', icon: '🌾', color: 'from-yellow-400 to-orange-600' },
  { id: 'holi', name: 'Holi', icon: '🌈', color: 'from-pink-500 to-purple-500' },
]

const shopCategories = [
  { name: 'T-Shirt', slug: 'T-Shirt', icon: '👕' },
  { name: 'Pant/Track', slug: 'Pant/Track', icon: '👖' },
  { name: 'Co-Ord Set', slug: 'Co-Ord Set', icon: '👔' },
  { name: 'Shirt', slug: 'Shirt', icon: '🧥' },
  { name: 'Hoodies', slug: 'Hoodies', icon: '🧣' },
  { name: 'Shoes', slug: 'Shoes', icon: '👟' },
  { name: 'Slipper', slug: 'Slipper', icon: '🥿' },
  { name: 'Perfume', slug: 'Perfume', icon: '✨' },
]

// Categories to showcase as scroll sections on home
const showcaseCategories = [
  { id: 'tshirt', apiCategory: 'T-Shirt', title: 'Shop by T-Shirt' },
  { id: 'bottom', apiCategory: 'Pant/Track', title: 'Shop by Bottom Wear' },
  { id: 'coord', apiCategory: 'Co-Ord Set', title: 'Shop by Co-Ord Set' },
  { id: 'hoodies', apiCategory: 'Hoodies', title: 'Shop by Hoodies' },
  { id: 'shirts', apiCategory: 'Shirt', title: 'Shop by Shirts' },
  { id: 'shoes', apiCategory: 'Shoes', title: 'Shop by Shoes' },
  { id: 'slipper', apiCategory: 'Slipper', title: 'Shop by Slipper' },
  { id: 'perfume', apiCategory: 'Perfume', title: 'Shop by Perfume' },
]

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([])
  const [backInStock, setBackInStock] = useState([])
  const [featured, setFeatured] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [heroProduct, setHeroProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchShowcaseCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const [newArrivalsRes, backInStockRes, featuredRes] = await Promise.all([
        axios.get('/api/products?newArrival=true&limit=6'),
        axios.get('/api/products?backInStock=true&limit=6'),
        axios.get('/api/products?featured=true&limit=6'),
      ])

      setNewArrivals(newArrivalsRes.data.products || [])
      setBackInStock(backInStockRes.data.products || [])
      setFeatured(featuredRes.data.products || [])
      
      // Set first featured product as hero if available
      if (featuredRes.data.products && featuredRes.data.products.length > 0) {
        setHeroProduct(featuredRes.data.products[0])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchShowcaseCategories = async () => {
    try {
      const responses = await Promise.all(
        showcaseCategories.map((cfg) =>
          axios.get('/api/products', {
            params: { category: cfg.apiCategory, limit: 6 },
          })
        )
      )

      const map = {}
      responses.forEach((res, index) => {
        const products = res.data.products || []
        console.log(`Category ${showcaseCategories[index].id} (${showcaseCategories[index].apiCategory}):`, products.length, 'products')
        map[showcaseCategories[index].id] = products
      })
      setCategoryProducts(map)
      console.log('Category products map:', map)
    } catch (error) {
      console.error('Error fetching showcase categories:', error)
    }
  }

  return (
    <div>
      {/* Hero Section - inspired by 7Man layout */}
      <section className="bg-[#f5eee4] py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
            {/* Left: Hero image */}
            <div className="lg:w-[34%]">
              <div className="relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl">
                {heroProduct && heroProduct.images && heroProduct.images.length > 0 ? (
                  <img
                    src={getImageUrl(heroProduct.images[0])}
                    alt={heroProduct.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={defaultHeroImage}
                    alt="Jolly Enterprises - Fashion Collection"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                <button
                  type="button"
                  className="absolute left-6 bottom-8 border border-black bg-white/80 text-xs tracking-[0.25em] uppercase px-6 py-2 hover:bg-black hover:text-white transition"
                  onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                >
                  Shop Now
                </button>
              </div>
            </div>

            {/* Center: Typography block */}
            <div className="lg:w-[40%] flex flex-col justify-center text-center lg:text-left">
              <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-gray-500 mb-4">
                Today Only
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-[0.16em] leading-tight text-gray-900">
                {heroProduct ? heroProduct.name.split(' ').slice(0, 2).join(' ') : 'Street'}
                <br />
                {heroProduct ? heroProduct.name.split(' ').slice(2).join(' ') : 'Baggy Pant'}
              </h1>
              <p className="mt-6 text-sm md:text-base tracking-[0.3em] uppercase text-gray-500">
                {heroProduct ? heroProduct.category : 'Exclusive Colors'}
              </p>
              <p className="mt-4 text-sm md:text-base text-gray-600 max-w-md mx-auto lg:mx-0">
                {heroProduct ? heroProduct.description : 'Relaxed, straight–fit silhouettes crafted in soft fabrics for all–day comfort. Perfect for everyday street style and off–duty looks.'}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                <Link
                  to="/products?category=Pant%20/%20Track"
                  className="inline-flex items-center justify-center border border-black px-8 py-3 text-xs md:text-sm tracking-[0.3em] uppercase hover:bg-black hover:text-white transition"
                >
                  Shop Now
                </Link>
                <Link
                  to="/track-order"
                  className="inline-flex items-center justify-center text-xs md:text-sm tracking-[0.25em] uppercase text-gray-600 hover:text-black"
                >
                  Track Your Order
                </Link>
              </div>

              {/* Dots / slider hint */}
              <div className="mt-10 flex items-center gap-2 justify-center lg:justify-start">
                <span className="inline-block h-1.5 w-6 rounded-full bg-black" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300" />
              </div>
            </div>

            {/* Right: Stacked thumbnails */}
            <div className="lg:w-[26%] flex lg:flex-col gap-4">
              {featured.slice(0, 3).map((product, index) => (
                <div
                  key={product._id}
                  className="flex-1 rounded-3xl overflow-hidden bg-gray-200 shadow-md"
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
              {featured.length === 0 && (
                <>
                  {[
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
                    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop',
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=200&fit=crop'
                  ].map((imageSrc, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-3xl overflow-hidden bg-gray-200 shadow-md"
                    >
                      <img
                        src={imageSrc}
                        alt={`Fashion collection ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Why shop with us</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              We combine quality products with reliable service so you can shop with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <Truck className="mx-auto mb-3 text-black" size={44} />
              <h3 className="font-semibold mb-2">Fast Shipping</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Orders ship within 24–48 hours. Track your parcel from checkout to doorstep.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <Star className="mx-auto mb-3 text-black" size={44} />
              <h3 className="font-semibold mb-2">4.8★ Rating</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Trusted by 8,000+ customers. Read reviews and join our happy community.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <Shield className="mx-auto mb-3 text-black" size={44} />
              <h3 className="font-semibold mb-2">Secure Checkout</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Safe payments and buyer protection. Your data and transactions are secure.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <ShoppingBag className="mx-auto mb-3 text-black" size={44} />
              <h3 className="font-semibold mb-2">Store Location</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Visit our 5 stores in Coimbatore. Try before you buy, in person.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll sections: shop by each category - Always show sections */}
      {showcaseCategories.map((cfg) => {
        const products = categoryProducts[cfg.id] || []

        return (
          <section key={cfg.id} className="py-14 bg-white">
            <div className="container mx-auto px-4">
              <p className="text-center text-xs tracking-[0.35em] uppercase text-red-500 mb-2">
                Find Your Style
              </p>
              <h2 className="text-center text-3xl md:text-4xl font-bold uppercase mb-8">
                {cfg.title} ({products.length} products)
              </h2>

              {products.length === 0 ? (
                // Empty state with simple placeholder image
                <div className="text-center py-12">
                  <div className="relative overflow-hidden rounded-2xl shadow-md mx-auto max-w-sm mb-6">
                    <img
                      src={categoryImages[cfg.apiCategory] || categoryImages['T-Shirt']}
                      alt={`${cfg.apiCategory}`}
                      className="h-48 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="text-center text-white">
                        <ShoppingBag size={40} className="mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-medium">
                          {cfg.apiCategory}
                        </p>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No {cfg.apiCategory} products yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add {cfg.apiCategory} products in admin panel to see them here
                  </p>
                  <Link
                    to={`/category/${encodeURIComponent(cfg.apiCategory)}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-black transition"
                  >
                    Browse {cfg.apiCategory}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                // Product gallery with horizontal scroll
                <div className="relative">
                  <div className="overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-max">
                      {products.slice(0, 8).map((product, idx) => (
                        <Link
                          key={product._id}
                          to={`/product/${product._id}`}
                          className="relative overflow-hidden rounded-3xl shadow-lg group flex-shrink-0 w-72"
                        >
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                              className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-80 w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <ShoppingBag size={60} className="text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 text-white">
                            <p className="text-xs uppercase tracking-[0.3em] mb-2">
                              {idx === 0 ? 'Best Seller' : 'Shop Now'}
                            </p>
                            <h3 className="text-xl font-semibold leading-tight">
                              {product.name}
                            </h3>
                            {product.price && (
                              <p className="mt-1 text-sm">
                                From <span className="font-semibold">₹{product.price}</span>
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {/* View all button */}
                  <div className="text-center mt-8">
                    <Link
                      to={`/category/${encodeURIComponent(cfg.apiCategory)}`}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      View All {cfg.apiCategory}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )
      })}

      {/* Festival Offers */}
      <section className="py-14 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-600" size={28} />
              <h2 className="text-3xl font-bold">Festival Offers</h2>
            </div>
            <Link
              to="/festival-offers"
              className="inline-flex items-center gap-2 font-semibold text-black hover:underline"
            >
              View all offers
              <ArrowRight size={20} />
            </Link>
          </div>
          <p className="text-gray-600 mb-2 max-w-2xl">
            Light up your wardrobe with seasonal deals — Diwali, Christmas, New Year, Eid, Pongal, Holi and more. Up to 50% off on selected items.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Use code <span className="font-mono font-semibold bg-amber-100 px-2 py-0.5 rounded">FESTIVAL10</span> for an extra 10% off on orders above ₹2,000.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {festivalHighlights.map((f) => (
              <Link
                key={f.id}
                to="/festival-offers"
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${f.color} p-5 text-white shadow-lg hover:scale-[1.02] transition transform`}
              >
                <span className="text-4xl block mb-2">{f.icon}</span>
                <span className="font-semibold">{f.name}</span>
                <div className="absolute bottom-2 right-2 opacity-80">
                  <Tag size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={28} className="text-black" />
            <h2 className="text-3xl font-bold">Shop by Category</h2>
          </div>
          <p className="text-gray-600 mb-2 max-w-2xl">
            Whether you need casual wear, formals, sportswear, or accessories — start from a category below. Each section has subcategories so you find exactly what you want.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            T-Shirts, Pants & Tracks, Co-Ord Sets, Shirts, Hoodies, Shoes, Slippers, Perfumes and more.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {shopCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${encodeURIComponent(cat.slug)}`}
                className="group flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-black hover:shadow-lg transition text-center"
              >
                <span className="text-4xl mb-2 block group-hover:scale-110 transition">{cat.icon}</span>
                <span className="font-semibold text-sm">{cat.name}</span>
                <ArrowRight size={16} className="mt-2 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2">New Arrivals</h2>
            <p className="text-gray-600 mb-6 max-w-xl">Just landed — the latest styles and trends, updated regularly. Be the first to wear what’s new.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back in Stock */}
      {backInStock.length > 0 && (
        <section className="py-14 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2">Back in Stock</h2>
            <p className="text-gray-600 mb-6 max-w-xl">Back by popular demand — previously sold-out favourites are here again. Grab them before they go.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {backInStock.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-gray-600 mb-6 max-w-xl">Editor’s picks — our most loved styles and bestsellers. Quality and design that our customers keep coming back for.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats / Social proof */}
      <section className="py-10 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">8,000+</p>
              <p className="text-gray-400 text-sm mt-1">Happy customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5</p>
              <p className="text-gray-400 text-sm mt-1">Stores in Coimbatore</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50+</p>
              <p className="text-gray-400 text-sm mt-1">Categories & subcategories</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4.8★</p>
              <p className="text-gray-400 text-sm mt-1">Average rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore more */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2 text-center">Explore more</h2>
          <p className="text-gray-600 text-center mb-8 max-w-lg mx-auto">
            Jump to festival offers, all products, about us, contact, or track your order — everything you need in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/festival-offers"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-black font-semibold transition"
            >
              <Gift size={20} />
              Festival Offers
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-black font-semibold transition"
            >
              <ShoppingBag size={20} />
              All Products
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-black font-semibold transition"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-black font-semibold transition"
            >
              Contact
            </Link>
            <Link
              to="/track-order"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-black font-semibold transition"
            >
              <Truck size={20} />
              Track Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

