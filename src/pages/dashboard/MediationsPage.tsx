import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, FileCheck, Mail, Clock, Plus, AlertCircle, X, MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useClientsStore } from '../../store/clientsStore';
import { getStatusLabel } from '../../utils/statusTranslations';
import { AddClientModal } from '../../components/clients/AddClientModal';
import { Spinner } from '../../components/ui/Spinner';
import { Client } from '../../types';
import { RequestDetailModal } from '../../components/requests/RequestDetailModal';
import { ChatService, ChatMessage } from '../../services/chatService';

// Интерфейс для обращений клиентов
interface ClientRequest {
  id: string;
  phone_number: string;
  iin?: string;
  reason_type: string;
  reason: string;
  status: string;
  created_at: string;
  mfo_name?: string;
  mfo_id?: string;
  organization_type?: 'bvu' | 'mfo';
  document_sent_at?: string;
  document_type?: string;
  document_signed_at?: string;
  messages?: ChatMessage[];
}

export const MediationsPage: React.FC = () => {
  const { clients, loading, initialize, error } = useClientsStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'clients' | 'requests'>('requests'); // По умолчанию показываем вкладку с обращениями
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Загружаем клиентов и обращения при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      // Загружаем клиентов
      await initialize();
      
      // Загружаем обращения клиентов из localStorage
      try {
        setRequestsLoading(true);
        const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
        
        // Загружаем сообщения для каждого запроса из Firebase Realtime Database
        const requestsWithMessages = await Promise.all(
          storedRequests.map(async (request: ClientRequest) => {
            try {
              const messages = await ChatService.getMessages(request.id);
              return { ...request, messages };
            } catch (error) {
              console.error(`Failed to load messages for request ${request.id}:`, error);
              return request;
            }
          })
        );
        
        setClientRequests(requestsWithMessages);
      } catch (error) {
        console.error('Failed to load client requests:', error);
      } finally {
        setRequestsLoading(false);
      }
      
      setInitialLoading(false);
    };
    
    loadData();
  }, [initialize]);

  // Фильтрация клиентов по поисковому запросу
  const filteredClients = clients.filter(client => 
    client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );
  
  // Фильтрация обращений клиентов по поисковому запросу
  const filteredRequests = clientRequests.filter(request => 
    request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.phone_number.includes(searchTerm) ||
    (request.reason_type && request.reason_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (request.mfo_name && request.mfo_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Обработчик успешного добавления клиента
  const handleClientAdded = (clientId: string) => {
    setSuccessMessage(`Клиент успешно добавлен и SMS отправлено автоматически. ID: ${clientId}`);
    setSelectedClientId(clientId);
    
    // Скрываем сообщение через 5 секунд
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };
  
  // Обработчик отправки документа клиенту
  const handleSendDocument = async (requestId: string, documentType: string) => {
    try {
      // Находим запрос по ID
      const requestIndex = clientRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) return;
      
      // Обновляем статус запроса
      const updatedRequests = [...clientRequests];
      const now = new Date().toISOString();
      
      updatedRequests[requestIndex] = {
        ...updatedRequests[requestIndex],
        status: 'document_sent',
        document_sent_at: now,
        document_type: documentType
      };
      
      // Сохраняем обновленные запросы в localStorage
      localStorage.setItem('clientRequests', JSON.stringify(updatedRequests));
      setClientRequests(updatedRequests);
      
      // Отправляем уведомление о документе в чат
      const documentTypeText = updatedRequests[requestIndex].document_type;
      await ChatService.sendMessage(
        requestId,
        'mediator',
        `Отправлен документ: ${documentTypeText}`
      );
      
      return true;
    } catch (error) {
      console.error('Error sending document:', error);
      return false;
    }
  };
  
  // Обработчик отправки сообщения в чат
  const handleSendMessage = async (requestId: string, text: string) => {
    try {
      // Отправляем сообщение в Firebase Realtime Database
      const message = await ChatService.sendMessage(requestId, 'mediator', text);
      
      if (message) {
        // Обновляем сообщения в состоянии
        const requestIndex = clientRequests.findIndex(req => req.id === requestId);
        if (requestIndex !== -1) {
          const updatedRequests = [...clientRequests];
          if (!updatedRequests[requestIndex].messages) {
            updatedRequests[requestIndex].messages = [];
          }
          
          updatedRequests[requestIndex].messages?.push(message);
          setClientRequests(updatedRequests);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return Promise.reject(error);
    }
  };

  // Функция для определения иконки статуса клиента
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Создан':
        return <Clock className="h-4 w-4" />;
      case 'Отправлено сообщение':
        return <Mail className="h-4 w-4" />;
      case 'Просмотрено':
      case 'Просмотрел документ':
        return <Eye className="h-4 w-4" />;
      case 'Договор подписан':
        return <FileCheck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Функция для определения цвета статуса клиента
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Создан':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'Отправлено сообщение':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Просмотрено':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Просмотрел документ':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Договор подписан':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  // Для перевода статуса используем функцию getStatusLabel из utils/statusTranslations.ts

  // Функция для определения цвета статуса обращения
  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Медиации</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление всеми вашими медиационными делами
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить тестового клиента
          </button>
        </div>
      </div>
      
      {/* Вкладки для переключения между клиентами и обращениями */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('clients')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'clients' 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Клиенты
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests' 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Обращения клиентов
            {clientRequests.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100">
                {clientRequests.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 flex items-start">
          <div className="flex-shrink-0">
            <div className="h-5 w-5 text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-green-800 dark:text-green-400">{successMessage}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-200 dark:hover:bg-green-800/50"
              >
                <span className="sr-only">Закрыть</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 flex items-start">
          <div className="flex-shrink-0">
            <div className="h-5 w-5 text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-200 dark:hover:bg-red-800/50"
              >
                <span className="sr-only">Закрыть</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Содержимое в зависимости от выбранной вкладки */}
      {activeTab === 'clients' ? (
        <div className="bg-white dark:bg-primary-800 shadow rounded-lg overflow-hidden dark:border dark:border-primary-700">
          <div className="p-4 border-b border-gray-200 dark:border-primary-700">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Поиск клиентов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <button className="btn btn-outline w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                </button>
              </div>
            </div>
          </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-primary-700">
            <thead className="bg-gray-50 dark:bg-primary-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID клиента
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Имя клиента
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата добавления
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата последнего изменения
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-primary-800 divide-y divide-gray-200 dark:divide-primary-700">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-primary-700/30 transition-colors ${
                      selectedClientId === client.id ? 'bg-green-50 dark:bg-green-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        {client.id}
                        {client.isNew && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-100 text-accent-800 dark:bg-accent-900/20 dark:text-accent-400">
                            Новый
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {getStatusIcon(client.status)}
                        <span className="ml-1.5">{client.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(client.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                          Просмотр
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center py-6">
                      <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Клиенты не найдены
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        {searchTerm 
                          ? `По запросу "${searchTerm}" ничего не найдено. Попробуйте изменить параметры поиска.` 
                          : 'В системе пока нет клиентов. Добавьте нового клиента, чтобы начать работу.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-primary-700/50 flex items-center justify-between border-t border-gray-200 dark:border-primary-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="btn btn-outline">
              Предыдущая
            </button>
            <button className="btn btn-outline ml-3">
              Следующая
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Показано <span className="font-medium">1</span> - <span className="font-medium">{filteredClients.length}</span> из{' '}
                <span className="font-medium">{filteredClients.length}</span> результатов
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-primary-600">
                  <span className="sr-only">Предыдущая</span>
                  &larr;
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-primary-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-primary-600">
                  <span className="sr-only">Следующая</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      ) : (
        /* Вкладка с обращениями клиентов */
        <div className="bg-white dark:bg-primary-800 shadow rounded-lg overflow-hidden dark:border dark:border-primary-700">
          <div className="p-4 border-b border-gray-200 dark:border-primary-700">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Поиск обращений..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <button className="btn btn-outline w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-primary-700">
              <thead className="bg-gray-50 dark:bg-primary-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID обращения
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Организация
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Тип обращения
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-primary-800 divide-y divide-gray-200 dark:divide-primary-700">
                {requestsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center">
                        <Spinner className="mr-2" />
                        Загрузка данных...
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="bg-white dark:bg-primary-800/30 border-b dark:border-primary-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {request.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {request.mfo_name || 'Не указано'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {request.reason_type || 'Не указано'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${getRequestStatusColor(request.status)} inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            Просмотр
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center py-6">
                        <MessageSquare className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          Обращения не найдены
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">
                          {searchTerm 
                            ? `По запросу "${searchTerm}" ничего не найдено. Попробуйте изменить параметры поиска.` 
                            : 'В системе пока нет обращений от клиентов.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 dark:bg-primary-700/50 flex items-center justify-between border-t border-gray-200 dark:border-primary-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="btn btn-outline">
                Предыдущая
              </button>
              <button className="btn btn-outline ml-3">
                Следующая
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Показано <span className="font-medium">1</span> - <span className="font-medium">{filteredRequests.length}</span> из{' '}
                  <span className="font-medium">{filteredRequests.length}</span> результатов
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-primary-600">
                    <span className="sr-only">Предыдущая</span>
                    &larr;
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-primary-600">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-primary-600">
                    <span className="sr-only">Следующая</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleClientAdded}
      />
      
      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        request={selectedRequest}
        onSendDocument={handleSendDocument}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};