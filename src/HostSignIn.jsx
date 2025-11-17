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
  const [hasError, setHasError] = useState(false);

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

  // Handle redirect after successful sign-in
  useEffect(() => {
    if (successMessage) {
      console.log('successMessage set, redirecting to /host-dashboard in 1.5 seconds');
      const timer = setTimeout(() => {
        console.log('Redirecting to /host-dashboard');
        navigate('/host-dashboard', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  // Add auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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
    setHasError(false);
    console.log('Starting sign-in process');

    try {
      console.log('Attempting sign-in with:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('Supabase sign-in response:', { data, error });

      if (error) {
        console.error('Detailed error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      if (!data.user) throw new Error('No user data returned');

      // Store email if remember me is checked
      if (formData.rememberMe) {
        console.log('Storing remembered email:', formData.email);
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        console.log('Removing remembered email');
        localStorage.removeItem('rememberedEmail');
      }

      // Set success message
      console.log('Setting success message');
      setSuccessMessage('Sign-in successful! Redirecting to dashboard...');

    } catch (error) {
      console.error('Complete sign-in error:', error);
      setHasError(true);
      setErrors({
        form: error.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
      console.log('Sign-in process completed, isLoading:', false);
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
    setHasError(false);
    console.log('Starting password reset process');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log('Password reset response:', { error });

      if (error) {
        console.error('Detailed reset error:', error);
        throw error;
      }

      console.log('Setting resetEmailSent to true');
      setResetEmailSent(true);
    } catch (error) {
      console.error('Complete password reset error:', error);
      setHasError(true);
      setErrors({
        form: error.message || 'Failed to send reset email. Please try again.'
      });
    } finally {
      setIsLoading(false);
      console.log('Password reset process completed, isLoading:', false);
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#e5e5e5] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#d4d4d4] mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-4">Please try signing in again</p>
          <button 
            onClick={() => setHasError(false)}
            className="bg-[#34c239] text-black px-6 py-3 hover:cursor-pointer rounded-lg font-medium hover:bg-green-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e5e5]">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center text-gray-300 hover:text-[#34c239] transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link to="/host-signup" className="text-gray-300 hover:text-[#34c239] font-medium transition-colors">
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
            className="inline-flex items-center gap-2 bg-[#002009] text-[#34c239] px-4 py-2 rounded-full mb-6 border border-[#00331a]"
          >
            <span className="font-medium">
              {showResetForm ? 'Reset Password' : 'Welcome back!'}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-[#d4d4d4] mb-4"
          >
            {showResetForm ? 'Forgot Password' : 'Host Sign In'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300"
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
            className="bg-[#002009] border border-green-900 rounded-lg p-6 text-center mb-6"
          >
            <h3 className="text-lg font-medium text-green-400 mb-2 flex items-center justify-center">
              <FaCheckCircle className="mr-2" />
              Success
            </h3>
            <p className="text-green-300">{successMessage}</p>
          </motion.div>
        )}

        {resetEmailSent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#002009] border border-green-900 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-medium text-green-400 mb-2 flex items-center justify-center">
              <FaCheckCircle className="mr-2" />
              Password reset email sent!
            </h3>
            <p className="text-green-300">
              Check your email at <span className="font-semibold">{resetEmail}</span> for instructions to reset your password.
            </p>
            <button
              onClick={() => {
                setShowResetForm(false);
                setResetEmailSent(false);
                setResetEmail('');
              }}
              className="mt-4 text-green-400 hover:cursor-pointer hover:text-green-300 font-medium transition-colors"
            >
              Back to Sign In
            </button>
          </motion.div>
        ) : showResetForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#000f07] p-8 rounded-xl shadow-lg border border-green-900"
          >
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                  <FaEnvelope className="mr-2 text-[#34c239]" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 bg-[#002009] border ${errors.email ? 'border-red-500' : 'border-green-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-gray-200 placeholder-gray-500 transition-colors`}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              {errors.form && (
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-400">{errors.form}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#34c239] cursor-pointer hover:bg-green-500 text-black py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  setResetEmail('');
                }}
                className="w-full text-gray-400 cursor-pointer hover:text-white font-medium text-center transition-colors"
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
            className="bg-[#000f07] p-8 rounded-xl shadow-lg border border-green-900"
          >
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                  <FaEnvelope className="mr-2 text-[#34c239]" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 bg-[#002009] border ${errors.email ? 'border-red-500' : 'border-green-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-gray-200 placeholder-gray-500 transition-colors`}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                  <FaLock className="mr-2 text-[#34c239]" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 bg-[#002009] border ${errors.password ? 'border-red-500' : 'border-green-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-gray-200 placeholder-gray-500 transition-colors`}
                  required
                />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#34c239] focus:ring-[#34c239] border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm font-medium cursor-pointer text-[#34c239] hover:text-green-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {errors.form && (
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-400">{errors.form}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#34c239] cursor-pointer hover:bg-green-500 text-black py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="mt-8 text-center text-sm text-gray-400"
          >
            Don't have an account?{' '}
            <Link to="/host-signup" className="font-medium text-[#34c239] hover:text-green-400 transition-colors">
              Sign up here
            </Link>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Ventar. All rights reserved.</p>
          <p>Powered By <a href="https://algoritic.com.ng" className="hover:text-[#34c239] transition-colors">Algoritic Inc</a></p>
        </div>
      </footer>
    </div>
  );
}

export default HostSignIn;