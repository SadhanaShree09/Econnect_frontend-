/**
 * Desktop Notification Manager
 * Advanced notification system with grouping, persistence, and enhanced UX
 */

class DesktopNotificationManager {
  constructor() {
    this.notifications = new Map(); // Active notifications
    this.notificationQueue = []; // Queue for rate limiting
    this.isProcessingQueue = false;
    this.maxNotificationsPerMinute = 10; // Rate limit
    this.notificationHistory = []; // Track sent notifications
    this.soundEnabled = true;
    this.desktopEnabled = true;
    
    // Audio setup
    this.audioContext = null;
    this.notificationSounds = {
      message: { freq1: 800, freq2: 600, duration: 0.6 },
      urgent: { freq1: 1000, freq2: 800, duration: 0.8 },
      success: { freq1: 600, freq2: 800, duration: 0.5 },
      info: { freq1: 700, freq2: 700, duration: 0.4 }
    };
    
    this.init();
  }

  /**
   * Initialize the manager
   */
  async init() {
    // Setup audio
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not available:', error);
    }

    // Force enable all features by default (no user preferences needed)
    this.soundEnabled = true;
    this.desktopEnabled = true;

    // Setup page visibility tracking
    this.setupVisibilityTracking();

    // Check notification support
    if (!('Notification' in window)) {
      console.warn('Desktop notifications not supported');
      return;
    }

    // Auto-request permission immediately if default
    if (Notification.permission === 'default') {
      await this.requestPermission();
    }

    console.log('✅ Desktop Notification Manager initialized - All features enabled');
  }

  /**
   * Load user preferences from localStorage (DEPRECATED - Always enabled)
   */
  loadPreferences() {
    // Deprecated - notifications are always enabled for optimal UX
    this.soundEnabled = true;
    this.desktopEnabled = true;
  }

  /**
   * Save user preferences (DEPRECATED - Always enabled)
   */
  savePreferences() {
    // Deprecated - no need to save preferences when always enabled
  }

  /**
   * Setup page visibility tracking
   */
  setupVisibilityTracking() {
    this.isPageVisible = !document.hidden;
    
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      
      if (this.isPageVisible) {
        this.onPageVisible();
      }
    });

    window.addEventListener('focus', () => {
      this.isPageVisible = true;
      this.onPageVisible();
    });

    window.addEventListener('blur', () => {
      this.isPageVisible = false;
    });
  }

  /**
   * Handle page becoming visible
   */
  onPageVisible() {
    // Stop title blinking
    this.stopTitleBlink();
    
    // Clear old notifications
    this.notifications.forEach((notif, id) => {
      if (notif.notification) {
        notif.notification.close();
      }
    });
  }

  /**
   * Request notification permission with user-friendly prompt
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      this.showInAppWarning();
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        this.showWelcomeNotification();
        return true;
      } else {
        this.showInAppWarning();
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Show welcome notification after permission granted
   */
  showWelcomeNotification() {
    this.show({
      title: '🎉 Desktop Notifications Enabled!',
      body: 'You\'ll now receive E-Connect notifications even when working in other apps.',
      tag: 'welcome',
      icon: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      type: 'success'
    });
  }

  /**
   * Show in-app warning when permissions denied
   */
  showInAppWarning() {
    // Emit event for UI to show warning
    window.dispatchEvent(new CustomEvent('notification-permission-denied', {
      detail: {
        message: 'Desktop notifications are blocked. Click the lock icon in your address bar to enable them.'
      }
    }));
  }

  /**
   * Play notification sound based on type
   */
  playSound(type = 'message') {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const soundConfig = this.notificationSounds[type] || this.notificationSounds.message;
      
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator1.frequency.value = soundConfig.freq1;
      oscillator1.type = 'sine';
      oscillator2.frequency.value = soundConfig.freq2;
      oscillator2.type = 'sine';

      const currentTime = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + soundConfig.duration);

      oscillator1.start(currentTime);
      oscillator1.stop(currentTime + soundConfig.duration * 0.5);
      
      oscillator2.start(currentTime + soundConfig.duration * 0.2);
      oscillator2.stop(currentTime + soundConfig.duration);

      console.log(`🔊 Sound played: ${type}`);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  /**
   * Start title blinking
   */
  startTitleBlink(message) {
    if (this.titleBlinkInterval) return;

    const originalTitle = document.title;
    let toggle = false;

    this.titleBlinkInterval = setInterval(() => {
      document.title = toggle ? originalTitle : `🔔 ${message}`;
      toggle = !toggle;
    }, 1000);
  }

  /**
   * Stop title blinking
   */
  stopTitleBlink() {
    if (this.titleBlinkInterval) {
      clearInterval(this.titleBlinkInterval);
      this.titleBlinkInterval = null;
      document.title = 'E-Connect'; // Reset to default
    }
  }

  /**
   * Get notification icon based on type
   */
  getIcon(type) {
    const icons = {
      message: '💬',
      task: '📋',
      urgent: '⚠️',
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      leave: '🏖️',
      wfh: '🏠',
      attendance: '⏰',
      reminder: '🔔'
    };
    return icons[type] || icons.info;
  }

  /**
   * Format notification for better readability
   */
  formatNotification(options) {
    const {
      title = 'E-Connect',
      body = '',
      type = 'info',
      priority = 'normal',
      data = {}
    } = options;

    const icon = this.getIcon(type);
    const formattedTitle = `${icon} ${title}`;
    
    // Add timestamp for context
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const formattedBody = `${body}\n⏰ ${timestamp}`;

    return {
      ...options,
      title: formattedTitle,
      body: formattedBody,
      timestamp: Date.now()
    };
  }

  /**
   * Show desktop notification
   */
  async show(options) {
    // Check if desktop notifications are enabled
    if (!this.desktopEnabled) {
      console.log('Desktop notifications disabled by user');
      return null;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Format notification
    const formatted = this.formatNotification(options);
    
    // Create unique tag
    const tag = formatted.tag || `econnect-${Date.now()}`;
    
    // Check for duplicates
    if (this.notifications.has(tag)) {
      console.log('Duplicate notification ignored:', tag);
      return null;
    }

    try {
      // Determine sound type based on notification type
      const soundType = formatted.priority === 'high' ? 'urgent' : 
                       formatted.type === 'success' ? 'success' :
                       formatted.type === 'error' ? 'urgent' : 'message';

      // Play sound if page is not visible or if urgent
      if (!this.isPageVisible || formatted.priority === 'high') {
        this.playSound(soundType);
        this.startTitleBlink(formatted.title);
      }

      // Create notification options
      const notificationOptions = {
        body: formatted.body,
        icon: formatted.icon || '/favicon.ico',
        badge: formatted.icon || '/favicon.ico',
        tag: tag,
        requireInteraction: formatted.priority === 'high',
        silent: true, // We handle sound ourselves
        renotify: true,
        timestamp: Date.now(),
        data: formatted.data || {},
        dir: 'ltr',
        lang: 'en'
      };

      // Add vibration for mobile devices (if not silent)
      if (formatted.priority === 'high' && 'vibrate' in navigator) {
        delete notificationOptions.silent;
        notificationOptions.vibrate = [300, 100, 300];
      }

      // Create notification
      const notification = new Notification(formatted.title, notificationOptions);

      // Store notification
      this.notifications.set(tag, {
        notification,
        options: formatted,
        timestamp: Date.now()
      });

      // Handle click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        this.stopTitleBlink();
        notification.close();
        
        // Emit click event
        if (formatted.onClick) {
          formatted.onClick(event);
        } else {
          window.dispatchEvent(new CustomEvent('econnect-notification-click', {
            detail: formatted.data
          }));
        }
      };

      // Handle close
      notification.onclose = () => {
        this.notifications.delete(tag);
      };

      // Handle error
      notification.onerror = (error) => {
        console.error('Notification error:', error);
        this.notifications.delete(tag);
      };

      // Auto-close based on priority
      const closeDelay = formatted.priority === 'high' ? 20000 : 12000;
      if (!formatted.requireInteraction) {
        setTimeout(() => {
          if (notification) {
            notification.close();
          }
        }, closeDelay);
      }

      console.log('✅ Desktop notification shown:', formatted.title);
      return notification;

    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show grouped notifications (for multiple messages)
   */
  async showGrouped(notifications) {
    if (!Array.isArray(notifications) || notifications.length === 0) return;

    if (notifications.length === 1) {
      return this.show(notifications[0]);
    }

    // Group by type
    const grouped = {};
    notifications.forEach(notif => {
      const type = notif.type || 'info';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(notif);
    });

    // Show summary notification
    const types = Object.keys(grouped);
    const totalCount = notifications.length;
    
    return this.show({
      title: `${totalCount} New Notifications`,
      body: types.map(type => {
        const count = grouped[type].length;
        const icon = this.getIcon(type);
        return `${icon} ${count} ${type}`;
      }).join('\n'),
      tag: 'grouped-' + Date.now(),
      type: 'info',
      priority: 'normal',
      data: { grouped: true, notifications }
    });
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.forEach((notif) => {
      if (notif.notification) {
        notif.notification.close();
      }
    });
    this.notifications.clear();
    this.stopTitleBlink();
  }

  /**
   * Update preferences
   */
  setPreference(key, value) {
    if (key === 'soundEnabled') {
      this.soundEnabled = value;
    } else if (key === 'desktopEnabled') {
      this.desktopEnabled = value;
    }
    this.savePreferences();
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      supported: 'Notification' in window,
      permission: Notification.permission,
      granted: Notification.permission === 'granted',
      soundEnabled: this.soundEnabled,
      desktopEnabled: this.desktopEnabled,
      activeNotifications: this.notifications.size,
      isPageVisible: this.isPageVisible
    };
  }

  /**
   * Test notification
   */
  test() {
    this.show({
      title: 'Test Notification',
      body: 'This is a test notification from E-Connect! If you can see this, notifications are working perfectly. 🎉',
      type: 'success',
      priority: 'normal',
      tag: 'test-' + Date.now()
    });
  }
}

// Export singleton instance
const desktopNotificationManager = new DesktopNotificationManager();
export default desktopNotificationManager;
