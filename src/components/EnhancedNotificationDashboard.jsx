import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTasks, 
  FaCalendarAlt, 
  FaHome, 
  FaDesktop,
  FaClock,
  FaFilter,
  FaWifi,
  FaTimesCircle,
  FaCog,
  FaPlay,
  FaChartBar
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LS } from '../Utils/Resuse';
import { toast } from 'react-hot-toast';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';
import { useNotificationAPI } from '../hooks/useNotificationAPI';

const EnhancedNotificationDashboard = () => {
  const navigate = useNavigate();
  const userid = LS.get('userid');
  const isAdmin = LS.get('isadmin') === 'true';
  
  // WebSocket hook for real-time notifications
  const { 
    notifications: wsNotifications, 
    unreadCount: wsUnreadCount, 
    isConnected, 
    connectionError,
    connect: reconnectWs,
    setNotifications: setWsNotifications,
    setUnreadCount: setWsUnreadCount
  } = useNotificationWebSocket();

  // API hook for notification operations
  const {
    loading,
    error: apiError,
    fetchNotifications,
    markNotification,
    markAllAsRead,
    deleteNotification,
    getNotificationStats,
    sendTestNotification,
    runAutomationChecks
  } = useNotificationAPI();

  // Local state
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [filter, setFilter] = useState({
    type: 'all',
    priority: 'all',
    status: 'all'
  });

  // Sync WebSocket notifications with local state
  useEffect(() => {
    if (wsNotifications.length > 0) {
      setNotifications(wsNotifications);
      setFilteredNotifications(wsNotifications);
    }
  }, [wsNotifications]);

  // Sync WebSocket unread count with local state
  useEffect(() => {
    setUnreadCount(wsUnreadCount);
  }, [wsUnreadCount]);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const fetchedNotifications = await fetchNotifications();
        if (fetchedNotifications.length > 0) {
          setNotifications(fetchedNotifications);
          setFilteredNotifications(fetchedNotifications);
          
          // Update WebSocket state to avoid conflicts
          setWsNotifications(fetchedNotifications);
          
          // Calculate unread count
          const unread = fetchedNotifications.filter(n => !n.is_read).length;
          setUnreadCount(unread);
          setWsUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error loading initial notifications:', error);
      }
    };

    if (userid) {
      loadInitialData();
    }
  }, [userid, fetchNotifications, setWsNotifications, setWsUnreadCount]);

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications];

    if (filter.type !== 'all') {
      if (filter.type === 'overdue') {
        filtered = filtered.filter(n => 
          n.type === 'task_overdue' || 
          n.message.toLowerCase().includes('overdue')
        );
      } else {
        filtered = filtered.filter(n => n.type === filter.type);
      }
    }

    if (filter.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    if (filter.status !== 'all') {
      if (filter.status === 'unread') {
        filtered = filtered.filter(n => !n.is_read);
      } else if (filter.status === 'read') {
        filtered = filtered.filter(n => n.is_read);
      }
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  // Load statistics
  const loadStats = async () => {
    const statsData = await getNotificationStats();
    if (statsData) {
      setStats(statsData);
      setShowStats(true);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.is_read) {
        const success = await markNotification(notification._id, notification.is_read);
        if (success) {
          // Update local state
          setNotifications(prev => 
            prev.map(n => n._id === notification._id ? { ...n, is_read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }

      // Navigate to relevant page
      if (notification.action_url) {
        navigate(notification.action_url);
      } else {
        // Default navigation based on type
        const defaultUrls = {
          task: isAdmin ? '/admin/task' : '/User/task',
          task_overdue: isAdmin ? '/admin/task' : '/User/task',
          task_due_soon: isAdmin ? '/admin/task' : '/User/task',
          leave: isAdmin ? '/admin/leaveapproval' : '/User/LeaveHistory',
          wfh: isAdmin ? '/admin/wfh' : '/User/Workfromhome',
          attendance: isAdmin ? '/admin/time' : '/User/Clockin_int',
          system: isAdmin ? '/admin' : '/User'
        };
        
        const targetUrl = defaultUrls[notification.type] || (isAdmin ? '/admin' : '/User');
        navigate(targetUrl);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Handle mark as read/unread
  const handleMarkNotification = async (notificationId, isRead) => {
    const success = await markNotification(notificationId, isRead);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, is_read: !isRead } : n)
      );
      setUnreadCount(prev => isRead ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    const success = await deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => {
        const deletedNotification = notifications.find(n => n._id === notificationId);
        return deletedNotification && !deletedNotification.is_read ? Math.max(0, prev - 1) : prev;
      });
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Just now';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  // Get type icon
  const getTypeIcon = (notification) => {
    const iconClass = `text-lg ${
      !notification.is_read ? 'text-[#6d9eeb]' : 'text-gray-500'
    }`;

    const typeIcons = {
      task: <FaTasks className={iconClass} />,
      task_overdue: <FaExclamationTriangle className="text-lg text-red-500" />,
      task_due_soon: <FaClock className="text-lg text-orange-500" />,
      leave: <FaCalendarAlt className={iconClass} />,
      wfh: <FaHome className={iconClass} />,
      attendance: <FaClock className={iconClass} />,
      system: <FaDesktop className={iconClass} />
    };

    return typeIcons[notification.type] || <FaInfoCircle className={iconClass} />;
  };

  // Get priority colors
  const getPriorityColors = (priority, isOverdue = false) => {
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';
    
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  // Check if notification is overdue
  const isOverdueNotification = (notification) => {
    return notification.type === 'task_overdue' || 
           notification.message.toLowerCase().includes('overdue') ||
           notification.priority === 'urgent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-[#6d9eeb] p-3 rounded-full mr-4">
                <FaBell className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Enhanced Notifications</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600">Real-time notification center</p>
                  <div className="flex items-center space-x-1">
                    {isConnected ? (
                      <>
                        <FaWifi className="text-green-500 text-sm" title="Real-time connected" />
                        <span className="text-xs text-green-600 font-medium">Live</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-orange-500 text-sm" title="Connecting..." />
                        <span className="text-xs text-orange-600 font-medium">
                          {connectionError ? 'Error' : 'Connecting...'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-[#6d9eeb]/20 text-[#6d9eeb] px-4 py-2 rounded-full font-semibold border border-[#6d9eeb]/30">
                {unreadCount} unread
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0 || loading}
                  className="bg-[#6d9eeb] text-white px-4 py-2 rounded-lg hover:bg-[#5a8bd9] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark All Read
                </button>
                
                <button
                  onClick={loadStats}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-md"
                >
                  <FaChartBar className="inline mr-2" />
                  Stats
                </button>
                
                <button
                  onClick={sendTestNotification}
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-all duration-200 shadow-md"
                >
                  <FaPlay className="inline mr-2" />
                  Test
                </button>
                
                {isAdmin && (
                  <button
                    onClick={runAutomationChecks}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-all duration-200 shadow-md"
                  >
                    <FaCog className="inline mr-2" />
                    Run Checks
                  </button>
                )}
                
                {!isConnected && (
                  <button
                    onClick={reconnectWs}
                    className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-all duration-200 shadow-md"
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Modal */}
        {showStats && stats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowStats(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">Notification Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Notifications:</span>
                  <span className="font-semibold">{stats.total_notifications}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unread:</span>
                  <span className="font-semibold text-blue-600">{stats.unread_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Read:</span>
                  <span className="font-semibold text-green-600">{stats.read_count}</span>
                </div>
                <hr />
                <h4 className="font-semibold">By Type:</h4>
                {Object.entries(stats.by_type).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowStats(false)}
                className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-white/20">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6d9eeb]"
            >
              <option value="all">All Types</option>
              <option value="task">Tasks</option>
              <option value="task_overdue">Overdue Tasks</option>
              <option value="task_due_soon">Due Soon</option>
              <option value="leave">Leave</option>
              <option value="wfh">Work From Home</option>
              <option value="attendance">Attendance</option>
              <option value="system">System</option>
            </select>

            <select
              value={filter.priority}
              onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6d9eeb]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6d9eeb]"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6d9eeb] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        )}

        {/* Error State */}
        {(apiError || connectionError) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <span className="text-red-700">
                {apiError || connectionError}
              </span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-white/20">
              <div className="bg-[#6d9eeb]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaInfoCircle className="text-[#6d9eeb] text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filter.type !== 'all' || filter.priority !== 'all' || filter.status !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! No notifications to display.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const isOverdue = isOverdueNotification(notification);
              
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-xl shadow-lg p-4 border transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-lg ${
                    isOverdue ? 'border-red-200 bg-red-50' : 
                    !notification.is_read ? 'border-[#6d9eeb]/30 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`mt-1 p-2 rounded-lg ${
                        isOverdue ? 'bg-red-100' :
                        !notification.is_read ? 'bg-[#6d9eeb]/20' : 'bg-gray-100'
                      }`}>
                        {getTypeIcon(notification)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium ${
                            isOverdue ? 'text-red-700 font-bold' :
                            !notification.is_read ? 'text-gray-900 font-bold' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium border ${
                            isOverdue ? 'bg-red-100 text-red-800 border-red-200' : 
                            getPriorityColors(notification.priority)
                          }`}>
                            {isOverdue ? 'URGENT' : notification.priority?.toUpperCase() || 'MEDIUM'}
                          </span>
                          {!notification.is_read && (
                            <div className="flex items-center space-x-1">
                              <div className={`w-3 h-3 rounded-full ${
                                isOverdue ? 'bg-red-500' : 'bg-[#6d9eeb]'
                              } animate-pulse`}></div>
                              <span className={`text-xs font-bold uppercase tracking-wide ${
                                isOverdue ? 'text-red-600' : 'text-[#6d9eeb]'
                              }`}>UNREAD</span>
                            </div>
                          )}
                        </div>
                        
                        <p className={`text-sm mb-3 leading-relaxed ${
                          isOverdue ? 'text-red-700 font-medium' :
                          !notification.is_read ? 'text-gray-800 font-medium' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatDate(notification.created_at)}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkNotification(notification._id, notification.is_read);
                              }}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                notification.is_read 
                                  ? 'text-gray-500 hover:bg-gray-100' 
                                  : 'text-[#6d9eeb] hover:bg-[#6d9eeb]/10 bg-[#6d9eeb]/5'
                              }`}
                              title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                            >
                              <FaCheck size={14} />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification._id);
                              }}
                              className="p-2 rounded-lg transition-all duration-200 text-red-500 hover:bg-red-50"
                              title="Delete notification"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotificationDashboard;
