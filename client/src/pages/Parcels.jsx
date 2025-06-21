import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Parcels = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [parcels, setParcels] = useState([]);
  const [filter, setFilter] = useState('all');

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

  const filteredParcels = filter === 'all' 
    ? parcels 
    : parcels.filter(parcel => parcel.status === filter);

  if (loading) {
    return (
      <DashboardLayout title="Railway Parcels">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Railway Parcels">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Railway Parcels</h2>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input py-1"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="lost">Lost</option>
          </select>
          <Link
            to="/parcels/new"
            className="btn-primary"
          >
            New Parcel
          </Link>
        </div>
      </div>

      {parcels.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParcels.map(parcel => (
                  <tr key={parcel.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {parcel.tracking_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        parcel.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        parcel.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        parcel.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        parcel.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {parcel.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.senderStation?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.receiverStation?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.sender_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.receiver_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/parcel/${parcel.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No parcels found. Create a new parcel to get started.</p>
          <Link to="/parcels/new" className="btn-primary mt-4 inline-block">
            Create New Parcel
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Parcels; 