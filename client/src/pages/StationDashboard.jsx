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
        <h2 className="text-2xl font-bold text-palette-dark">{currentUser?.station?.name}</h2>
        <div className="flex items-center">
          <span className="px-3 py-1 bg-palette-beige text-palette-dark font-bold rounded-lg mr-2">
            {currentUser?.station?.code}
          </span>
          <p className="text-palette-mid">User ID: {currentUser?.name}</p>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-palette-dark">Recent Parcels</h3>
            <Link to="/parcels" className="text-palette-dark hover:text-palette-mid">
              View all
            </Link>
          </div>
          
          {parcels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-palette-mid">
                <thead className="bg-palette-beige">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-palette-dark uppercase tracking-wider">Tracking #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-palette-dark uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-palette-dark uppercase tracking-wider">From/To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-palette-dark uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-palette-dark uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-palette-mid">
                  {parcels.slice(0, 5).map(parcel => (
                    <tr key={parcel.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-palette-dark">{parcel.tracking_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          parcel.status === 'pending' ? 'bg-palette-beige text-palette-dark' :
                          parcel.status === 'in_transit' ? 'bg-palette-beige text-palette-dark' :
                          parcel.status === 'delivered' ? 'bg-palette-beige text-palette-dark' :
                          'bg-palette-beige text-palette-dark'
                        }`}>
                          {parcel.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-palette-mid">
                        {parcel.sender_station_id === currentUser.station_id
                          ? `To: ${parcel.receiverStation?.name}`
                          : `From: ${parcel.senderStation?.name}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-palette-mid">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/parcel/${parcel.id}`} className="text-palette-dark hover:text-palette-mid">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-palette-mid">No parcels available.</p>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-palette-dark">Recent Messages</h3>
            <Link to="/messages" className="text-palette-dark hover:text-palette-mid">
              View all
            </Link>
          </div>
          
          <div className="mb-4 p-3 bg-palette-beige border border-palette-mid rounded-md text-sm text-palette-dark">
            <p>Showing messages from all stations for better system visibility and coordination.</p>
          </div>
          
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.slice(0, 5).map(message => (
                <div 
                  key={message.id} 
                  className={`border-l-4 p-4 ${
                    message.to_station === currentUser.station_id
                      ? 'border-palette-dark bg-palette-beige'
                      : message.from_station === currentUser.station_id
                        ? 'border-palette-dark bg-palette-beige'
                        : 'border-palette-mid bg-palette-light'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium text-palette-dark">{message.sender?.name}</span>
                      <span className="mx-2 text-palette-mid">→</span>
                      <span className="font-medium text-palette-dark">{message.receiver?.name}</span>
                      
                      {message.to_station === currentUser.station_id && (
                        <span className="ml-2 bg-palette-mid text-white text-xs px-2 py-1 rounded-full">
                          To Your Station
                        </span>
                      )}
                      {message.from_station === currentUser.station_id && (
                        <span className="ml-2 bg-palette-mid text-white text-xs px-2 py-1 rounded-full">
                          From Your Station
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-palette-mid">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-palette-dark">{message.content}</p>
                  <div className="mt-2">
                    <Link to={`/parcel/${message.parcel_id}`} className="text-sm text-palette-dark hover:text-palette-mid">
                      View Parcel: {message.parcel?.tracking_number}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-palette-mid">No messages available.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StationDashboard; 