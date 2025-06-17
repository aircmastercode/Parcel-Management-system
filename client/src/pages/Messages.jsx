import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Messages = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('incoming');

  useEffect(() => {
    loadMessages();
  }, [currentUser]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      let response;
      if (currentUser.role === 'master') {
        response = await api.get('/api/messages');
      } else {
        response = await api.get(`/api/messages/station/${currentUser.station_id}`);
      }
      
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/api/messages/${messageId}/read`);
      
      // Update message in local state
      setMessages(messages.map(message => 
        message.id === messageId 
          ? { ...message, read: true } 
          : message
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Filter messages based on the selected filter
  const getFilteredMessages = () => {
    // First filter by read status
    let filteredByStatus = filter === 'all' 
      ? messages 
      : filter === 'unread'
        ? messages.filter(message => !message.read)
        : messages.filter(message => message.read);
    
    // Then filter by incoming/outgoing based on viewMode
    if (currentUser.role !== 'master') {
      if (viewMode === 'incoming') {
        return filteredByStatus.filter(message => message.to_station === currentUser.station_id);
      } else {
        return filteredByStatus.filter(message => message.from_station === currentUser.station_id);
      }
    }
    
    return filteredByStatus;
  };

  const filteredMessages = getFilteredMessages();

  if (loading) {
    return (
      <DashboardLayout title="Messages">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Messages">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Message Center</h2>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input py-1"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Message type tabs */}
      {currentUser.role !== 'master' && (
        <div className="flex border-b mb-6">
          <button
            onClick={() => setViewMode('incoming')}
            className={`px-4 py-2 font-medium ${
              viewMode === 'incoming'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Incoming Messages
          </button>
          <button
            onClick={() => setViewMode('outgoing')}
            className={`px-4 py-2 font-medium ${
              viewMode === 'outgoing'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Outgoing Messages
          </button>
        </div>
      )}

      {filteredMessages.length > 0 ? (
        <div className="space-y-4">
          {filteredMessages.map(message => (
            <div 
              key={message.id} 
              className={`bg-white shadow rounded-lg p-4 border-l-4 ${
                message.read ? 'border-gray-300' : 'border-primary-500'
              }`}
            >
              <div className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{message.sender?.name}</span>
                  <span className="mx-2 text-gray-500">→</span>
                  <span className="font-medium">{message.receiver?.name}</span>
                  
                  {/* Clearly indicate if this is a message to/from your station */}
                  {message.to_station === currentUser.station_id && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">To Your Station</span>
                  )}
                  {message.from_station === currentUser.station_id && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">From Your Station</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{message.content}</p>
              
              <div className="flex justify-between items-center mt-2">
                <Link 
                  to={`/parcel/${message.parcel_id}`} 
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  View Parcel: {message.parcel?.tracking_number}
                </Link>
                
                {!message.read && message.to_station === currentUser.station_id && (
                  <button
                    onClick={() => handleMarkAsRead(message.id)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">
            {viewMode === 'incoming' 
              ? 'No incoming messages available.' 
              : 'No outgoing messages available.'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Messages; 