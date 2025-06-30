import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { generateQRCodeDataURL, generateTrackingURL, downloadQRCode } from '../utils/qrGenerator';
import { 
  FaBox, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowDown,
  FaCamera,
  FaUpload,
  FaTimes,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaWeightHanging,
  FaCalendar,
  FaEdit,
  FaHistory,
  FaQrcode,
  FaDownload,
  FaShare
} from 'react-icons/fa';

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
  const [stations, setStations] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    loadParcelData();
    loadStations();
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

  const loadStations = async () => {
    try {
      const response = await api.get('/api/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Error loading stations:', error);
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

  const handleDownloadQR = async () => {
    if (!parcel) return;
    
    try {
      await downloadQRCode(parcel.tracking_number, {
        from: parcel.senderStation?.name,
        to: parcel.receiverStation?.name,
        status: parcel.status.replace('_', ' ').toUpperCase()
      });
      toast.success('QR code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
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

  const getTrackingSteps = () => {
    const steps = [
      { status: 'pending', label: 'Pending', description: 'Parcel is waiting to be processed' },
      { status: 'in_transit', label: 'In Transit', description: 'Parcel is being transported' },
      { status: 'delivered', label: 'Delivered', description: 'Parcel has been delivered' }
    ];
    
    const currentIndex = steps.findIndex(step => step.status === parcel?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-palette-dark mb-2">Parcel PMS-{parcel?.tracking_number}</h2>
            <p className="text-palette-mid mb-6">Track and manage parcel details</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(parcel?.status)}`}>
              {React.createElement(getStatusIcon(parcel?.status), { className: "w-4 h-4 mr-2" })}
              {parcel?.status?.replace('_', ' ').toUpperCase()}
            </span>
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="btn-outline flex items-center"
            >
              <FaQrcode className="w-4 h-4 mr-2" />
              QR Code
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        {showQRCode && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-center">
                <FaShare className="w-5 h-5 mr-2" />
                Share & Track Parcel
              </h4>
              <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
                <img 
                  src={generateQRCodeDataURL(generateTrackingURL(parcel?.tracking_number), 200)}
                  alt="Tracking QR Code"
                  className="mx-auto mb-4"
                />
                <p className="text-sm text-slate-600 mb-4">
                  Scan to track: {parcel?.tracking_number}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDownloadQR}
                    className="btn-primary text-sm"
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateTrackingURL(parcel?.tracking_number));
                      toast.success('Tracking URL copied to clipboard');
                    }}
                    className="btn-secondary text-sm"
                  >
                    <FaShare className="w-4 h-4 mr-2" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Parcel Image */}
          {parcel?.image_url && (
            <div className="card bg-white border border-mid-gray rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <FaCamera className="w-5 h-5 mr-2 text-blue-600" />
                Parcel Image
              </h3>
              <div className="flex justify-center">
                <img 
                  src={parcel.image_url} 
                  alt="Parcel" 
                  className="max-h-96 rounded-xl shadow-md"
                />
              </div>
            </div>
          )}
          
          {/* Image Upload */}
          {!parcel?.image_url && (
            <div className="card bg-white border border-mid-gray rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <FaUpload className="w-5 h-5 mr-2 text-blue-600" />
                Upload Parcel Image
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="parcel-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    onClick={uploadImage}
                    disabled={!image || uploadingImage}
                    className="btn-primary bg-gradient-to-r from-railway-primary to-railway-primary-light text-black font-semibold rounded-xl hover:from-railway-primary-dark hover:to-railway-primary focus:outline-none focus:ring-2 focus:ring-railway-primary focus:ring-offset-2 transition-all duration-200 shadow-lg"
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {imagePreview && (
                  <div className="relative">
                    <p className="text-sm text-slate-700 mb-2">Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-60 rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          <div className="card bg-white border border-mid-gray rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-black mb-6 flex items-center">
              <FaHistory className="w-5 h-5 mr-2 text-blue-600" />
              Tracking Timeline
            </h3>
            <div className="space-y-4">
              {getTrackingSteps().map((step, index) => (
                <div key={step.status} className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <FaCheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className={`text-sm font-medium ${
                      step.completed ? 'text-black' : 'text-slate-700'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                  {step.current && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="card bg-white border border-mid-gray rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-black mb-6 flex items-center">
              <FaEnvelope className="w-5 h-5 mr-2 text-blue-600" />
              Messages
            </h3>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 rounded-xl ${
                      message.from_station === currentUser.station_id
                        ? 'bg-blue-50 ml-8 border-l-4 border-blue-400'
                        : message.to_station === currentUser.station_id
                          ? 'bg-gray-50 mr-8 border-l-4 border-gray-400'
                          : 'bg-gray-50 border border-dashed border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <FaUser className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="font-medium">{message.sender?.name}</span>
                        <span className="mx-2 text-slate-400">→</span>
                        <span className="font-medium">{message.receiver?.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-800">{message.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No messages yet.</p>
              )}
            </div>
            
            {/* New Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Send Message To:
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={targetStation || ''}
                  onChange={(e) => setTargetStation(Number(e.target.value))}
                  required
                >
                  <option value="">Select Station</option>
                  {currentUser.station_id !== parcel?.sender_station_id && (
                    <option value={parcel?.sender_station_id}>
                      {parcel?.senderStation?.name} (Sender)
                    </option>
                  )}
                  {currentUser.station_id !== parcel?.receiver_station_id && (
                    <option value={parcel?.receiver_station_id}>
                      {parcel?.receiverStation?.name} (Receiver)
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message:
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parcel Information */}
          <div className="card bg-white border border-mid-gray rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
              <FaBox className="w-5 h-5 mr-2 text-blue-600" />
              Parcel Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FaMapMarkerAlt className="w-4 h-4 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm text-slate-700">From</p>
                  <p className="font-medium">{parcel?.senderStation?.name}</p>
                  <p className="text-xs text-slate-500">{parcel?.senderStation?.code}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaMapMarkerAlt className="w-4 h-4 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm text-slate-700">To</p>
                  <p className="font-medium">{parcel?.receiverStation?.name}</p>
                  <p className="text-xs text-slate-500">{parcel?.receiverStation?.code}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaWeightHanging className="w-4 h-4 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm text-slate-700">Weight</p>
                  <p className="font-medium">{parcel?.weight} kg</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCalendar className="w-4 h-4 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm text-slate-700">Created</p>
                  <p className="font-medium">{new Date(parcel?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sender/Receiver Details */}
          <div className="card bg-white border border-mid-gray rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
              <FaUser className="w-5 h-5 mr-2 text-blue-600" />
              Contact Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-black mb-2">Sender</h4>
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">{parcel?.sender_name}</p>
                  {parcel?.sender_contact && (
                    <div className="flex items-center text-sm text-slate-700">
                      <FaPhone className="w-3 h-3 mr-2" />
                      {parcel.sender_contact}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-black mb-2">Receiver</h4>
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">{parcel?.receiver_name}</p>
                  {parcel?.receiver_contact && (
                    <div className="flex items-center text-sm text-slate-700">
                      <FaPhone className="w-3 h-3 mr-2" />
                      {parcel.receiver_contact}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card bg-white border border-mid-gray rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
              <FaEdit className="w-5 h-5 mr-2 text-blue-600" />
              Update Status
            </h3>
            
            <form onSubmit={handleStatusChange} className="space-y-4">
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="lost">Lost</option>
              </select>
              
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Update Status
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParcelDetail; 