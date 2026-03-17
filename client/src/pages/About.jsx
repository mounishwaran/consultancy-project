import { Users, Award, Target, Heart, MapPin, ShoppingBag } from 'lucide-react'

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Jolly Enterprises</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted destination for premium clothing and fashion essentials in Coimbatore
        </p>
      </div>

      {/* Company Story */}
      <section className="mb-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-semibold mb-6">Our Story</h2>
          <div className="prose max-w-none text-gray-700 space-y-4">
            <p className="text-lg leading-relaxed">
              Jolly Enterprises has been serving the Coimbatore community with quality clothing and fashion essentials for years. 
              We pride ourselves on offering a wide selection of premium products including T-Shirts, Pants, Tracks, Co-Ord Sets, 
              Shirts, Hoodies, Shoes, Slippers, and Perfumes.
            </p>
            <p className="text-lg leading-relaxed">
              With 5 convenient store locations across Coimbatore, we've built a reputation for providing excellent customer 
              service, quality products, and competitive prices. Our commitment to customer satisfaction has earned us a 
              4.8★ rating from over 8,000 satisfied customers.
            </p>
            <p className="text-lg leading-relaxed">
              Whether you're shopping in-store or online, we ensure a seamless shopping experience with fast shipping, 
              secure checkout, and a wide range of products to suit every style and occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Award className="mx-auto mb-4 text-black" size={48} />
            <h3 className="text-xl font-semibold mb-2">Quality First</h3>
            <p className="text-gray-600">
              We source and curate only the finest products to ensure you get the best value for your money.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Heart className="mx-auto mb-4 text-black" size={48} />
            <h3 className="text-xl font-semibold mb-2">Customer Focus</h3>
            <p className="text-gray-600">
              Your satisfaction is our top priority. We're committed to providing exceptional service at every step.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Target className="mx-auto mb-4 text-black" size={48} />
            <h3 className="text-xl font-semibold mb-2">Reliability</h3>
            <p className="text-gray-600">
              Fast shipping, secure transactions, and reliable service you can count on every time.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="mx-auto mb-4 text-black" size={48} />
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600">
              Proudly serving the Coimbatore community with multiple convenient locations.
            </p>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="mb-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-black" size={32} />
            <h2 className="text-3xl font-semibold">Our Store Locations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Main Store</h3>
              <p className="text-gray-600 mb-4">
                Pollachi Main Rd, Malumichampatti,<br />
                Tamil Nadu 641050
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Phone:</strong> (+91) 7418871277</p>
                <p><strong>Email:</strong> jolly.enterprises@gmail.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Other Locations</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Jolly Enterprises - Malumichampatti - Coimbatore</li>
                <li>• Jolly Enterprises - Cross Cut Rd, Coimbatore</li>
                <li>• Visit our 5 Stores in Coimbatore</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section>
        <h2 className="text-3xl font-semibold mb-8 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <ShoppingBag className="mb-4 text-black" size={40} />
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">
              From casual wear to formal attire, we offer an extensive range of products across multiple categories 
              to meet all your fashion needs.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <Award className="mb-4 text-black" size={40} />
            <h3 className="text-xl font-semibold mb-2">Proven Track Record</h3>
            <p className="text-gray-600">
              With a 4.8★ rating from 8,000+ customers, we've proven our commitment to quality and customer satisfaction.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <MapPin className="mb-4 text-black" size={40} />
            <h3 className="text-xl font-semibold mb-2">Convenient Access</h3>
            <p className="text-gray-600">
              With 5 store locations across Coimbatore and an easy-to-use online platform, shopping with us is always convenient.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
