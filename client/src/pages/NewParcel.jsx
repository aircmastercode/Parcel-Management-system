import React, { useState, useEffect, useRef } from 'react';
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
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        fileInputRef.current.value = "";
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and JPG images are allowed');
        fileInputRef.current.value = "";
        return;
      }
      
      setImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      
      // Create FormData object for sending data + file
      const parcelData = new FormData();
      
      // Add text fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'sender_station_id' || key === 'receiver_station_id') {
          parcelData.append(key, parseInt(formData[key]));
        } else if (key === 'weight' && formData[key]) {
          parcelData.append(key, parseFloat(formData[key]));
        } else {
          parcelData.append(key, formData[key]);
        }
      });
      
      // Add image to FormData if exists
      if (image) {
        parcelData.append('image', image);
      }
      
      // API request with FormData
      const response = await api.post('/api/parcels', parcelData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
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
      <DashboardLayout title="New Railway Parcel">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="New Railway Parcel">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Railway Parcel</h2>
        <p className="text-gray-600">Fill in the details to create a new parcel for railway transport</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
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
              <label htmlFor="image" className="form-label">Parcel Image (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative mx-auto">
                      <img 
                        src={imagePreview} 
                        alt="Parcel preview" 
                        className="mx-auto h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="image"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image"
                            name="image"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
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