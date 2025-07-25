import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaChartPie, FaQrcode, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    name: '',
    workshopNumber: '',
    date: '',
    capacity: 100,
    registrations: 0,
    status: 'upcoming'
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
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
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          name: `${eventData.name} ${eventData.workshopNumber ? `#${eventData.workshopNumber}` : ''}`,
          date: eventData.date,
          capacity: eventData.capacity,
          registrations: eventData.registrations,
          status: eventData.status,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      navigate(`/events/${data[0].id}/manage`);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-gray-700 hover:text-gray-900"
              onClick={() => navigate(-1)}
            >
              Back
            </motion.button>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Create New Event
          </div>
          <div className="w-24"></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Information</h1>
            <p className="text-gray-500">Enter details similar to the example image</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-xs p-6">
            {/* Event Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-lg font-semibold text-gray-900 mb-2">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={eventData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium`}
                placeholder="Tech Conference"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Workshop Number */}
            <div className="mb-6">
              <label htmlFor="workshopNumber" className="block text-md font-medium text-gray-700 mb-2">
                Workshop/Event Number (optional)
              </label>
              <input
                type="number"
                id="workshopNumber"
                name="workshopNumber"
                min="1"
                value={eventData.workshopNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g. 2 for Workshop #2"
              />
            </div>

            {/* Date */}
            <div className="mb-6">
              <label htmlFor="date" className="block text-md font-medium text-gray-700 mb-2">
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
                  className={`pl-10 w-full px-4 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                />
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            {/* Capacity and Registrations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="capacity" className="block text-md font-medium text-gray-700 mb-2">
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
                    className={`pl-10 w-full px-4 py-2 border ${errors.capacity ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>
                {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
              </div>

              <div>
                <label htmlFor="registrations" className="block text-md font-medium text-gray-700 mb-2">
                  Current Registrations
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaChartPie className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="registrations"
                    name="registrations"
                    min="0"
                    max={eventData.capacity}
                    value={eventData.registrations}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-8">
              <label htmlFor="status" className="block text-md font-medium text-gray-700 mb-2">
                Event Status
              </label>
              <select
                id="status"
                name="status"
                value={eventData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Preview Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">Preview (similar to your image):</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {eventData.name || "Event Name"} {eventData.workshopNumber && `#${eventData.workshopNumber}`}
                  </h4>
                </div>
                
                {eventData.date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-md text-gray-900">
                      {new Date(eventData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Registrations</p>
                  <p className="text-md text-gray-900">
                    {eventData.registrations}/{eventData.capacity}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-md text-gray-900 capitalize">
                    {eventData.status} • {eventData.capacity > 0 ? 
                      `${Math.round((eventData.registrations / eventData.capacity) * 100)}% full` : 
                      '0% full'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-8 rounded-xl font-medium shadow-sm shadow-green-100 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Create Event
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

export default CreateEvent;