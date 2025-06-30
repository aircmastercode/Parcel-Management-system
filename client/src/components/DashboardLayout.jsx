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
  FaTrain,
  FaChevronDown
} from 'react-icons/fa';

const DashboardLayout = ({ children, title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
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
    <div className="min-h-screen bg-palette-light">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}></div>
        </div>
      )}

      {/* Sidebar - Always Fixed */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full shadow-2xl border-r border-palette-mid bg-palette-dark">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-palette-mid/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-palette-beige to-palette-mid rounded-lg flex items-center justify-center">
                <FaTrain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Railway PMS</span>
            </div>
            <button className="lg:hidden text-white hover:text-palette-beige transition-colors" onClick={toggleSidebar}>
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          {/* User info */}
          <div className="px-6 py-6 border-b border-palette-mid/30">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-palette-beige rounded-full flex items-center justify-center">
                <FaUser className="w-4 h-4 text-palette-dark" />
              </div>
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-white font-semibold truncate drop-shadow-sm">{currentUser?.name || 'Loading...'}</p>
                <p className="text-palette-beige text-sm truncate drop-shadow-sm">{currentUser?.station?.name || 'Loading station...'}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-lg"></div>
                  <span className="text-xs text-green-400 drop-shadow-sm font-medium">Online</span>
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
                  className={`relative flex items-center px-4 py-3 text-sm transition-all duration-200 group ${
                    active
                      ? 'font-bold bg-palette-beige text-palette-dark rounded-2xl'
                      : 'text-white hover:bg-palette-beige/20 hover:text-palette-beige rounded-2xl'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  style={active ? { boxShadow: 'none' } : {}}
                >
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-3 bg-palette-beige rounded-r-full shadow-lg ring-2 ring-palette-beige/30 transition-all duration-200"></div>
                  )}
                  <Icon className={`mr-3 transition-all duration-200 ${active ? 'w-6 h-6 text-palette-dark' : 'w-5 h-5 text-white group-hover:text-palette-beige'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t border-palette-mid/30">
            {/* Developer Credit */}
            <DeveloperCredit variant="dark" className="mb-3" showSocialLinks={true} />
            
            <button
              className="flex items-center w-full px-4 py-3 text-white hover:text-palette-beige hover:bg-palette-beige/10 rounded-2xl transition-all duration-200 group hover:font-medium"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-72">
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
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-palette-beige transition-colors"
                >
                  <div className="w-6 h-6 bg-palette-beige rounded-full flex items-center justify-center">
                    <FaUser className="w-3 h-3 text-palette-dark" />
                  </div>
                  <FaChevronDown className="w-3 h-3 text-palette-mid" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-palette-mid py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-palette-mid hover:bg-palette-beige hover:text-palette-dark transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
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