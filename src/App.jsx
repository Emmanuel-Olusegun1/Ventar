import { motion } from 'framer-motion'
import Header from './components/Header'
import AnimatedButton from './components/AnimatedButton'
import FeatureCard from './components/FeatureCard'
import Testimonial from './components/Testimonial'
import { FaCalendarAlt, FaTicketAlt, FaUsers, FaChartLine, FaRegCheckCircle } from 'react-icons/fa'
import { IoMdRibbon } from 'react-icons/io'
import { BsStars } from 'react-icons/bs'

function App() {
  const features = [
    {
      icon: <FaCalendarAlt className="text-2xl" />,
      title: "Easy Event Creation",
      description: "Create and manage events in minutes with our intuitive interface.",
      highlights: ["Drag-and-drop builder", "Templates", "AI suggestions"]
    },
    {
      icon: <FaTicketAlt className="text-2xl" />,
      title: "Seamless Registration",
      description: "Attendees can register with just a few clicks.",
      highlights: ["One-click signup", "Social login", "Mobile optimized"]
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: "Attendee Management",
      description: "Track and communicate with your attendees effortlessly.",
      highlights: ["CRM integration", "Automated emails", "Badge printing"]
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: "Real-time Analytics",
      description: "Get insights into your event's performance.",
      highlights: ["Live dashboards", "Engagement metrics", "ROI tracking"]
    }
  ];

  const testimonials = [
    {
      quote: "Ventar made organizing our conference so much easier. The analytics helped us understand our audience better.",
      author: "Sarah Johnson",
      role: "Event Organizer",
      rating: 5
    },
    {
      quote: "As a frequent event attendee, I love how simple Ventar makes the registration process.",
      author: "Michael Chen",
      role: "Tech Enthusiast",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-green-200 rounded-full blur-3xl opacity-10"></div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-24 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-600 px-4 py-1.5 rounded-full mb-6"
          >
            <IoMdRibbon className="text-green-500" />
            <span className="text-sm font-medium">Trusted by 10,000+ organizers</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Transform Your <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Event Experience</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-10"
          >
            The all-in-one platform for creating unforgettable events with powerful tools and analytics.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <AnimatedButton 
              text="Join as Attendee" 
              href="/attendee" 
              primary 
              icon={<FaTicketAlt className="ml-2" />}
            />
            <AnimatedButton 
              text="Host an Event" 
              href="/host" 
              icon={<BsStars className="ml-2" />}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              New Feature
            </div>
            <p className="text-gray-700 font-medium">
              Try our <span className="text-green-600 font-semibold">AI Event Assistant</span> to generate complete event plans in seconds!
            </p>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="mb-28">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need in One Platform</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From small meetups to large conferences, we've got you covered.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <FeatureCard 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  highlights={feature.highlights}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="mb-28 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-10 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold">50K+</div>
                  <div className="text-green-100">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">2M+</div>
                  <div className="text-green-100">Attendees</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">98%</div>
                  <div className="text-green-100">Satisfaction</div>
                </div>
              </div>
              <p className="text-xl text-green-50 mb-8">
                Join thousands of organizers who trust Ventar for their most important events.
              </p>
              <AnimatedButton 
                text="See Case Studies" 
                href="/case-studies" 
                white 
                outline
              />
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-28">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Organizers & Attendees</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our community.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Testimonial 
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  rating={testimonial.rating}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gray-900 rounded-3xl p-10 text-white">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-green-600 rounded-full opacity-10 blur-3xl"></div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Elevate Your Events?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Start creating unforgettable experiences today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <AnimatedButton 
                text="Get Started Free" 
                href="/signup" 
                primary 
                large
              />
              <AnimatedButton 
                text="Schedule Demo" 
                href="/demo" 
                white 
                outline
                large
              />
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Ventar</h3>
              <p className="mb-4">The complete event management platform for modern organizers.</p>
              <div className="flex gap-4">
                {/* Social icons would go here */}
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Guides</a></li>
                <li><a href="#" className="hover:text-white transition">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p>© {new Date().getFullYear()} Ventar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App