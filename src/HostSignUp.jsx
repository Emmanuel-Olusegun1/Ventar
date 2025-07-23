import { motion } from 'framer-motion'
import { FaCalendarAlt, FaUsers, FaChartLine, FaTools, FaCrown, FaShieldAlt } from 'react-icons/fa'
import { BsArrowLeft, BsLightningFill } from 'react-icons/bs'

function HostSignUp() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a href="/" className="flex items-center text-gray-700 hover:text-green-600">
            <BsArrowLeft className="mr-2" />
            Back to Home
          </a>
          <a href="/host-login" className="text-gray-700 hover:text-green-600 font-medium">
            Sign In
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6"
          >
            <BsLightningFill />
            <span className="font-medium">Start Hosting in minutes</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Host Events Like a <span className="text-green-600">Pro</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 mb-10"
          >
            Join thousands of successful event organizers who trust Ventar to create memorable experiences and grow their communities.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            {[
              { value: "10K+", label: "Events Created" },
              { value: "50K+", label: "Happy Hosts" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-2xl font-bold text-green-700">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Start Hosting Today</h2>
              <p className="text-gray-600 mb-8">
                Create your host account and launch your first event
              </p>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    id="organization"
                    placeholder="Company or organization"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Create Host Account
                </button>
                
                <p className="text-center text-gray-600">
                  Already have an account? <a href="/host-login" className="text-green-600 hover:underline">Sign in here</a>
                </p>
              </form>
            </div>
          </motion.div>
          
          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Everything You Need to Host Successfully
            </h2>
            <p className="text-gray-600 mb-10">
              Powerful tools and features designed to make event hosting effortless and professional
            </p>
            
            <div className="space-y-8">
              {[
                {
                  icon: <FaCalendarAlt className="text-green-600 text-xl" />,
                  title: "Easy Event Creation",
                  description: "Create and customize events in minutes with our intuitive interface"
                },
                {
                  icon: <FaUsers className="text-green-600 text-xl" />,
                  title: "Guest Management",
                  description: "Track registrations, send updates, and manage attendee lists effortlessly"
                },
                {
                  icon: <FaChartLine className="text-green-600 text-xl" />,
                  title: "Real-time Analytics",
                  description: "Monitor event performance with detailed insights and reporting"
                },
                {
                  icon: <FaTools className="text-green-600 text-xl" />,
                  title: "Time-saving Tools",
                  description: "Automated reminders, check-in systems, and seamless integrations"
                },
                {
                  icon: <FaCrown className="text-green-600 text-xl" />,
                  title: "Premium Features",
                  description: "Advanced customization, branding options, and priority support"
                },
                {
                  icon: <FaShieldAlt className="text-green-600 text-xl" />,
                  title: "Secure & Reliable",
                  description: "Enterprise-grade security with 99.9% uptime guarantee"
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bottom CTA */}
            <div className="mt-16 bg-green-50 rounded-xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Ready to Create Amazing Events?
              </h3>
              <p className="text-gray-600 mb-6">
                Join the community of successful event hosts and start creating memorable experiences today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/free-trial"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors"
                >
                  Start Free Trial
                </a>
                <a
                  href="/demo"
                  className="bg-white border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium text-center transition-colors"
                >
                  View Demo
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Ventar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HostSignUp