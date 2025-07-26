import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaArrowRight, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function HostSignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load remembered email if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password && !showResetForm) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Store email if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Show success message before redirecting
        setSuccessMessage('Sign-in successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/host-dashboard');
        }, 1500); // Delay to show success message
      } else {
        throw new Error('No user data returned');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setErrors({
        form: error.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      setErrors({});
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({
        form: error.message || 'Failed to send reset email. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center text-gray-700 hover:text-green-600">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link to="/host-signup" className="text-gray-700 hover:text-green-600 font-medium">
            Create Account
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-md">
        {/* Header Section */}
        <section className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6"
          >
            <span className="font-medium">
              {showResetForm ? 'Reset Password' : 'Welcome back!'}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            {showResetForm ? 'Forgot Password' : 'Host Sign In'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600"
          >
            {showResetForm 
              ? 'Enter your email to receive a password reset link' 
              : 'Sign in to manage your events and attendees'}
          </motion.p>
        </section>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6"
          >
            <h3 className="text-lg font-medium text-green-800 mb-2 flex items-center justify-center">
              <FaCheckCircle className="mr-2" />
              Success
            </h3>
            <p className="text-green-700">{successMessage}</p>
          </motion.div>
        )}

        {resetEmailSent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-medium text-green-800 mb-2 flex items-center justify-center">
              <FaCheckCircle className="mr-2" />
              Password reset email sent!
            </h3>
            <p className="text-green-700">
              Check your email at <span className="font-semibold">{resetEmail}</span> for instructions to reset your password.
            </p>
            <button
              onClick={() => {
                setShowResetForm(false);
                setResetEmailSent(false);
                setResetEmail('');
              }}
              className="mt-4 text-green-600 hover:text-green-800 font-medium"
            >
              Back to Sign In
            </button>
          </motion.div>
        ) : showResetForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
          >
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaEnvelope className="mr-2 text-green-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {errors.form && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-700">{errors.form}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowResetForm(false);
                  setErrors({});
                }}
                className="w-full text-gray-600 hover:text-gray-800 font-medium"
              >
                Back to Sign In
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
          >
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaEnvelope className="mr-2 text-green-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaLock className="mr-2 text-green-600" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  required
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Forgot password?
                </button>
              </div>

              {errors.form && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-700">{errors.form}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {!showResetForm && !resetEmailSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-sm text-gray-600"
          >
            Don't have an account?{' '}
            <Link to="/host-signup" className="font-medium text-green-600 hover:text-green-500">
              Sign up here
            </Link>
          </motion.div>
        )}
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

export default HostSignIn;