import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaEnvelope, 
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

function Register() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log('Fetching event with ID:', eventId);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        console.log('Supabase response:', { data, error });
        if (error) throw error;
        if (!data) throw new Error('Event not found');
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Event not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting registration:', { eventId, ...formData });
      const { error } = await supabase.from('registrations').insert({
        event_id: eventId,
        name: formData.name,
        email: formData.email,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error('Error registering:', error);
      setError('Registration failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full mx-auto"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 md:mt-6 text-gray-600 font-medium text-sm md:text-base"
          >
            Loading event details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">Event Not Found</h1>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 px-5 rounded-xl font-medium shadow-md flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheckCircle className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h1>
            <p className="text-gray-600 mb-2">You're registered for</p>
            <p className="text-emerald-600 font-semibold mb-6">{event?.name}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-500 text-sm flex items-center justify-center">
                <FaCalendarAlt className="mr-2 text-emerald-600" />
                {new Date(event?.date).toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                })}
              </p>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              A confirmation email has been sent to <span className="text-emerald-600">{formData.email}</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSuccess(false);
                setFormData({ name: '', email: '' });
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 px-5 rounded-xl font-medium shadow-md"
            >
              Register Another Person
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm"
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Register for Event</h1>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1 w-16 rounded-full mb-4"></div>
              <p className="text-lg font-semibold text-emerald-700 mb-3">{event?.name}</p>
              <div className="flex items-center text-gray-500 text-sm">
                <FaCalendarAlt className="mr-2 text-emerald-600" />
                {new Date(event?.date).toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 text-sm transition-all duration-200"
                    required
                    aria-label="Your Name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 text-sm transition-all duration-200"
                    required
                    aria-label="Your Email"
                  />
                </div>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start"
                >
                  <FaExclamationTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3.5 px-5 rounded-xl font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Register Now'
                )}
              </motion.button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to our{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Register;