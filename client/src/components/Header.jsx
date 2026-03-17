import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout, isAuthenticated } = useAuth()
  const { getCartItemCount } = useCart()
  const navigate = useNavigate()

  const categories = [
    { name: 'T-Shirt', subcategories: ['Five Sleeve T-Shirt', 'Full Sleeve T-Shirt', 'Short Sleeve T-Shirt', 'Foot Ball Jersey'] },
    { name: 'Pant/Track', subcategories: ['Lycra Pant', 'Track Pant', 'Cargo Pant', 'Baggy Pant', 'Shorts'] },
    { name: 'Co-Ord Set' },
    { name: 'Shirt', subcategories: ['Lycra Shirt', 'Cotton Shirt'] },
    { name: 'Hoodies' },
    { name: 'Shoes', subcategories: ['Size 6', 'Size 7', 'Size 8', 'Size 9', 'Size 10', 'Size 11', 'Size 12'] },
    { name: 'Slipper' },
    { name: 'Perfume' },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold">
            Jolly Enterprises
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-r-md hover:bg-gray-800"
            >
              <Search size={20} />
            </button>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/my-orders" className="hidden md:flex items-center gap-1 hover:text-gray-600">
                  <User size={20} />
                  <span className="text-sm">{user?.name}</span>
                </Link>
                <button onClick={logout} className="hidden md:block text-sm hover:text-gray-600">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-1 hover:text-gray-600">
                <User size={20} />
                <span className="text-sm">Sign In</span>
              </Link>
            )}

            {/* Liked / Wishlist */}
            <Link to="/wishlist" className="relative hidden sm:inline-flex">
              <Heart size={22} />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart size={24} />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center justify-center border-t border-gray-200 py-3">
          <ul className="flex items-center gap-6">
            <li><Link to="/" className="hover:text-gray-600">Home</Link></li>
            {categories.map((cat) => (
              <li key={cat.name} className="relative group">
                <Link to={`/category/${encodeURIComponent(cat.name)}`} className="hover:text-gray-600">
                  {cat.name}
                </Link>
                {cat.subcategories && (
                  <ul className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {cat.subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={`/category/${encodeURIComponent(cat.name)}?subcategory=${encodeURIComponent(sub)}`}
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li><Link to="/about" className="hover:text-gray-600">About Us</Link></li>
            <li><Link to="/festival-offers" className="hover:text-gray-600">Festival Offers</Link></li>
            <li><Link to="/contact" className="hover:text-gray-600">Contact</Link></li>
            {isAuthenticated && user?.role === 'admin' && (
              <li><Link to="/admin/dashboard" className="hover:text-gray-600 font-semibold text-black">Admin</Link></li>
            )}
            <li><Link to="/track-order" className="hover:text-gray-600">Track Your Order</Link></li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </form>
            <ul className="space-y-2">
              <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link to={`/category/${encodeURIComponent(cat.name)}`} onClick={() => setIsMenuOpen(false)}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
              <li><Link to="/festival-offers" onClick={() => setIsMenuOpen(false)}>Festival Offers</Link></li>
              <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
              <li><Link to="/track-order" onClick={() => setIsMenuOpen(false)}>Track Your Order</Link></li>
              {isAuthenticated && user?.role === 'admin' && (
                <li><Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="font-semibold text-black">Admin</Link></li>
              )}
              {!isAuthenticated && (
                <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link></li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

