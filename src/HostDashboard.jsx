import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartPie,
  FaBell, 
  FaCog,
  FaSearch,
  FaPlus,
  FaRegCheckCircle,
  FaUserPlus,
  FaQrcode,
  FaSignOutAlt
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { supabase, setupAuthListener, getValidSession } from './supabaseClient';

function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: '15 new registrations for Tech Conference', time: '2 mins ago', read: false, icon: <FaUserPlus className="text-green-500"/> },
    { id: 2, message: 'Your workshop reached 80% capacity', time: '1 hour ago', read: true, icon: <FaChartPie className="text-blue-500"/> },
    { id: 3, message: 'Community Mixer starts tomorrow', time: '3 hours ago', read: true, icon: <FaCalendarAlt className="text-purple-500"/> }
  ]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Monitor localStorage changes to detect interference
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'ventar-sb-auth-token') {
        console.warn('ventar-sb-auth-token modified:', event.newValue);
        setErrorMessage('Session token was modified. Please refresh the page.');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Warn about potential extension conflicts
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.warn('Potential extension conflict detected. Try disabling extensions if issues persist.');
      setErrorMessage('Some browser extensions may interfere with the dashboard. Try disabling them if issues persist.');
    }
  }, []);

  // Check session and set up auth listener on component mount
  useEffect(() => {
    console.log('HostDashboard mounted');
    let isMounted = true;

    const checkSession = async () => {
      const session = await getValidSession();
      if (!isMounted) return;
      if (!session) {
        console.log('No valid session, redirecting to login');
        navigate('/login');
      } else {
        console.log('Session valid, user ID:', session.user.id);
        setUser(session.user);
      }
    };

    checkSession();

    const unsubscribe = setupAuthListener((event, session) => {
      console.log('Auth event in HostDashboard:', event, session?.user?.id);
      if (!isMounted) return;
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('ventar-sb-auth-token');
        localStorage.removeItem('ventar-sb-user-data');
        navigate('/login');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => {
      console.log('HostDashboard unmounted');
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Fetch events when user is available
  useEffect(() => {
    const fetchEvents = async (retries = 3, delay = 1000) => {
      if (!user) {
        console.log('No user, skipping fetchEvents');
        return;
      }

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          setLoading(true);
          setErrorMessage(null);
          console.log(`Fetching events for user ID: ${user.id} (Attempt ${attempt}/${retries})`);

          let query = supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

          // Try with host_id filter first
          query = query.eq('host_id', user.id);

          let { data, error } = await query;

          if (error) {
            console.error('Error fetching events with host_id:', error);
            if (error.message.includes('column events.host_id does not exist')) {
              console.log('host_id column missing, trying without filter');
              // Fallback query without host_id filter (for debugging or no RLS)
              ({ data, error } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false }));
              if (error) {
                console.error('Error fetching events without host_id:', error);
                setErrorMessage('Database error: Unable to fetch events. Please check the table schema or contact support.');
                return;
              }
              setErrorMessage('Warning: host_id column missing in events table. Showing all events (check RLS policies).');
            } else if (error.code === 'PGRST301') {
              setErrorMessage('Authentication error: Please log in again.');
              navigate('/login');
              return;
            } else if (error.code === 'PGRST116') {
              setErrorMessage('No events found for your account.');
              return;
            } else if (attempt === retries) {
              setErrorMessage(`Failed to load events: ${error.message || 'Unknown error'}.`);
              return;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          console.log('Events fetched:', data);

          const formattedEvents = data.map(event => {
            const eventDate = new Date(event.date);
            return {
              ...event,
              date: isNaN(eventDate) ? 'Invalid Date' : eventDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            };
          });

          setEvents(formattedEvents);
          setFilteredEvents(formattedEvents);
          return;
        } catch (error) {
          console.error('Unexpected error fetching events:', error);
          if (attempt === retries) {
            setErrorMessage('An unexpected error occurred while loading events. Please refresh the page.');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvents();
  }, [user, navigate]);

  // Filter events based on search query
  useEffect(() => {
    const filtered = events.filter(event =>
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotificationsDropdown && !event.target.closest('.notifications-dropdown')) {
        setShowNotificationsDropdown(false);
      }
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown, showProfileDropdown]);

  const toggleNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: !n.read} : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('ventar-sb-auth-token');
      localStorage.removeItem('ventar-sb-user-data');
      
      navigate('/host-login');
    } catch (error) {
      console.error('Error signing out:', error);
      setErrorMessage('Error signing out. Please try again.');
    }
  };

  const handleEventAction = (eventId, action) => {
    switch(action) {
      case 'manage':
        navigate(`/events/${eventId}/manage`);
        break;
      case 'checkin':
        navigate(`/events/${eventId}/checkin`);
        break;
      case 'insights':
        navigate(`/events/${eventId}/analytics`);
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'new-event':
        navigate('/events/new');
        break;
      case 'invite-team':
        navigate('/team/invite');
        break;
      case 'checkin-app':
        navigate('/checkin');
        break;
      case 'reports':
        navigate('/reports');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mx-4 mb-4 rounded">
          <p>{errorMessage}</p>
          <button
            className="text-sm text-red-600 hover:text-red-800 mt-2"
            onClick={() => setErrorMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Glassmorphism Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent mr-10 cursor-pointer"
              onClick={() => navigate('/host-dashboard')}
            >
              Ventar
            </motion.div>
            <div className="hidden md:flex space-x-6">
              {['events', 'attendees', 'insights'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 font-medium text-sm relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative notifications-dropdown">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              >
                <FaBell className="h-5 w-5 text-gray-600" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotificationsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-medium">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 ${notification.read ? 'bg-white' : 'bg-green-50/50'} hover:bg-gray-50 cursor-pointer`}
                          onClick={() => toggleNotificationRead(notification.id)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-100' : 'bg-green-100'}`}>
                                {notification.icon}
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="ml-3 flex-shrink-0">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button 
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                        onClick={() => navigate('/notifications')}
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative profile-dropdown">
              <button 
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-medium">
                  {user ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:inline">{user ? user.email.split('@')[0] : 'User'}</span>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="py-1">
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => navigate('/profile')}
                      >
                        Your Profile
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => navigate('/settings')}
                      >
                        Settings
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="mr-2" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Dashboard</h1>
            <p className="text-gray-500 mt-1">{user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Manage your events and track engagement'}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 md:mt-0 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2.5 px-5 rounded-xl font-medium flex items-center shadow-sm shadow-green-100"
            onClick={() => navigate('/events/new')}
          >
            <FaPlus className="mr-2" />
            New Event
          </motion.button>
        </div>

        {/* Welcome Message for New Users */}
        {events.length === 0 && !searchQuery && !errorMessage && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Ventar!</h2>
            <p className="text-gray-500 mb-4">It looks like you're new here. Start by creating your first event to engage your audience.</p>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2.5 px-5 rounded-xl font-medium flex items-center shadow-sm shadow-green-100 mx-auto"
              onClick={() => navigate('/events/new')}
            >
              <FaPlus className="mr-2" />
              Create Your First Event
            </motion.button>
          </div>
        )}

        {/* Stats Cards - Neumorphic Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {[
            { 
              icon: <FaCalendarAlt className="h-5 w-5" />,
              title: "Total Events",
              value: events.length,
              color: "bg-gradient-to-r from-green-100 to-green-50 text-green-600",
              onClick: () => setActiveTab('events')
            },
            { 
              icon: <FaUsers className="h-5 w-5" />,
              title: "Total Attendees",
              value: events.reduce((sum, event) => sum + (event.registrations || 0), 0),
              color: "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600",
              onClick: () => setActiveTab('attendees')
            },
            { 
              icon: <FaRegCheckCircle className="h-5 w-5" />,
              title: "Active Events",
              value: events.filter(e => e.status === 'active').length,
              color: "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-600",
              onClick: () => {
                setActiveTab('events');
                setSearchQuery('active');
              }
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-all ${stat.color} cursor-pointer`}
              onClick={stat.onClick}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/50 backdrop-blur-sm">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Events Table - Card Grid Layout */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 w-full pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filteredEvents.length === 0 && searchQuery && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500 mb-4">No events found matching your search</p>
              <button 
                className="text-green-600 hover:text-green-700 font-medium"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </button>
            </div>
          )}

          {filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="p-2.5 rounded-lg bg-green-100 text-green-600 mr-3">
                          <FaCalendarAlt className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.name}</h3>
                          <p className="text-sm text-gray-500">#{event.workshop_number || 'N/A'}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <BsThreeDotsVertical />
                      </button>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">{event.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Registrations</p>
                        <p className="font-medium text-gray-900">{event.registrations || 0}/{event.capacity || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, ((event.registrations || 0) / (event.capacity || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {Math.round(((event.registrations || 0) / (event.capacity || 1)) * 100)}% full
                        </span>
                        <span className={`text-xs font-medium ${
                          event.status === 'active' ? 'text-green-600' :
                          event.status === 'upcoming' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          {event.status?.charAt(0)?.toUpperCase() + event.status?.slice(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-between">
                    <button 
                      className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'manage')}
                    >
                      <FaUsers className="mr-1.5" /> Manage
                    </button>
                    <button 
                      className="text-sm font-medium text-gray-600 hover:text-gray-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'checkin')}
                    >
                      <FaQrcode className="mr-1.5" /> Check-in
                    </button>
                    <button 
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'insights')}
                    >
                      <FaChartPie className="mr-1.5" /> Insights
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {notifications.slice(0, 4).map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 ${notification.read ? 'bg-white' : 'bg-green-50/50'} hover:bg-gray-50 cursor-pointer`}
                    onClick={() => toggleNotificationRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-100' : 'bg-green-100'}`}>
                          {notification.icon}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="ml-3 flex-shrink-0">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <button 
                className="text-sm font-medium text-green-600 hover:text-green-700"
                onClick={() => navigate('/notifications')}
              >
                View all activity
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5">
              {[
                { icon: <FaPlus className="h-5 w-5" />, label: "New Event", color: "bg-green-100 text-green-600", action: "new-event" },
                { icon: <FaUserPlus className="h-5 w-5" />, label: "Invite Team", color: "bg-blue-100 text-blue-600", action: "invite-team" },
                { icon: <FaQrcode className="h-5 w-5" />, label: "Check-in App", color: "bg-purple-100 text-purple-600", action: "checkin-app" },
                { icon: <FaChartPie className="h-5 w-5" />, label: "Reports", color: "bg-yellow-100 text-yellow-600", action: "reports" }
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border border-gray-100 flex flex-col items-center hover:shadow-xs transition-all ${action.color} cursor-pointer`}
                  onClick={() => handleQuickAction(action.action)}
                >
                  <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm mb-2">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Glassmorphism Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} Ventar</p>
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/privacy');
                }}
              >
                Privacy
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/terms');
                }}
              >
                Terms
              </a>
            </div>
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://twitter.com/ventar', '_blank');
                }}
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://github.com/ventar', '_blank');
                }}
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HostDashboard;