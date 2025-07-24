import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartLine, 
  FaBell, 
  FaCog,
  FaSearch,
  FaPlus,
  FaEllipsisV,
  FaRegCheckCircle
} from 'react-icons/fa';
import { BsLightningFill } from 'react-icons/bs';

function HostDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New registration for Tech Conference', time: '2 mins ago', read: false },
    { id: 2, message: '15 people registered for Workshop', time: '1 hour ago', read: true },
    { id: 3, message: 'Event reminder: Community Meetup starts tomorrow', time: '3 hours ago', read: true }
  ]);

  const [events, setEvents] = useState([
    { id: 1, name: 'Tech Conference 2023', date: 'Oct 15, 2023', registrations: 245, status: 'active' },
    { id: 2, name: 'Community Workshop', date: 'Nov 5, 2023', registrations: 89, status: 'active' },
    { id: 3, name: 'Networking Mixer', date: 'Dec 10, 2023', registrations: 112, status: 'upcoming' },
    { id: 4, name: 'Developer Meetup', date: 'Sep 20, 2023', registrations: 156, status: 'completed' }
  ]);

  const toggleNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: !n.read} : n
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-green-700 mr-10"
            >
              Ventar
            </motion.div>
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveTab('events')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'events' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                My Events
              </button>
              <button 
                onClick={() => setActiveTab('attendees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendees' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Attendees
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Insights
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button className="text-gray-500 hover:text-gray-700 relative">
                <FaBell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
            </div>
            <div className="flex items-center">
              <img 
                className="h-8 w-8 rounded-full" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="User profile" 
              />
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">Alex Johnson</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Management Dashboard</h1>
            <p className="text-gray-600">Manage your free events and track participation</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center"
          >
            <FaPlus className="mr-2" />
            Create New Event
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                <FaCalendarAlt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <FaUsers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {events.reduce((sum, event) => sum + event.registrations, 0)}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                <FaRegCheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Events</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {events.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800">Your Events</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrations
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                          <FaCalendarAlt />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{event.name}</div>
                          <div className="text-sm text-gray-500">#{event.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.registrations}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${event.status === 'active' ? 'bg-green-100 text-green-800' : 
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900 mr-4">Manage</button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">Upcoming Events</h2>
            </div>
            <div className="p-4">
              {events.filter(e => e.status === 'upcoming').map(event => (
                <motion.div 
                  key={event.id} 
                  whileHover={{ x: 5 }}
                  className="mb-4 last:mb-0 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className="text-sm text-gray-500">{event.registrations} registered</span>
                    <button className="ml-auto text-sm text-green-600 hover:text-green-800">Details</button>
                  </div>
                </motion.div>
              ))}
              {events.filter(e => e.status === 'upcoming').length === 0 && (
                <p className="text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-800">Recent Activity</h2>
                <button className="text-sm text-green-600 hover:text-green-800">View All</button>
              </div>
            </div>
            <div className="p-4">
              {notifications.map(notification => (
                <motion.div 
                  key={notification.id} 
                  whileHover={{ x: 5 }}
                  className={`mb-4 last:mb-0 p-3 rounded-lg ${notification.read ? 'bg-white' : 'bg-green-50'}`}
                  onClick={() => toggleNotificationRead(notification.id)}
                >
                  <div className="flex">
                    <div className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Ventar. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HostDashboard;