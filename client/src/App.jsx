import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// ErrorBoundary for catching React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Optionally log error to an error reporting service
    // console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Something went wrong</h1>
          <p className="text-red-600 mb-2">{this.state.error && this.state.error.toString()}</p>
          <pre className="bg-red-100 text-red-800 p-4 rounded-lg overflow-x-auto max-w-2xl text-xs">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
const PublicTracking = lazy(() => import('./pages/PublicTracking'));

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
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/track/:trackingNumber?" element={<PublicTracking />} />
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

          {/* Default route - redirect to public tracking if not logged in */}
          <Route path="/" element={
            currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/track" replace />
          } />
          
          {/* Admin redirect */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App; 