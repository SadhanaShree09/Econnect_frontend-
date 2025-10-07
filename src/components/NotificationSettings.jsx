import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaToggleOn, 
  FaToggleOff, 
  FaVolumeUp, 
  FaVolumeMute,
  FaDesktop,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCog
} from 'react-icons/fa';
import browserNotificationService from '../services/BrowserNotificationService';

/**
 * NotificationSettings Component
 * Allows users to manage notification preferences
 */
const NotificationSettings = ({ isOpen, onClose }) => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [settings, setSettings] = useState({
    browserNotifications: true,
    soundEnabled: true,
    titleBlink: true,
    notifyWhenAway: true
  });

  useEffect(() => {
    // Load permission status
    updatePermissionStatus();

    // Load saved settings
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updatePermissionStatus = () => {
    const status = browserNotificationService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const handleEnablePermission = async () => {
    await browserNotificationService.requestPermission();
    updatePermissionStatus();
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  const handleTestNotification = () => {
    browserNotificationService.showNotification({
      title: 'Test Notification',
      message: 'This is a test notification from E-Connect!',
      type: 'info',
      silent: !settings.soundEnabled,
      autoClose: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCog className="text-3xl" />
              <div>
                <h2 className="text-2xl font-bold">Notification Settings</h2>
                <p className="text-sm text-blue-100">Manage how you receive notifications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Browser Permission Status */}
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FaDesktop className="text-blue-600" />
                  Browser Notification Permission
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    {permissionStatus?.granted && (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <FaCheckCircle /> Granted
                      </span>
                    )}
                    {permissionStatus?.denied && (
                      <span className="flex items-center gap-1 text-red-600 font-semibold">
                        <FaTimesCircle /> Denied
                      </span>
                    )}
                    {permissionStatus?.default && (
                      <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                        <FaExclamationTriangle /> Not Set
                      </span>
                    )}
                  </div>
                  {!permissionStatus?.supported && (
                    <p className="text-sm text-red-600">
                      Your browser doesn't support notifications
                    </p>
                  )}
                </div>
              </div>
              {permissionStatus?.default && (
                <button
                  onClick={handleEnablePermission}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <FaBell />
                  Enable
                </button>
              )}
            </div>
            {permissionStatus?.denied && (
              <div className="mt-3 text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="font-semibold mb-1">To enable notifications:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Click the lock/info icon in your browser's address bar</li>
                  <li>Find "Notifications" in the permissions</li>
                  <li>Change it to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Notification Preferences</h3>

            {/* Browser Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium flex items-center gap-2">
                  <FaBell className="text-blue-600" />
                  Browser Notifications
                </h4>
                <p className="text-sm text-gray-600">
                  Show desktop notifications when you receive new alerts
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('browserNotifications', !settings.browserNotifications)}
                className="ml-4"
                disabled={!permissionStatus?.granted}
              >
                {settings.browserNotifications ? (
                  <FaToggleOn className="text-4xl text-blue-600" />
                ) : (
                  <FaToggleOff className="text-4xl text-gray-400" />
                )}
              </button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <FaVolumeUp className="text-green-600" />
                  ) : (
                    <FaVolumeMute className="text-gray-400" />
                  )}
                  Notification Sound
                </h4>
                <p className="text-sm text-gray-600">
                  Play a sound when receiving notifications
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                className="ml-4"
              >
                {settings.soundEnabled ? (
                  <FaToggleOn className="text-4xl text-green-600" />
                ) : (
                  <FaToggleOff className="text-4xl text-gray-400" />
                )}
              </button>
            </div>

            {/* Title Blink */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium flex items-center gap-2">
                  <FaBell className="text-purple-600" />
                  Tab Title Alerts
                </h4>
                <p className="text-sm text-gray-600">
                  Blink the page title when you're in another tab
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('titleBlink', !settings.titleBlink)}
                className="ml-4"
              >
                {settings.titleBlink ? (
                  <FaToggleOn className="text-4xl text-purple-600" />
                ) : (
                  <FaToggleOff className="text-4xl text-gray-400" />
                )}
              </button>
            </div>

            {/* Notify When Away */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium flex items-center gap-2">
                  <FaDesktop className="text-orange-600" />
                  Only When Inactive
                </h4>
                <p className="text-sm text-gray-600">
                  Show notifications only when E-Connect is in the background
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('notifyWhenAway', !settings.notifyWhenAway)}
                className="ml-4"
              >
                {settings.notifyWhenAway ? (
                  <FaToggleOn className="text-4xl text-orange-600" />
                ) : (
                  <FaToggleOff className="text-4xl text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Test Notification */}
          <div className="border-t pt-4">
            <button
              onClick={handleTestNotification}
              disabled={!permissionStatus?.granted}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              <FaBell />
              Send Test Notification
            </button>
            {!permissionStatus?.granted && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Enable browser notifications to test
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-lg border-t">
          <p className="text-xs text-gray-600 text-center">
            💡 Tip: Notifications help you stay updated even when you're working in other tabs or applications
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
