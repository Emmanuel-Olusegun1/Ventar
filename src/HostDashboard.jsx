import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartPie,
  FaBell, 
  FaCog,
  FaFilter,
  FaChevronDown,
  FaSearch,
  FaPlus,
  FaRegCheckCircle,
  FaUserPlus,
  FaQrcode,
  FaSignOutAlt,
  FaRedo,
  FaTrash,
  FaLink,
  FaCopy,
  FaHome,
  FaUserFriends,
  FaChartBar,
  FaSlidersH,
  FaBars,
  FaTimes,
  FaExclamationTriangle,
  FaLayerGroup
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiOutlineViewGrid, HiOutlineViewList } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, setupAuthListener, getValidSession } from './supabaseClient';

function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    date: 'all'
  });
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [showCascadeModal, setShowCascadeModal] = useState(false);

  // Navigation items
  const navItems = [
    { id: 'events', label: 'Events', icon: FaCalendarAlt },
    { id: 'attendees', label: 'Attendees', icon: FaUserFriends },
    { id: 'insights', label: 'Insights', icon: FaChartBar },
    { id: 'settings', label: 'Settings', icon: FaSlidersH }
  ];

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
      if (!user) {
        console.log('No user, skipping fetchEvents');
        return;
      }

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
            }),
            registrations: event.registrations || 0,
            capacity: event.capacity || 50,
            status: event.status || 'draft',
            progress: Math.min(100, ((event.registrations || 0) / (event.capacity || 1)) * 100)
          };
        });

        setEvents(formattedEvents);
        setFilteredEvents(formattedEvents);
      } catch (error) {
        console.error('Unexpected error fetching events:', error);
        setErrorMessage('An unexpected error occurred while loading events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, navigate]);

  // Filter events
  useEffect(() => {
    let filtered = events.filter(event =>
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(event => event.status === selectedFilters.status);
    }

    if (selectedFilters.date === 'upcoming') {
      filtered = filtered.filter(event => event.status === 'upcoming' || event.status === 'active');
    }

    setFilteredEvents(filtered);
  }, [searchQuery, events, selectedFilters]);

  // Close dropdowns and modals on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotificationsDropdown && !event.target.closest('.notifications-dropdown')) {
        setShowNotificationsDropdown(false);
      }
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
      if (showMobileMenu && !event.target.closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
      if (showLinkModal && !event.target.closest('.link-modal')) {
        setShowLinkModal(null);
        setCopied(false);
      }
      if (showDeleteModal && !event.target.closest('.delete-modal')) {
        setShowDeleteModal(null);
      }
      if (showCascadeModal && !event.target.closest('.cascade-modal')) {
        setShowCascadeModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown, showProfileDropdown, showMobileMenu, showLinkModal, showDeleteModal, showCascadeModal]);

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

  const handleDeleteEvent = async (eventId, cascade = false) => {
    try {
      setDeletingEvent(eventId);
      
      // If cascade delete is requested, delete related registrations first
      if (cascade) {
        const { error: regError } = await supabase
          .from('registrations')
          .delete()
          .eq('event_id', eventId);

        if (regError) {
          console.error('Error deleting registrations:', regError);
          setErrorMessage(`Failed to delete event registrations: ${regError.message || 'Unknown error'}.`);
          setDeletingEvent(null);
          return;
        }
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('host_id', user.id);

      if (error) {
        console.error('Error deleting event:', error);
        
        // Check if it's a foreign key constraint error
        if (error.message.includes('violates foreign key constraint')) {
          setShowCascadeModal(eventId);
          setShowDeleteModal(null);
          setDeletingEvent(null);
          return;
        }
        
        setErrorMessage(`Failed to delete event: ${error.message || 'Unknown error'}.`);
        setDeletingEvent(null);
        return;
      }

      setEvents(events.filter(event => event.id !== eventId));
      setFilteredEvents(filteredEvents.filter(event => event.id !== eventId));
      setShowDeleteModal(null);
      setShowCascadeModal(false);
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
    } finally {
      setDeletingEvent(null);
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
    if (user) {
      setEvents([]);
      setFilteredEvents([]);
      setErrorMessage(null);
      window.location.reload();
    }
  };

  const getEventLink = (eventId) => {
    return `${import.meta.env.VITE_APP_URL}/register/${eventId}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
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
            Loading your dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 lg:hidden mobile-menu"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">V</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Ventar</span>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <FaTimes className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <nav className="p-6 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-3 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">V</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Ventar</span>
          </div>
        </div>
        
        <nav className="p-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-3 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <FaBars className="h-5 w-5 text-gray-600" />
              </button>

              {/* Page Title - Mobile */}
              <h1 className="text-xl font-bold text-gray-900 lg:hidden">
                {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>

              {/* Search Bar - Desktop */}
              <div className="hidden md:block flex-1 max-w-md mx-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Search Button - Mobile */}
                <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                  <FaSearch className="h-5 w-5 text-gray-600" />
                </button>

                {/* Notifications */}
                <div className="relative notifications-dropdown">
                  <button
                    className="relative p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  >
                    <FaBell className="h-5 w-5 text-gray-600" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotificationsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-40 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Mark all as read
                            </button>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                                notification.read ? 'bg-white' : 'bg-emerald-50/30'
                              }`}
                              onClick={() => toggleNotificationRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-xl ${
                                  notification.read ? 'bg-gray-100' : 'bg-emerald-100'
                                }`}>
                                  {notification.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative profile-dropdown">
                  <button
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user ? user.email.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-40 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user ? user.email.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {user ? user.email.split('@')[0] : 'User'}
                              </p>
                              <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <FaSignOutAlt className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={() => setErrorMessage(null)}
                  >
                    Dismiss
                  </button>
                </div>
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
                        disabled={deletingEvent}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                        onClick={() => handleDeleteEvent(showDeleteModal)}
                        disabled={deletingEvent}
                      >
                        {deletingEvent ? 'Deleting...' : 'Delete'}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cascade Delete Confirmation Modal */}
            <AnimatePresence>
              {showCascadeModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 cascade-modal"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Cannot Delete Event</h3>
                    </div>
                    <p className="text-gray-600 mb-5">
                      This event has registrations associated with it. Would you like to delete the event along with all its registrations?
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
                        onClick={() => setShowCascadeModal(false)}
                        disabled={deletingEvent}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                        onClick={() => handleDeleteEvent(showCascadeModal, true)}
                        disabled={deletingEvent}
                      >
                        {deletingEvent ? 'Deleting...' : 'Delete All'}
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

            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Event Dashboard</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Manage your events and track engagement'}
                </p>
              </div>
              <div className="flex space-x-3">
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
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Ventar!</h2>
                <p className="text-gray-600 mb-4">No events found. Create your first event to get started.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 px-5 rounded-xl font-medium flex items-center mx-auto shadow-md"
                  onClick={() => navigate('/events/new')}
                >
                  <FaPlus className="mr-2" />
                  Create Your First Event
                </motion.button>
              </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { 
                  icon: FaCalendarAlt,
                  title: "Total Events",
                  value: events.length,
                  change: "+12%",
                  trend: "up",
                  color: "from-emerald-500 to-emerald-600",
                  bgColor: "bg-emerald-500/10"
                },
                { 
                  icon: FaUsers,
                  title: "Total Attendees",
                  value: events.reduce((sum, event) => sum + (event.registrations || 0), 0),
                  change: "+24%",
                  trend: "up",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-500/10"
                },
                { 
                  icon: FaRegCheckCircle,
                  title: "Active Events",
                  value: events.filter(e => e.status === 'active').length,
                  change: "+8%",
                  trend: "up",
                  color: "from-indigo-500 to-indigo-600",
                  bgColor: "bg-indigo-500/10"
                },
                { 
                  icon: FaChartPie,
                  title: "Avg. Attendance",
                  value: `${Math.round(events.reduce((sum, event) => sum + event.progress, 0) / (events.length || 1))}%`,
                  change: "+5%",
                  trend: "up",
                  color: "from-orange-500 to-orange-600",
                  bgColor: "bg-orange-500/10"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                    </div>
                    <span className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Events Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Events</h2>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'grid'
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <HiOutlineViewGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'list'
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <HiOutlineViewList className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Search - Mobile */}
                    <div className="lg:hidden relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FaFilter className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Filters</span>
                      <FaChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${
                        showFilters ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={selectedFilters.status}
                          onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <select
                          value={selectedFilters.date}
                          onChange={(e) => setSelectedFilters(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        >
                          <option value="all">All Dates</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="past">Past Events</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Events Content */}
              <div className="p-4 sm:p-6">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCalendarAlt className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {searchQuery || selectedFilters.status !== 'all' || selectedFilters.date !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Get started by creating your first event'
                      }
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedFilters({ status: 'all', date: 'all' });
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2 px-4 rounded-xl font-medium text-sm"
                    >
                      {searchQuery || selectedFilters.status !== 'all' || selectedFilters.date !== 'all'
                        ? 'Clear Filters'
                        : 'Create Event'
                      }
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ y: -2 }}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                <FaCalendarAlt className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{event.name}</h3>
                                <p className="text-gray-500 text-xs">#{event.workshop_number || 'N/A'}</p>
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

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-500 text-xs">Date</p>
                                <p className="font-medium text-gray-900 text-sm">{event.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 text-xs">Registrations</p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {event.registrations || 0}/{event.capacity || 0}
                                </p>
                              </div>
                            </div>

                            <div>
                              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${event.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1.5">
                                <span className="text-xs text-gray-500">
                                  {Math.round(event.progress)}% full
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                                  {event.status?.charAt(0)?.toUpperCase() + event.status?.slice(1) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex flex-wrap gap-3">
                          {[
                            { action: 'manage', icon: FaUsers, label: 'Manage', color: 'text-emerald-600 hover:text-emerald-700' },
                            { action: 'checkin', icon: FaQrcode, label: 'Check-in', color: 'text-gray-600 hover:text-gray-700' },
                            { action: 'insights', icon: FaChartPie, label: 'Insights', color: 'text-blue-600 hover:text-blue-700' },
                            { action: 'delete', icon: FaTrash, label: 'Delete', color: 'text-red-600 hover:text-red-700' },
                            { action: 'share', icon: FaLink, label: 'Share', color: 'text-indigo-600 hover:text-indigo-700' }
                          ].map((btn) => (
                            <motion.button
                              key={btn.action}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`text-xs font-medium transition-colors ${btn.color}`}
                              onClick={() => handleEventAction(event.id, btn.action)}
                            >
                              <btn.icon className="h-3 w-3 inline mr-1" />
                              <span className="hidden sm:inline">{btn.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ x: 2 }}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <FaCalendarAlt className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm">{event.name}</h3>
                              <p className="text-gray-500 text-xs">#{event.workshop_number || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="text-left sm:text-right">
                              <p className="text-gray-500 text-xs">Date</p>
                              <p className="font-medium text-gray-900 text-sm">{event.date}</p>
                            </div>
                            
                            <div className="w-full sm:w-20">
                              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full"
                                  style={{ width: `${event.progress}%` }}
                                />
                              </div>
                              <p className="text-gray-500 text-xs text-center">
                                {event.registrations}/{event.capacity}
                              </p>
                            </div>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)} self-start sm:self-auto`}>
                              {event.status?.charAt(0)?.toUpperCase() + event.status?.slice(1) || 'N/A'}
                            </span>
                            
                            <div className="flex items-center space-x-2">
                              {[
                                { action: 'manage', icon: FaUsers, color: 'text-emerald-600 hover:text-emerald-700' },
                                { action: 'checkin', icon: FaQrcode, color: 'text-gray-600 hover:text-gray-700' },
                                { action: 'insights', icon: FaChartPie, color: 'text-blue-600 hover:text-blue-700' },
                                { action: 'delete', icon: FaTrash, color: 'text-red-600 hover:text-red-700' },
                                { action: 'share', icon: FaLink, color: 'text-indigo-600 hover:text-indigo-700' }
                              ].map((btn) => (
                                <motion.button
                                  key={btn.action}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${btn.color}`}
                                  onClick={() => handleEventAction(event.id, btn.action)}
                                >
                                  <btn.icon className="h-4 w-4" />
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
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
                <div className="p-4 border-t border-gray-200 text-center">
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
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="font-semibold text-lg text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 sm:p-6">
                  {[
                    { icon: <FaPlus className="h-5 w-5" />, label: "New Event", color: "bg-emerald-50 text-emerald-600", action: "new-event" },
                    { icon: <FaUserPlus className="h-5 w-5" />, label: "Invite Team", color: "bg-blue-50 text-blue-600", action: "invite-team" },
                    { icon: <FaQrcode className="h-5 w-5" />, label: "Check-in App", color: "bg-indigo-50 text-indigo-600", action: "checkin-app" },
                    { icon: <FaChartPie className="h-5 w-5" />, label: "Reports", color: "bg-yellow-50 text-yellow-600", action: "reports" }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ y: -2, shadow: 'md' }}
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default HostDashboard;