import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LS, ipadr } from '../Utils/Resuse';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';

const NotificationBell = ({ className = "" }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userid = LS.get('userid');
  
  // Use WebSocket hook for real-time updates
  const { unreadCount: wsUnreadCount, isConnected } = useNotificationWebSocket();

  // Fetch unread count from API (fallback)
  const fetchUnreadCount = async () => {
    if (!userid) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${ipadr}/notifications/${userid}/unread-count`);
      const data = await response.json();
      
      if (response.ok) {
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bell click
  const handleBellClick = () => {
    navigate('/User/notifications');
  };

  useEffect(() => {
    // Use WebSocket count if connected, otherwise fetch from API
    if (isConnected) {
      setUnreadCount(wsUnreadCount);
    } else {
      fetchUnreadCount();
      // Fallback polling when WebSocket is not connected
      const interval = setInterval(() => {
        if (!isConnected) {
          fetchUnreadCount();
        }
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }
  }, [wsUnreadCount, isConnected, userid]);

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={handleBellClick}>
      <FaBell 
        className={`text-xl ${unreadCount > 0 ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-300 transition-colors`}
        title="Notifications"
      />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {/* Connection status indicator */}
      <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} 
           title={isConnected ? 'Real-time connected' : 'Polling mode'}>
      </div>
    </div>
  );
};

export default NotificationBell;
