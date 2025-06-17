import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalParcels: 0,
    pendingParcels: 0,
    inTransitParcels: 0,
    deliveredParcels: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    // Redirect to master dashboard if user is master
    if (currentUser?.role === 'master') {
      navigate('/master-dashboard');
      return;
    }

    loadDashboardData();
  }, [currentUser, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Get parcels for the station
      const parcelsResponse = await api.get(`/api/parcels/station/${currentUser.station_id}`);
      const parcels = parcelsResponse.data;

      // Get unread messages
      const messagesResponse = await api.get(`/api/messages/unread/${currentUser.station_id}`);
      const unreadMessages = messagesResponse.data;

      // Calculate statistics
      const pendingCount = parcels.filter(p => p.status === 'pending').length;
      const inTransitCount = parcels.filter(p => p.status === 'in_transit').length;
      const deliveredCount = parcels.filter(p => p.status === 'delivered').length;

      setStats({
        totalParcels: parcels.length,
        pendingParcels: pendingCount,
        inTransitParcels: inTransitCount,
        deliveredParcels: deliveredCount,
        unreadMessages: unreadMessages.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {currentUser?.name}</h2>
        <p className="text-gray-600">Station: {currentUser?.station?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <h3 className="text-lg font-medium text-gray-500">Total Parcels</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalParcels}</p>
          <Link to="/parcels" className="text-primary-600 text-sm mt-2 block hover:underline">
            View all parcels
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-500">Pending</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingParcels}</p>
          <Link to="/parcels?status=pending" className="text-primary-600 text-sm mt-2 block hover:underline">
            View pending parcels
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-500">In Transit</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inTransitParcels}</p>
          <Link to="/parcels?status=in_transit" className="text-primary-600 text-sm mt-2 block hover:underline">
            View in-transit parcels
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-500">Delivered</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.deliveredParcels}</p>
          <Link to="/parcels?status=delivered" className="text-primary-600 text-sm mt-2 block hover:underline">
            View delivered parcels
          </Link>
        </div>
      </div>

      {/* Messages Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Unread Messages</h3>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {stats.unreadMessages} New
          </span>
        </div>
        {stats.unreadMessages > 0 ? (
          <Link
            to="/messages"
            className="btn-primary inline-block"
          >
            View Messages
          </Link>
        ) : (
          <p className="text-gray-500">No new messages</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 