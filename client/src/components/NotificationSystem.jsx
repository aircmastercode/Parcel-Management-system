import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaBell, FaEnvelope, FaBox, FaTimes } from 'react-icons/fa';

const NotificationSystem = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.station_id) {
      loadNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      if (!currentUser || !currentUser.station_id) return;
      
      setLoading(true);
      
      // Get unread messages for this station
      const messagesResponse = await api.get(`/api/messages/unread/${currentUser.station_id}`);
      const unreadMessages = messagesResponse.data;
      
      // Transform messages into notifications
      const messageNotifications = unreadMessages.map(message => ({
        id: `message-${message.id}`,
        type: 'message',
        title: 'New Message',
        content: `From ${message.sender?.name}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        time: new Date(message.createdAt),
        data: message
      }));
      
      // Sort by most recent first
      const allNotifications = [...messageNotifications]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10); // Limit to 10 most recent
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await api.put(`/api/messages/${messageId}/read`);
      // Remove the notification from the list
      setNotifications(prev => prev.filter(notif => notif.data?.id !== messageId));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return FaEnvelope;
      case 'parcel': return FaBox;
      default: return FaBell;
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.content}
                          </p>
                          {notification.type === 'message' && notification.data && (
                            <button
                              onClick={() => markMessageAsRead(notification.data.id)}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to messages page
                  window.location.href = '/messages';
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all messages
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem; 