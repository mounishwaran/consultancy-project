import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let url = '/api/products?'
      
      if (filters.search) {
        url = `/api/products/search?q=${filters.search}`
      } else {
        if (filters.category) url += `category=${filters.category}&`
        if (filters.minPrice) url += `minPrice=${filters.minPrice}&`
        if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`
        if (filters.sort) url += `sort=${filters.sort}&`
      }

      const res = await axios.get(url)
      setProducts(filters.search ? res.data : res.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-4">Filters</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="10000"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">
            {filters.search ? `Search Results for "${filters.search}"` : 'All Products'}
          </h1>
          
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">No products found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products

