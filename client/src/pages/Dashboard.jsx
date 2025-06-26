import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaBox, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaEnvelope, 
  FaExclamationTriangle,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalParcels: 0,
    pendingParcels: 0,
    inTransitParcels: 0,
    deliveredParcels: 0,
    unreadMessages: 0,
    recentParcels: [],
    recentMessages: []
  });

  useEffect(() => {
    // Redirect to master dashboard if user is master
    if (currentUser?.role === 'master') {
      navigate('/master-dashboard');
      return;
    }

    // Only load data if we have a valid currentUser with station_id
    if (currentUser && currentUser.station_id) {
      loadDashboardData();
    }
  }, [currentUser, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Add null check for currentUser
      if (!currentUser || !currentUser.station_id) {
        console.error('No valid user or station_id found');
        return;
      }
      
      // Get parcels for the station
      const parcelsResponse = await api.get(`/api/parcels/station/${currentUser.station_id}`);
      const parcels = parcelsResponse.data;

      // Get all messages to provide a global view
      const messagesResponse = await api.get(`/api/messages/all`);
      const allMessages = messagesResponse.data;
      
      // Get unread messages directed to this station
      const unreadMessages = allMessages.filter(m => 
        m.to_station === currentUser.station_id && !m.read
      );

      // Calculate statistics
      const pendingCount = parcels.filter(p => p.status === 'pending').length;
      const inTransitCount = parcels.filter(p => p.status === 'in_transit').length;
      const deliveredCount = parcels.filter(p => p.status === 'delivered').length;

      // Get recent parcels (last 5)
      const recentParcels = parcels
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Get recent messages (last 5)
      const recentMessages = allMessages
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalParcels: parcels.length,
        pendingParcels: pendingCount,
        inTransitParcels: inTransitCount,
        deliveredParcels: deliveredCount,
        unreadMessages: unreadMessages.length,
        recentParcels,
        recentMessages
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'returned': return 'text-gray-600 bg-gray-100';
      case 'lost': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return FaClock;
      case 'in_transit': return FaTruck;
      case 'delivered': return FaCheckCircle;
      case 'returned': return FaArrowDown;
      case 'lost': return FaExclamationTriangle;
      default: return FaBox;
    }
  };

  // Show loading if no valid user data
  if (!currentUser || !currentUser.station_id) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="gradient-railway rounded-2xl p-6 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.name}!</h2>
          <p className="text-blue-100 text-lg">
            Railway Station: {currentUser?.station?.name} ({currentUser?.station?.code})
          </p>
          <div className="mt-4 flex items-center">
            <FaChartLine className="w-5 h-5 mr-2" />
            <span className="text-blue-100">Here's your station overview</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Parcels</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalParcels}</p>
            </div>
            <div className="dashboard-card-icon gradient-railway">
              <FaBox className="w-6 h-6 text-white" />
            </div>
          </div>
          <Link to="/parcels" className="text-blue-600 text-sm mt-4 block hover:underline font-medium">
            View all parcels →
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingParcels}</p>
            </div>
            <div className="dashboard-card-icon gradient-railway-warm">
              <FaClock className="w-6 h-6 text-white" />
            </div>
          </div>
          <Link to="/parcels?status=pending" className="text-yellow-600 text-sm mt-4 block hover:underline font-medium">
            View pending →
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Transit</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.inTransitParcels}</p>
            </div>
            <div className="dashboard-card-icon" style={{background: 'linear-gradient(135deg, #3b82f6, #6366f1)'}}>
              <FaTruck className="w-6 h-6 text-white" />
            </div>
          </div>
          <Link to="/parcels?status=in_transit" className="text-blue-600 text-sm mt-4 block hover:underline font-medium">
            View in transit →
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Delivered</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.deliveredParcels}</p>
            </div>
            <div className="dashboard-card-icon gradient-railway-success">
              <FaCheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <Link to="/parcels?status=delivered" className="text-green-600 text-sm mt-4 block hover:underline font-medium">
            View delivered →
          </Link>
        </div>
      </div>

      {/* Messages and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Messages Card */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <FaEnvelope className="w-5 h-5 mr-2 text-blue-600" />
              Messages
            </h3>
            <span className="notification-badge">
              {stats.unreadMessages}
            </span>
          </div>
          
          {stats.unreadMessages > 0 ? (
            <div className="space-y-4">
              <p className="text-slate-600">You have {stats.unreadMessages} unread messages</p>
              <Link
                to="/messages"
                className="btn-primary inline-flex items-center"
              >
                <FaEnvelope className="w-4 h-4 mr-2" />
                View Messages
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaEnvelope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No new messages</p>
            </div>
          )}
        </div>

        {/* Recent Parcels */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <FaBox className="w-5 h-5 mr-2 text-blue-600" />
              Recent Parcels
            </h3>
            <Link to="/parcels" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all →
            </Link>
          </div>
          
          {stats.recentParcels.length > 0 ? (
            <div className="space-y-4">
              {stats.recentParcels.map(parcel => {
                const StatusIcon = getStatusIcon(parcel.status);
                return (
                  <div key={parcel.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 gradient-railway rounded-lg flex items-center justify-center mr-3">
                        <FaBox className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{parcel.tracking_number}</p>
                        <p className="text-sm text-slate-500">
                          {parcel.senderStation?.name} → {parcel.receiverStation?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(parcel.status)}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {parcel.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaBox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No parcels available</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="text-xl font-bold text-slate-900 flex items-center">
            <FaChartLine className="w-5 h-5 mr-2 text-blue-600" />
            Station Performance Analytics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Rate */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-slate-800">Delivery Rate</h4>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.totalParcels > 0 ? Math.round((stats.deliveredParcels / stats.totalParcels) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {stats.deliveredParcels} of {stats.totalParcels} delivered
            </p>
          </div>

          {/* Transit Efficiency */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaTruck className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-slate-800">In Transit</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.totalParcels > 0 ? Math.round((stats.inTransitParcels / stats.totalParcels) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {stats.inTransitParcels} parcels moving
            </p>
          </div>

          {/* Pending Processing */}
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaClock className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-slate-800">Pending</h4>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {stats.totalParcels > 0 ? Math.round((stats.pendingParcels / stats.totalParcels) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {stats.pendingParcels} awaiting processing
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/parcels/new"
            className="flex items-center p-4 gradient-railway-success text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FaBox className="w-6 h-6 mr-3" />
            <div>
              <p className="font-medium">Create New Parcel</p>
              <p className="text-sm opacity-90">Send a new parcel</p>
            </div>
          </Link>
          
          <Link
            to="/messages"
            className="flex items-center p-4 gradient-railway text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FaEnvelope className="w-6 h-6 mr-3" />
            <div>
              <p className="font-medium">View Messages</p>
              <p className="text-sm opacity-90">Check communications</p>
            </div>
          </Link>
          
          <Link
            to="/track"
            className="flex items-center p-4 gradient-railway-warm text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FaChartLine className="w-6 h-6 mr-3" />
            <div>
              <p className="font-medium">Public Tracking</p>
              <p className="text-sm opacity-90">Customer tracking portal</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 