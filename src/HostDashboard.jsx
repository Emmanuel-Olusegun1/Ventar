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
  FaSignOutAlt,
  FaRedo,
  FaTrash,
  FaLink,
  FaCopy
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, setupAuthListener, getValidSession } from './supabaseClient';

function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: '15 new registrations for Tech Conference', time: '2 mins ago', read: false, icon: <FaUserPlus className="text-emerald-500" /> },
    { id: 2, message: 'Your workshop reached 80% capacity', time: '1 hour ago', read: true, icon: <FaChartPie className="text-blue-500" /> },
    { id: 3, message: 'Community Mixer starts tomorrow', time: '3 hours ago', read: true, icon: <FaCalendarAlt className="text-indigo-500" /> }
  ]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [copied, setCopied] = useState(false);
  let isFetching = false;

  // Monitor localStorage changes
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

  // Check for extension conflicts
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.warn('Potential extension conflict detected.');
      setErrorMessage('Some browser extensions may interfere with the dashboard. Try disabling them if issues persist.');
    }
  }, []);

  // Check session and set up auth listener
  useEffect(() => {
    console.log('HostDashboard mounted');
    let isMounted = true;

    const checkSession = async () => {
      const session = await getValidSession();
      if (!isMounted) return;
      if (!session) {
        console.log('No valid session, redirecting to login');
        navigate('/host-login');
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
        navigate('/host-login');
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

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user || isFetching) {
        console.log('No user or fetch in progress, skipping fetchEvents');
        return;
      }

      isFetching = true;
      try {
        setLoading(true);
        setErrorMessage(null);
        console.log(`Fetching events for host_id: ${user.id}`);

        let query = supabase
          .from('events')
          .select('*')
          .eq('host_id', user.id)
          .order('created_at', { ascending: false });

        let { data, error } = await query;

        if (error) {
          console.error('Error fetching events:', error);
          if (error.message.includes('column events.host_id does not exist')) {
            console.log('host_id column missing, trying without filter');
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
            navigate('/host-login');
            return;
          } else if (error.code === 'PGRST116') {
            setErrorMessage('No events found for your account. Create an event to get started.');
            return;
          } else {
            setErrorMessage(`Failed to load events: ${error.message || 'Unknown error'}.`);
            return;
          }
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
      } catch (error) {
        console.error('Unexpected error fetching events:', error);
        setErrorMessage('An unexpected error occurred while loading events. Please try again.');
      } finally {
        setLoading(false);
        isFetching = false;
      }
    };

    fetchEvents();
  }, [user, navigate]);

  // Filter events
  useEffect(() => {
    const filtered = events.filter(event =>
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  // Close dropdowns and modals on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotificationsDropdown && !event.target.closest('.notifications-dropdown')) {
        setShowNotificationsDropdown(false);
      }
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
      if (showLinkModal && !event.target.closest('.link-modal')) {
        setShowLinkModal(null);
        setCopied(false);
      }
      if (showDeleteModal && !event.target.closest('.delete-modal')) {
        setShowDeleteModal(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown, showProfileDropdown, showLinkModal, showDeleteModal]);

  const toggleNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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
    switch (action) {
      case 'manage':
        navigate(`/events/${eventId}/manage`);
        break;
      case 'checkin':
        navigate(`/events/${eventId}/checkin`);
        break;
      case 'insights':
        navigate(`/events/${eventId}/analytics`);
        break;
      case 'delete':
        setShowDeleteModal(eventId);
        break;
      case 'share':
        setShowLinkModal(eventId);
        setCopied(false);
        break;
      default:
        break;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('host_id', user.id);

      if (error) {
        console.error('Error deleting event:', error);
        setErrorMessage(`Failed to delete event: ${error.message || 'Unknown error'}.`);
        return;
      }

      setEvents(events.filter(event => event.id !== eventId));
      setFilteredEvents(filteredEvents.filter(event => event.id !== eventId));
      setShowDeleteModal(null);
      setNotifications([...notifications, {
        id: Date.now(),
        message: 'Event deleted successfully',
        time: 'Just now',
        read: false,
        icon: <FaRegCheckCircle className="text-emerald-500" />
      }]);
    } catch (error) {
      console.error('Unexpected error deleting event:', error);
      setErrorMessage('An unexpected error occurred while deleting the event.');
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAction = (action) => {
    switch (action) {
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

  const handleRefresh = () => {
    if (user && !isFetching) {
      setEvents([]);
      setFilteredEvents([]);
      setErrorMessage(null);
      fetchEvents();
    }
  };

  const getEventLink = (eventId) => {
    return `${import.meta.env.VITE_APP_URL}/register/${eventId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-emerald-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50"
        >
          <p className="text-red-700 text-sm">{errorMessage}</p>
          <button
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={() => setErrorMessage(null)}
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 delete-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete Event</h3>
              <p className="text-gray-600 mb-5">Are you sure you want to delete this event? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  onClick={() => handleDeleteEvent(showDeleteModal)}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Link/QR Code Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 link-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Share Event</h3>
              <p className="text-gray-600 mb-4">Use this link or QR code to invite attendees.</p>
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={getEventLink(showLinkModal)}
                    readOnly
                    className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => handleCopyLink(getEventLink(showLinkModal))}
                    aria-label="Copy link"
                  >
                    <FaCopy />
                  </motion.button>
                </div>
                {copied && <p className="text-sm text-emerald-600 mt-2">Link copied!</p>}
              </div>
              <div className="flex justify-center mb-4">
                <QRCodeSVG
                  value={getEventLink(showLinkModal)}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  className="rounded-lg shadow-sm"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
                onClick={() => setShowLinkModal(null)}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"
              onClick={() => navigate('/host-dashboard')}
            >
              Ventar
            </motion.div>
            <div className="hidden md:flex space-x-6">
              {['events', 'attendees', 'insights'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3 py-2 text-sm font-medium ${activeTab === tab ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-800'}`}
                  aria-current={activeTab === tab ? 'page' : undefined}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative notifications-dropdown">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                aria-label="Notifications"
              >
                <FaBell className="h-5 w-5 text-gray-600" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </motion.button>
              <AnimatePresence>
                {showNotificationsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                  >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 ${notification.read ? 'bg-white' : 'bg-emerald-50/50'} hover:bg-gray-50 cursor-pointer`}
                          onClick={() => toggleNotificationRead(notification.id)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-100' : 'bg-emerald-100'}`}>
                                {notification.icon}
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="ml-3 flex-shrink-0">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 text-center">
                      <button
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                aria-label="Profile"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center text-white font-medium">
                  {user ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:inline">{user ? user.email.split('@')[0] : 'User'}</span>
              </motion.button>
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                  >
                    <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => navigate('/profile')}
                      >
                        Your Profile
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => navigate('/settings')}
                      >
                        Settings
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">{user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Manage your events'}</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl font-medium flex items-center shadow-md"
              onClick={() => navigate('/events/new')}
            >
              <FaPlus className="mr-2" />
              New Event
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-5 rounded-xl font-medium flex items-center shadow-sm"
              onClick={handleRefresh}
            >
              <FaRedo className="mr-2" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* No Events Message */}
        {events.length === 0 && !searchQuery && !errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Ventar!</h2>
            <p className="text-gray-500 mb-4">No events found. Create your first event to get started.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl font-medium flex items-center mx-auto shadow-md"
              onClick={() => navigate('/events/new')}
            >
              <FaPlus className="mr-2" />
              Create Your First Event
            </motion.button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: <FaCalendarAlt className="h-6 w-6" />,
              title: "Total Events",
              value: events.length,
              color: "bg-emerald-50 text-emerald-600",
              onClick: () => setActiveTab('events')
            },
            {
              icon: <FaUsers className="h-6 w-6" />,
              title: "Total Attendees",
              value: events.reduce((sum, event) => sum + (event.registrations || 0), 0),
              color: "bg-blue-50 text-blue-600",
              onClick: () => setActiveTab('attendees')
            },
            {
              icon: <FaRegCheckCircle className="h-6 w-6" />,
              title: "Active Events",
              value: events.filter(e => e.status === 'active').length,
              color: "bg-indigo-50 text-indigo-600",
              onClick: () => {
                setActiveTab('events');
                setSearchQuery('active');
              }
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4, shadow: 'lg' }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all ${stat.color} cursor-pointer`}
              onClick={stat.onClick}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/50">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Events Table */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Your Events</h2>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 w-full pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search events"
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filteredEvents.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm"
            >
              <p className="text-gray-500 mb-4">No events found matching your search</p>
              <button
                className="text-emerald-600 hover:text-emerald-700 font-medium"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </button>
            </motion.div>
          )}

          {filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -4, shadow: 'lg' }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 mr-3">
                          <FaCalendarAlt className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{event.name}</h3>
                          <p className="text-sm text-gray-500">#{event.workshop_number || 'N/A'}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="More options"
                      >
                        <BsThreeDotsVertical />
                      </motion.button>
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
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((event.registrations || 0) / (event.capacity || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-gray-500">
                          {Math.round(((event.registrations || 0) / (event.capacity || 1)) * 100)}% full
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            event.status === 'active' ? 'text-emerald-600' :
                            event.status === 'upcoming' ? 'text-blue-600' :
                            'text-gray-500'
                          }`}
                        >
                          {event.status?.charAt(0)?.toUpperCase() + event.status?.slice(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'manage')}
                    >
                      <FaUsers className="mr-1.5" /> Manage
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-medium text-gray-600 hover:text-gray-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'checkin')}
                    >
                      <FaQrcode className="mr-1.5" /> Check-in
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'insights')}
                    >
                      <FaChartPie className="mr-1.5" /> Insights
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'delete')}
                    >
                      <FaTrash className="mr-1.5" /> Delete
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
                      onClick={() => handleEventAction(event.id, 'share')}
                    >
                      <FaLink className="mr-1.5" /> Share
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
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
                    className={`p-4 ${notification.read ? 'bg-white' : 'bg-emerald-50/50'} hover:bg-gray-50 cursor-pointer`}
                    onClick={() => toggleNotificationRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-100' : 'bg-emerald-100'}`}>
                          {notification.icon}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="ml-3 flex-shrink-0">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <button
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                onClick={() => navigate('/notifications')}
              >
                View all activity
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6">
              {[
                { icon: <FaPlus className="h-5 w-5" />, label: "New Event", color: "bg-emerald-50 text-emerald-600", action: "new-event" },
                { icon: <FaUserPlus className="h-5 w-5" />, label: "Invite Team", color: "bg-blue-50 text-blue-600", action: "invite-team" },
                { icon: <FaQrcode className="h-5 w-5" />, label: "Check-in App", color: "bg-indigo-50 text-indigo-600", action: "checkin-app" },
                { icon: <FaChartPie className="h-5 w-5" />, label: "Reports", color: "bg-yellow-50 text-yellow-600", action: "reports" }
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -3, shadow: 'md' }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border border-gray-100 flex flex-col items-center hover:shadow-md transition-all ${action.color}`}
                  onClick={() => handleQuickAction(action.action)}
                >
                  <div className="p-3 rounded-xl bg-white/50">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-2">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 mb-4 md:mb-0">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} Ventar</p>
              <div className="flex space-x-4 mt-2 sm:mt-0">
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
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://twitter.com/ventar', '_blank');
                }}
                aria-label="Twitter"
              >
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
                aria-label="GitHub"
              >
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