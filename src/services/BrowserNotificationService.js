/**
 * Browser Notification Service
 * Handles all browser notification functionality including:
 * - Permission management
 * - Notification creation and display
 * - Sound alerts
 * - Tab title notifications
 * - Focus detection
 */

class BrowserNotificationService {
  constructor() {
    this.permission = 'default';
    this.audioContext = null;
    this.notificationSound = null;
    this.originalTitle = document.title;
    this.titleInterval = null;
    this.isPageVisible = !document.hidden;
    this.activeNotifications = new Map();
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the service
   */
  async init() {
    // Check browser support
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return;
    }

    this.permission = Notification.permission;

    // Track page visibility
    this.setupVisibilityTracking();

    // Load notification sound
    this.loadNotificationSound();

    console.log('BrowserNotificationService initialized');
  }

  /**
   * Setup visibility tracking
   */
  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      
      if (this.isPageVisible) {
        // Stop title blinking when user returns
        this.stopTitleNotification();
      }
      
      console.log('Page visibility changed:', this.isPageVisible ? 'visible' : 'hidden');
    });

    // Also track window focus
    window.addEventListener('focus', () => {
      this.isPageVisible = true;
      this.stopTitleNotification();
    });

    window.addEventListener('blur', () => {
      this.isPageVisible = false;
    });
  }

  /**
   * Load notification sound
   */
  loadNotificationSound() {
    // Create a simple notification sound using Web Audio API
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Audio context created for notification sounds');
    } catch (error) {
      console.warn('Could not create audio context:', error);
    }
  }

  /**
   * Play notification sound - Enhanced for better audibility
   */
  playNotificationSound() {
    if (!this.audioContext) return;

    try {
      // Create a more prominent two-tone notification sound
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // First tone - higher frequency
      oscillator1.frequency.value = 800; // Hz
      oscillator1.type = 'sine';

      // Second tone - slightly lower for harmony
      oscillator2.frequency.value = 600; // Hz
      oscillator2.type = 'sine';

      // Volume envelope - louder and longer for better noticeability
      const currentTime = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);

      // Play the sound
      oscillator1.start(currentTime);
      oscillator1.stop(currentTime + 0.3);
      
      oscillator2.start(currentTime + 0.15);
      oscillator2.stop(currentTime + 0.6);

      console.log('Enhanced notification sound played');
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission was denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        // Show a test notification
        this.showTestNotification();
        return true;
      } else {
        console.warn('Notification permission denied by user');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a test notification
   */
  showTestNotification() {
    this.showNotification({
      title: 'E-Connect Notifications Enabled',
      message: 'You will now receive notifications even when E-Connect is in the background!',
      type: 'info',
      autoClose: true
    });
  }

  /**
   * Start blinking title to notify user
   */
  startTitleNotification(message = 'New Notification') {
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
    }

    let showOriginal = true;
    this.titleInterval = setInterval(() => {
      document.title = showOriginal ? this.originalTitle : `🔔 ${message}`;
      showOriginal = !showOriginal;
    }, 1000);
  }

  /**
   * Stop blinking title
   */
  stopTitleNotification() {
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
      this.titleInterval = null;
    }
    document.title = this.originalTitle;
  }

  /**
   * Show browser notification
   * @param {Object} options - Notification options
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification message
   * @param {string} options.type - Notification type (info, success, warning, error)
   * @param {string} options.icon - Custom icon URL
   * @param {string} options.tag - Unique tag to prevent duplicates
   * @param {boolean} options.requireInteraction - Keep notification until user interacts
   * @param {boolean} options.silent - Don't play sound
   * @param {boolean} options.autoClose - Auto close after specified time (default 10 seconds)
   * @param {number} options.closeAfter - Time in milliseconds before auto-closing (default 10000)
   * @param {function} options.onClick - Callback when notification is clicked
   */
  showNotification(options) {
    const {
      title = 'E-Connect',
      message = '',
      type = 'info',
      icon = '/favicon.ico',
      tag = `notification-${Date.now()}`,
      requireInteraction = false,
      silent = false,
      autoClose = true,
      closeAfter = 10000, // Default 10 seconds for better visibility
      onClick = null,
      data = null
    } = options;

    // ALWAYS play sound and show title notification when user is away (not just when page is hidden)
    // This ensures notifications are noticeable even when completely outside E-Connect
    if (!silent) {
      this.playNotificationSound();
    }
    
    // Always blink title when page is not visible
    if (!this.isPageVisible) {
      this.startTitleNotification(title);
    }

    // Show browser notification if permission granted
    if (this.permission !== 'granted') {
      console.log('Cannot show notification: permission not granted');
      // Still play sound even if notification permission not granted
      if (!silent && !this.isPageVisible) {
        this.playNotificationSound();
        this.startTitleNotification(title);
      }
      return null;
    }

    try {
      // Get icon based on type
      let notificationIcon = icon;
      const typeIcons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️',
        task: '📋',
        leave: '🏖️',
        wfh: '🏠',
        attendance: '⏰',
        chat: '💬'
      };

      // Create notification body with emoji prefix for better visibility
      const prefix = typeIcons[type] || '🔔';
      const notificationTitle = `${prefix} ${title}`;

      // Build notification options with enhanced visibility
      const notificationOptions = {
        body: message,
        icon: notificationIcon,
        tag: tag,
        requireInteraction: requireInteraction, // For important notifications, keep visible
        silent: true, // We handle sound ourselves with Web Audio API
        badge: notificationIcon,
        timestamp: Date.now(),
        data: data || { type, timestamp: Date.now() },
        // Add renotify to make it more noticeable
        renotify: true,
        // Add dir for better text rendering
        dir: 'ltr',
        // Add lang
        lang: 'en'
      };

      // Only add vibrate if not silent (silent and vibrate cannot be used together)
      if (!silent) {
        // Remove the silent flag and add vibration for mobile/touch devices
        delete notificationOptions.silent;
        notificationOptions.vibrate = [200, 100, 200];
      }

      const notification = new Notification(notificationTitle, notificationOptions);

      // Store active notification
      this.activeNotifications.set(tag, notification);

      // Handle notification click - bring window to focus
      notification.onclick = (event) => {
        event.preventDefault();
        
        // Focus the window (works even when completely outside E-Connect)
        window.focus();
        
        // Stop title blinking
        this.stopTitleNotification();
        
        // Close the notification
        notification.close();
        
        // Call custom onClick handler
        if (onClick) {
          onClick(event);
        }
        
        console.log('Notification clicked - window focused');
      };

      // Handle notification close
      notification.onclose = () => {
        this.activeNotifications.delete(tag);
        console.log('Notification closed');
      };

      // Handle notification error
      notification.onerror = (error) => {
        console.error('Notification error:', error);
        this.activeNotifications.delete(tag);
      };

      // Handle notification show event
      notification.onshow = () => {
        console.log('Desktop notification displayed:', notificationTitle);
      };

      // Auto-close after specified time if requested
      // Use longer time (10 seconds default) for better visibility
      if (autoClose && !requireInteraction) {
        setTimeout(() => {
          if (notification) {
            notification.close();
          }
        }, closeAfter);
      }

      console.log('Browser notification shown:', notificationTitle);
      return notification;

    } catch (error) {
      console.error('Error showing browser notification:', error);
      return null;
    }
  }

  /**
   * Close all active notifications
   */
  closeAllNotifications() {
    this.activeNotifications.forEach(notification => {
      try {
        notification.close();
      } catch (error) {
        console.error('Error closing notification:', error);
      }
    });
    this.activeNotifications.clear();
    this.stopTitleNotification();
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    return {
      supported: 'Notification' in window,
      permission: this.permission,
      granted: this.permission === 'granted',
      denied: this.permission === 'denied',
      default: this.permission === 'default'
    };
  }

  /**
   * Check if page is visible
   */
  isVisible() {
    return this.isPageVisible;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.closeAllNotifications();
    this.stopTitleNotification();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
const browserNotificationService = new BrowserNotificationService();
export default browserNotificationService;
