import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientAuthStore } from '../../store/clientAuthStore';
import { PlusCircle, ChevronRight, Clock, Building } from 'lucide-react';
import { ClientRequestService, ClientRequest } from '../../services/clientRequestService';
import { Spinner } from '../../components/ui/Spinner';

// Используем тип ClientRequest из сервиса

export const ClientRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all'); // Состояние для вкладок
  const [errorMessage, setError] = useState<string | null>(null);
  const { phoneNumber } = useClientAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRequests = async () => {
      if (!phoneNumber) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Выполняем миграцию данных из localStorage, если это не было сделано
        await ClientRequestService.migrateLocalStorageForPhone(phoneNumber);
        
        // Загружаем обращения из Firebase
        const userRequests = await ClientRequestService.getRequestsByPhone(phoneNumber);
        console.log('Loaded requests from Firebase:', userRequests);
        
        setRequests(userRequests);
        setError(null);
      } catch (error) {
        console.error('Failed to load requests:', error);
        setError('Не удалось загрузить ваши обращения. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, [phoneNumber]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string; icon: JSX.Element; label: string }> = {
      new: { 
        color: 'text-blue-800 dark:text-blue-300', 
        bgColor: 'bg-blue-100 dark:bg-blue-900', 
        label: 'Новая',
        icon: (
          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        )
      },
      processing: { 
        color: 'text-yellow-800 dark:text-yellow-300', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900', 
        label: 'В обработке',
        icon: (
          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      },
      document_sent: { 
        color: 'text-indigo-800 dark:text-indigo-300', 
        bgColor: 'bg-indigo-100 dark:bg-indigo-900', 
        label: 'Документ отправлен',
        icon: (
          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
            <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
          </svg>
        )
      },
      document_viewed: { 
        color: 'text-purple-800 dark:text-purple-300', 
        bgColor: 'bg-purple-100 dark:bg-purple-900', 
        label: 'Документ просмотрен',
        icon: (
          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        )
      },
      resolved: { 
        color: 'text-green-800 dark:text-green-300', 
        bgColor: 'bg-green-100 dark:bg-green-900', 
        label: 'Решена',
        icon: (
          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      },
      rejected: { 
        color: 'text-red-800 dark:text-red-300', 
        bgColor: 'bg-red-100 dark:bg-red-900', 
        label: 'Отклонена',
        icon: (
          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      },
    };

    const { color, bgColor, icon, label } = statusMap[status] || { 
      color: 'text-gray-800 dark:text-gray-300', 
      bgColor: 'bg-gray-100 dark:bg-gray-900', 
      label: status,
      icon: null
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
        {icon}
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Фильтрация запросов по активной вкладке
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['new', 'processing'].includes(request.status);
    if (activeTab === 'completed') return ['resolved', 'rejected'].includes(request.status);
    return true;
  });

  // Улучшенные анимации для элементов списка
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0, scale: 0.98 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      y: -10, 
      opacity: 0,
      transition: { duration: 0.2 }
    },
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Мои обращения</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление запросами и обращениями
          </p>
        </div>
        <button
          onClick={() => navigate('/client/dashboard/new-request')}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 w-full md:w-auto"
        >
          <PlusCircle size={18} className="mr-2" />
          Создать обращение
        </button>
      </div>
      
      {/* Вкладки для фильтрации - улучшенный дизайн с продвинутыми анимациями */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.5 
        }}
        className="flex overflow-x-auto mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-1.5 relative"
      >
        <nav className="flex w-full relative">
          {/* Улучшенный анимированный индикатор активной вкладки с тенью и градиентной обводкой */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-gray-700 shadow-md z-0 
                      border border-indigo-100 dark:border-indigo-900"
            layoutId="tabIndicator"
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30, 
              mass: 1
            }}
            style={{
              width: `calc(100% / 3)`, // Ширина зависит от количества вкладок
              left: activeTab === 'all' ? '0%' : activeTab === 'active' ? '33.333%' : '66.666%'
            }}
          />
          
          {/* Все запросы */}
          <motion.button
            onClick={() => setActiveTab('all')}
            className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm z-10 relative
                      transition-all duration-300 ease-out
                      ${activeTab === 'all' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ 
                y: activeTab === 'all' ? 0 : 0,
                opacity: activeTab === 'all' ? 1 : 0.8
              }}
              className="flex items-center justify-center"
            >
              <motion.span 
                animate={{ 
                  fontWeight: activeTab === 'all' ? 600 : 500,
                  scale: activeTab === 'all' ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                Все запросы
              </motion.span>
              {activeTab === 'all' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                >
                  <motion.span 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                  />
                </motion.span>
              )}
            </motion.span>
          </motion.button>
          
          {/* Активные */}
          <motion.button
            onClick={() => setActiveTab('active')}
            className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm z-10 relative
                      transition-all duration-300 ease-out
                      ${activeTab === 'active' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ 
                y: activeTab === 'active' ? 0 : 0,
                opacity: activeTab === 'active' ? 1 : 0.8
              }}
              className="flex items-center justify-center"
            >
              <motion.span 
                animate={{ 
                  fontWeight: activeTab === 'active' ? 600 : 500,
                  scale: activeTab === 'active' ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                Активные
              </motion.span>
              {activeTab === 'active' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                >
                  <motion.span 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                  />
                </motion.span>
              )}
            </motion.span>
          </motion.button>
          
          {/* Завершенные */}
          <motion.button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm z-10 relative
                      transition-all duration-300 ease-out
                      ${activeTab === 'completed' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ 
                y: activeTab === 'completed' ? 0 : 0,
                opacity: activeTab === 'completed' ? 1 : 0.8
              }}
              className="flex items-center justify-center"
            >
              <motion.span 
                animate={{ 
                  fontWeight: activeTab === 'completed' ? 600 : 500,
                  scale: activeTab === 'completed' ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                Завершенные
              </motion.span>
              {activeTab === 'completed' && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                >
                  <motion.span 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                  />
                </motion.span>
              )}
            </motion.span>
          </motion.button>
        </nav>
      </motion.div>

      {loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-center py-12"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="rounded-full h-16 w-16 border-t-3 border-b-3 border-indigo-500"
          />
        </motion.div>
      ) : filteredRequests.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="rounded-xl p-8 text-center my-8"
        >
          <motion.div 
            className="bg-indigo-100 dark:bg-indigo-900 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <motion.svg 
              className="h-12 w-12 text-indigo-600 dark:text-indigo-300" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
            >
              <motion.path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </motion.svg>
          </motion.div>
          <motion.h3 
            className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            У вас пока нет обращений
          </motion.h3>
          <motion.p 
            className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Создайте новое обращение, чтобы начать работу с сервисом. Мы поможем вам решить ваши вопросы и проблемы.
          </motion.p>
          <motion.button
            onClick={() => navigate('/client/dashboard/new-request')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Создать обращение
          </motion.button>
          </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            variants={containerVariants}
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка обращений...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 px-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Обращений не найдено</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Создайте новое обращение, чтобы начать работу с сервисом.  
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <motion.div 
                key={request.id}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/client/dashboard/requests/${request.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                          Запрос #{request.id.substring(0, 6)}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{request.reason_type}</h3>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <Clock size={16} className="mr-1.5" />
                          {formatDate(request.created_at)}
                        </div>
                        
                        {request.mfo_name && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Building size={16} className="mr-1.5" />
                            <span className="mr-1.5">{request.mfo_name}</span>
                            {request.organization_type && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {request.organization_type === 'bvu' ? 'БВУ' : 'МФО'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Нажмите, чтобы просмотреть подробности</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </motion.div>
            ))
          )}</motion.div>
        </AnimatePresence>
      )}

      {/* Показать сообщение об ошибке, если есть */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
