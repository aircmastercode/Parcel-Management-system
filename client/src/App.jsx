import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loaded components
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StationDashboard = lazy(() => import('./pages/StationDashboard'));
const MasterDashboard = lazy(() => import('./pages/MasterDashboard'));
const ParcelDetail = lazy(() => import('./pages/ParcelDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Parcels = lazy(() => import('./pages/Parcels'));
const Messages = lazy(() => import('./pages/Messages'));
const NewParcel = lazy(() => import('./pages/NewParcel'));

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    }>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/station-dashboard" element={
          <ProtectedRoute>
            <StationDashboard />
          </ProtectedRoute>
        } />

        <Route path="/master-dashboard" element={
          <ProtectedRoute requiredRole="master">
            <MasterDashboard />
          </ProtectedRoute>
        } />

        <Route path="/parcels" element={
          <ProtectedRoute>
            <Parcels />
          </ProtectedRoute>
        } />

        <Route path="/parcels/new" element={
          <ProtectedRoute>
            <NewParcel />
          </ProtectedRoute>
        } />

        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        <Route path="/parcel/:id" element={
          <ProtectedRoute>
            <ParcelDetail />
          </ProtectedRoute>
        } />

        {/* Default route - redirect to dashboard if logged in, otherwise login */}
        <Route path="/" element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
        
        {/* Admin redirect */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App; 