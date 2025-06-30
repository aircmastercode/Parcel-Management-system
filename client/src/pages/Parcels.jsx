import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaBox, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowDown,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit
} from 'react-icons/fa';

const Parcels = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [parcels, setParcels] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadParcels();
  }, [currentUser]);

  const loadParcels = async () => {
    try {
      setLoading(true);
      
      let response;
      if (currentUser.role === 'master') {
        response = await api.get('/api/parcels');
      } else {
        response = await api.get(`/api/parcels/station/${currentUser.station_id}`);
      }
      
      setParcels(response.data);
    } catch (error) {
      console.error('Error loading parcels:', error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'in_transit': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'delivered': return 'text-green-600 bg-green-100 border-green-200';
      case 'returned': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'lost': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return FaSort;
    return sortOrder === 'asc' ? FaSortUp : FaSortDown;
  };

  const handleUpdateStatus = async (parcelId, newStatus) => {
    try {
      await api.put(`/api/parcels/${parcelId}/status`, { status: newStatus });
      loadParcels(); // Reload parcels after update
    } catch (error) {
      console.error('Error updating parcel status:', error);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'in_transit',
      'in_transit': 'delivered',
      'delivered': 'delivered' // Already delivered
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  const filteredAndSortedParcels = parcels
    .filter(parcel => {
      const matchesFilter = filter === 'all' || parcel.status === filter;
      const matchesSearch = searchQuery === '' || 
        parcel.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parcel.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parcel.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parcel.senderStation?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parcel.receiverStation?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'senderStation' || sortBy === 'receiverStation') {
        aValue = a[sortBy]?.name || '';
        bValue = b[sortBy]?.name || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <DashboardLayout title="Railway Parcels">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Railway Parcels">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-palette-dark">Parcels</h1>
            <p className="mt-2 text-sm text-palette-mid">
              Manage and track all parcels in your station
            </p>
          </div>
          <Link
            to="/parcels/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-palette-beige text-palette-dark font-semibold rounded-xl hover:bg-palette-mid focus:outline-none focus:ring-2 focus:ring-palette-dark focus:ring-offset-2 transition-all duration-200 shadow-lg"
          >
            <FaPlus className="w-5 h-5 mr-2" />
            New Parcel
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-palette-beige rounded-lg flex items-center justify-center">
                <FaBox className="w-5 h-5 text-palette-dark" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-palette-mid">Total Parcels</p>
                <p className="text-2xl font-bold text-palette-dark">{parcels.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-palette-beige rounded-lg flex items-center justify-center">
                <FaClock className="w-5 h-5 text-palette-dark" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-palette-mid">Pending</p>
                <p className="text-2xl font-bold text-palette-dark">{parcels.filter(p => p.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-palette-beige rounded-lg flex items-center justify-center">
                <FaTruck className="w-5 h-5 text-palette-dark" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-palette-mid">In Transit</p>
                <p className="text-2xl font-bold text-palette-dark">{parcels.filter(p => p.status === 'in_transit').length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-palette-beige rounded-lg flex items-center justify-center">
                <FaCheckCircle className="w-5 h-5 text-palette-dark" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-palette-mid">Delivered</p>
                <p className="text-2xl font-bold text-palette-dark">{parcels.filter(p => p.status === 'delivered').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-palette-mid w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search parcels..."
                  className="form-input pl-10 w-full sm:w-64 text-palette-dark"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                className="form-input w-full sm:w-auto text-palette-dark"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSort('tracking_number')}
                className={`p-2 rounded-lg ${sortBy === 'tracking_number' ? 'bg-palette-dark text-white' : 'bg-palette-light text-palette-mid'}`}
              >
                <FaSort className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('status')}
                className={`p-2 rounded-lg ${sortBy === 'status' ? 'bg-palette-dark text-white' : 'bg-palette-light text-palette-mid'}`}
              >
                <FaSort className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('senderStation')}
                className={`p-2 rounded-lg ${sortBy === 'senderStation' ? 'bg-palette-dark text-white' : 'bg-palette-light text-palette-mid'}`}
              >
                <FaSort className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('receiverStation')}
                className={`p-2 rounded-lg ${sortBy === 'receiverStation' ? 'bg-palette-dark text-white' : 'bg-palette-light text-palette-mid'}`}
              >
                <FaSort className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('createdAt')}
                className={`p-2 rounded-lg ${sortBy === 'createdAt' ? 'bg-palette-dark text-white' : 'bg-palette-light text-palette-mid'}`}
              >
                <FaSort className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="large" />
              <span className="ml-3 text-palette-mid">Loading parcels...</span>
            </div>
          </div>
        )}

        {/* Parcels List */}
        {!loading && (
          <>
            {filteredAndSortedParcels.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th className="text-palette-dark">Tracking Number</th>
                        <th className="text-palette-dark">Sender</th>
                        <th className="text-palette-dark">Receiver</th>
                        <th className="text-palette-dark">Route</th>
                        <th className="text-palette-dark">Status</th>
                        <th className="text-palette-dark">Date</th>
                        <th className="text-palette-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedParcels.map((parcel) => (
                        <tr key={parcel.id}>
                          <td>
                            <div className="font-medium text-palette-dark">{parcel.tracking_number}</div>
                          </td>
                          <td>
                            <div className="text-palette-dark">{parcel.sender_name}</div>
                            <div className="text-sm text-palette-mid">{parcel.sender_contact}</div>
                          </td>
                          <td>
                            <div className="text-palette-dark">{parcel.receiver_name}</div>
                            <div className="text-sm text-palette-mid">{parcel.receiver_contact}</div>
                          </td>
                          <td>
                            <div className="text-sm text-palette-dark">
                              {parcel.senderStation?.name} → {parcel.receiverStation?.name}
                            </div>
                          </td>
                          <td>
                            <span className={`status-${parcel.status}`}>
                              {parcel.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="text-sm text-palette-dark">
                              {new Date(parcel.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/parcel/${parcel.id}`}
                                className="btn-outline btn-sm"
                              >
                                <FaEye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleUpdateStatus(parcel.id, getNextStatus(parcel.status))}
                                className="btn-primary btn-sm"
                                disabled={parcel.status === 'delivered'}
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <FaBox className="w-16 h-16 text-palette-mid mx-auto mb-4" />
                <h3 className="text-lg font-medium text-palette-dark mb-2">No parcels found</h3>
                <p className="text-palette-mid mb-6">
                  {searchQuery || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create a new parcel to get started.'
                  }
                </p>
                <Link 
                  to="/parcels/new" 
                  className="btn-primary"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Create New Parcel
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Parcels; 