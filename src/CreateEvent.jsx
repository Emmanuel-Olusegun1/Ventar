import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartPie, 
  FaPlus,
  FaArrowLeft,
  FaTicketAlt,
  FaTag,
  FaCog,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    name: '',
    workshopNumber: '',
    date: '',
    capacity: 100,
    status: 'upcoming'
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [activeSection, setActiveSection] = useState('details');
  const [success, setSuccess] = useState(false);

  // Check session on mount
  useEffect(() => {
    async function verifySession() {
      console.log('Verifying Supabase session');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Session check:', { session, error });

      if (error || !session) {
        console.log('No valid session, redirecting to /host-login');
        navigate('/host-login', { replace: true });
      }
    }
    verifySession();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!eventData.name.trim()) newErrors.name = 'Event name is required';
    if (!eventData.date) newErrors.date = 'Date is required';
    if (!eventData.capacity || eventData.capacity <= 0) newErrors.capacity = 'Capacity must be positive';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setLoading(true);
    console.log('Starting event creation process');

    try {
      // Get current user to associate event
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User check:', { user, userError });

      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user found');

      // Insert event
      const eventName = `${eventData.name} ${eventData.workshopNumber ? `#${eventData.workshopNumber}` : ''}`.trim();
      console.log('Inserting event:', { eventName, date: eventData.date, capacity: eventData.capacity });

      const { data, error } = await supabase
        .from('events')
        .insert([{
          name: eventName,
          date: eventData.date,
          capacity: Number(eventData.capacity),
          registrations: 0,
          status: eventData.status,
          created_at: new Date().toISOString(),
          host_id: user.id // Associate event with host
        }])
        .select();

      console.log('Supabase insert response:', { data, error });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No data returned from server');

      setSuccess(true);
      setTimeout(() => {
        // Clear localStorage to prevent token issues
        console.log('Clearing supabase.auth.token from localStorage');
        localStorage.removeItem('supabase.auth.token');

        console.log('Redirecting to /host-dashboard');
        navigate('/host-dashboard', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Error creating event:', error);
      setSubmitError(error.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
      console.log('Event creation process completed, loading:', false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Event Created Successfully!</h1>
          <p className="text-gray-600 mb-6">Your event has been created and is now ready for registrations.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-emerald-600 font-semibold">{eventData.name} {eventData.workshopNumber && `#${eventData.workshopNumber}`}</p>
            <p className="text-gray-500 text-sm mt-1">
              {new Date(eventData.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 text-sm"
          >
            Redirecting to dashboard...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Glassmorphism Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="mr-2" />
            Back
          </motion.button>
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Create Event
          </div>
          <div className="w-24"></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="lg:w-72">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Event Setup</h2>
              <nav className="space-y-2">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection('details')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                    activeSection === 'details' 
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaTicketAlt className={`mr-3 ${activeSection === 'details' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  Event Details
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection('settings')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                    activeSection === 'settings' 
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaCog className={`mr-3 ${activeSection === 'settings' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  Date & Capacity
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection('preview')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                    activeSection === 'preview' 
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaEye className={`mr-3 ${activeSection === 'preview' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  Preview
                </motion.button>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                      eventData.name ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {eventData.name ? <FaCheckCircle className="w-3 h-3" /> : '1'}
                    </div>
                    <span className={eventData.name ? 'text-emerald-700' : 'text-gray-600'}>Event Name</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                      eventData.date ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {eventData.date ? <FaCheckCircle className="w-3 h-3" /> : '2'}
                    </div>
                    <span className={eventData.date ? 'text-emerald-700' : 'text-gray-600'}>Date Set</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                      eventData.capacity ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {eventData.capacity ? <FaCheckCircle className="w-3 h-3" /> : '3'}
                    </div>
                    <span className={eventData.capacity ? 'text-emerald-700' : 'text-gray-600'}>Capacity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
            >
              {/* Form Header */}
              <div className="border-b border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white">
                <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
                <p className="text-gray-500 mt-1">Fill in your event details below</p>
              </div>

              {/* Error Message */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6 rounded-lg flex items-start"
                >
                  <FaExclamationTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="p-6">
                <AnimatePresence mode="wait">
                  {activeSection === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                          <FaTicketAlt className="mr-3 text-emerald-600" />
                          Event Information
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                              Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={eventData.name}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200`}
                              placeholder="Tech Conference 2024"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="mr-1 w-3 h-3" /> {errors.name}
                            </p>}
                          </div>

                          <div>
                            <label htmlFor="workshopNumber" className="block text-sm font-medium text-gray-700 mb-2">
                              Workshop/Event Number (optional)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaTag className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                id="workshopNumber"
                                name="workshopNumber"
                                min="1"
                                value={eventData.workshopNumber}
                                onChange={handleInputChange}
                                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                                placeholder="e.g. 2 for Workshop #2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                          <FaCog className="mr-3 text-blue-500" />
                          Event Settings
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                              Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="date"
                                id="date"
                                name="date"
                                value={eventData.date}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`pl-10 w-full px-4 py-3 border ${errors.date ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200`}
                              />
                            </div>
                            {errors.date && <p className="mt-2 text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="mr-1 w-3 h-3" /> {errors.date}
                            </p>}
                          </div>

                          <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                              Total Capacity <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUsers className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                id="capacity"
                                name="capacity"
                                min="1"
                                value={eventData.capacity}
                                onChange={handleInputChange}
                                className={`pl-10 w-full px-4 py-3 border ${errors.capacity ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200`}
                              />
                            </div>
                            {errors.capacity && <p className="mt-2 text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="mr-1 w-3 h-3" /> {errors.capacity}
                            </p>}
                          </div>

                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                              Event Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={eventData.status}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'preview' && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                          <FaEye className="mr-3 text-purple-500" />
                          Event Preview
                        </h3>
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                          <div className="space-y-5">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">
                                {eventData.name || "Untitled Event"} {eventData.workshopNumber && `#${eventData.workshopNumber}`}
                              </h4>
                            </div>

                            {eventData.date && (
                              <div className="flex items-center text-gray-600">
                                <FaCalendarAlt className="mr-2 text-emerald-500" />
                                <span>
                                  {new Date(eventData.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Registrations</span>
                                <span className="font-medium">0/{eventData.capacity}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500" 
                                  style={{ width: '0%' }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                eventData.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                eventData.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {eventData.status?.charAt(0)?.toUpperCase() + eventData.status?.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation and Submit */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="flex space-x-2">
                    {['details', 'settings', 'preview'].map((section) => (
                      <button
                        key={section}
                        type="button"
                        onClick={() => setActiveSection(section)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeSection === section 
                            ? 'bg-emerald-100 text-emerald-700 shadow-xs' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-3 w-full sm:w-auto">
                    <motion.button 
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(-1)}
                      className="w-full sm:w-auto px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl text-sm font-medium shadow-sm flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaPlus className="-ml-1 mr-2" />
                          Create Event
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateEvent;