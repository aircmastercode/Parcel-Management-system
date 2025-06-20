import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaHome, FaBox, FaEnvelope, FaSignOutAlt, FaUser, FaBuilding } from 'react-icons/fa';

const DashboardLayout = ({ children, title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-primary-800 shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 bg-primary-900">
            <span className="text-xl font-semibold text-white">PMS</span>
            <button className="text-white" onClick={toggleSidebar}>
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            <SidebarContent currentUser={currentUser} />
          </div>
          
          {/* Logout button */}
          <div className="p-4 border-t border-primary-700">
            <button
              className="flex items-center w-full px-4 py-2 text-white rounded-md hover:bg-primary-700"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-primary-800">
          <div className="flex items-center h-16 px-6 bg-primary-900">
            <span className="text-xl font-semibold text-white">PMS</span>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            <SidebarContent currentUser={currentUser} />
          </div>
          
          {/* Logout button */}
          <div className="p-4 border-t border-primary-700">
            <button
              className="flex items-center w-full px-4 py-2 text-white rounded-md hover:bg-primary-700"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button className="lg:hidden text-gray-500 focus:outline-none" onClick={toggleSidebar}>
                <FaBars className="w-6 h-6" />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-gray-800">{title}</h1>
            </div>
            
            <div className="flex items-center">
              <div className="relative ml-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {currentUser?.name}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white">
                    {currentUser?.name?.charAt(0).toUpperCase() || <FaUser />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

// Sidebar content component
const SidebarContent = ({ currentUser }) => {
  const isMaster = currentUser?.role === 'master';
  
  return (
    <nav className="mt-5 px-4">
      <Link 
        to="/dashboard"
        className="flex items-center px-4 py-2 text-white rounded-md hover:bg-primary-700"
      >
        <FaHome className="mr-3" />
        <span>Dashboard</span>
      </Link>
      
      <Link 
        to="/parcels"
        className="flex items-center px-4 py-2 mt-2 text-white rounded-md hover:bg-primary-700"
      >
        <FaBox className="mr-3" />
        <span>Parcels</span>
      </Link>
      
      <Link 
        to="/messages"
        className="flex items-center px-4 py-2 mt-2 text-white rounded-md hover:bg-primary-700"
      >
        <FaEnvelope className="mr-3" />
        <span>Messages</span>
      </Link>
      
      {isMaster && (
        <Link 
          to="/master-dashboard"
          className="flex items-center px-4 py-2 mt-2 text-white rounded-md hover:bg-primary-700"
        >
          <FaBuilding className="mr-3" />
          <span>Master View</span>
        </Link>
      )}
      
      <div className="mt-8">
        <h3 className="px-3 text-xs font-semibold text-white uppercase tracking-wider">
          Railway Station Information
        </h3>
        <div className="mt-2 px-3 py-2 text-white bg-primary-700 rounded-md">
          <p className="text-sm font-medium">{currentUser?.station?.name}</p>
          <p className="text-xs mt-1">Station Code: {currentUser?.station?.code}</p>
          <p className="text-xs mt-1">User ID: {currentUser?.name}</p>
        </div>
      </div>
    </nav>
  );
};

export default DashboardLayout; 