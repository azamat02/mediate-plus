import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  BarChart2, 
  Settings, 
  User, 
  X, 
  LogOut,
  Handshake,
  Sun,
  Moon,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isMobile, 
  isOpen, 
  onClose 
}) => {
  const location = useLocation();
  const { signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const navItems: NavItem[] = [
    { label: 'Главная', path: '/dashboard', icon: <Home size={20} /> },
    { label: 'Медиации', path: '/dashboard/mediations', icon: <Handshake size={20} /> },
    { label: 'Партнеры', path: '/dashboard/partners', icon: <Users size={20} /> },
    { label: 'Статистика', path: '/dashboard/statistics', icon: <BarChart2 size={20} /> },
    { label: 'Настройки', path: '/dashboard/settings', icon: <Settings size={20} /> },
    { label: 'Профиль', path: '/dashboard/profile', icon: <User size={20} /> },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const sidebarClasses = cn(
    'flex flex-col h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    'transition-all duration-300 ease-in-out',
    {
      'fixed inset-y-0 left-0 z-50 w-72': isMobile,
      'w-72': !isMobile,
      'translate-x-0': isOpen || !isMobile,
      '-translate-x-full': !isOpen && isMobile,
    }
  );

  // Анимация для пунктов меню
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <AnimatePresence>
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={theme === 'dark'
                ? "/images/logo-dark.svg"
                : "/images/logo-light.svg"
              }
              alt="Kelisim Logo"
              className="h-8 w-auto"
            />
          </Link>
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          )}
        </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Навигация</h3>
          </div>
          <ul className="space-y-1 px-2 mb-6">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.li 
                  key={item.path}
                  custom={index}
                  variants={itemVariants}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      {
                        'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200': isActive,
                        'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50': !isActive,
                      }
                    )}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <span className={cn("mr-3", { "text-indigo-500 dark:text-indigo-400": isActive })}>{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
          
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Поддержка</h3>
          </div>
          <ul className="space-y-1 px-2">
            <motion.li custom={navItems.length + 1} variants={itemVariants}>
              <a
                href="#"
                className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                <span className="mr-3"><HelpCircle size={20} /></span>
                Справка
              </a>
            </motion.li>
            <motion.li custom={navItems.length + 2} variants={itemVariants}>
              <a
                href="#"
                className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                <span className="mr-3"><MessageSquare size={20} /></span>
                Обратная связь
              </a>
            </motion.li>
          </ul>
        </motion.div>
      </nav>

      <div className="p-5 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Тема интерфейса
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 0 : 180 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-indigo-600" />
              )}
            </motion.div>
          </motion.button>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2.5 mt-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg dark:text-red-400 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors duration-200"
        >
          <LogOut size={20} className="mr-3" />
          Выйти из системы
        </motion.button>
      </div>
    </aside>
    </AnimatePresence>
  );
};