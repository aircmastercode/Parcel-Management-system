import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTrain, FaUsers, FaBuilding, FaPlus, FaEdit, FaTrash, FaEye, FaSignOutAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('users'); // Start with 'users' to show the main functionality
  
  // Modal states
  const [showStationModal, setShowStationModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form states
  const [stationForm, setStationForm] = useState({
    name: '',
    location: '',
    code: ''
  });
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    station_id: ''
  });
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'station' or 'user'

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('is_admin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    
    loadAdminData();
  }, [navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Get all stations
      const stationsResponse = await api.get('/api/admin/stations');
      setStations(stationsResponse.data);
      
      // Get all users
      const usersResponse = await api.get('/api/admin/users');
      setUsers(usersResponse.data);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error loading data');
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('is_admin');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Station CRUD operations
  const handleAddStation = () => {
    setCurrentStation(null);
    setStationForm({
      name: '',
      location: '',
      code: ''
    });
    setShowStationModal(true);
  };
  
  const handleEditStation = (station) => {
    setCurrentStation(station);
    setStationForm({
      name: station.name,
      location: station.location,
      code: station.code
    });
    setShowStationModal(true);
  };
  
  const handleDeleteStation = (station) => {
    setItemToDelete(station);
    setDeleteType('station');
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteStation = async () => {
    try {
      await api.delete(`/api/admin/stations/${itemToDelete.id}`);
      toast.success('Station deleted successfully');
      loadAdminData();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting station:', error);
      toast.error(error.response?.data?.message || 'Failed to delete station');
    }
  };
  
  const handleStationFormChange = (e) => {
    const { name, value } = e.target;
    setStationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStationSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentStation) {
        // Update existing station
        await api.put(`/api/admin/stations/${currentStation.id}`, stationForm);
        toast.success('Station updated successfully');
      } else {
        // Create new station
        await api.post('/api/admin/stations', stationForm);
        toast.success('Station created successfully');
      }
      setShowStationModal(false);
      loadAdminData();
    } catch (error) {
      console.error('Error saving station:', error);
      toast.error(error.response?.data?.message || 'Failed to save station');
    }
  };
  
  // User CRUD operations
  const handleAddUser = () => {
    setCurrentUser(null);
    setUserForm({
      name: '',
      email: '',
      phone: '',
      station_id: ''
    });
    setShowUserModal(true);
  };
  
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      station_id: user.station_id
    });
    setShowUserModal(true);
  };
  
  const handleDeleteUser = (user) => {
    setItemToDelete(user);
    setDeleteType('user');
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteUser = async () => {
    try {
      await api.delete(`/api/admin/users/${itemToDelete.id}`);
      toast.success('User deleted successfully');
      loadAdminData();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };
  
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Update existing user
        await api.put(`/api/admin/users/${currentUser.id}`, userForm);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await api.post('/api/admin/users', userForm);
        toast.success('User created successfully');
      }
      setShowUserModal(false);
      loadAdminData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('is_admin');
    delete api.defaults.headers.common['x-auth-token'];
    navigate('/admin/login');
    toast.info('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-slate-600">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50">
        <div className="container-responsive py-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 gradient-railway rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <FaTrain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="heading-primary text-gradient">Railway Admin Portal</h1>
              <p className="text-slate-600 font-medium">System administration and management</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="btn-outline flex items-center"
          >
            <FaSignOutAlt className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container-responsive py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="metric-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{users.length}</p>
                <p className="text-blue-600 text-sm mt-1">Active station users</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Railway Stations</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stations.length}</p>
                <p className="text-green-600 text-sm mt-1">Active stations</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FaBuilding className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">System Health</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">100%</p>
                <p className="text-purple-600 text-sm mt-1">All systems operational</p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FaTrain className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 mb-8 bg-white/50 backdrop-blur-sm rounded-t-2xl p-1">
          <button
            onClick={() => setView('users')}
            className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
              view === 'users'
                ? 'bg-white text-blue-600 shadow-lg border border-blue-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <FaUsers className="inline w-4 h-4 mr-2" />
            Station Users
          </button>
          <button
            onClick={() => setView('stations')}
            className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
              view === 'stations'
                ? 'bg-white text-blue-600 shadow-lg border border-blue-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <FaBuilding className="inline w-4 h-4 mr-2" />
            Railway Stations
          </button>
        </div>

        {/* Content based on active tab */}
        {view === 'users' ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-secondary">Manage Station Users</h2>
              <button className="btn-primary flex items-center" onClick={handleAddUser}>
                <FaPlus className="w-4 h-4 mr-2" />
                Add New User
              </button>
            </div>
            
            <div className="card-elevated">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Station</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="w-10 h-10 gradient-railway rounded-xl flex items-center justify-center mr-3 text-white font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <p className="text-sm text-slate-500">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="text-slate-900">{user.email}</p>
                        </td>
                        <td>
                          <p className="text-slate-600">{user.phone || 'N/A'}</p>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                              {user.station?.name} ({user.station?.code})
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button 
                              className="btn-ghost text-blue-600 hover:text-blue-800"
                              onClick={() => handleEditUser(user)}
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button 
                              className="btn-ghost text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-secondary">Manage Railway Stations</h2>
              <button className="btn-primary flex items-center" onClick={handleAddStation}>
                <FaPlus className="w-4 h-4 mr-2" />
                Add New Station
              </button>
            </div>
            
            <div className="card-elevated">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Users</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map(station => (
                      <tr key={station.id}>
                        <td>
                          <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg font-mono font-bold">
                            {station.code}
                          </span>
                        </td>
                        <td>
                          <p className="font-semibold text-slate-900">{station.name}</p>
                        </td>
                        <td>
                          <p className="text-slate-600">{station.location}</p>
                        </td>
                        <td>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                            {users.filter(u => u.station_id === station.id).length} users
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button 
                              className="btn-ghost text-blue-600 hover:text-blue-800"
                              onClick={() => handleEditStation(station)}
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button 
                              className="btn-ghost text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteStation(station)}
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Station Modal */}
      {showStationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleStationSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    {currentStation ? 'Edit Station' : 'Add New Station'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="code" className="form-label">Station Code</label>
                      <input
                        type="text"
                        name="code"
                        id="code"
                        required
                        className="form-input"
                        value={stationForm.code}
                        onChange={handleStationFormChange}
                        placeholder="e.g., CNB, DHN"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="form-label">Station Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="form-input"
                        value={stationForm.name}
                        onChange={handleStationFormChange}
                        placeholder="e.g., KANPUR CENTRAL JN."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="form-label">Location</label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        required
                        className="form-input"
                        value={stationForm.location}
                        onChange={handleStationFormChange}
                        placeholder="e.g., Kanpur"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse space-x-reverse space-x-3">
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {currentStation ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowStationModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUserSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    {currentUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="form-input"
                        value={userForm.name}
                        onChange={handleUserFormChange}
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="form-input"
                        value={userForm.email}
                        onChange={handleUserFormChange}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="form-label">Phone (Optional)</label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        className="form-input"
                        value={userForm.phone}
                        onChange={handleUserFormChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="station_id" className="form-label">Station</label>
                      <select
                        name="station_id"
                        id="station_id"
                        required
                        className="form-input"
                        value={userForm.station_id}
                        onChange={handleUserFormChange}
                      >
                        <option value="">Select a station</option>
                        {stations.map(station => (
                          <option key={station.id} value={station.id}>
                            {station.name} ({station.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse space-x-reverse space-x-3">
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {currentUser ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowUserModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-red-100">
                    <FaTrash className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      Confirm Delete
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Are you sure you want to delete this {deleteType}? This action cannot be undone.
                      </p>
                      {deleteType === 'user' && (
                        <p className="text-sm text-red-600 mt-2 font-medium">
                          This will immediately log out the user from all devices.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse space-x-reverse space-x-3">
                <button
                  type="button"
                  className="btn-danger"
                  onClick={deleteType === 'station' ? confirmDeleteStation : confirmDeleteUser}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;