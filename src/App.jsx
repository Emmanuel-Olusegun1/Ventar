import { motion } from 'framer-motion'
import { FaCalendarAlt, FaTicketAlt, FaUsers, FaChartLine, FaHeadset } from 'react-icons/fa'
import { IoRibbonOutline } from 'react-icons/io5'
import { BsArrowRight, BsLightningFill } from 'react-icons/bs'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold text-green-700 tracking-tight"
        >
          Ventar
        </motion.div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="/host-signup" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300">Host Sign-Up</a>
          <a href="/host-login" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300">Host Login</a>
          <a href="/join" className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300">Join Event</a>
        </div>
        <button className="md:hidden text-gray-700 hover:text-green-600 transition-colors">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-teal-100/30 rounded-full blur-3xl opacity-50 -z-10"></div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight"
        >
          Welcome to <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Ventar</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed"
        >
          Craft unforgettable events and connect with your community through an intuitive, modern platform.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-center gap-5"
        >
          <a 
            href="/join" 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg text-lg"
          >
            Join an Event <BsArrowRight />
          </a>
          <a 
            href="/host-signup" 
            className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg text-lg"
          >
            Become a Host <BsLightningFill />
          </a>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-50/50 py-20">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: "10K+", label: "Events Created" },
            { value: "50K+", label: "Active Users" },
            { value: "99.9%", label: "Uptime" },
            { value: "24/7", label: "Support" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-extrabold text-green-700 mb-3">{stat.value}</div>
              <div className="text-gray-600 text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight">Why Choose Ventar?</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Seamlessly blend simplicity and power with our cutting-edge event management platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: <FaCalendarAlt className="text-3xl text-green-600" />,
              title: "Easy Events",
              description: "Create stunning events and share them with beautiful, personalized links that engage your audience."
            },
            {
              icon: <FaTicketAlt className="text-3xl text-green-600" />,
              title: "Simple Registration",
              description: "Join events instantly with one click. No complicated forms or lengthy signup processes required."
            },
            {
              icon: <FaChartLine className="text-3xl text-green-600" />,
              title: "Smart Management",
              description: "Track attendance, analyze engagement, and manage your events with powerful real-time dashboards."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Join Event Section */}
      <section className="bg-gray-50/50 py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-2xl shadow-lg border border-gray-200"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Join an Event</h2>
            <p className="text-gray-600 mb-8 text-center text-lg">Enter your event link below to get started</p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <input 
                type="text" 
                placeholder="Enter event link (e.g., https://ventar.com/event_id=UUID)" 
                className="flex-grow px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-lg">
                Join Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight">Trusted by Our Community</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover why organizers and attendees love Ventar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full mr-4"></div>
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
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight"
          >
            The Future of Event Management
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-xl mb-10 max-w-4xl mx-auto leading-relaxed"
          >
            Create, manage, and grow your events with the most intuitive platform available.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <a 
              href="/host-signup" 
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-lg"
            >
              Start Free Trial
            </a>
            <a 
              href="/demo" 
              className="bg-transparent border-2 border-white text-white hover:bg-green-700/50 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-lg"
            >
              Request Demo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="text-3xl font-extrabold text-white mb-5 tracking-tight">Ventar</div>
              <p className="mb-6 text-gray-400 leading-relaxed">The ultimate platform for modern event management.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-5 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/host-signup" className="hover:text-white transition-colors duration-300">Host Sign-Up</a></li>
                <li><a href="/host-login" className="hover:text-white transition-colors duration-300">Host Login</a></li>
                <li><a href="/join" className="hover:text-white transition-colors duration-300">Join Event</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-5 text-lg">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-5 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Ventar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App