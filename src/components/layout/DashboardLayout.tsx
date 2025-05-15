import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Spinner size="lg" />
        </motion.div>
      </div>
    );
  }

  // If no session and not loading, redirect will happen via the first useEffect
  if (!session && !loading) {
    return null;
  }
  
  // Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить логику поиска
    console.log('Searching for:', searchQuery);
  };
  
  // Список уведомлений для демо
  const notifications = [
    { id: 1, title: 'Новая заявка', message: 'Поступила новая заявка на медиацию', time: '5 минут назад', read: false },
    { id: 2, title: 'Напоминание', message: 'Завтра в 10:00 состоится встреча', time: '1 час назад', read: true },
    { id: 3, title: 'Обновление статуса', message: 'Статус заявки #12345 изменен на "В процессе"', time: '2 часа назад', read: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMobile={isMobile} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="px-4 h-16 flex items-center justify-between">
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Menu size={24} />
              </button>
            )}
            
            {/* Поисковая строка */}
            <div className="flex-1 max-w-xl mx-auto px-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full py-1.5 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
              </form>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Кнопка уведомлений */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    2
                  </span>
                </button>
                
                {/* Выпадающее меню уведомлений */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Уведомления</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            У вас нет новых уведомлений
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                              <div 
                                key={notification.id} 
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer ${
                                  notification.read ? '' : 'bg-indigo-50 dark:bg-indigo-900/20'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                          Посмотреть все уведомления
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Профиль пользователя */}
              <div className="relative">
                <button 
                  onClick={() => navigate('/dashboard/profile')} 
                  className="flex items-center space-x-2 text-sm focus:outline-none group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white overflow-hidden group-hover:ring-2 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-700 transition-all duration-200">
                    <span>ИП</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 transition-colors duration-200">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
        
        {/* Нижняя навигация для мобильных устройств */}
        {isMobile && <BottomNavigation />}
      </div>
    </div>
  );
};