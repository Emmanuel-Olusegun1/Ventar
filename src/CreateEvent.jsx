import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartPie, 
  FaPlus,
  FaArrowLeft,
  FaTicketAlt
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
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          name: `${eventData.name} ${eventData.workshopNumber ? `#${eventData.workshopNumber}` : ''}`.trim(),
          date: eventData.date,
          capacity: Number(eventData.capacity),
          registrations: 0, // Start with 0 registrations
          status: eventData.status,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No data returned from server');

      navigate('/host-dashboard'); // Redirect to host dashboard
    } catch (error) {
      console.error('Error creating event:', error);
      setSubmitError(error.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Glassmorphism Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-gray-700 hover:text-gray-900"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </motion.button>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Event Manager
          </div>
          <div className="w-24"></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Event</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('details')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${activeSection === 'details' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaTicketAlt className="mr-3" />
                  Event Details
                </button>
                <button
                  onClick={() => setActiveSection('settings')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${activeSection === 'settings' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaCalendarAlt className="mr-3" />
                  Date & Capacity
                </button>
                <button
                  onClick={() => setActiveSection('preview')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${activeSection === 'preview' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaChartPie className="mr-3" />
                  Preview
                </button>
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden"
            >
              {/* Form Header */}
              <div className="border-b border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900">New Event Setup</h1>
                <p className="text-gray-500 mt-1">Fill in your event details below</p>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                </div>
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
                          <FaTicketAlt className="mr-2 text-green-500" />
                          Event Information
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                              Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={eventData.name}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                              placeholder="Tech Conference"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                          </div>

                          <div>
                            <label htmlFor="workshopNumber" className="block text-sm font-medium text-gray-700 mb-1">
                              Workshop/Event Number (optional)
                            </label>
                            <input
                              type="number"
                              id="workshopNumber"
                              name="workshopNumber"
                              min="1"
                              value={eventData.workshopNumber}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="e.g. 2 for Workshop #2"
                            />
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
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          Event Settings
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
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
                                className={`pl-10 w-full px-4 py-2.5 border ${errors.date ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                              />
                            </div>
                            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                          </div>

                          <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
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
                                className={`pl-10 w-full px-4 py-2.5 border ${errors.capacity ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                              />
                            </div>
                            {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
                          </div>

                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                              Event Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={eventData.status}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          <FaChartPie className="mr-2 text-purple-500" />
                          Event Preview
                        </h3>
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">
                                {eventData.name || "Untitled Event"} {eventData.workshopNumber && `#${eventData.workshopNumber}`}
                              </h4>
                            </div>
                            
                            {eventData.date && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p className="text-md text-gray-900">
                                  {new Date(eventData.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-sm font-medium text-gray-500">Registrations</p>
                              <div className="flex items-center space-x-4">
                                <p className="text-md text-gray-900">
                                  0/{eventData.capacity}
                                </p>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: '0%' }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-500">0%</span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-500">Status</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                eventData.status === 'active' ? 'bg-green-100 text-green-800' :
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
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection('details')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${activeSection === 'details' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('settings')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${activeSection === 'settings' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('preview')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${activeSection === 'preview' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Preview
                    </button>
                  </div>

                  <div className="flex space-x-3 w-full sm:w-auto">
                    <button 
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg text-sm font-medium shadow-sm flex items-center justify-center"
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