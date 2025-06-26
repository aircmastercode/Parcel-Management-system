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
            <h2 className="text-3xl font-bold text-gray-900">Parcel Management</h2>
            <p className="mt-2 text-gray-600">Track and manage all railway parcels</p>
          </div>
          <Link
            to="/parcels/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
          >
            <FaPlus className="w-5 h-5 mr-2" />
            New Parcel
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search parcels..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
            <span className="text-sm text-gray-600">
              {filteredAndSortedParcels.length} of {parcels.length} parcels
            </span>
          </div>
        </div>
      </div>

      {/* Parcels Table */}
      {filteredAndSortedParcels.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('tracking_number')}
                  >
                    <div className="flex items-center">
                      Tracking #
                      {React.createElement(getSortIcon('tracking_number'), { className: "ml-2 w-4 h-4" })}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {React.createElement(getSortIcon('status'), { className: "ml-2 w-4 h-4" })}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('senderStation')}
                  >
                    <div className="flex items-center">
                      From
                      {React.createElement(getSortIcon('senderStation'), { className: "ml-2 w-4 h-4" })}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('receiverStation')}
                  >
                    <div className="flex items-center">
                      To
                      {React.createElement(getSortIcon('receiverStation'), { className: "ml-2 w-4 h-4" })}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Receiver
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {React.createElement(getSortIcon('createdAt'), { className: "ml-2 w-4 h-4" })}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedParcels.map(parcel => {
                  const StatusIcon = getStatusIcon(parcel.status);
                  return (
                    <tr key={parcel.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <FaBox className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 font-mono">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{parcel.senderStation?.name}</div>
                          <div className="text-gray-500 text-xs">{parcel.senderStation?.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{parcel.receiverStation?.name}</div>
                          <div className="text-gray-500 text-xs">{parcel.receiverStation?.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{parcel.sender_name}</div>
                          {parcel.sender_contact && (
                            <div className="text-gray-500 text-xs">{parcel.sender_contact}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{parcel.receiver_name}</div>
                          {parcel.receiver_contact && (
                            <div className="text-gray-500 text-xs">{parcel.receiver_contact}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/parcel/${parcel.id}`} 
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No parcels found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create a new parcel to get started.'
            }
          </p>
          <Link 
            to="/parcels/new" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
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