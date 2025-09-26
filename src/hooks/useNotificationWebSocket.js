import { useEffect, useRef, useState, useCallback } from 'react';
import { LS } from '../Utils/Resuse';

export const useNotificationWebSocket = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const userid = LS.get('userid');

  // WebSocket URL - adjust based on your backend configuration
  const getWebSocketUrl = useCallback(() => {
    // Get base URL from environment or use default
    const apiBaseUrl = import.meta.env.VITE_HOST_IP || "http://127.0.0.1:8000";
    // Remove protocol and trailing slash for WebSocket URL construction
    const wsUrl = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    // Use secure WebSocket for HTTPS, regular WebSocket for HTTP
    const protocol = apiBaseUrl.startsWith('https') ? 'wss' : 'ws';
    const fullWsUrl = `${protocol}://${wsUrl}/ws/notifications/${userid}`;
    console.log('WebSocket URL constructed:', fullWsUrl);
    return fullWsUrl;
  }, [userid]);

  const connect = useCallback(() => {
    if (!userid) {
      console.log('WebSocket: No userid available, skipping connection');
      setConnectionError('No user ID available');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected');
      return;
    }

    // Don't attempt to reconnect if we've exceeded max attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('WebSocket: Max reconnection attempts reached');
      setConnectionError('Connection failed after maximum attempts');
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('WebSocket: Attempting to connect to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
        
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        // Send a ping to confirm connection
        try {
          wsRef.current.send(JSON.stringify({ 
            type: 'ping', 
            message: 'Hello from frontend',
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error sending ping:', error);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket: Received message:', data);
          
          if (data.type === 'notification') {
            // ✅ CRITICAL: Validate that notification belongs to current user
            if (data.data && data.data.userid === userid) {
              console.log('✅ Valid notification received for user:', userid);
              
              // New notification received - avoid duplicates
              setNotifications(prev => {
                const exists = prev.some(notif => notif._id === data.data._id);
                if (exists) {
                  console.log('⚠️ Duplicate notification ignored:', data.data._id);
                  return prev;
                }
                console.log('📝 Adding new notification:', data.data.title);
                return [data.data, ...prev];
              });
              
              // Update unread count
              setUnreadCount(prev => prev + 1);
              
              // Show browser notification if permission granted
              if (Notification.permission === 'granted' && data.data) {
                try {
                  const notification = new Notification(data.data.title || 'New E-Connect Notification', {
                    body: data.data.message || '',
                    icon: '/favicon.ico',
                    tag: data.data._id,
                    requireInteraction: false,
                    silent: false
                  });
                  
                  // Auto-close after 5 seconds
                  setTimeout(() => notification.close(), 5000);
                  
                  console.log('🔔 Browser notification shown:', data.data.title);
                } catch (error) {
                  console.error('Error showing browser notification:', error);
                }
              } else {
                console.log('🔕 Browser notifications not permitted or no data');
              }
            } else {
              console.warn('WebSocket: Received notification for different user:', {
                received_userid: data.data?.userid,
                current_userid: userid
              });
            }
          } else if (data.type === 'unread_count_update' && data.data) {
            // Unread count update
            setUnreadCount(data.data.unread_count || 0);
          } else if (data.type === 'pong') {
            // Handle pong response
            console.log('WebSocket: Pong received');
          } else {
            console.log('WebSocket: Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
        
        // Only attempt to reconnect if it wasn't a clean close and we haven't exceeded attempts
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Exponential backoff, max 30s
          console.log(`WebSocket: Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Connection lost and max reconnection attempts exceeded');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setConnectionError('WebSocket connection error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
      setConnectionError('Failed to create WebSocket connection');
      
      // Retry connection with backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    }
  }, [userid, getWebSocketUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Set readyState to closing to prevent reconnection attempts
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionError(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    
    return Notification.permission === 'granted';
  }, []);

  useEffect(() => {
    if (userid) {
      // Request notification permission
      requestNotificationPermission();
      
      // Connect to WebSocket
      connect();
    } else {
      setConnectionError('No user ID available');
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [userid, connect, disconnect, requestNotificationPermission]);

  // Reconnect when window becomes visible (if not already connected)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && userid && !connectionError) {
        console.log('Window became visible, attempting to reconnect...');
        reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, userid, connectionError, reconnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected || !wsRef.current) return;

    const heartbeat = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ 
            type: 'ping', 
            timestamp: new Date().toISOString() 
          }));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      }
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(heartbeat);
  }, [isConnected]);

  return {
    notifications,
    unreadCount,
    isConnected,
    connectionError,
    connect: reconnect,
    disconnect,
    setNotifications,
    setUnreadCount
  };
};