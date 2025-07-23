import { motion } from 'framer-motion'
import Header from './components/Header'
import AnimatedButton from './components/AnimatedButton'
import FeatureCard from './components/FeatureCard'
import Testimonial from './components/Testimonial'
import { FaCalendarAlt, FaTicketAlt, FaUsers, FaChartLine } from 'react-icons/fa'

function App() {
  const features = [
    {
      icon: <FaCalendarAlt className="text-3xl" />,
      title: "Easy Event Creation",
      description: "Create and manage events in minutes with our intuitive interface."
    },
    {
      icon: <FaTicketAlt className="text-3xl" />,
      title: "Seamless Registration",
      description: "Attendees can register with just a few clicks."
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Attendee Management",
      description: "Track and communicate with your attendees effortlessly."
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "Real-time Analytics",
      description: "Get insights into your event's performance."
    }
  ];

  const testimonials = [
    {
      quote: "Ventar made organizing our conference so much easier. The analytics helped us understand our audience better.",
      author: "Sarah Johnson",
      role: "Event Organizer"
    },
    {
      quote: "As a frequent event attendee, I love how simple Ventar makes the registration process.",
      author: "Michael Chen",
      role: "Tech Enthusiast"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-green-800 mb-6"
          >
            Your Events, <span className="text-green-600">Simplified</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-green-700 max-w-2xl mx-auto mb-10"
          >
            Ventar is the all-in-one platform for creating, managing, and attending events with ease.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <AnimatedButton 
              text="Join as Attendee" 
              href="/attendee" 
              primary 
            />
            <AnimatedButton 
              text="Host an Event" 
              href="/host" 
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Why Choose Ventar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">What People Are Saying</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-green-600 rounded-xl p-8 md:p-12 text-white">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers and attendees who trust Ventar for their event needs.
            </p>
            <AnimatedButton 
              text="Create Your First Event" 
              href="/create-event" 
              white 
            />
          </motion.div>
        </section>
      </main>

      <footer className="bg-green-800 text-green-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Ventar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App