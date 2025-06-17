import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const NewParcel = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stations, setStations] = useState([]);

  const [formData, setFormData] = useState({
    sender_station_id: '',
    receiver_station_id: '',
    weight: '',
    description: '',
    sender_name: '',
    receiver_name: '',
    sender_contact: '',
    receiver_contact: '',
    initial_message: ''
  });

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    // If user is not master, set sender_station_id to current user's station
    if (currentUser && currentUser.role !== 'master') {
      setFormData(prev => ({
        ...prev,
        sender_station_id: currentUser.station_id.toString()
      }));
    }
  }, [currentUser]);

  const loadStations = async () => {
    try {
      const response = await api.get('/api/stations');
      setStations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error('Failed to load stations');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.sender_station_id) {
      toast.error('Please select a sender station');
      return;
    }
    
    if (!formData.receiver_station_id) {
      toast.error('Please select a receiver station');
      return;
    }
    
    if (formData.sender_station_id === formData.receiver_station_id) {
      toast.error('Sender and receiver stations must be different');
      return;
    }
    
    if (!formData.sender_name || !formData.receiver_name) {
      toast.error('Sender and receiver names are required');
      return;
    }
    
    // Validate initial message
    if (!formData.initial_message.trim()) {
      toast.error('Initial message is required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Convert data types
      const payload = {
        ...formData,
        sender_station_id: parseInt(formData.sender_station_id),
        receiver_station_id: parseInt(formData.receiver_station_id),
        weight: formData.weight ? parseFloat(formData.weight) : null
      };
      
      const response = await api.post('/api/parcels', payload);
      toast.success('Parcel created successfully');
      
      // Navigate to parcel detail page
      navigate(`/parcel/${response.data.id}`);
    } catch (error) {
      console.error('Error creating parcel:', error);
      toast.error('Failed to create parcel');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="New Parcel">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="New Parcel">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Parcel</h2>
        <p className="text-gray-600">Fill in the details to create a new parcel</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Station Information</h3>
            </div>

            <div>
              <label htmlFor="sender_station_id" className="form-label">Sender Station</label>
              <select
                id="sender_station_id"
                name="sender_station_id"
                value={formData.sender_station_id}
                onChange={handleChange}
                className="form-input"
                disabled={currentUser.role !== 'master'}
                required
              >
                <option value="">Select Sender Station</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="receiver_station_id" className="form-label">Receiver Station</label>
              <select
                id="receiver_station_id"
                name="receiver_station_id"
                value={formData.receiver_station_id}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Receiver Station</option>
                {stations.map(station => (
                  <option 
                    key={station.id} 
                    value={station.id}
                    disabled={station.id.toString() === formData.sender_station_id}
                  >
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Parcel Information</h3>
            </div>

            <div>
              <label htmlFor="weight" className="form-label">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="description" className="form-label">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Sender/Receiver Details</h3>
            </div>

            <div>
              <label htmlFor="sender_name" className="form-label">Sender Name</label>
              <input
                type="text"
                id="sender_name"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="receiver_name" className="form-label">Receiver Name</label>
              <input
                type="text"
                id="receiver_name"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="sender_contact" className="form-label">Sender Contact</label>
              <input
                type="text"
                id="sender_contact"
                name="sender_contact"
                value={formData.sender_contact}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="receiver_contact" className="form-label">Receiver Contact</label>
              <input
                type="text"
                id="receiver_contact"
                name="receiver_contact"
                value={formData.receiver_contact}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Initial Message</h3>
              <label htmlFor="initial_message" className="form-label">Message</label>
              <textarea
                id="initial_message"
                name="initial_message"
                value={formData.initial_message}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="Enter an initial message about this parcel"
                required
              ></textarea>
              <p className="mt-1 text-sm text-gray-500">This message will be sent to the receiver station.</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/parcels')}
              className="btn-outline mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Parcel'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewParcel; 