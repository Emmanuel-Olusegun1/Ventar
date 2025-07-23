import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaTicketAlt, FaUsers, FaChartLine, FaRegCheckCircle, FaHeadset, FaTimes, FaBars } from 'react-icons/fa'
import { IoRibbonOutline } from 'react-icons/io5'
import { BsArrowRight, BsLightningFill } from 'react-icons/bs'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-green-700"
        >
          Ventar
        </motion.div>
       {/* Desktop Navigation */}
       <div className="hidden md:flex gap-6">
          <a href="/host-signup" className="text-gray-700 hover:text-green-600 font-medium">Host Sign-Up</a>
          <a href="/host-login" className="text-gray-700 hover:text-green-600 font-medium">Host Login</a>
          <a href="#join" className="text-gray-700 hover:text-green-600 font-medium">Join Event</a>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <FaTimes className="w-6 h-6" />
          ) : (
            <FaBars className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50"
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a 
                href="/host-signup" 
                className="text-gray-700 hover:text-green-600 font-medium py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Host Sign-Up
              </a>
              <a 
                href="/host-login" 
                className="text-gray-700 hover:text-green-600 font-medium py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Host Login
              </a>
              <a 
                href="#join" 
                className="text-gray-700 hover:text-green-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Event
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
        >
          Welcome to <span className="text-green-600">Ventar</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10"
        >
          Create unforgettable events and connect with your community. The most intuitive event platform for modern organizers.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <a 
            href="#join" 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            Join an Event <BsArrowRight />
          </a>
          <a 
            href="/host-signup" 
            className="bg-white border border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            Become a Host <BsLightningFill />
          </a>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Events Created" },
            { value: "50K+", label: "Active Users" },
            { value: "99.9%", label: "Uptime" },
            { value: "24/7", label: "Support" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-green-700 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Ventar?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the perfect blend of simplicity and power with our cutting-edge event management platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaCalendarAlt className="text-2xl text-green-600" />,
              title: "Easy Events",
              description: "Create stunning events and share them with beautiful, personalized links that engage your audience."
            },
            {
              icon: <FaTicketAlt className="text-2xl text-green-600" />,
              title: "Simple Registration",
              description: "Join events instantly with one click. No complicated forms or lengthy signup processes required."
            },
            {
              icon: <FaChartLine className="text-2xl text-green-600" />,
              title: "Smart Management",
              description: "Track attendance, analyze engagement, and manage your events with powerful real-time dashboards."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Join Event Section */}
      <section className="bg-gray-50 py-20" id='join'>
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join an Event</h2>
            <p className="text-gray-600 mb-6 text-center">Enter your event link below to get started</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Enter event link (e.g., https://ventar.com/event_id=UUID)" 
                className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Join Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Event Organizers</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our community has to say about Ventar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Ventar transformed how we manage corporate events. The interface is intuitive and the results are amazing!",
              author: "Sarah Johnson",
              role: "Event Coordinator"
            },
            {
              quote: "Setting up events has never been this easy. Our attendance rates increased by 40% since switching to Ventar.",
              author: "Michael Chen",
              role: "Community Manager"
            },
            {
              quote: "The analytics and reporting features give us insights we never had before. Highly recommend!",
              author: "Emily Rodriguez",
              role: "Marketing Director"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full mr-4"></div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-green-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            The future of event management
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-10 max-w-3xl mx-auto"
          >
            Create, manage, and grow your events with the most intuitive platform available.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <a 
              href="/host-signup" 
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Free
            </a>
            <a 
              href="/how" 
              className="bg-transparent border border-white text-white hover:bg-green-700 px-8 py-3 rounded-lg font-medium transition-colors"
            >
            How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">Ventar</div>
              <p className="mb-4">The complete event management platform for modern organizers.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/host-signup" className="hover:text-white transition">Host Sign-Up</a></li>
                <li><a href="/host-login" className="hover:text-white transition">Host Login</a></li>
                <li><a href="#join" className="hover:text-white transition">Join Event</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center">
            <p>© {new Date().getFullYear()} Ventar. All rights reserved.</p>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center">
            <p> Powered By <a href="algoritic.com.ng" hover:text-green-600>Algoritic Inc</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App