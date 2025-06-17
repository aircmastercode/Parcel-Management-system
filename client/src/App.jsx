import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loaded components
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StationDashboard = lazy(() => import('./pages/StationDashboard'));
const MasterDashboard = lazy(() => import('./pages/MasterDashboard'));
const ParcelDetail = lazy(() => import('./pages/ParcelDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

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

        <Route path="/parcel/:id" element={
          <ProtectedRoute>
            <ParcelDetail />
          </ProtectedRoute>
        } />

        {/* Default route - redirect to dashboard if logged in, otherwise login */}
        <Route path="/" element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App; 