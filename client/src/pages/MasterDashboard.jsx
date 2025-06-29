import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const MasterDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalParcels: 0,
    totalStations: 0,
    totalUsers: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    loadMasterDashboardData();
  }, []);

  const loadMasterDashboardData = async () => {
    try {
      setLoading(true);

      // Get all stations
      const stationsResponse = await api.get('/api/stations');
      setStations(stationsResponse.data);

      // Get all parcels
      const parcelsResponse = await api.get('/api/parcels');
      setParcels(parcelsResponse.data);

      // Get all messages
      const messagesResponse = await api.get('/api/messages');
      const allMessages = messagesResponse.data;
      setMessages(allMessages);

      // Get users count
      const usersResponse = await api.get('/api/users');

      // Calculate statistics
      setStats({
        totalParcels: parcelsResponse.data.length,
        totalStations: stationsResponse.data.length,
        totalUsers: usersResponse.data.length,
        unreadMessages: allMessages.filter(m => !m.read).length
      });
    } catch (error) {
      console.error('Error loading master dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Master Dashboard">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Master Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-charcoal">Railway Control Panel</h2>
        <div className="flex items-center">
          <span className="px-3 py-1 bg-soft-gray text-accent-black font-bold rounded-lg mr-2">
            {currentUser?.station?.code}
          </span>
          <p className="text-body-text">{currentUser?.station?.name} - System Overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-soft-gray">
          <h3 className="text-lg font-medium text-charcoal">Total Parcels</h3>
          <p className="text-3xl font-bold text-accent-black mt-2">{stats.totalParcels}</p>
          <Link to="/parcels" className="text-accent-black text-sm mt-2 block hover:underline">
            View all parcels
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-soft-gray">
          <h3 className="text-lg font-medium text-charcoal">Stations</h3>
          <p className="text-3xl font-bold text-accent-black mt-2">{stats.totalStations}</p>
          <Link to="/stations" className="text-accent-black text-sm mt-2 block hover:underline">
            Manage stations
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-soft-gray">
          <h3 className="text-lg font-medium text-charcoal">Users</h3>
          <p className="text-3xl font-bold text-accent-black mt-2">{stats.totalUsers}</p>
          <Link to="/users" className="text-accent-black text-sm mt-2 block hover:underline">
            Manage users
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-soft-gray">
          <h3 className="text-lg font-medium text-charcoal">Unread Messages</h3>
          <p className="text-3xl font-bold text-accent-black mt-2">{stats.unreadMessages}</p>
          <Link to="/messages" className="text-accent-black text-sm mt-2 block hover:underline">
            View all messages
          </Link>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Recent Messages</h3>
        {messages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.slice(0, 5).map(message => (
                  <tr key={message.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-black">{message.sender?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{message.sender?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{message.receiver?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{message.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {message.read ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Read
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Unread
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No messages available</p>
        )}
        <div className="mt-4">
          <Link to="/messages" className="text-primary-600 hover:text-primary-800">
            View all messages →
          </Link>
        </div>
      </div>

      {/* Station Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Railway Station Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map(station => (
            <div key={station.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{station.name}</h4>
                <span className="text-xs font-bold bg-primary-100 text-primary-800 px-3 py-1 rounded-lg">
                  {station.code}
                </span>
              </div>
              <p className="text-sm text-gray-500">Location: {station.location}</p>
              <p className="text-sm text-gray-600 mt-2">
                {parcels.filter(p => p.sender_station_id === station.id || p.receiver_station_id === station.id).length} parcels
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MasterDashboard; 