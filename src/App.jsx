import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AssetDirectory from './pages/AssetDirectory';
import MaintenanceKanban from './pages/MaintenanceKanban';
import SystemAudit from './pages/SystemAudit';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import OrganizationSetup from './pages/OrganizationSetup';
import AllocationTransfer from './pages/AllocationTransfer';
import ResourceBooking from './pages/ResourceBooking';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import ErrorStates from './pages/ErrorStates';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AppContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard or error page if unauthorized
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <Layout>
              <AssetDirectory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Layout>
              <MaintenanceKanban />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Auditor']}>
            <Layout>
              <SystemAudit />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <UserProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <OrganizationSetup />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/allocation"
        element={
          <ProtectedRoute>
            <Layout>
              <AllocationTransfer />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <Layout>
              <ResourceBooking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/error-states"
        element={
          <ProtectedRoute>
            <Layout>
              <ErrorStates />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
