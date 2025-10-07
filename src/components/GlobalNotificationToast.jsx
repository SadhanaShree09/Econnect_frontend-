import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaTimes, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaExclamationCircle,
  FaTasks,
  FaComment,
  FaCalendar,
  FaHome,
  FaClock
} from 'react-icons/fa';
import desktopNotificationManager from '../services/DesktopNotificationManager';

/**
 * Global Toast Notifications
 * Shows beautiful in-app notifications that sync with desktop notifications
 */
const GlobalNotificationToast = () => {
  const [toasts, setToasts] = useState([]);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

  useEffect(() => {
    // Track page visibility
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for notification events
    const handleNewNotification = (event) => {
      const notification = event.detail;
      addToast(notification);
    };

    window.addEventListener('econnect-new-notification', handleNewNotification);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('econnect-new-notification', handleNewNotification);
    };
  }, []);

  const addToast = (notification) => {
    const toastId = `toast-${Date.now()}-${Math.random()}`;
    
    const newToast = {
      id: toastId,
      ...notification,
      timestamp: Date.now()
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts

    // Auto-remove after delay
    const delay = notification.priority === 'high' ? 8000 : 5000;
    setTimeout(() => {
      removeToast(toastId);
    }, delay);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getIcon = (type) => {
    const icons = {
      success: <FaCheckCircle className="text-green-500" />,
      error: <FaExclamationCircle className="text-red-500" />,
      warning: <FaExclamationTriangle className="text-yellow-500" />,
      info: <FaInfoCircle className="text-blue-500" />,
      message: <FaComment className="text-purple-500" />,
      task: <FaTasks className="text-indigo-500" />,
      leave: <FaCalendar className="text-orange-500" />,
      wfh: <FaHome className="text-teal-500" />,
      attendance: <FaClock className="text-pink-500" />
    };
    return icons[type] || icons.info;
  };

  const getBackgroundClass = (type, priority) => {
    if (priority === 'high') {
      return 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300';
    }
    
    const backgrounds = {
      success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300',
      error: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300',
      warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300',
      info: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300',
      message: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300',
      task: 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300',
      leave: 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-300',
      wfh: 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300',
      attendance: 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300'
    };
    return backgrounds[type] || backgrounds.info;
  };

  // Only show toasts when page is visible
  if (!isPageVisible || toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-3 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getBackgroundClass(toast.type, toast.priority)}
            border-2 rounded-lg shadow-2xl p-4
            transform transition-all duration-300 ease-out
            animate-slide-in-right
            hover:scale-105 hover:shadow-3xl
          `}
          onClick={() => {
            if (toast.onClick) {
              toast.onClick();
            }
            removeToast(toast.id);
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="text-2xl mt-1 flex-shrink-0">
              {getIcon(toast.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-gray-800 text-sm leading-tight">
                  {toast.title}
                  {toast.priority === 'high' && (
                    <span className="ml-2 inline-block px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                      URGENT
                    </span>
                  )}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <FaTimes />
                </button>
              </div>
              
              {toast.body && (
                <p className="text-gray-600 text-sm mt-1 leading-relaxed line-clamp-3">
                  {toast.body}
                </p>
              )}

              {/* Action button if provided */}
              {toast.actionLabel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (toast.onAction) {
                      toast.onAction();
                    }
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {toast.actionLabel} →
                </button>
              )}

              {/* Timestamp */}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(toast.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Progress bar for auto-dismiss */}
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress"
              style={{
                animation: `progress ${toast.priority === 'high' ? '8s' : '5s'} linear`
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default GlobalNotificationToast;
