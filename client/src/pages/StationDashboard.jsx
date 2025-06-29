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
        <h2 className="text-2xl font-bold text-charcoal">{currentUser?.station?.name}</h2>
        <div className="flex items-center">
          <span className="px-3 py-1 bg-soft-gray text-accent-black font-bold rounded-lg mr-2">
            {currentUser?.station?.code}
          </span>
          <p className="text-body-text">User ID: {currentUser?.name}</p>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-charcoal">Recent Parcels</h3>
            <Link to="/parcels" className="text-accent-black hover:text-accent-black">
              View all
            </Link>
          </div>
          
          {parcels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-soft-gray">
                <thead className="bg-beige">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Tracking #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">From/To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-soft-gray">
                  {parcels.slice(0, 5).map(parcel => (
                    <tr key={parcel.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{parcel.tracking_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          parcel.status === 'pending' ? 'bg-soft-gray text-accent-black' :
                          parcel.status === 'in_transit' ? 'bg-soft-gray text-accent-black' :
                          parcel.status === 'delivered' ? 'bg-soft-gray text-accent-black' :
                          'bg-soft-gray text-accent-black'
                        }`}>
                          {parcel.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-body-text">
                        {parcel.sender_station_id === currentUser.station_id
                          ? `To: ${parcel.receiverStation?.name}`
                          : `From: ${parcel.senderStation?.name}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-body-text">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/parcel/${parcel.id}`} className="text-accent-black hover:text-accent-black">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-body-text">No parcels available.</p>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-charcoal">Recent Messages</h3>
            <Link to="/messages" className="text-accent-black hover:text-accent-black">
              View all
            </Link>
          </div>
          
          <div className="mb-4 p-3 bg-soft-gray border border-border-soft-gray rounded-md text-sm text-accent-black">
            <p>Showing messages from all stations for better system visibility and coordination.</p>
          </div>
          
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.slice(0, 5).map(message => (
                <div 
                  key={message.id} 
                  className={`border-l-4 p-4 ${
                    message.to_station === currentUser.station_id
                      ? 'border-accent-black bg-accent-black-10'
                      : message.from_station === currentUser.station_id
                        ? 'border-accent-black bg-accent-black-10'
                        : 'border-border-soft-gray bg-accent-black-5'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{message.sender?.name}</span>
                      <span className="mx-2 text-body-text">→</span>
                      <span className="font-medium">{message.receiver?.name}</span>
                      
                      {message.to_station === currentUser.station_id && (
                        <span className="ml-2 bg-accent-black-10 text-accent-black text-xs px-2 py-1 rounded-full">
                          To Your Station
                        </span>
                      )}
                      {message.from_station === currentUser.station_id && (
                        <span className="ml-2 bg-accent-black-10 text-accent-black text-xs px-2 py-1 rounded-full">
                          From Your Station
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-body-text">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1">{message.content}</p>
                  <div className="mt-2">
                    <Link to={`/parcel/${message.parcel_id}`} className="text-sm text-accent-black hover:text-accent-black">
                      View Parcel: {message.parcel?.tracking_number}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-text">No messages available.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StationDashboard; 