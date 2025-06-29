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
  FaSortDown
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
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-charcoal">Parcel Management</h2>
            <p className="mt-2 text-secondary-text">Track and manage all railway parcels</p>
          </div>
          <Link
            to="/parcels/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-railway-primary to-railway-primary-light text-white font-semibold rounded-xl hover:from-railway-primary-dark hover:to-railway-primary focus:outline-none focus:ring-2 focus:ring-railway-primary focus:ring-offset-2 transition-all duration-200 shadow-lg"
          >
            <FaPlus className="w-5 h-5 mr-2" />
            New Parcel
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-soft-gray rounded-2xl shadow-lg p-6 mb-8 border border-mid-gray">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-railway-primary" />
            </div>
            <input
              type="text"
              placeholder="Search parcels..."
              className="block w-full pl-10 pr-3 py-3 border border-mid-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-railway-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="h-5 w-5 text-railway-primary" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-mid-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-railway-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center md:justify-end">
            <span className="text-sm text-secondary-text">
              {filteredAndSortedParcels.length} of {parcels.length} parcels
            </span>
          </div>
        </div>
      </div>

      {/* Parcels Table */}
      {filteredAndSortedParcels.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-mid-gray">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-mid-gray">
              <thead className="bg-gradient-to-r from-soft-gray to-railway-primary/10">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider cursor-pointer hover:bg-soft-gray transition-colors"
                    onClick={() => handleSort('tracking_number')}
                  >
                    <div className="flex items-center">
                      Tracking #
                      {React.createElement(getSortIcon('tracking_number'), { className: "ml-2 w-4 h-4 text-railway-primary" })}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider cursor-pointer hover:bg-soft-gray transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {React.createElement(getSortIcon('status'), { className: "ml-2 w-4 h-4 text-railway-primary" })}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider cursor-pointer hover:bg-soft-gray transition-colors"
                    onClick={() => handleSort('senderStation')}
                  >
                    <div className="flex items-center">
                      From
                      {React.createElement(getSortIcon('senderStation'), { className: "ml-2 w-4 h-4 text-railway-primary" })}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider cursor-pointer hover:bg-soft-gray transition-colors"
                    onClick={() => handleSort('receiverStation')}
                  >
                    <div className="flex items-center">
                      To
                      {React.createElement(getSortIcon('receiverStation'), { className: "ml-2 w-4 h-4 text-railway-primary" })}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider">
                    Receiver
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider cursor-pointer hover:bg-soft-gray transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {React.createElement(getSortIcon('createdAt'), { className: "ml-2 w-4 h-4 text-railway-primary" })}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-charcoal uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-mid-gray">
                {filteredAndSortedParcels.map(parcel => {
                  const StatusIcon = getStatusIcon(parcel.status);
                  return (
                    <tr key={parcel.id} className="hover:bg-soft-gray transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-railway-primary to-railway-primary-light rounded-lg flex items-center justify-center mr-3">
                            <FaBox className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-charcoal font-mono">
                            {parcel.tracking_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(parcel.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {parcel.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                        <div>
                          <div className="font-medium">{parcel.senderStation?.name}</div>
                          <div className="text-secondary-text text-xs">{parcel.senderStation?.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                        <div>
                          <div className="font-medium">{parcel.receiverStation?.name}</div>
                          <div className="text-secondary-text text-xs">{parcel.receiverStation?.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                        <div>
                          <div className="font-medium">{parcel.sender_name}</div>
                          {parcel.sender_contact && (
                            <div className="text-secondary-text text-xs">{parcel.sender_contact}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                        <div>
                          <div className="font-medium">{parcel.receiver_name}</div>
                          {parcel.receiver_contact && (
                            <div className="text-secondary-text text-xs">{parcel.receiver_contact}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/parcel/${parcel.id}`} 
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-railway-primary bg-railway-primary/10 hover:bg-railway-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-railway-primary transition-colors"
                        >
                          <FaEye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-mid-gray">
          <FaBox className="w-16 h-16 text-mid-gray mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal mb-2">No parcels found</h3>
          <p className="text-secondary-text mb-6">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create a new parcel to get started.'
            }
          </p>
          <Link 
            to="/parcels/new" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-railway-primary to-railway-primary-light text-white font-semibold rounded-xl hover:from-railway-primary-dark hover:to-railway-primary focus:outline-none focus:ring-2 focus:ring-railway-primary focus:ring-offset-2 transition-all duration-200 shadow-lg"
          >
            <FaPlus className="w-5 h-5 mr-2" />
            Create New Parcel
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Parcels; 