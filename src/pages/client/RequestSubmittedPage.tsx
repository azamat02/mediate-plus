import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ClientAuthHeader } from '../../components/client/ClientAuthHeader';
import { useNavigate } from 'react-router-dom';

export const RequestSubmittedPage: React.FC = () => {
  const navigate = useNavigate();
  const requestNumber = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ClientAuthHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg dark:border dark:border-gray-700 text-center animate-fadeIn">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full scale-150 animate-pulse-slow"></div>
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500 dark:text-green-400 animate-scaleIn" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-400 dark:to-teal-400 mt-4">
            Запрос успешно отправлен
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Ваш запрос успешно отправлен и будет обработан в ближайшее время. Наши специалисты свяжутся с вами по указанному номеру телефона.
          </p>
          
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Номер вашего запроса
            </p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {requestNumber}
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/client/dashboard/requests')}
              className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Мои обращения
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
