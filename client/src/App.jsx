import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ServicesPage from './pages/public/ServicesPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerTrackingView from './pages/customer/CustomerTrackingView';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import KycUploadView from './pages/provider/KycUploadView';
import ProviderEarningsView from './pages/provider/ProviderEarningsView';
import ProviderReviewsView from './pages/provider/ProviderReviewsView';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKycDesk from './pages/admin/AdminKycDesk';
import AdminProvidersView from './pages/admin/AdminProvidersView';
import AdminComplaintsView from './pages/admin/AdminComplaintsView';
import AdminAiReviewsView from './pages/admin/AdminAiReviewsView';
import AdminAnalyticsView from './pages/admin/AdminAnalyticsView';
import AdminAuditLogsView from './pages/admin/AdminAuditLogsView';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/track"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerTrackingView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/track/:bookingId"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerTrackingView />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Protected Routes */}
                <Route
                  path="/provider/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['provider', 'admin']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/kyc"
                  element={
                    <ProtectedRoute allowedRoles={['provider', 'admin']}>
                      <KycUploadView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/earnings"
                  element={
                    <ProtectedRoute allowedRoles={['provider', 'admin']}>
                      <ProviderEarningsView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/reviews"
                  element={
                    <ProtectedRoute allowedRoles={['provider', 'admin']}>
                      <ProviderReviewsView />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/kyc-desk"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminKycDesk />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/providers"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminProvidersView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminComplaintsView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/ai-reviews"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAiReviewsView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAnalyticsView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAuditLogsView />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
