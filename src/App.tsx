import React, { useEffect, Suspense, useState } from 'react';
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
import { Spinner } from './components/ui/Spinner';
// Импорт DebugPage удален, так как он больше не используется

// Компонент для защищенных маршрутов админа
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary-900">
        <Spinner size="lg" className="border-accent-500" />
      </div>
    );
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для защищенных маршрутов клиента
const ProtectedClientRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useClientAuthStore();
  
  // Добавляем анимацию перехода
  return isAuthenticated ? (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>}>
      {children}
    </Suspense>
  ) : <Navigate to="/client/auth" replace />;
};

function App() {
  const { initialize, session } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { loadState } = useClientAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initialize();
      // Загружаем состояние аутентификации клиента при запуске приложения
      await loadState();
      setInitializing(false);
    };
    
    init();
  }, [initialize, loadState]);

  useEffect(() => {
    // Apply the theme on initial load
    setTheme(theme);
    // Добавляем класс для плавных переходов на уровне всего приложения
    document.documentElement.classList.add('transition-colors', 'duration-300');
  }, [theme, setTheme]);
  
  // Показываем индикатор загрузки, пока инициализируемся
  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary-900">
        <Spinner size="lg" className="border-accent-500" />
      </div>
    );
  }

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
            <Route path="document/:requestId" element={<ViewDocumentPage />} />
            <Route path="new-request" element={<NewRequestPage />} />
            <Route path="profile" element={<ClientProfilePage />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={
            session ? <Navigate to="/dashboard" replace /> : <Navigate to="/admin/login" replace />
          } />
          
          <Route path="/admin/login" element={
            session ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          
          {/* Все маршруты дашборда защищены */}
          <Route path="/dashboard" element={
            <ProtectedAdminRoute>
              <DashboardLayout />
            </ProtectedAdminRoute>
          }>
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