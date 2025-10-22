import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, PlusCircle, User, LogOut, Bell, Moon, Sun, Menu, X } from 'lucide-react';
import { useClientAuthStore } from '../../store/clientAuthStore';
import { PageTransition } from '../../components/ui/PageTransition';
import { useThemeStore } from '../../store/themeStore';

export const ClientDashboardPage: React.FC = () => {
  const { signOut, fullName } = useClientAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(2);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/client/auth');
  };
  
  // Функция для получения имени пользователя или первой буквы имени
  const getUserInitial = () => {
    if (fullName && fullName.length > 0) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return fullName.charAt(0).toUpperCase();
    }
    return 'M';
  };
  
  // Демо-данные для уведомлений
  const notifications = [
    { id: 1, title: 'Новая заявка', message: 'Ваша заявка №12345 была принята в обработку', time: '5 минут назад', read: false },
    { id: 2, title: 'Напоминание', message: 'Завтра в 10:00 состоится встреча с медиатором', time: '1 час назад', read: true },
    { id: 3, title: 'Обновление статуса', message: 'Статус заявки №12345 изменен на "В процессе"', time: '2 часа назад', read: false },
  ];
  
  // Removed unused stats data
  
  // Эффект для обработки закрытия мобильного меню при изменении маршрута
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Современный хедер с градиентом и стеклянным эффектом */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {/* Кнопка мобильного меню */}
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden mr-3 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                </button>
                
                <Link to="/client/dashboard" className="flex items-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center"
                  >
                    <img
                      src={theme === 'dark'
                        ? "/images/logo-dark.svg"
                        : "/images/logo-light.svg"
                      }
                      alt="Kelisim Logo"
                      className="h-8 w-auto mr-2"
                    />
                  </motion.div>
                </Link>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Переключатель темы */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                {/* Кнопка уведомлений */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Выпадающее меню уведомлений */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Уведомления</h3>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">Отметить все</span>
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div 
                                key={notification.id} 
                                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-l-2 ${!notification.read ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-transparent'}`}
                              >
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">У вас нет уведомлений</p>
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                          <button className="text-xs text-center w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium py-1">
                            Показать все уведомления
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Профиль пользователя */}
                <div className="relative">
                  <button 
                    onClick={() => navigate('/client/dashboard/profile')}
                    className="flex items-center space-x-2 p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                      {getUserInitial()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pr-1 hidden md:block">{fullName || 'Пользователь'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Мобильное меню */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-40"
            >
              <div className="px-4 py-3 space-y-1">
                <Link 
                  to="/client/dashboard/requests"
                  className={`flex items-center px-3 py-2 rounded-lg ${location.pathname === '/client/dashboard/requests' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <FileText size={18} className="mr-3" />
                  <span className="font-medium">Мои обращения</span>
                </Link>
                
                <Link 
                  to="/client/dashboard/new-request"
                  className={`flex items-center px-3 py-2 rounded-lg ${location.pathname === '/client/dashboard/new-request' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <PlusCircle size={18} className="mr-3" />
                  <span className="font-medium">Создать обращение</span>
                </Link>
                
                <Link 
                  to="/client/dashboard/profile"
                  className={`flex items-center px-3 py-2 rounded-lg ${location.pathname === '/client/dashboard/profile' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <User size={18} className="mr-3" />
                  <span className="font-medium">Мой профиль</span>
                </Link>
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 rounded-lg w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={18} className="mr-3" />
                  <span className="font-medium">Выйти</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content container with increased top padding */}
        <div className="max-w-7xl mx-auto w-full px-4 py-6">
          {/* Content will be rendered through Outlet */}
        </div>
        
        {/* Основной контент с улучшенным дизайном */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className=" rounded-xl overflow-hidden"
          >
            <Outlet />
          </motion.div>
        </div>
      
        {/* Улучшенная нижняя навигация в стиле мобильного приложения */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 shadow-lg border-t border-gray-200 dark:border-gray-700 md:hidden"
        >
          <div className="flex justify-around items-center h-16 px-2">
            <NavItem 
              to="/client/dashboard/requests" 
              label="Заявки" 
              icon={<FileText size={20} />} 
              active={location.pathname === '/client/dashboard/requests'} 
            />
            <NavItem 
              to="/client/dashboard/new-request" 
              label="Создать" 
              icon={<PlusCircle size={20} />} 
              active={location.pathname === '/client/dashboard/new-request'} 
            />
            <NavItem 
              to="/client/dashboard/profile" 
              label="Профиль" 
              icon={<User size={20} />} 
              active={location.pathname === '/client/dashboard/profile'} 
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSignOut}
              className="flex flex-col items-center justify-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
            >
              <LogOut size={20} className="mb-1" />
              <span className="text-xs font-medium">Выйти</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, active }) => {
  const navigate = useNavigate();
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate(to)}
      className="flex flex-col items-center justify-center px-3 py-2 relative"
    >
      <div className="relative">
        {active && (
          <motion.div
            layoutId="bottomNavIndicator"
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <div 
          className={`p-2 rounded-full mb-1 transition-all duration-200 ${active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-600 dark:text-gray-300'}`}
        >
          {icon}
        </div>
      </div>
      <span 
        className={`text-xs font-medium transition-colors duration-200 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
      >
        {label}
      </span>
    </motion.button>
  );
};
