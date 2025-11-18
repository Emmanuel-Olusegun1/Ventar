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
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
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
              className="w-12 h-12 md:w-16 md:h-16 border-4 border-[#002009] border-t-[#34c239] rounded-full mx-auto"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 md:mt-6 text-gray-400 font-medium text-sm md:text-base"
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
        className="min-h-screen bg-[#000000] flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full">
          <div className="bg-[#000f07] rounded-2xl border border-[#00331a] p-6 shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-red-900/20 rounded-full mb-4 mx-auto">
              <FaExclamationTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#d4d4d4] text-center mb-3">Event Not Found</h1>
            <p className="text-gray-400 text-center mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="w-full bg-[#34c239] hover:bg-green-500 text-black py-3 px-5 rounded-xl font-medium shadow-md flex items-center justify-center transition-colors"
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
        className="min-h-screen bg-[#000000] flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#000f07] rounded-2xl border border-[#00331a] p-8 shadow-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-[#002009] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheckCircle className="h-8 w-8 text-[#34c239]" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[#d4d4d4] mb-3">Registration Successful!</h1>
            <p className="text-gray-400 mb-2">You're registered for</p>
            <p className="text-[#34c239] font-semibold mb-6">{event?.name}</p>
            <div className="bg-[#002009] rounded-xl p-4 mb-6 border border-[#00331a]">
              <p className="text-gray-500 text-sm flex items-center justify-center">
                <FaCalendarAlt className="mr-2 text-[#34c239]" />
                {new Date(event?.date).toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                })}
              </p>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              A confirmation email has been sent to <span className="text-[#34c239]">{formData.email}</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSuccess(false);
                setFormData({ name: '', email: '' });
              }}
              className="w-full bg-[#34c239] hover:bg-green-500 text-black py-3 px-5 rounded-xl font-medium shadow-md transition-colors"
            >
              Register Another Person
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e5e5] font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#000f07] rounded-2xl border border-[#00331a] p-6 sm:p-8 shadow-sm"
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#d4d4d4] mb-2">Register for Event</h1>
              <div className="bg-[#34c239] h-1 w-16 rounded-full mb-4"></div>
              <p className="text-lg font-semibold text-[#34c239] mb-3">{event?.name}</p>
              <div className="flex items-center text-gray-500 text-sm">
                <FaCalendarAlt className="mr-2 text-[#34c239]" />
                {new Date(event?.date).toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 w-full p-3.5 bg-[#002009] border border-[#00331a] rounded-xl focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-gray-200 placeholder-gray-500 text-sm transition-all duration-200"
                    required
                    aria-label="Your Name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full p-3.5 bg-[#002009] border border-[#00331a] rounded-xl focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-gray-200 placeholder-gray-500 text-sm transition-all duration-200"
                    required
                    aria-label="Your Email"
                  />
                </div>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-900/20 border border-red-800 rounded-xl p-3 flex items-start"
                >
                  <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-[#34c239] hover:bg-green-500 text-black py-3.5 px-5 rounded-xl font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            
            <div className="mt-6 pt-6 border-t border-[#00331a]">
              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to our{' '}
                <a href="#" className="text-[#34c239] hover:text-green-400 underline transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#34c239] hover:text-green-400 underline transition-colors">
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