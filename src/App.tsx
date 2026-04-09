import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import ToastContainer from '@/components/common/ToastContainer'
import AppLayout from '@/components/layout/AppLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import GroupDetailPage from '@/pages/groups/GroupDetailPage'
import GroupsPage from '@/pages/groups/GroupsPage'
import AboutPage from '@/pages/about/AboutPage'
import PrivacyPage from '@/pages/privacy/PrivacyPage'
import TermsPage from '@/pages/terms/TermsPage'
import ContactPage from '@/pages/contact/ContactPage'
import { useAuthStore } from '@/store/authStore'
import AssistantPage from '@/assistant/pages/AssistantPage'
import AssistantWidget from '@/components/common/AssistantWidget'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<GroupsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {isAuthenticated ? <AssistantWidget /> : null}

      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
