import { useState, useEffect, useCallback } from 'react';
import { LS, ipadr } from '../Utils/Resuse';
import { toast } from 'react-hot-toast';

export const useNotificationAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userid = LS.get('userid');

  // Fetch notifications with enhanced error handling
  const fetchNotifications = useCallback(async (filters = {}) => {
    if (!userid) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        limit: filters.limit || 50,
        ...(filters.type && { type: filters.type }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.is_read !== undefined && { is_read: filters.is_read })
      });

      const response = await fetch(`${ipadr}/notifications/${userid}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.notifications || [];
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
      toast.error('Failed to load notifications');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userid]);

  // Mark notification as read/unread
  const markNotification = useCallback(async (notificationId, isRead) => {
    if (!userid || !notificationId) return false;
    
    try {
      const response = await fetch(`${ipadr}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: !isRead })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success(isRead ? 'Marked as unread' : 'Marked as read');
        return true;
      } else {
        throw new Error(data.message || 'Failed to update notification');
      }
    } catch (error) {
      console.error('Error marking notification:', error);
      toast.error('Failed to update notification');
      return false;
    }
  }, [userid]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userid) return false;
    
    try {
      const response = await fetch(`${ipadr}/notifications/${userid}/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('All notifications marked as read');
        return true;
      } else {
        throw new Error(data.message || 'Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
      return false;
    }
  }, [userid]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!userid || !notificationId) return false;
    
    try {
      const response = await fetch(`${ipadr}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Notification deleted');
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
      return false;
    }
  }, [userid]);

  // Get notification statistics
  const getNotificationStats = useCallback(async () => {
    if (!userid) return null;
    
    try {
      const response = await fetch(`${ipadr}/notification-stats/${userid}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return null;
    }
  }, [userid]);

  // Test notification system
  const sendTestNotification = useCallback(async () => {
    if (!userid) return false;
    
    try {
      const response = await fetch(`${ipadr}/test-notifications/${userid}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Test notification sent!');
        return true;
      } else {
        throw new Error(data.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
      return false;
    }
  }, [userid]);

  // Trigger manual automation checks (admin only)
  const runAutomationChecks = useCallback(async () => {
    try {
      const response = await fetch(`${ipadr}/run-automation-checks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Automation checks completed!');
        return data.results;
      } else {
        throw new Error(data.message || 'Failed to run automation checks');
      }
    } catch (error) {
      console.error('Error running automation checks:', error);
      toast.error('Failed to run automation checks');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    fetchNotifications,
    markNotification,
    markAllAsRead,
    deleteNotification,
    getNotificationStats,
    sendTestNotification,
    runAutomationChecks
  };
};
