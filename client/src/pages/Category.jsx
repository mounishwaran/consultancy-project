import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const Category = () => {
  const { category } = useParams()
  const [searchParams] = useSearchParams()
  const subcategory = searchParams.get('subcategory')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [bannerProduct, setBannerProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [category, subcategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let url = `/api/products?category=${encodeURIComponent(category)}`
      if (subcategory) {
        url += `&subcategory=${encodeURIComponent(subcategory)}`
      }
      console.log('Category page - Fetching URL:', url)
      const res = await axios.get(url)
      const fetchedProducts = res.data.products || []
      console.log('Category page - Products fetched:', fetchedProducts.length, fetchedProducts.map(p => ({ name: p.name, category: p.category, subcategory: p.subcategory })))
      setProducts(fetchedProducts)
      
      // Set the first product as banner if available
      if (fetchedProducts.length > 0) {
        setBannerProduct(fetchedProducts[0])
      } else {
        setBannerProduct(null)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBannerImage = () => {
    if (bannerProduct && bannerProduct.images && bannerProduct.images.length > 0) {
      // Use the first image from the first product as banner
      return bannerProduct.images[0]
    }
    // No fallback image - return empty string to show no banner
    return ''
  }

  const shouldShowBanner = () => {
    return bannerProduct && bannerProduct.images && bannerProduct.images.length > 0
  }

  return (
    <div>
      {/* Banner Section - only show if there are actual uploaded images */}
      {shouldShowBanner() && (
        <div className="relative h-64 md:h-96 bg-gray-200 overflow-hidden">
          <img
            src={getBannerImage()}
            alt={`${subcategory || category} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {subcategory || category}
              </h1>
              <p className="text-lg md:text-xl">
                {subcategory ? `Premium ${subcategory} collection` : `Shop our ${category} collection`}
              </p>
              {bannerProduct && (
                <p className="text-sm md:text-base mt-2 opacity-90">
                  Featured: {bannerProduct.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Section - shown when no banner image */}
      {!shouldShowBanner() && (
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              {subcategory || category}
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              {subcategory ? `Premium ${subcategory} collection` : `Shop our ${category} collection`}
            </p>
            {products.length === 0 && !loading && (
              <p className="text-gray-500 mt-4">
                Add products through the admin panel to see them here
              </p>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No products found</h2>
              <p className="text-gray-500">
                {subcategory 
                  ? `No products found in ${subcategory} subcategory.` 
                  : `No products found in ${category} category.`
                }
              </p>
              <p className="text-gray-400 mt-2">
                Please check back later or browse other categories.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {subcategory ? `${subcategory} Products` : `${category} Products`}
              </h2>
              <p className="text-gray-600 mt-1">
                Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Category

