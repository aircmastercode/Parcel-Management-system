import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StationDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [parcels, setParcels] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadStationData();
    }
  }, [currentUser]);

  const loadStationData = async () => {
    try {
      setLoading(true);
      
      // Get parcels for this station
      const parcelsResponse = await api.get(`/api/parcels/station/${currentUser.station_id}`);
      setParcels(parcelsResponse.data);
      
      // Get all messages
      const messagesResponse = await api.get('/api/messages/all');
      
      // Sort messages with most recent first
      const sortedMessages = messagesResponse.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setMessages(sortedMessages);
      
    } catch (error) {
      console.error('Error loading station data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Station Dashboard">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Station Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{currentUser?.station?.name}</h2>
        <div className="flex items-center">
          <span className="px-3 py-1 bg-primary-100 text-primary-800 font-bold rounded-lg mr-2">
            {currentUser?.station?.code}
          </span>
          <p className="text-gray-600">User ID: {currentUser?.name}</p>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Parcels</h3>
            <Link to="/parcels" className="text-primary-600 hover:text-primary-800">
              View all
            </Link>
          </div>
          
          {parcels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From/To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parcels.slice(0, 5).map(parcel => (
                    <tr key={parcel.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parcel.tracking_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          parcel.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          parcel.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                          parcel.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {parcel.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parcel.sender_station_id === currentUser.station_id
                          ? `To: ${parcel.receiverStation?.name}`
                          : `From: ${parcel.senderStation?.name}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/parcel/${parcel.id}`} className="text-primary-600 hover:text-primary-800">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No parcels available.</p>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
            <Link to="/messages" className="text-primary-600 hover:text-primary-800">
              View all
            </Link>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <p>Showing messages from all stations for better system visibility and coordination.</p>
          </div>
          
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.slice(0, 5).map(message => (
                <div 
                  key={message.id} 
                  className={`border-l-4 p-4 ${
                    message.to_station === currentUser.station_id
                      ? 'border-primary-500 bg-primary-50'
                      : message.from_station === currentUser.station_id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{message.sender?.name}</span>
                      <span className="mx-2 text-gray-500">→</span>
                      <span className="font-medium">{message.receiver?.name}</span>
                      
                      {message.to_station === currentUser.station_id && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          To Your Station
                        </span>
                      )}
                      {message.from_station === currentUser.station_id && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          From Your Station
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1">{message.content}</p>
                  <div className="mt-2">
                    <Link to={`/parcel/${message.parcel_id}`} className="text-sm text-primary-600 hover:text-primary-800">
                      View Parcel: {message.parcel?.tracking_number}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No messages available.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StationDashboard; 