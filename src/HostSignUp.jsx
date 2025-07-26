import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartLine, 
  FaTools, 
  FaShieldAlt, 
  FaEye, 
  FaEyeSlash,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import { BsArrowLeft, BsLightningFill } from 'react-icons/bs';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function HostSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(formData.password)) {
      newErrors.password = 'Must contain uppercase, lowercase, and number';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // 1. Sign up with Supabase Auth
      const { data: { user, session }, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      console.log('Supabase sign-up response:', { user, session, authError });

      if (authError) throw authError;
      if (!user) throw new Error('User creation failed - no user returned');

      // 2. Add additional user data to hosts table
      const { error: dbError } = await supabase
        .from('hosts')
        .insert([{
          id: user.id,
          email: formData.email,
          full_name: formData.fullName,
          organization: formData.organization || null,
          phone: formData.phone || null,
          role: 'host'
        }]);

      if (dbError) throw dbError;

      // 3. Clear session to prevent refresh token issues
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');

      // 4. Set success state
      console.log('Signup successful, setting signupSuccess to true');
      setSignupSuccess(true);

    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        form: error.message || 'Signup failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
      console.log('Signup process completed, isLoading set to false');
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, session });
      if (event === 'SIGNED_IN' && signupSuccess) {
        // Ensure no session persists after signup
        supabase.auth.signOut();
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [signupSuccess]);

  // Handle redirect after signupSuccess
  useEffect(() => {
    if (signupSuccess) {
      console.log('signupSuccess is true, initiating redirect in 2 seconds');
      const timer = setTimeout(() => {
        console.log('Redirecting to /host-login');
        navigate('/host-login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [signupSuccess, navigate]);

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-6">
            Your host account has been successfully created. Redirecting to sign-in page...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-green-600 h-2.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
            ></motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-700 hover:text-green-600"
          >
            <BsArrowLeft className="mr-2" />
            Back to Home
          </button>
          <button 
            onClick={() => navigate('/host-login')}
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Sign In
          </button>
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
            Join thousands of successful event organizers who trust our platform to create memorable experiences.
          </motion.p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Host Account</h2>
              
              {errors.form && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.form}</p>
                    </div>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Company or organization"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password (min 8 characters)"
                      className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-green-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-green-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Host Account"
                  )}
                </button>
                
                <p className="text-center text-gray-600">
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => navigate('/host-login')}
                    className="text-green-600 hover:underline"
                  >
                    Sign in here
                  </button>
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
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Ventar. All rights reserved.</p>
          <p> Powered By <a href="https://algoritic.com.ng" className="hover:text-green-600">Algoritic Inc</a></p>
        </div>
      </footer>
    </div>
  );
}

export default HostSignUp;