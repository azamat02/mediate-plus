import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { PaymentScheduleDocument } from '../../components/documents/PaymentScheduleDocument';

// Функция для генерации тестовых данных платежей
const generatePaymentSchedule = (amount: number, rate: number, term: number, startDate: string) => {
  const startDateObj = new Date(startDate);
  const monthlyRate = rate / 100 / 12;
  const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  
  let remainingBalance = amount;
  const payments = [];
  
  for (let i = 1; i <= term; i++) {
    const paymentDate = new Date(startDateObj);
    paymentDate.setMonth(startDateObj.getMonth() + i);
    
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    payments.push({
      paymentNumber: i,
      paymentDate: paymentDate.toISOString(),
      totalPayment: monthlyPayment,
      principalPayment,
      interestPayment,
      remainingBalance: Math.max(0, remainingBalance)
    });
  }
  
  return payments;
};

interface DocumentDetails {
  id: string;
  name: string;
  type: string;
  sent_at: string;
  url: string;
}

export const ViewDocumentPage: React.FC = () => {
  const { requestId, documentId } = useParams<{ requestId: string; documentId: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [paymentSchedule, setPaymentSchedule] = useState<any>(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        
        // В реальном приложении здесь бы был запрос к API/Supabase
        // Для демонстрации используем заглушку
        const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
        const request = storedRequests.find((req: any) => req.id === requestId);
        
        if (!request) {
          throw new Error('Запрос не найден');
        }
        
        // Если нашли запрос, создаем демонстрационный документ
        const mockDocument: DocumentDetails = {
          id: documentId || 'doc-1',
          name: getDocumentTypeName(request.document_type),
          type: 'new_schedule', // Всегда используем new_schedule для отображения графика платежей,
          sent_at: request.document_sent_at || new Date().toISOString(),
          url: ''
        };
        
        setDocument(mockDocument);
        
        // Если это график платежей, генерируем данные
        if (request.document_type === 'new_schedule') {
          // Генерируем данные для графика платежей
          const loanData = {
            clientName: request.client_name || 'Иванов Иван Иванович',
            contractNumber: `L-${requestId?.substring(0, 6) || '123456'}`,
            contractDate: request.created_at || new Date().toISOString(),
            loanAmount: request.loan_amount || 1000000,
            interestRate: request.interest_rate || 12.5,
            term: request.loan_term || 12,
            startDate: request.created_at || new Date().toISOString(),
            endDate: (() => {
              const endDate = new Date(request.created_at || new Date());
              endDate.setMonth(endDate.getMonth() + (request.loan_term || 12));
              return endDate.toISOString();
            })(),
            payments: generatePaymentSchedule(
              request.loan_amount || 1000000, 
              request.interest_rate || 12.5, 
              request.loan_term || 12, 
              request.created_at || new Date().toISOString()
            )
          };
          
          setPaymentSchedule(loanData);
        }
        
        // Помечаем документ как просмотренный, если еще не был просмотрен
        if (!request.document_viewed_at) {
          request.document_viewed_at = new Date().toISOString();
          request.status = 'document_viewed';
          
          // Обновляем localStorage
          const updatedRequests = storedRequests.map((req: any) => 
            req.id === requestId ? request : req
          );
          localStorage.setItem('clientRequests', JSON.stringify(updatedRequests));
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setError(`Ошибка при загрузке документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [requestId, documentId]);
  
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
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleBack = () => {
    navigate(`/client/dashboard/requests/${requestId}`);
  };
  
  const handleSign = () => {
    navigate(`/client/dashboard/requests/${requestId}?action=sign`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
          <p>{error || 'Документ не найден'}</p>
        </div>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к обращению
        </button>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к обращению
        </button>
        
        <button
          onClick={handleSign}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Подписать документ
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                {document.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Отправлен: {formatDate(document.sent_at)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="overflow-auto">
          {document.type === 'new_schedule' && paymentSchedule ? (
            <PaymentScheduleDocument 
              clientName={paymentSchedule.clientName}
              contractNumber={paymentSchedule.contractNumber}
              contractDate={paymentSchedule.contractDate}
              loanAmount={paymentSchedule.loanAmount}
              interestRate={paymentSchedule.interestRate}
              term={paymentSchedule.term}
              startDate={paymentSchedule.startDate}
              endDate={paymentSchedule.endDate}
              payments={paymentSchedule.payments}
            />
          ) : (
            <div className="h-[700px] flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
                <FileText className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Предпросмотр недоступен</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Просмотр этого типа документа в данный момент не поддерживается.</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к обращению
          </button>
          
          <button
            onClick={handleSign}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Подписать документ
          </button>
        </div>
      </div>
    </motion.div>
  );
};
