import { motion } from 'framer-motion'
import Header from './components/Header'
import AnimatedButton from './components/AnimatedButton'
import FeatureCard from './components/FeatureCard'
import Testimonial from './components/Testimonial'
import { FaCalendarAlt, FaTicketAlt, FaUsers, FaChartLine } from 'react-icons/fa'
import { IoMdRibbon } from 'react-icons/io'
import { BsStars } from 'react-icons/bs'

function App() {
  const features = [
    {
      icon: <FaCalendarAlt className="text-3xl" />,
      title: "Easy Event Creation",
      description: "Create and manage events in minutes with our intuitive interface.",
      highlights: ["Drag-and-drop builder", "Templates", "Smart suggestions"]
    },
    {
      icon: <FaTicketAlt className="text-3xl" />,
      title: "Seamless Registration",
      description: "Attendees can register with just a few clicks.",
      highlights: ["One-click signup", "Social login", "Mobile optimized"]
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Attendee Management",
      description: "Track and communicate with your attendees effortlessly.",
      highlights: ["CRM integration", "Automated emails", "Badge printing"]
    },
    {
      icon: <FaChartLine className="text-3xl" />,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-100/50 font-sans">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-56 h-56 bg-green-200 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-15"></div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-6 py-20 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-28 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-3 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 px-5 py-2 rounded-full mb-8 shadow-sm"
          >
            <IoMdRibbon className="text-green-600" />
            <span className="text-sm font-semibold tracking-tight">Trusted by 10,000+ organizers</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight"
          >
            Elevate Your <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Event Journey</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Your all-in-one platform for crafting seamless events with cutting-edge tools and insights.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-16">
            <AnimatedButton 
              text="Join as Attendee" 
              href="/attendee" 
              primary 
              icon={<FaTicketAlt className="ml-2" />}
              className="px-8 py-3 text-lg"
            />
            <AnimatedButton 
              text="Host an Event" 
              href="/host" 
              icon={<BsStars className="ml-2" />}
              className="px-8 py-3 text-lg"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">All-in-One Event Solution</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From intimate gatherings to global conferences, streamline every step.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
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
        <section className="mb-32 bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl p-12 text-white shadow-xl">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-5xl font-extrabold">50K+</div>
                  <div className="text-green-100 text-lg">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-extrabold">2M+</div>
                  <div className="text-green-100 text-lg">Attendees</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-extrabold">98%</div>
                  <div className="text-green-100 text-lg">Satisfaction</div>
                </div>
              </div>
              <p className="text-xl text-green-50 mb-10 leading-relaxed">
                Join a thriving community of organizers powering their events with Ventar.
              </p>
              <AnimatedButton 
                text="Explore Case Studies" 
                href="/case-studies" 
                white 
                outline
                className="px-8 py-3 text-lg"
              />
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">Trusted by Our Community</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See why organizers and attendees love using Ventar.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
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
        <section className="relative overflow-hidden bg-gray-900 rounded-3xl p-12 text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-teal-500 rounded-full opacity-10 blur-3xl"></div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative z-10 text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Transform Your Events?</h2>
            <p className="text-xl text-gray-200 mb-10 leading-relaxed">
              Start creating unforgettable experiences today. No credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <AnimatedButton 
                text="Get Started Free" 
                href="/signup" 
                primary 
                large
                className="px-8 py-3 text-lg"
              />
              <AnimatedButton 
                text="Schedule Demo" 
                href="/demo" 
                white 
                outline
                large
                className="px-8 py-3 text-lg"
              />
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-16 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h3 className="text-white text-xl font-semibold mb-5">Ventar</h3>
              <p className="mb-6 text-gray-400 leading-relaxed">The ultimate platform for modern event management.</p>
              <div className="flex gap-5">
                {/* Social icons would go here */}
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-5 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">Features</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-5 text-lg">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">Blog</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Guides</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-5 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">About</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Contact</a></li>
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