import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Send, Eye } from 'lucide-react';
import { RequestChat } from '../../components/client/RequestChat';
import { Spinner } from '../../components/ui/Spinner';
import { mobizonApi } from '../../lib/mobizon';
import { getStatusLabel, getStatusColor } from '../../utils/statusTranslations';
import { ClientRequestService, ClientRequest } from '../../services/clientRequestService';
import { ChatService } from '../../services/chatService';

export const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<ClientRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedReason, setEditedReason] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'document'>('info');
  const [showSignModal, setShowSignModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  
  // Загрузка данных обращения из Firebase
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Загружаем данные из Firebase
        const fetchedRequest = await ClientRequestService.getRequestById(requestId);
        
        if (fetchedRequest) {
          console.log('[RequestDetailPage] Loaded request from Firebase:', fetchedRequest);
          
          // Если есть документ и мы его открываем впервые, отметим как просмотренный
          if (fetchedRequest.document_sent_at && !fetchedRequest.document_viewed_at) {
            console.log('[RequestDetailPage] Marking document as viewed');
            
            // Обновляем в Firebase
            await ClientRequestService.markDocumentAsViewed(requestId);
            
            // Обновляем локальный объект
            fetchedRequest.document_viewed_at = new Date().toISOString();
            fetchedRequest.status = 'document_viewed';
            
            // Автоматически переключаемся на вкладку с документом
            setActiveTab('document');
          }
          
          setRequest(fetchedRequest);
          setError(null);
        } else {
          console.error('[RequestDetailPage] Request not found:', requestId);
          setError('Обращение не найдено');
        }
      } catch (error) {
        console.error('[RequestDetailPage] Error fetching request:', error);
        setError('Ошибка при загрузке данных обращения');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [requestId]);
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Неизвестная дата';
    }
  };
  
  // Получение информации о статусе
  const getStatusInfo = (status: string) => {
    const statusColor = getStatusColor(status);
    const statusLabel = getStatusLabel(status);
    
    let icon;
    
    switch (status) {
      case 'new':
        icon = <Clock className="h-5 w-5" />;
        break;
      case 'in_progress':
        icon = <Clock className="h-5 w-5" />;
        break;
      case 'document_sent':
        icon = <Send className="h-5 w-5" />;
        break;
      case 'document_viewed':
        icon = <Eye className="h-5 w-5" />;
        break;
      case 'document_signed':
        icon = <CheckCircle className="h-5 w-5" />;
        break;
      default:
        icon = <Clock className="h-5 w-5" />;
    }
    
    return { icon, color: statusColor, label: statusLabel };
  };
  
  // Обработчик удаления обращения
  const handleDelete = async () => {
    // Для этого примера мы просто перенаправляем пользователя назад
    // В реальном приложении здесь был бы запрос к API для удаления
    setShowDeleteModal(false);
    navigate('/client/dashboard/requests');
  };
  
  // Обработчик редактирования обращения
  const handleEdit = async () => {
    if (!request || !editedReason.trim()) return;
    
    try {
      // В реальном приложении здесь был бы запрос к API
      // Для демо используем console.log
      console.log('Edited reason:', editedReason);
      
      // Обновляем состояние
      setRequest({
        ...request,
        reason: editedReason
      });
      
      // Закрываем модальное окно
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error editing request:', error);
    }
  };
  
  // Отправка ОТП-кода для подписания документа
  const sendOtp = async () => {
    if (!request) return;
    
    try {
      setOtpSent(false);
      setOtpError(null);
      
      // Симулируем отправку OTP 
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-значный код
      
      // В реальном приложении здесь был бы запрос к API для отправки SMS
      console.log(`[Код подтверждения] OTP: ${otp} (для тестирования)`);
      
      // Устанавливаем флаг, что код отправлен
      setTimeout(() => {
        setOtpSent(true);
      }, 1500); // Имитируем небольшую задержку
      
    } catch (error) {
      console.error('[RequestDetailPage] Ошибка при отправке кода:', error);
      setOtpError('Не удалось отправить код подтверждения. Пожалуйста, попробуйте еще раз.');
    }
  };
  
  // Обработчик подписания документа
  const handleSignDocument = async () => {
    if (!request || !otpCode) return;
    
    try {
      setSigningInProgress(true);
      setOtpError(null);
      
      // Проверяем OTP код
      // В реальном приложении здесь была бы проверка на сервере
      // Для демо просто проверяем, что код состоит из 4 цифр
      if (!/^\d{4}$/.test(otpCode)) {
        setOtpError('Код должен состоять из 4 цифр');
        setSigningInProgress(false);
        return;
      }
      
      // Обновляем статус в Firebase
      const reqId = request.id;
      const success = await ClientRequestService.markDocumentAsSigned(reqId);
      
      if (!success) {
        throw new Error('Ошибка при обновлении статуса документа');
      }
      
      // Обновляем локальное состояние
      setRequest({
        ...request,
        status: 'document_signed',
        document_signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Показываем успешное сообщение и закрываем модальное окно через 3 секунды
      setSignSuccess(true);
      setTimeout(() => {
        setShowSignModal(false);
        setSignSuccess(false);
        setOtpSent(false);
        setOtpCode('');
      }, 3000);
      
    } catch (error) {
      console.error('[RequestDetailPage] Error signing document:', error);
      setOtpError('Ошибка при подписании документа');
    } finally {
      setSigningInProgress(false);
    }
  };
  
  // Получение названия типа документа
  const getDocumentTypeName = (documentType?: string) => {
    if (!documentType) return 'Неизвестный документ';
    
    const documentTypes: Record<string, string> = {
      'loan_restructuring': 'Договор о реструктуризации займа',
      'payment_delay': 'Соглашение об отсрочке платежа',
      'debt_dispute': 'Акт сверки задолженности',
      'interest_rate': 'Дополнительное соглашение о снижении ставки',
      'new_schedule': 'Новый график платежей',
      'early_repayment': 'Соглашение о досрочном погашении',
      'general': 'Типовой договор'
    };
    
    return documentTypes[documentType] || 'Неизвестный документ';
  };
  
  // Обработчик просмотра документа
  const handleViewDocument = () => {
    if (!request || !request.document_sent_at) return;
    
    // В реальном приложении перенаправляли бы на страницу с документом
    // Для демо просто перенаправляем на страницу просмотра документа
    navigate(`/client/dashboard/documents/${request.id}/1`);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }
  
  if (error || !request) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error || 'Обращение не найдено'}</p>
        </div>
        <button
          onClick={() => navigate('/client/dashboard/requests')}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Вернуться к списку обращений
        </button>
      </div>
    );
  }
  
  const { icon, color, label } = getStatusInfo(request.status);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4"
    >
      {/* Заголовок и статус */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Обращение #{request.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Создано: {formatDate(request.created_at)}
          </p>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
          {icon}
          <span className="ml-1">{label}</span>
        </div>
      </div>
      
      {/* Вкладки */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`inline-flex items-center py-2 px-4 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Информация
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`inline-flex items-center py-2 px-4 text-sm font-medium ${
                activeTab === 'chat'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Чат
            </button>
          </li>
          {request.document_sent_at && (
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('document')}
                className={`inline-flex items-center py-2 px-4 text-sm font-medium ${
                  activeTab === 'document'
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Документ
              </button>
            </li>
          )}
        </ul>
      </div>
      
      {/* Содержимое вкладок */}
      <div className="pb-6">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Тип обращения</p>
                <p className="mt-1">{request.reason_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">МФО</p>
                <p className="mt-1">{request.mfo_name || 'Не указано'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Описание проблемы</p>
                <p className="mt-1">{request.reason}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div>
            <RequestChat
              requestId={request.id}
              initialMessages={request.messages || []}
              currentUserType="client"
            />
          </div>
        )}
        
        {activeTab === 'document' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-start mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-full p-2 mr-3">
                  <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {getDocumentTypeName(request.document_type)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Отправлен: {request.document_sent_at ? formatDate(request.document_sent_at) : 'Н/Д'}
                  </p>
                  {request.document_viewed_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Просмотрен: {formatDate(request.document_viewed_at)}
                    </p>
                  )}
                  {request.document_signed_at && (
                    <p className="text-sm text-green-500 dark:text-green-400 mt-1">
                      Подписан: {formatDate(request.document_signed_at)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleViewDocument}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотреть документ
                </button>
                
                {!request.document_signed_at && (
                  <button
                    onClick={() => setShowSignModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Подписать документ
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-2">Примечание</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                После подписания вы не сможете отозвать свое согласие. Пожалуйста, внимательно прочитайте документ перед подписанием.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Модальное окно для подписания документа */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Подписание документа
                    </h3>
                    
                    {signSuccess ? (
                      <div className="mt-4 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Документ успешно подписан!
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Для подписания документа необходимо ввести код подтверждения, который будет отправлен на ваш номер телефона.
                        </p>
                        
                        {!otpSent ? (
                          <button
                            onClick={sendOtp}
                            className="mt-4 w-full inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Отправить код
                          </button>
                        ) : (
                          <div className="mt-4">
                            <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Введите код подтверждения
                            </label>
                            <input
                              type="text"
                              id="otpCode"
                              maxLength={4}
                              placeholder="0000"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-center text-lg"
                            />
                            
                            {otpError && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {otpError}
                              </p>
                            )}
                            
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setShowSignModal(false)}
                                className="inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Отмена
                              </button>
                              <button
                                onClick={handleSignDocument}
                                disabled={!otpCode || otpCode.length < 4 || signingInProgress}
                                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {signingInProgress ? (
                                  <span className="flex items-center">
                                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                                    Подписание...
                                  </span>
                                ) : (
                                  'Подписать'
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
