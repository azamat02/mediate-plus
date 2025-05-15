import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Send, Eye } from 'lucide-react';
import { RequestChat } from '../../components/client/RequestChat';
import { Spinner } from '../../components/ui/Spinner';
import { mobizonApi } from '../../lib/mobizon';
import { getStatusLabel, getStatusColor } from '../../utils/statusTranslations';

interface Request {
  id: string;
  phone_number: string;
  iin?: string;
  mfo_id: string;
  mfo_name: string;
  reason_type: string;
  reason: string;
  status: string;
  created_at: string;
  messages?: Message[];
  organization_type?: 'bvu' | 'mfo';
  document_sent_at?: string;
  document_type?: string;
  document_viewed_at?: string;
  document_signed_at?: string;
}

interface Message {
  id: string;
  sender: 'client' | 'mediator' | 'mfo';
  text: string;
  timestamp: string;
}

export const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<Request | null>(null);
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
  
  // Загрузка данных обращения
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        
        // В реальном приложении здесь был бы запрос к API
        // Для демо используем localStorage
        const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
        const foundRequest = storedRequests.find((req: Request) => req.id === requestId);
        
        if (foundRequest) {
          // Убедимся, что у запроса есть массив сообщений
          if (!foundRequest.messages) {
            foundRequest.messages = [];
          }
          
          // Если есть документ и мы его открываем впервые, отметим как просмотренный
          if (foundRequest.document_sent_at && !foundRequest.document_viewed_at) {
            foundRequest.document_viewed_at = new Date().toISOString();
            foundRequest.status = 'document_viewed';
            
            // Обновляем в localStorage
            const updatedRequests = storedRequests.map((req: Request) => 
              req.id === requestId ? foundRequest : req
            );
            localStorage.setItem('clientRequests', JSON.stringify(updatedRequests));
            
            // Автоматически переключаемся на вкладку с документом
            setActiveTab('document');
          }
          
          setRequest(foundRequest);
        } else {
          setError('Обращение не найдено');
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        setError('Ошибка при загрузке данных обращения');
      } finally {
        setLoading(false);
      }
    };
    
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);
  
  // Форматирование даты
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
  
  // Получение цвета и текста для статуса
  const getStatusInfo = (status: string) => {
    const colorInfo = getStatusColor(status);
    
    return {
      color: colorInfo.text,
      bgColor: colorInfo.bg,
      label: getStatusLabel(status)
    };
  };
  
  // Обработка удаления обращения
  const handleDelete = () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // Для демо используем localStorage
      const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      const updatedRequests = storedRequests.filter((req: Request) => req.id !== requestId);
      
      localStorage.setItem('clientRequests', JSON.stringify(updatedRequests));
      
      // Перенаправляем на страницу со списком обращений
      navigate('/client/dashboard/requests');
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };
  
  // Обработка редактирования обращения
  const handleEdit = () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // Для демо используем localStorage
      const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      const updatedRequests = storedRequests.map((req: Request) => {
        if (req.id === requestId) {
          return { ...req, reason: editedReason };
        }
        return req;
      });
      
      localStorage.setItem('clientRequests', JSON.stringify(updatedRequests));
      
      // Обновляем локальное состояние
      if (request) {
        setRequest({ ...request, reason: editedReason });
      }
      
      // Закрываем модальное окно
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };
  
  // Отправка ОТП-кода для подписания документа
  const sendOtp = async () => {
    setOtpError(null);
    
    try {
      if (!request?.phone_number) {
        setOtpError('Номер телефона не найден');
        return;
      }
      
      // Генерируем 4-значный OTP код
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Сохраняем OTP в localStorage для проверки (в реальном приложении должно быть на сервере)
      localStorage.setItem(`otp_${requestId}`, otp);
      
      // Формируем текст сообщения
      const smsText = `Ваш код подтверждения для подписания документа: ${otp}. Mediate+`;
      
      // Отправляем SMS через mobizonApi
      const success = await mobizonApi.sendSms(request.phone_number, smsText);
      
      if (success) {
        console.log(`Отправлен OTP на номер ${request.phone_number}`);
        setOtpSent(true);
      } else {
        setOtpError('Ошибка при отправке SMS. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      console.error('Ошибка при отправке OTP:', error);
      setOtpError('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  };
  
  // Подписание документа с помощью ОТП
  const signDocument = () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError('Введите корректный ОТП-код');
      return;
    }
    
    setSigningInProgress(true);
    setOtpError(null);
    
    try {
      // Получаем сохраненный OTP из localStorage
      const savedOtp = localStorage.getItem(`otp_${requestId}`);
      
      if (!savedOtp) {
        throw new Error('Код подтверждения не найден. Пожалуйста, отправьте код повторно.');
      }
      
      // Проверяем, совпадает ли введенный код с сохраненным
      if (otpCode !== savedOtp) {
        setSigningInProgress(false);
        setOtpError('Неверный код подтверждения. Пожалуйста, попробуйте еще раз.');
        return;
      }
      
      // Удаляем использованный OTP из localStorage
      localStorage.removeItem(`otp_${requestId}`);
      
      // Обновляем статус в localStorage
      const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      const updatedRequests = storedRequests.map((req: Request) => {
        if (req.id === requestId) {
          return { 
            ...req, 
            status: 'document_signed',
            document_signed_at: new Date().toISOString()
          };
        }
        return req;
      });

      localStorage.setItem('clientRequests', JSON.stringify(updatedRequests));
      
      // Обновляем состояние после небольшой задержки
      setTimeout(() => {
        setRequest((prev) => 
          prev ? { ...prev, status: 'document_signed', document_signed_at: new Date().toISOString() } : null
        );
        setSigningInProgress(false);
        setSignSuccess(true);
        console.log('Документ успешно подписан!');
      }, 1500);
    } catch (error) {
      console.error('Ошибка при подписании документа:', error);
      setSigningInProgress(false);
      setOtpError('Произошла ошибка при подписании документа');
    }
  };
  
  // Получение названия типа документа
  const getDocumentTypeName = (documentType?: string) => {
    if (!documentType) return 'Документ';
    
    const documentTypes: Record<string, string> = {
      'loan_restructuring': 'Договор о реструктуризации займа',
      'payment_delay': 'Соглашение об отсрочке платежа',
      'debt_dispute': 'Акт сверки задолженности',
      'interest_rate': 'Дополнительное соглашение о снижении ставки',
      'new_schedule': 'Новый график платежей',
      'early_repayment': 'Соглашение о досрочном погашении',
      'general': 'Типовой договор'
    };
    
    return documentTypes[documentType] || 'Документ';
  };
  
  // Функция для перехода на страницу просмотра документа
  const handleViewDocument = () => {
    if (!request || !request.id) return;
    
    // Создаем уникальный ID документа (в реальном приложении он был бы в базе данных)
    const documentId = `doc-${request.id.substring(0, 6)}`;
    
    // Переходим на страницу просмотра документа
    navigate(`/client/dashboard/documents/${request.id}/${documentId}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
          <p>{error || 'Обращение не найдено'}</p>
        </div>
        <button
          onClick={() => navigate('/client/dashboard/requests')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Вернуться к списку обращений
        </button>
      </div>
    );
  }
  
  const { color, bgColor, label } = getStatusInfo(request.status);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-6 flex flex-col items-start gap-3 justify-between">
        <button
          onClick={() => navigate('/client/dashboard/requests')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Назад
        </button>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Детали обращения</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Просмотр информации по обращению #{request.id.substring(0, 6)}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Заголовок с информацией об обращении */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
                {label}
              </span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-2">Обращение №{request.id.substring(0, 8)}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Создано: {formatDate(request.created_at)}</p>
            </div>
            
            <div className="flex space-x-2">
              {/* Кнопка редактирования */}
              {['new', 'processing'].includes(request.status) && (
                <button
                  onClick={() => {
                    setEditedReason(request.reason);
                    setShowEditModal(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Редактировать
                </button>
              )}
              
              {/* Кнопка удаления */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Удалить
              </button>
            </div>
          </div>
        </div>
        
        {/* Вкладки навигации */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'info' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Информация
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'chat' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Чат с медиатором
            </button>
            {request.document_sent_at && (
              <button
                onClick={() => setActiveTab('document')}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center ${activeTab === 'document' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Документ
                {request.document_sent_at && !request.document_viewed_at && (
                  <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            )}
          </nav>
        </div>
        
        {/* Информация об обращении */}
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Информация о заявителе</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Телефон</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{request.phone_number}</p>
                  </div>
                  {request.iin && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ИИН</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{request.iin}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Информация об обращении</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Финансовая организация</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{request.mfo_name}</p>
                  </div>
                  {request.organization_type && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Тип организации</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {request.organization_type === 'bvu' ? 'Банк второго уровня (БВУ)' : 'Микрофинансовая организация (МФО)'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Тип обращения</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{request.reason_type}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Описание проблемы</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{request.reason}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Чат с медиатором */}
        {activeTab === 'chat' && (
          <div className="p-0 h-[500px]">
            <RequestChat requestId={request.id} />
          </div>
        )}
        
        {/* Документ */}
        {activeTab === 'document' && request.document_sent_at && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {getDocumentTypeName(request.document_type)}
              </h3>
              <div className="flex items-center space-x-2">
                {request.document_viewed_at && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Eye className="h-3 w-3 mr-1" />
                    Просмотрен {formatDate(request.document_viewed_at)}
                  </span>
                )}
                {request.document_signed_at ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Подписан {formatDate(request.document_signed_at)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Ожидает подписания
                  </span>
                )}
              </div>
            </div>
            
            {/* Превью документа */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6 flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {getDocumentTypeName(request.document_type)}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                Документ отправлен {formatDate(request.document_sent_at)}
              </p>
              
              <button
                onClick={handleViewDocument}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                Просмотреть документ
              </button>
              
              {request.document_viewed_at && (
                <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Eye className="h-3 w-3 mr-1" />
                  Просмотрен {formatDate(request.document_viewed_at)}
                </span>
              )}
            </div>
            
            {/* Кнопка подписания */}
            {!request.document_signed_at && (
              <div className="flex justify-center">
                <button 
                  onClick={() => {
                    setOtpCode('');
                    setOtpError(null);
                    setOtpSent(false);
                    setSignSuccess(false);
                    setShowSignModal(true);
                  }}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Подписать документ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Модальное окно удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Подтверждение удаления</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Вы уверены, что хотите удалить это обращение? Это действие нельзя будет отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Удалить
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Модальное окно редактирования */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Редактирование обращения</h3>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Описание проблемы
              </label>
              <textarea
                id="reason"
                rows={6}
                value={editedReason}
                onChange={(e) => setEditedReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Модальное окно подписания документа */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              {signSuccess ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Документ успешно подписан</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Подписанный документ доступен во вкладке "Документ"
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 inline-flex mb-4">
                    <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Подписание документа</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Для подписания документа "{getDocumentTypeName(request?.document_type)}" требуется подтверждение через ОТП-код.
                  </p>
                  
                  {!otpSent ? (
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Нажмите кнопку ниже, чтобы получить ОТП-код на номер {request?.phone_number}
                      </p>
                      <button
                        onClick={sendOtp}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Отправить ОТП-код
                      </button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="mb-4">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-2">
                          Введите ОТП-код, отправленный на номер {request?.phone_number}
                        </label>
                        <input
                          type="text"
                          id="otp"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
                          placeholder="••••••"
                        />
                      </div>
                      
                      {otpError && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
                          {otpError}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-6">
                        <button
                          onClick={() => setOtpSent(false)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Отправить код повторно
                        </button>
                        <button
                          onClick={signDocument}
                          disabled={signingInProgress}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {signingInProgress ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Подписание...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Подписать документ
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {!signSuccess && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Отмена
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
