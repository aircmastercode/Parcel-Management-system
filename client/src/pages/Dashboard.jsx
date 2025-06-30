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
      <div className="mb-8 animate-fade-in-up">
        <div className="bg-white border border-palette-mid rounded-2xl p-6 shadow-xl">
          <h2 className="text-3xl font-extrabold mb-2 flex items-center text-palette-dark">
            Welcome back, {currentUser?.name}!
          </h2>
          <div className="w-24 h-1 bg-palette-mid rounded-full mb-2" />
          <p className="text-palette-dark text-lg">
            Railway Station: {currentUser?.station?.name} ({currentUser?.station?.code})
          </p>
          <div className="mt-4 flex items-center">
            <FaChartLine className="w-5 h-5 mr-2 text-palette-mid" />
            <span className="text-palette-mid">Here's your station overview</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-palette-mid rounded-2xl p-6 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-palette-mid">Total Parcels</p>
              <p className="text-3xl font-bold text-palette-dark mt-2">{stats.totalParcels}</p>
            </div>
            <div className="dashboard-card-icon bg-palette-beige rounded-xl p-2">
              <FaBox className="w-6 h-6 text-palette-dark" />
            </div>
          </div>
          <Link to="/parcels" className="text-palette-dark text-sm mt-4 block hover:underline font-medium">
            View all parcels →
          </Link>
        </div>

        <div className="bg-white border border-palette-mid rounded-2xl p-6 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-palette-mid">Pending</p>
              <p className="text-3xl font-bold text-palette-dark mt-2">{stats.pendingParcels}</p>
            </div>
            <div className="dashboard-card-icon bg-palette-beige rounded-xl p-2">
              <FaClock className="w-6 h-6 text-palette-dark" />
            </div>
          </div>
          <Link to="/parcels?filter=pending" className="text-palette-dark text-sm mt-4 block hover:underline font-medium">
            View pending →
          </Link>
        </div>

        <div className="bg-white border border-palette-mid rounded-2xl p-6 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-palette-mid">In Transit</p>
              <p className="text-3xl font-bold text-palette-dark mt-2">{stats.inTransitParcels}</p>
            </div>
            <div className="dashboard-card-icon bg-palette-beige rounded-xl p-2">
              <FaTruck className="w-6 h-6 text-palette-dark" />
            </div>
          </div>
          <Link to="/parcels?filter=in_transit" className="text-palette-dark text-sm mt-4 block hover:underline font-medium">
            View in transit →
          </Link>
        </div>

        <div className="bg-white border border-palette-mid rounded-2xl p-6 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-palette-mid">Delivered</p>
              <p className="text-3xl font-bold text-palette-dark mt-2">{stats.deliveredParcels}</p>
            </div>
            <div className="dashboard-card-icon bg-palette-beige rounded-xl p-2">
              <FaCheckCircle className="w-6 h-6 text-palette-dark" />
            </div>
          </div>
          <Link to="/parcels?filter=delivered" className="text-palette-dark text-sm mt-4 block hover:underline font-medium">
            View delivered →
          </Link>
        </div>
      </div>

      {/* Messages and Recent Parcels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-palette-mid rounded-2xl p-6 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
          <h3 className="text-lg font-bold text-palette-dark mb-2">Messages</h3>
          <p className="text-palette-mid mb-4">You have {stats.unreadMessages} unread messages</p>
          <Link to="/messages" className="w-full py-2 rounded-xl bg-palette-dark text-white font-semibold shadow hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-palette-dark/20 transition-all duration-200 flex items-center justify-center">
            <FaEnvelope className="w-5 h-5 mr-2" />
            View Messages
          </Link>
        </div>

        <div className="bg-white border border-palette-mid rounded-2xl p-6 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
          <h3 className="text-lg font-bold text-palette-dark mb-2">Recent Parcels</h3>
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

      {/* Station Performance Analytics */}
      <div className="bg-white border border-palette-mid rounded-2xl p-8 mb-8 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-xl font-bold text-palette-dark mb-6">Station Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Rate */}
          <div className="text-center p-6 bg-palette-beige rounded-xl border border-palette-mid">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-palette-dark">Delivery Rate</h4>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {stats.totalParcels > 0 ? Math.round((stats.deliveredParcels / stats.totalParcels) * 100) : 0}%
            </p>
            <p className="text-sm text-palette-mid mt-1">
              {stats.deliveredParcels} of {stats.totalParcels} delivered
            </p>
          </div>

          {/* Transit Efficiency */}
          <div className="text-center p-6 bg-palette-light rounded-xl border border-palette-mid">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTruck className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-palette-dark">In Transit</h4>
            <p className="text-3xl font-bold text-blue-500 mt-2">
              {stats.totalParcels > 0 ? Math.round((stats.inTransitParcels / stats.totalParcels) * 100) : 0}%
            </p>
            <p className="text-sm text-palette-mid mt-1">
              {stats.inTransitParcels} parcels moving
            </p>
          </div>

          {/* Pending Processing */}
          <div className="text-center p-6 bg-palette-beige rounded-xl border border-palette-mid">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-palette-dark">Pending</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.totalParcels > 0 ? Math.round((stats.pendingParcels / stats.totalParcels) * 100) : 0}%
            </p>
            <p className="text-sm text-palette-mid mt-1">
              {stats.pendingParcels} awaiting processing
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-white border border-palette-mid rounded-2xl p-8 shadow-xl animate-fade-in-up hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="card-header">
          <h3 className="text-xl font-bold text-palette-dark mb-4">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/parcels/new"
            className="flex items-center p-4 bg-palette-dark text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FaBox className="w-6 h-6 mr-3" />
            <div>
              <p className="font-medium">Create New Parcel</p>
              <p className="text-sm opacity-90">Send a new parcel</p>
            </div>
          </Link>
          
          <Link
            to="/messages"
            className="flex items-center p-4 bg-palette-beige text-palette-dark rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FaEnvelope className="w-6 h-6 mr-3" />
            <div>
              <p className="font-medium">View Messages</p>
              <p className="text-sm opacity-90">Check communications</p>
            </div>
          </Link>
          
          <Link
            to="/track"
            className="flex items-center p-4 bg-palette-mid text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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