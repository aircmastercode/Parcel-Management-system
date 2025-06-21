import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const ParcelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [parcel, setParcel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [targetStation, setTargetStation] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    loadParcelData();
  }, [id]);
  
  const loadParcelData = async () => {
    try {
      setLoading(true);
      
      const parcelResponse = await api.get(`/api/parcels/${id}`);
      setParcel(parcelResponse.data);
      setNewStatus(parcelResponse.data.status);
      
      if (parcelResponse.data.messages) {
        setMessages(parcelResponse.data.messages);
      }
      
      // Set default target station
      if (currentUser.station_id === parcelResponse.data.sender_station_id) {
        setTargetStation(parcelResponse.data.receiver_station_id);
      } else {
        setTargetStation(parcelResponse.data.sender_station_id);
      }
      
    } catch (error) {
      console.error('Error loading parcel:', error);
      toast.error('Error loading parcel data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await api.put(`/api/parcels/${id}/status`, {
        status: newStatus
      });
      
      toast.success('Parcel status updated successfully');
      loadParcelData();
    } catch (error) {
      console.error('Error updating parcel status:', error);
      toast.error('Failed to update parcel status');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (!targetStation) {
      toast.error('Please select a recipient station');
      return;
    }
    
    try {
      setLoading(true);
      
      await api.post('/api/messages', {
        to_station: targetStation,
        parcel_id: parcel.id,
        content: newMessage
      });
      
      setNewMessage('');
      toast.success('Message sent successfully');
      loadParcelData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setLoading(false);
    }
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

  const uploadImage = async (e) => {
    e.preventDefault();
    
    if (!image) {
      toast.error('Please select an image first');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('image', image);
      
      await api.post(`/api/parcels/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Image uploaded successfully');
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      loadParcelData();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Helper to get station name from ID
  const getStationName = (stationId) => {
    if (stationId === parcel?.sender_station_id) {
      return parcel?.senderStation?.name;
    } else if (stationId === parcel?.receiver_station_id) {
      return parcel?.receiverStation?.name;
    }
    return 'Unknown Station';
  };

  if (loading && !parcel) {
    return (
      <DashboardLayout title="Parcel Details">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Parcel Details">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Parcel {parcel?.tracking_number}</h2>
        <span className={`px-4 py-1 rounded-full text-sm font-medium ${
          parcel?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          parcel?.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
          parcel?.status === 'delivered' ? 'bg-green-100 text-green-800' :
          parcel?.status === 'returned' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {parcel?.status?.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Parcel information */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Parcel Information</h3>
          
          {/* Display parcel image if available */}
          {parcel?.image_url && (
            <div className="mb-6 flex justify-center">
              <img 
                src={parcel.image_url} 
                alt="Parcel" 
                className="max-h-96 rounded-lg shadow-md"
              />
            </div>
          )}
          
          {/* Image upload form if no image exists */}
          {!parcel?.image_url && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-md font-medium text-gray-800 mb-3">Upload Parcel Image</h4>
              <div className="flex items-center">
                <input
                  type="file"
                  id="parcel-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="form-input"
                />
                <button 
                  onClick={uploadImage}
                  disabled={!image || uploadingImage}
                  className="ml-4 btn-primary"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-60 rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-sm text-gray-500">From Station</p>
              <p className="font-medium">{parcel?.senderStation?.name} ({parcel?.senderStation?.code})</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To Station</p>
              <p className="font-medium">{parcel?.receiverStation?.name} ({parcel?.receiverStation?.code})</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sender</p>
              <p className="font-medium">{parcel?.sender_name}</p>
              <p className="text-sm text-gray-500">{parcel?.sender_contact}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Receiver</p>
              <p className="font-medium">{parcel?.receiver_name}</p>
              <p className="text-sm text-gray-500">{parcel?.receiver_contact}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="font-medium">{parcel?.weight} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{new Date(parcel?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {parcel?.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{parcel?.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Form */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
          <form onSubmit={handleStatusChange}>
            <div className="flex items-center">
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-input mr-4"
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="lost">Lost</option>
              </select>
              <button type="submit" className="btn-primary">
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Messages section */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Messages</h3>
          
          {/* Message list */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-lg ${
                    message.from_station === currentUser.station_id
                      ? 'bg-primary-50 ml-12'
                      : message.to_station === currentUser.station_id
                        ? 'bg-gray-50 mr-12'
                        : 'bg-gray-50 border border-dashed border-gray-300' // For copies to other stations
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{message.sender?.name}</span>
                      <span className="mx-2 text-gray-500">→</span>
                      <span className="font-medium">{message.receiver?.name}</span>
                      
                      {/* Indicate if this is a copy */}
                      {message.to_station !== parcel?.sender_station_id && 
                       message.to_station !== parcel?.receiver_station_id && 
                       message.is_master_copied && !message.content.startsWith('[COPY]') && (
                        <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          FYI Copy
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No messages yet.</p>
            )}
          </div>
          
          {/* Information about message visibility */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <p>Note: All messages are visible to all stations for transparency and better coordination.</p>
          </div>
          
          {/* New message form with explicit station selection */}
          <form onSubmit={handleSendMessage}>
            <div className="mt-4">
              <div className="mb-4">
                <label htmlFor="target-station" className="form-label">
                  Send Message To:
                </label>
                <select
                  id="target-station"
                  className="form-input"
                  value={targetStation || ''}
                  onChange={(e) => setTargetStation(Number(e.target.value))}
                  required
                >
                  <option value="">Select Station</option>
                  
                  {/* Only show sender station if user is not from sender station */}
                  {currentUser.station_id !== parcel?.sender_station_id && (
                    <option value={parcel?.sender_station_id}>
                      {parcel?.senderStation?.name} (Sender)
                    </option>
                  )}
                  
                  {/* Only show receiver station if user is not from receiver station */}
                  {currentUser.station_id !== parcel?.receiver_station_id && (
                    <option value={parcel?.receiver_station_id}>
                      {parcel?.receiverStation?.name} (Receiver)
                    </option>
                  )}
                </select>
              </div>

              <label htmlFor="message" className="form-label">
                Message Content
              </label>
              <textarea
                id="message"
                rows={3}
                className="form-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                required
              ></textarea>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn-primary">
                Send Message
              </button>
              {targetStation && (
                <p className="mt-2 text-sm text-gray-500">
                  This message will be sent to: {getStationName(targetStation)}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParcelDetail; 