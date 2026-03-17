import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const Footer = () => {
  const categories = [
    'T-Shirt',
    'Pant / Track',
    'Co-Ord Set',
    'Shirt',
    'Hoodies',
    'Shoes',
    'Slipper',
    'Perfume',
  ]

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Jolly Enterprises</h3>
            <p className="text-gray-400 mb-4">
              Premium clothing store offering the latest fashion trends and styles.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-gray-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-gray-400">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-gray-400">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">CATEGORIES</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link to={`/category/${cat}`} className="text-gray-400 hover:text-white">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">SERVICES</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/track-order" className="hover:text-white">Track Your Order</Link></li>
              <li><a href="#" className="hover:text-white">Refunds/Cancellations</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms and Conditions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">CONTACT US</h4>
            <div className="space-y-2 text-gray-400">
              <p>Email: jolly.enterprises@gmail.com</p>
              <p>Phone: (+91) 7418871277</p>
              <p className="mt-4">
                Pollachi Main Rd, Malumichampatti,<br />
                Tamil Nadu 641050
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>Copyright © 2024. All Right Reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

