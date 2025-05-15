import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FileText, PlusCircle, User } from 'lucide-react';
import { cn } from '../../utils/cn';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: 'Главная' },
    { path: '/dashboard/requests', icon: <FileText size={20} />, label: 'Заявки' },
    { path: '/dashboard/new-request', icon: <PlusCircle size={20} />, label: 'Создать' },
    { path: '/dashboard/profile', icon: <User size={20} />, label: 'Профиль' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <motion.div
                className={cn(
                  "flex flex-col items-center justify-center",
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-400" 
                    : "text-gray-500 dark:text-gray-400"
                )}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <div className="mb-1">{item.icon}</div>
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
