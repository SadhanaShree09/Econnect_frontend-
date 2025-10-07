import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import browserNotificationService from '../services/BrowserNotificationService';

/**
 * NotificationPermissionPrompt Component
 * Shows a banner to request notification permissions from users
 */
const NotificationPermissionPrompt = () => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check permission status
    const status = browserNotificationService.getPermissionStatus();
    setPermissionStatus(status);

    // Show prompt if permission is default (not yet asked) and not dismissed
    const wasDismissed = localStorage.getItem('notification-prompt-dismissed');
    if (status.default && !wasDismissed) {
      // Wait 2 seconds before showing to avoid overwhelming user
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await browserNotificationService.requestPermission();
    const status = browserNotificationService.getPermissionStatus();
    setPermissionStatus(status);
    
    if (granted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  const handleDontAskAgain = () => {
    handleDismiss();
    localStorage.setItem('notification-prompt-never-show', 'true');
  };

  // Don't show if dismissed or permission already handled
  if (!showPrompt || dismissed || !permissionStatus?.default) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md animate-slide-in-right">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-2xl p-5 border border-blue-400">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <FaBell className="text-2xl text-yellow-300 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold">Stay Connected!</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Dismiss"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <p className="text-sm mb-4 leading-relaxed">
          Enable notifications to stay updated with E-Connect even when you're in another tab or window. 
          You'll receive alerts for:
        </p>

        <ul className="text-sm mb-4 space-y-1">
          <li className="flex items-center gap-2">
            <FaCheck className="text-green-300 flex-shrink-0" />
            <span>New messages and chats</span>
          </li>
          <li className="flex items-center gap-2">
            <FaCheck className="text-green-300 flex-shrink-0" />
            <span>Task updates and deadlines</span>
          </li>
          <li className="flex items-center gap-2">
            <FaCheck className="text-green-300 flex-shrink-0" />
            <span>Leave approvals and requests</span>
          </li>
          <li className="flex items-center gap-2">
            <FaCheck className="text-green-300 flex-shrink-0" />
            <span>Attendance reminders</span>
          </li>
        </ul>

        <div className="flex gap-2">
          <button
            onClick={handleEnableNotifications}
            className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <FaBell />
            <span>Enable Notifications</span>
          </button>
          <button
            onClick={handleDontAskAgain}
            className="px-3 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-md transition-colors text-sm"
            title="Don't ask again"
          >
            Not Now
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-blue-100">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>You can change this later in your browser settings</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionPrompt;
