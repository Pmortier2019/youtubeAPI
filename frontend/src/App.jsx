import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ReviewPage from './pages/admin/ReviewPage'
import PayoutPage from './pages/admin/PayoutPage'
import StatsPage from './pages/admin/StatsPage'
import CampaignsPage from './pages/admin/CampaignsPage'
import SoundLibraryPage from './pages/admin/SoundLibraryPage'
import ParticipationsPage from './pages/admin/ParticipationsPage'
import PayoutsAdminPage from './pages/admin/PayoutsAdminPage'
import UsersPage from './pages/admin/UsersPage'
import PaymentMethodsPage from './pages/admin/PaymentMethodsPage'
import MyStatsPage from './pages/creator/MyStatsPage'
import MyPayoutPage from './pages/creator/MyPayoutPage'
import CampaignsBrowsePage from './pages/creator/CampaignsBrowsePage'
import EarningsPage from './pages/creator/EarningsPage'
import MyChannelsPage from './pages/creator/MyChannelsPage'
import MyShortsPage from './pages/creator/MyShortsPage'
import CreatorSoundLibraryPage from './pages/creator/SoundLibraryPage'

function AppRoutes() {
  const { role } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />

      {/* Admin routes inside Layout */}
      <Route path="/admin/review" element={
        <ProtectedRoute role="ADMIN">
          <Layout><ReviewPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/stats" element={
        <ProtectedRoute role="ADMIN">
          <Layout><StatsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/payout" element={
        <ProtectedRoute role="ADMIN">
          <Layout><PayoutPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/sounds" element={
        <ProtectedRoute role="ADMIN">
          <Layout><SoundLibraryPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/campaigns" element={
        <ProtectedRoute role="ADMIN">
          <Layout><CampaignsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/participations" element={
        <ProtectedRoute role="ADMIN">
          <Layout><ParticipationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/payouts" element={
        <ProtectedRoute role="ADMIN">
          <Layout><PayoutsAdminPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute role="ADMIN">
          <Layout><UsersPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/payment-methods" element={
        <ProtectedRoute role="ADMIN">
          <Layout><PaymentMethodsPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Creator routes inside Layout */}
      <Route path="/me/stats" element={
        <ProtectedRoute role="CREATOR">
          <Layout><MyStatsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/me/payout" element={
        <ProtectedRoute role="CREATOR">
          <Layout><MyPayoutPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/campaigns" element={
        <ProtectedRoute role="CREATOR">
          <Layout><CampaignsBrowsePage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/me/earnings" element={
        <ProtectedRoute role="CREATOR">
          <Layout><EarningsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/creator/channels" element={
        <ProtectedRoute role="CREATOR">
          <Layout><MyChannelsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/creator/shorts" element={
        <ProtectedRoute role="CREATOR">
          <Layout><MyShortsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/sounds" element={
        <ProtectedRoute role="CREATOR">
          <Layout><CreatorSoundLibraryPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={
        <Navigate to={role === 'ADMIN' ? '/admin/review' : role === 'CREATOR' ? '/me/stats' : '/login'} replace />
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
