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
  FaLayerGroup,
  FaEllipsisV,
  FaExternalLinkAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { 
  HiOutlineViewGrid, 
  HiOutlineViewList,
  HiOutlineSparkles 
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, setupAuthListener, getValidSession } from './supabaseClient';

function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [notifications, setNotifications] = useState([
    { id: 1, message: '15 new registrations for Tech Conference', time: '2 mins ago', read: false, type: 'success' },
    { id: 2, message: 'Your workshop reached 80% capacity', time: '1 hour ago', read: true, type: 'warning' },
    { id: 3, message: 'Community Mixer starts tomorrow', time: '3 hours ago', read: true, type: 'info' }
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
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Dark green color scheme
  const colors = {
    primary: '#34c239',
    primaryDark: '#2aa82e',
    background: '#000000',
    surface: '#000f07',
    surfaceLight: '#002009',
    surfaceHover: '#00331a',
    border: '#00331a',
    textPrimary: '#ffffff',
    textSecondary: '#d4d4d4',
    textTertiary: '#a0a0a0',
    success: '#34c239',
    warning: '#ffb224',
    error: '#ff5757',
    info: '#34c239'
  };

  // Calculate dynamic badge counts
  const getBadgeCounts = () => {
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'active').length;
    const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
    const totalAttendees = events.reduce((sum, event) => sum + (event.registrations || 0), 0);
    
    return {
      events: totalEvents,
      attendees: totalAttendees > 99 ? '99+' : totalAttendees,
      insights: activeEvents + upcomingEvents,
      settings: 0 // Settings typically doesn't have a badge
    };
  };

  const badgeCounts = getBadgeCounts();

  // Navigation items with dynamic badges
  const navItems = [
    { id: 'events', label: 'Events', icon: FaCalendarAlt, badge: badgeCounts.events },
    { id: 'attendees', label: 'Attendees', icon: FaUserFriends, badge: badgeCounts.attendees },
    { id: 'insights', label: 'Insights', icon: FaChartBar, badge: badgeCounts.insights },
    { id: 'settings', label: 'Settings', icon: FaSlidersH, badge: badgeCounts.settings }
  ];

  // Quick actions
  const quickActions = [
    { 
      icon: <FaPlus className="h-5 w-5" />, 
      label: "New Event", 
      description: "Create a new event",
      action: "new-event",
      gradient: "from-green-600 to-green-500"
    },
    { 
      icon: <FaUserPlus className="h-5 w-5" />, 
      label: "Invite Team", 
      description: "Add team members",
      action: "invite-team",
      gradient: "from-green-700 to-green-600"
    },
    { 
      icon: <FaQrcode className="h-5 w-5" />, 
      label: "Check-in App", 
      description: "Manage check-ins",
      action: "checkin-app",
      gradient: "from-green-800 to-green-700"
    },
    { 
      icon: <FaChartPie className="h-5 w-5" />, 
      label: "Reports", 
      description: "View analytics",
      action: "reports",
      gradient: "from-green-900 to-green-800"
    }
  ];

  // Stats data
  const stats = [
    { 
      icon: FaCalendarAlt,
      title: "Total Events",
      value: events.length,
      change: "+12%",
      trend: "up",
      color: colors.success
    },
    { 
      icon: FaUsers,
      title: "Total Attendees",
      value: events.reduce((sum, event) => sum + (event.registrations || 0), 0),
      change: "+24%",
      trend: "up",
      color: colors.success
    },
    { 
      icon: FaRegCheckCircle,
      title: "Active Events",
      value: events.filter(e => e.status === 'active').length,
      change: "+8%",
      trend: "up",
      color: colors.success
    },
    { 
      icon: FaChartPie,
      title: "Avg. Attendance",
      value: `${Math.round(events.reduce((sum, event) => sum + event.progress, 0) / (events.length || 1))}%`,
      change: "+5%",
      trend: "up",
      color: colors.success
    }
  ];

  // Fix the getStatusColor function
  const getStatusColor = (status) => {
    const statusColors = {
      active: colors.success,
      upcoming: colors.success,
      completed: colors.textTertiary,
      draft: colors.warning,
      cancelled: colors.error
    };
    return statusColors[status] || statusColors.draft;
  };

  const getStatusBgColor = (status) => {
    const bgColors = {
      active: `bg-[#002009]`,
      upcoming: `bg-[#002009]`,
      completed: `bg-[#002009]`,
      draft: `bg-[#002009]`,
      cancelled: `bg-[#002009]`
    };
    return bgColors[status] || bgColors.draft;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      success: <FaRegCheckCircle className="text-[#34c239]" />,
      warning: <FaExclamationTriangle className="text-yellow-500" />,
      error: <FaExclamationTriangle className="text-red-500" />,
      info: <FaInfoCircle className="text-[#34c239]" />
    };
    return icons[type] || icons.info;
  };

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
        type: 'success'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
        <div className="text-center">
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
            className="mt-4 md:mt-6 text-[#34c239] font-bold text-lg md:text-xl"
          >
            Ventar
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-gray-400 font-medium text-sm md:text-base"
          >
            Loading your dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e5e5] flex">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#000f07] shadow-xl z-50 lg:hidden mobile-menu border-r border-[#00331a]"
            >
              <div className="p-6 border-b border-[#00331a]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#34c239] rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">V</span>
                    </div>
                    <span className="text-xl font-bold text-[#d4d4d4]">Ventar</span>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg hover:bg-[#002009] transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-gray-400" />
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
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between group ${
                      activeTab === item.id
                        ? 'bg-[#34c239] text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-[#002009]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === item.id ? 'bg-black/20 text-black' : 'bg-[#002009] text-gray-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop - Fixed (no scroll) */}
      <div className="hidden lg:flex flex-col w-80 bg-[#000f07] border-r border-[#00331a] fixed left-0 top-0 h-screen">
        <div className="p-6 border-b border-[#00331a]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#34c239] rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-base">V</span>
            </div>
            <span className="text-2xl font-bold text-[#d4d4d4]">Ventar</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between group ${
                activeTab === item.id
                  ? 'bg-[#34c239] text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#002009]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === item.id ? 'bg-black/20 text-black' : 'bg-[#002009] text-gray-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-6 border-t border-[#00331a]">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#002009]">
            <div className="w-10 h-10 bg-[#34c239] rounded-xl flex items-center justify-center">
              <span className="text-black font-semibold text-sm">
                {user ? user.email.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#d4d4d4] truncate">
                {user ? user.email.split('@')[0] : 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <FaSignOutAlt className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col lg:ml-80">
        {/* Header */}
        <header className="bg-[#000f07]/80 backdrop-blur-xl border-b border-[#00331a] sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button & Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="lg:hidden p-2 rounded-xl hover:bg-[#002009] transition-colors"
                >
                  <FaBars className="h-5 w-5 text-gray-400" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-[#d4d4d4]">
                    {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-400 hidden sm:block">
                    Manage your events and track engagement
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="hidden md:block flex-1 max-w-md mx-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-3 w-full bg-[#002009] border border-[#00331a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-[#e5e5e5] placeholder-gray-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {/* Search Button - Mobile */}
                <button className="md:hidden p-2 rounded-xl hover:bg-[#002009] transition-colors">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </button>

                {/* Notifications */}
                <div className="relative notifications-dropdown">
                  <button
                    className="relative p-2 rounded-xl hover:bg-[#002009] transition-colors"
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  >
                    <FaBell className="h-5 w-5 text-gray-400" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#000f07]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotificationsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-96 bg-[#000f07] rounded-2xl shadow-xl border border-[#00331a] z-40 overflow-hidden"
                      >
                        <div className="p-4 border-b border-[#00331a]">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-[#d4d4d4]">Notifications</h3>
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-[#34c239] hover:text-green-400 font-medium transition-colors"
                            >
                              Mark all as read
                            </button>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-[#00331a] last:border-b-0 hover:bg-[#002009] cursor-pointer transition-colors ${
                                notification.read ? 'bg-[#000f07]' : 'bg-[#002009]'
                              }`}
                              onClick={() => toggleNotificationRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-xl ${
                                  notification.read ? 'bg-[#002009]' : 'bg-[#00331a]'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#d4d4d4]">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-[#34c239] rounded-full mt-2 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* New Event Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#34c239] hover:bg-green-500 text-black py-2.5 px-4 rounded-xl font-semibold flex items-center shadow-lg transition-all"
                  onClick={() => navigate('/events/new')}
                >
                  <FaPlus className="mr-2" />
                  New Event
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-800 rounded-2xl p-4 mb-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    onClick={() => setErrorMessage(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

            {/* Welcome Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-[#000f07] to-black rounded-3xl p-8 border border-[#00331a]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#d4d4d4] mb-2">
                      Welcome back, {user ? user.email.split('@')[0] : 'Host'}! 👋
                    </h1>
                    <p className="text-gray-400 text-lg">
                      Here's what's happening with your events today.
                    </p>
                  </div>
                  <div className="flex space-x-3 mt-4 lg:mt-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#002009] hover:bg-[#00331a] text-gray-400 py-2.5 px-5 rounded-xl font-medium flex items-center transition-colors"
                      onClick={handleRefresh}
                    >
                      <FaRedo className="mr-2" />
                      Refresh
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#000f07] rounded-2xl p-6 border border-[#00331a] hover:border-[#34c239]/30 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl bg-[#002009] group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon 
                        className="h-6 w-6" 
                        style={{ color: stat.color }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-[#34c239]' : 'text-red-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#d4d4d4] mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-br ${action.gradient} p-4 rounded-2xl flex flex-col items-center text-white shadow-lg hover:shadow-xl transition-all duration-200`}
                  onClick={() => handleQuickAction(action.action)}
                >
                  <div className="p-3 rounded-xl bg-white/10 mb-3">
                    {action.icon}
                  </div>
                  <span className="font-semibold text-sm mb-1">{action.label}</span>
                  <span className="text-xs text-white/70">{action.description}</span>
                </motion.button>
              ))}
            </div>

            {/* Events Section */}
            <div className="bg-[#000f07] rounded-2xl border border-[#00331a] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-[#00331a]">
                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#d4d4d4]">Your Events</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* View Toggle */}
                    <div className="flex bg-[#002009] rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'grid'
                            ? 'bg-[#00331a] shadow-sm text-[#d4d4d4]'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <HiOutlineViewGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === 'list'
                            ? 'bg-[#00331a] shadow-sm text-[#d4d4d4]'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <HiOutlineViewList className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Search - Mobile */}
                    <div className="lg:hidden relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="pl-10 pr-4 py-2 w-full bg-[#002009] border border-[#00331a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-sm text-[#e5e5e5] placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-[#002009] border border-[#00331a] rounded-xl hover:bg-[#00331a] transition-colors text-sm"
                    >
                      <FaFilter className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-300">Filters</span>
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
                      className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                          Status
                        </label>
                        <select
                          value={selectedFilters.status}
                          onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#002009] border border-[#00331a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-sm text-[#e5e5e5]"
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                          Date
                        </label>
                        <select
                          value={selectedFilters.date}
                          onChange={(e) => setSelectedFilters(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#002009] border border-[#00331a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34c239] focus:border-transparent text-sm text-[#e5e5e5]"
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
              <div className="p-6">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-[#002009] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCalendarAlt className="h-10 w-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#d4d4d4] mb-2">No events found</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                      {searchQuery || selectedFilters.status !== 'all' || selectedFilters.date !== 'all'
                        ? 'Try adjusting your search or filters to find what you\'re looking for.'
                        : 'Get started by creating your first event and manage everything in one place.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedFilters({ status: 'all', date: 'all' });
                        }}
                        className="bg-[#002009] hover:bg-[#00331a] text-[#e5e5e5] py-2.5 px-6 rounded-xl font-medium transition-colors"
                      >
                        {searchQuery || selectedFilters.status !== 'all' || selectedFilters.date !== 'all'
                          ? 'Clear Filters'
                          : 'Explore Templates'
                        }
                      </button>
                      <button
                        onClick={() => navigate('/events/new')}
                        className="bg-[#34c239] hover:bg-green-500 text-black py-2.5 px-6 rounded-xl font-medium transition-all"
                      >
                        Create Event
                      </button>
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="bg-[#000f07] rounded-2xl border border-[#00331a] overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        onMouseEnter={() => setHoveredEvent(event.id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-[#002009] rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <FaCalendarAlt className="h-5 w-5 text-[#34c239]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-[#d4d4d4] text-lg line-clamp-1 group-hover:text-[#34c239] transition-colors">
                                  {event.name}
                                </h3>
                                <p className="text-gray-400 text-sm">#{event.workshop_number || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="relative">
                              <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
                                <FaEllipsisV className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-400 text-xs">Date</p>
                                <p className="font-medium text-[#d4d4d4] text-sm">{event.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 text-xs">Registrations</p>
                                <p className="font-medium text-[#d4d4d4] text-sm">
                                  {event.registrations || 0}/{event.capacity || 0}
                                </p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                              <div className="w-full bg-[#002009] rounded-full h-2 mb-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${event.progress}%` }}
                                  className="bg-[#34c239] h-2 rounded-full transition-all duration-500"
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                  {Math.round(event.progress)}% full
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(event.status)}`}
                                      style={{ color: getStatusColor(event.status) }}>
                                  {event.status?.charAt(0)?.toUpperCase() + event.status?.slice(1) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-[#00331a] px-5 py-4 bg-[#002009] backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              {[
                                { action: 'manage', icon: FaUsers, label: 'Manage' },
                                { action: 'checkin', icon: FaQrcode, label: 'Check-in' },
                                { action: 'insights', icon: FaChartPie, label: 'Insights' },
                              ].map((btn) => (
                                <motion.button
                                  key={btn.action}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 text-gray-400 hover:text-[#34c239] transition-colors rounded-lg hover:bg-[#00331a]"
                                  onClick={() => handleEventAction(event.id, btn.action)}
                                  title={btn.label}
                                >
                                  <btn.icon className="h-4 w-4" />
                                </motion.button>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-[#34c239] transition-colors rounded-lg hover:bg-[#00331a]"
                                onClick={() => handleEventAction(event.id, 'share')}
                                title="Share"
                              >
                                <FaLink className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-[#00331a]"
                                onClick={() => handleEventAction(event.id, 'delete')}
                                title="Delete"
                              >
                                <FaTrash className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ x: 4 }}
                        className="bg-[#000f07] border border-[#00331a] rounded-2xl p-5 hover:shadow-lg transition-all duration-200 group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#002009] rounded-xl group-hover:scale-110 transition-transform duration-200">
                              <FaCalendarAlt className="h-5 w-5 text-[#34c239]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#d4d4d4] text-lg group-hover:text-[#34c239] transition-colors">
                                {event.name}
                              </h3>
                              <p className="text-gray-400 text-sm">#{event.workshop_number || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                            <div className="text-left lg:text-right">
                              <p className="text-gray-400 text-xs">Date</p>
                              <p className="font-medium text-[#d4d4d4] text-sm">{event.date}</p>
                            </div>
                            
                            <div className="w-full lg:w-32">
                              <div className="w-full bg-[#002009] rounded-full h-2 mb-2">
                                <div
                                  className="bg-[#34c239] h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${event.progress}%` }}
                                />
                              </div>
                              <p className="text-gray-400 text-xs text-center">
                                {event.registrations}/{event.capacity}
                              </p>
                            </div>
                            
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(event.status)} self-start lg:self-auto`}
                                  style={{ color: getStatusColor(event.status) }}>
                              {event.status?.charAt(0)?.toUpperCase() + event.status?.slice(1) || 'N/A'}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              {[
                                { action: 'manage', icon: FaUsers, color: 'hover:text-[#34c239]' },
                                { action: 'checkin', icon: FaQrcode, color: 'hover:text-[#34c239]' },
                                { action: 'insights', icon: FaChartPie, color: 'hover:text-[#34c239]' },
                                { action: 'share', icon: FaLink, color: 'hover:text-[#34c239]' },
                                { action: 'delete', icon: FaTrash, color: 'hover:text-red-500' }
                              ].map((btn) => (
                                <motion.button
                                  key={btn.action}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`p-2 text-gray-400 rounded-lg hover:bg-[#002009] transition-colors ${btn.color}`}
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
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 delete-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#000f07] rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-[#00331a]"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-900/20 rounded-lg mr-3">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#d4d4d4]">Delete Event</h3>
              </div>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-gray-400 hover:text-white font-medium rounded-xl transition-colors"
                  onClick={() => setShowDeleteModal(null)}
                  disabled={deletingEvent}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
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

      <AnimatePresence>
        {showLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 link-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#000f07] rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-[#00331a]"
            >
              <h3 className="text-lg font-semibold text-[#d4d4d4] mb-3">Share Event</h3>
              <p className="text-gray-400 mb-4">Use this link or QR code to invite attendees.</p>
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={getEventLink(showLinkModal)}
                    readOnly
                    className="flex-1 p-3 bg-[#002009] border border-[#00331a] rounded-xl text-[#e5e5e5] text-sm focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl ${copied ? 'bg-[#34c239] text-black' : 'bg-[#002009] text-gray-400 hover:bg-[#00331a]'} transition-colors`}
                    onClick={() => handleCopyLink(getEventLink(showLinkModal))}
                    aria-label="Copy link"
                  >
                    <FaCopy />
                  </motion.button>
                </div>
                {copied && <p className="text-sm text-[#34c239] mt-2">Link copied!</p>}
              </div>
              <div className="flex justify-center mb-4">
                <QRCodeSVG
                  value={getEventLink(showLinkModal)}
                  size={160}
                  bgColor="#000f07"
                  fgColor="#34c239"
                  level="H"
                  className="rounded-lg"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2.5 text-gray-400 hover:text-white font-medium rounded-xl transition-colors"
                onClick={() => setShowLinkModal(null)}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HostDashboard;