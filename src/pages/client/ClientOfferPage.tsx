import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OfferDocument } from '../../components/client/OfferDocument';
import { useClientAuthStore } from '../../store/clientAuthStore';

export const ClientOfferPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { fullName, iin } = useClientAuthStore();
  const [loading, setLoading] = useState(true);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [mfoName, setMfoName] = useState('');
  
  useEffect(() => {
    // В реальном приложении здесь был бы запрос к API для получения данных офферты
    // Для демо используем имитацию загрузки и данные из localStorage
    const fetchData = async () => {
      try {
        // Имитация задержки загрузки
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Проверяем, есть ли информация о запросе в localStorage
        const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
        const request = storedRequests.find((req: any) => req.id === clientId);
        
        if (request) {
          setMfoName(request.mfo_name);
        } else {
          // Если запрос не найден, используем тестовое название МФО
          setMfoName('Тойота Финанс Казахстан');
        }
        
        // Проверяем, была ли оферта уже принята
        const acceptedOffers = JSON.parse(localStorage.getItem('acceptedOffers') || '[]');
        if (acceptedOffers.includes(clientId)) {
          setOfferAccepted(true);
        }
      } catch (error) {
        console.error('Error fetching offer data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [clientId]);
  
  const handleAcceptOffer = () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // Для демо сохраняем в localStorage
      const acceptedOffers = JSON.parse(localStorage.getItem('acceptedOffers') || '[]');
      if (!acceptedOffers.includes(clientId)) {
        acceptedOffers.push(clientId);
        localStorage.setItem('acceptedOffers', JSON.stringify(acceptedOffers));
      }
      
      setOfferAccepted(true);
      
      // Обновляем статус запроса на "processing"
      const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      const updatedRequests = storedRequests.map((req: any) => {
        if (req.id === clientId) {
          return { ...req, status: 'processing' };
        }
        return req;
      });
      localStorage.setItem('clientRequests', JSON.stringify(updatedRequests));
      
      // Показываем сообщение об успехе
      setTimeout(() => {
        navigate('/client/dashboard/requests');
      }, 2000);
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };
  
  const handleRejectOffer = () => {
    // В реальном приложении здесь был бы запрос к API
    navigate('/client/dashboard/requests');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Оферта о медиации</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Пожалуйста, внимательно ознакомьтесь с условиями соглашения о медиации
          </p>
        </div>
        
        <OfferDocument 
          clientName={fullName} 
          iin={iin} 
          mfoName={mfoName} 
          date={new Date().toISOString()} 
        />
        
        {offerAccepted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-green-50 dark:bg-green-900 p-6 rounded-xl shadow-md text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-800 p-3">
                <svg className="h-8 w-8 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">Оферта успешно принята</h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Ваше обращение передано в работу. Медиатор свяжется с вами в ближайшее время.
            </p>
            <button
              onClick={() => navigate('/client/dashboard/requests')}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              Вернуться к обращениям
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={handleRejectOffer}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-base font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Отклонить
            </button>
            <button
              onClick={handleAcceptOffer}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Принять оферту
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
