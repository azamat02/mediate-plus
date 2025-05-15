import React, { useState } from 'react';
import { X, Send, FileText, CheckCircle, AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Spinner } from '../ui/Spinner';
import { AdminRequestChat } from '../admin/AdminRequestChat';
import { getStatusLabel } from '../../utils/statusTranslations';

// Типы документов для отправки
export const DOCUMENT_TYPES = [
  { id: 'loan_restructuring', name: 'Договор о реструктуризации займа' },
  { id: 'payment_delay', name: 'Соглашение об отсрочке платежа' },
  { id: 'debt_dispute', name: 'Акт сверки задолженности' },
  { id: 'interest_rate', name: 'Дополнительное соглашение о снижении ставки' },
  { id: 'new_schedule', name: 'Новый график платежей' },
  { id: 'early_repayment', name: 'Соглашение о досрочном погашении' },
  { id: 'general', name: 'Типовой договор' },
];

// Интерфейс для обращений клиентов
interface Message {
  id: string;
  sender: 'client' | 'mediator' | 'mfo';
  text: string;
  timestamp: string;
}

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
  messages?: Message[];
}

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClientRequest | null;
  onSendDocument: (requestId: string, documentType: string) => Promise<void>;
  onSendMessage?: (requestId: string, message: string) => Promise<void>;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onSendDocument,
  onSendMessage
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
  
  // Определяем рекомендуемый тип документа на основе типа обращения
  const getRecommendedDocumentType = (requestType: string): string => {
    switch (requestType) {
      case 'Реструктуризация займа':
        return 'loan_restructuring';
      case 'Отсрочка платежа':
        return 'payment_delay';
      case 'Оспаривание задолженности':
        return 'debt_dispute';
      case 'Снижение процентной ставки':
        return 'interest_rate';
      case 'Новый график':
        return 'new_schedule';
      case 'Досрочное погашение':
        return 'early_repayment';
      default:
        return 'general';
    }
  };

  // При открытии модального окна устанавливаем рекомендуемый тип документа
  React.useEffect(() => {
    if (isOpen && request && request.reason_type) {
      setSelectedDocument(getRecommendedDocumentType(request.reason_type));
    } else if (isOpen) {
      setSelectedDocument('general');
    }
  }, [isOpen, request]);
  
  if (!isOpen || !request) return null;

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: ru });
    } catch (error) {
      return 'Некорректная дата';
    }
  };

  // Используем общий метод из utils/statusTranslations.ts

  // Получение иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'document_sent':
        return <Send className="h-5 w-5 text-purple-500" />;
      case 'document_viewed':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'document_signed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Обработчик отправки документа
  const handleSendDocument = async () => {
    if (!selectedDocument) {
      setError('Выберите тип документа для отправки');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await onSendDocument(request.id, selectedDocument);
      setSuccess('Документ успешно отправлен клиенту');
    } catch (error) {
      setError('Ошибка при отправке документа. Пожалуйста, попробуйте еще раз.');
      console.error('Error sending document:', error);
    } finally {
      setLoading(false);
    }
  };

  // Проверка, можно ли отправить документ
  const canSendDocument = ['new', 'in_progress'].includes(request.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Детали обращения
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  ID: {request.id}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'info'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FileText className="h-4 w-4 inline-block mr-1" />
                    Информация
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'chat'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 inline-block mr-1" />
                    Чат
                  </button>
                </div>
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Закрыть</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="mt-4 space-y-6">
                  {activeTab === 'info' ? (
                    <div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center mb-4">
                          {getStatusIcon(request.status)}
                          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Статус: {getStatusLabel(request.status)}
                          </span>
                        </div>
                    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID обращения</p>
                            <p className="font-medium text-gray-900 dark:text-white">{request.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Дата создания</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(request.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Телефон клиента</p>
                            <p className="font-medium text-gray-900 dark:text-white">{request.phone_number}</p>
                          </div>
                          {request.iin && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">ИИН клиента</p>
                              <p className="font-medium text-gray-900 dark:text-white">{request.iin}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Организация</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {request.mfo_name || 'Не указано'} 
                              {request.organization_type && ` (${request.organization_type === 'mfo' ? 'МФО' : 'БВУ'})`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Тип обращения</p>
                            <p className="font-medium text-gray-900 dark:text-white">{request.reason_type || 'Другое'}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Текст обращения</p>
                          <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap mt-1">
                            {request.reason}
                          </p>
                        </div>

                        {request.document_sent_at && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Документ отправлен</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(request.document_sent_at)}
                              {request.document_type && ` - ${DOCUMENT_TYPES.find(d => d.id === request.document_type)?.name || request.document_type}`}
                            </p>
                          </div>
                        )}

                        {request.document_signed_at && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Документ подписан</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(request.document_signed_at)}
                            </p>
                          </div>
                        )}
                      </div>

                      {canSendDocument && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-6">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                            Отправить документ клиенту
                          </h4>

                          <div className="mb-4">
                            <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Выберите тип документа
                            </label>
                            <select
                              id="document-type"
                              className="input w-full"
                              value={selectedDocument}
                              onChange={(e) => setSelectedDocument(e.target.value)}
                            >
                              <option value="">Выберите тип документа</option>
                              {DOCUMENT_TYPES.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                  {doc.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
                              {error}
                            </div>
                          )}

                          {success && (
                            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
                              {success}
                            </div>
                          )}

                          <button
                            type="button"
                            className="btn btn-primary w-full"
                            onClick={handleSendDocument}
                            disabled={loading || !selectedDocument}
                          >
                            {loading ? (
                              <>
                                <Spinner size="sm" className="mr-2" />
                                Отправка...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Отправить документ
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[500px] flex flex-col">
                      <AdminRequestChat
                        requestId={request.id}
                        messages={request.messages || []}
                        onSendMessage={async (text) => {
                          if (onSendMessage) {
                            await onSendMessage(request.id, text);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
