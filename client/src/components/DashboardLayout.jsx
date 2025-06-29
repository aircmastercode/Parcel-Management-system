import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationSystem from './NotificationSystem';
import DeveloperCredit from './DeveloperCredit';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaBox, 
  FaEnvelope, 
  FaSignOutAlt, 
  FaUser, 
  FaBuilding, 
  FaChartBar,
  FaCog,
  FaBell,
  FaSearch,
  FaTrain
} from 'react-icons/fa';

const DashboardLayout = ({ children, title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleLogout = () => {
    logout(true); // Show success message for manual logout
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FaHome },
    { name: 'Parcels', path: '/parcels', icon: FaBox },
    { name: 'Messages', path: '/messages', icon: FaEnvelope },
    ...(currentUser?.role === 'master' ? [{ name: 'Master View', path: '/master-dashboard', icon: FaBuilding }] : [])
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full shadow-2xl border-r border-white/10" style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <div className="flex items-center">
              <div className="w-10 h-10 gradient-railway rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <FaTrain className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white drop-shadow-sm">Railway PMS</span>
                <p className="text-xs text-blue-100 drop-shadow-sm">Management System</p>
              </div>
            </div>
            <button className="lg:hidden text-white hover:text-blue-200 transition-colors" onClick={toggleSidebar}>
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          {/* User info */}
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex items-center">
              <div className="w-12 h-12 gradient-railway-success rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FaUser className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate drop-shadow-sm">{currentUser?.name || 'Loading...'}</p>
                <p className="text-blue-100 text-sm truncate drop-shadow-sm">{currentUser?.station?.name || 'Loading station...'}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-lg"></div>
                  <span className="text-xs text-green-200 drop-shadow-sm font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group ${
                    active
                      ? 'bg-white/25 text-white shadow-xl backdrop-blur-sm border border-white/30 font-semibold'
                      : 'text-blue-50 hover:bg-white/15 hover:text-white hover:shadow-lg hover:font-medium'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="truncate">{item.name}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t border-white/10">
            {/* Developer Credit */}
            <DeveloperCredit variant="dark" className="mb-3" showSocialLinks={true} />
            
            <button
              className="flex items-center w-full px-4 py-3 text-blue-50 hover:text-white hover:bg-white/15 rounded-2xl transition-all duration-200 group hover:font-medium"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button 
                className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none mr-4 p-2 rounded-xl hover:bg-slate-100 transition-colors" 
                onClick={toggleSidebar}
              >
                <FaBars className="w-5 h-5" />
              </button>
              <h1 className="heading-primary text-gradient">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search bar */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search parcels, messages..."
                  className="block w-64 pl-10 pr-3 py-2.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Notifications */}
              <NotificationSystem />
              
              {/* User menu */}
              <div className="relative">
                <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/50 hover:bg-white transition-all duration-200">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-railway text-white font-bold shadow-lg">
                    {currentUser?.name?.charAt(0).toUpperCase() || <FaUser className="w-5 h-5" />}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className="text-sm font-semibold text-slate-700">{currentUser?.name || 'Loading...'}</p>
                    <p className="text-xs text-slate-500">{currentUser?.station?.code || 'Loading...'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-responsive py-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 