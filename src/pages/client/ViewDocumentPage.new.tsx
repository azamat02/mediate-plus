import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { ClientRequestService } from '../../services/clientRequestService';

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

interface PaymentScheduleData {
  clientName: string;
  contractNumber: string;
  contractDate: string;
  loanAmount: number;
  interestRate: number;
  term: number;
  startDate: string;
  endDate: string;
  payments: any[];
}

// Компонент для отображения графика платежей
const PaymentScheduleDocument: React.FC<{ data: PaymentScheduleData }> = ({ data }) => {
  // Функция форматирования даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция форматирования суммы
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="document payment-schedule">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Информация о кредите</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Заемщик:</p>
            <p className="font-medium">{data.clientName}</p>
          </div>
          <div>
            <p className="text-gray-600">Номер договора:</p>
            <p className="font-medium">{data.contractNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Дата договора:</p>
            <p className="font-medium">{formatDate(data.contractDate)}</p>
          </div>
          <div>
            <p className="text-gray-600">Сумма кредита:</p>
            <p className="font-medium">{formatMoney(data.loanAmount)}</p>
          </div>
          <div>
            <p className="text-gray-600">Ставка по кредиту:</p>
            <p className="font-medium">{data.interestRate}% годовых</p>
          </div>
          <div>
            <p className="text-gray-600">Срок кредита:</p>
            <p className="font-medium">{data.term} месяцев</p>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">График платежей</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 border-b text-left">№</th>
              <th className="py-2 px-3 border-b text-left">Дата платежа</th>
              <th className="py-2 px-3 border-b text-right">Сумма платежа</th>
              <th className="py-2 px-3 border-b text-right">Основной долг</th>
              <th className="py-2 px-3 border-b text-right">Проценты</th>
              <th className="py-2 px-3 border-b text-right">Остаток долга</th>
            </tr>
          </thead>
          <tbody>
            {data.payments.map((payment) => (
              <tr key={payment.paymentNumber} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b">{payment.paymentNumber}</td>
                <td className="py-2 px-3 border-b">{formatDate(payment.paymentDate)}</td>
                <td className="py-2 px-3 border-b text-right">{formatMoney(payment.totalPayment)}</td>
                <td className="py-2 px-3 border-b text-right">{formatMoney(payment.principalPayment)}</td>
                <td className="py-2 px-3 border-b text-right">{formatMoney(payment.interestPayment)}</td>
                <td className="py-2 px-3 border-b text-right">{formatMoney(payment.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Основной компонент страницы просмотра документа
export const ViewDocumentPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleData | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchDocument = async () => {
      if (!requestId) {
        setError('Идентификатор запроса не указан');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Загружаем данные запроса из Firebase
        const fetchedRequest = await ClientRequestService.getRequestById(requestId);
        
        if (!fetchedRequest) {
          throw new Error('Запрос не найден');
        }
        
        setRequest(fetchedRequest);
        
        // Создаем моковые данные для графика платежей
        const mockSchedule: PaymentScheduleData = {
          clientName: fetchedRequest.phone_number || 'Клиент',
          contractNumber: `КЗ-${requestId.substring(0, 6)}`,
          contractDate: fetchedRequest.document_sent_at || new Date().toISOString(),
          loanAmount: 500000,
          interestRate: 12,
          term: 12,
          startDate: fetchedRequest.document_sent_at || new Date().toISOString(),
          endDate: (() => {
            const endDate = new Date(fetchedRequest.document_sent_at || new Date());
            endDate.setMonth(endDate.getMonth() + 12);
            return endDate.toISOString();
          })(),
          payments: generatePaymentSchedule(
            500000, // сумма кредита 
            12, // процентная ставка
            12, // срок в месяцах
            fetchedRequest.document_sent_at || new Date().toISOString() // дата начала
          )
        };
        
        setPaymentSchedule(mockSchedule);
        setLoading(false);
        
        // Если документ еще не просмотрен, отмечаем его как просмотренный
        if (fetchedRequest.status === 'document_sent' && !fetchedRequest.document_viewed_at) {
          await ClientRequestService.markDocumentAsViewed(requestId);
        }
      } catch (error: any) {
        console.error('Error loading document:', error);
        setError(error.message || 'Ошибка при загрузке документа');
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [requestId]);
  
  // Обработчик возврата назад
  const handleBack = () => {
    navigate(`/client/dashboard/requests/${requestId}`);
  };
  
  // Обработчик подписания документа
  const handleSign = () => {
    setShowSignModal(true);
  };
  
  // Отправка OTP кода
  const handleSendOtp = async () => {
    try {
      setOtpError(null);
      setOtpSent(true);
      // Здесь был бы реальный запрос на отправку кода, но мы используем моковые данные
      console.log('OTP code sent');
    } catch (error: any) {
      setOtpError(error.message || 'Ошибка при отправке кода');
    }
  };
  
  // Подтверждение OTP кода
  const handleConfirmOtp = async () => {
    try {
      setOtpError(null);
      setSigningInProgress(true);
      
      // Имитация проверки кода и подписания документа
      setTimeout(async () => {
        if (otpCode === '1234' || otpCode.length > 3) {
          // Если код верный или любые 4 цифры (для демо)
          try {
            // Отмечаем документ как подписанный в Firebase
            await ClientRequestService.markDocumentAsSigned(requestId!);
            setSignSuccess(true);
            setSigningInProgress(false);
            
            // Обновляем локальное состояние
            if (request) {
              setRequest({
                ...request,
                document_signed_at: new Date().toISOString(),
                status: 'document_signed'
              });
            }
            
            setTimeout(() => {
              setShowSignModal(false);
            }, 2000);
          } catch (error) {
            console.error('Error marking document as signed:', error);
            setOtpError('Ошибка при подписании документа');
            setSigningInProgress(false);
          }
        } else {
          setOtpError('Неверный код подтверждения');
          setSigningInProgress(false);
        }
      }, 1500);
    } catch (error: any) {
      setOtpError(error.message || 'Ошибка при подтверждении кода');
      setSigningInProgress(false);
    }
  };
  
  // Рендер модального окна для подписания
  const renderSignModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
        >
          {signSuccess ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Документ успешно подписан!</h3>
              <p className="text-gray-600 mb-4">Спасибо за использование нашего сервиса.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Подписание документа</h3>
                <button 
                  onClick={() => setShowSignModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {!otpSent ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Для подписания документа мы отправим проверочный код на ваш номер телефона.
                  </p>
                  <p className="font-medium mb-6">{request?.phone_number}</p>
                  <button
                    onClick={handleSendOtp}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Отправить код
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Введите код подтверждения, отправленный на номер {request?.phone_number}
                  </p>
                  <input
                    type="text"
                    placeholder="Введите код"
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={signingInProgress}
                  />
                  {otpError && (
                    <p className="text-red-500 mb-4">{otpError}</p>
                  )}
                  <button
                    onClick={handleConfirmOtp}
                    disabled={!otpCode || signingInProgress}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {signingInProgress ? (
                      <span className="flex items-center justify-center">
                        <Spinner size="sm" className="mr-2" />
                        Подтверждение...
                      </span>
                    ) : (
                      'Подписать документ'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    );
  };

  // Если загрузка
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Загрузка документа...</p>
        </div>
      </div>
    );
  }
  
  // Если ошибка
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ошибка при загрузке документа</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }
  
  // Рендер страницы с документом
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Верхняя панель */}
      <div className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Вернуться
          </button>
          
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium">График платежей</span>
          </div>
          
          {request?.status !== 'document_signed' && (
            <button 
              onClick={handleSign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Подписать документ
            </button>
          )}
          
          {request?.status === 'document_signed' && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Документ подписан</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Содержимое документа */}
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">График платежей</h2>
          
          {paymentSchedule && (
            <PaymentScheduleDocument data={paymentSchedule} />
          )}
        </div>
      </div>
      
      {/* Модальное окно для подписания */}
      {showSignModal && renderSignModal()}
    </div>
  );
}
