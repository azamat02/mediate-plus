import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { HomePage } from './pages/dashboard/HomePage';
import { MediationsPage } from './pages/dashboard/MediationsPage';
import { PartnersPage } from './pages/dashboard/PartnersPage';
import { StatisticsPage } from './pages/dashboard/StatisticsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { ClientOfferPage } from './pages/client/ClientOfferPage';
import { ClientAuthPage } from './pages/client/ClientAuthPage';
import { RequestSubmittedPage } from './pages/client/RequestSubmittedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { ClientRequestsPage } from './pages/client/ClientRequestsPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';
import { NewRequestPage } from './pages/client/NewRequestPage';
import { RequestDetailPage } from './pages/client/RequestDetailPage';
import { ViewDocumentPage } from './pages/client/ViewDocumentPage';
import { TermsPage } from './pages/client/TermsPage';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useClientAuthStore } from './store/clientAuthStore';
// Импорт DebugPage удален, так как он больше не используется

function App() {
  const { initialize } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { isAuthenticated, loadState } = useClientAuthStore();

  useEffect(() => {
    initialize();
    // Загружаем состояние аутентификации клиента при запуске приложения
    loadState();
  }, [initialize, loadState]);

  useEffect(() => {
    // Apply the theme on initial load
    setTheme(theme);
    // Добавляем класс для плавных переходов на уровне всего приложения
    document.documentElement.classList.add('transition-colors', 'duration-300');
  }, [theme, setTheme]);
  
  // Компонент для защищенных маршрутов клиентского кабинета с улучшенной обработкой
  const ProtectedClientRoute = ({ children }: { children: React.ReactNode }) => {
    // Добавляем анимацию перехода
    return isAuthenticated ? (
      <Suspense fallback={<div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>}>
        {children}
      </Suspense>
    ) : <Navigate to="/client/auth" replace />;
  };

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Default route now goes to client auth page */}
          <Route path="/" element={<Navigate to="/client/auth" replace />} />
          
          {/* Client routes с улучшенными переходами */}
          <Route path="/client/auth" element={<ClientAuthPage />} />
          <Route path="/client/request-submitted" element={<RequestSubmittedPage />} />
          <Route path="/client/:clientId/offer" element={<ClientOfferPage />} />
          <Route path="/client/:clientId/document" element={<ClientOfferPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Клиентский личный кабинет с улучшенным дизайном */}
          <Route path="/client/dashboard" element={
            <ProtectedClientRoute>
              <ClientDashboardPage />
            </ProtectedClientRoute>
          }>
            <Route index element={<Navigate to="/client/dashboard/requests" replace />} />
            <Route path="requests" element={<ClientRequestsPage />} />
            <Route path="requests/:requestId" element={<RequestDetailPage />} />
            <Route path="documents/:requestId/:documentId" element={<ViewDocumentPage />} />
            <Route path="new-request" element={<NewRequestPage />} />
            <Route path="profile" element={<ClientProfilePage />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="mediations" element={<MediationsPage />} />
            <Route path="partners" element={<PartnersPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;