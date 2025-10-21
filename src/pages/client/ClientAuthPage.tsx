import React, { useState } from 'react';
import { PhoneInput } from '../../components/client/PhoneInput';
import { OtpVerification } from '../../components/client/OtpVerification';
import { useClientAuthStore } from '../../store/clientAuthStore';
import { useNavigate } from 'react-router-dom';

export const ClientAuthPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'user_data'>('phone');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Добавляем состояние загрузки
  const [isTransitioning, setIsTransitioning] = useState(false); // Состояние для анимации перехода
  const { 
    phoneNumber, 
    setPhoneNumber, 
    verifyPhone, 
    verifyOtp, 
    submitUserData 
  } = useClientAuthStore();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (phone: string) => {
    if (!termsAccepted) {
      alert('Пожалуйста, примите условия оферты');
      return;
    }
    
    // Устанавливаем состояние загрузки
    setIsLoading(true);
    setPhoneNumber(phone);
    
    try {
      // Выполняем запрос на проверку телефона
      await verifyPhone(phone);
      
      // Устанавливаем состояние перехода для анимации
      setIsTransitioning(true);
      
      // Добавляем небольшую задержку для плавного перехода
      setTimeout(() => {
        setStep('otp');
        setIsLoading(false);
        setIsTransitioning(false);
      }, 800); // Увеличиваем задержку для более надежного перехода
    } catch (error) {
      console.error('Error verifying phone:', error);
      setIsLoading(false);
      alert('Ошибка при отправке кода. Пожалуйста, попробуйте снова.');
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    // Устанавливаем состояние загрузки
    setIsLoading(true);
    
    try {
      const isNewUser = await verifyOtp(otp);
      
      // Устанавливаем состояние перехода для анимации
      setIsTransitioning(true);
      
      // Добавляем небольшую задержку для плавного перехода
      setTimeout(() => {
        if (isNewUser) {
          // Если новый пользователь, переходим к заполнению данных
          setStep('user_data');
        } else {
          // Если существующий пользователь, переходим в личный кабинет
          navigate('/client/dashboard');
        }
        
        setIsLoading(false);
        setIsTransitioning(false);
      }, 800);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setIsLoading(false);
      alert('Неверный код. Пожалуйста, попробуйте снова.');
    }
  };

  // Новый обработчик для отправки данных пользователя
  const handleUserDataSubmit = async (data: { iin: string; fullName: string; birthDate: string }) => {
    try {
      await submitUserData(data);
      // После успешного сохранения данных переходим в личный кабинет
      navigate('/client/dashboard');
    } catch (error) {
      console.error('Error submitting user data:', error);
      alert('Ошибка при сохранении данных. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col overflow-hidden">
      {/* Декоративные элементы для минималистичного дизайна */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-tl from-blue-500/10 via-indigo-500/5 to-transparent"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Логотип с улучшенным дизайном */}
          <div className="flex justify-center mb-12">
            <div className="relative">
            <img
                  src={document.documentElement.classList.contains('dark')
                    ? "/images/logo-dark.svg"
                    : "/images/logo-light.svg"
                  }
                  alt="Kelisim Logo"
                  className="h-7 w-auto mb-2 animate-float"
                />
            </div>
          </div>
          
          {/* Контейнер для всех шагов с абсолютным позиционированием */}
          <div className="relative min-h-[400px]">
            {/* Индикатор загрузки и перехода */}
            {(isLoading || isTransitioning) && (
              <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
                  <p className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium">
                    {isTransitioning ? 'Переход к следующему шагу...' : 'Отправка кода...'}  
                  </p>
                </div>
              </div>
            )}
            
            {/* Шаг 1: Телефон */}
            <div 
              className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out transform ${step === 'phone' ? 'translate-x-0 opacity-100 z-10' : step === 'otp' ? '-translate-x-full opacity-0 z-0' : 'translate-x-full opacity-0 z-0'}`}
            >
              {step === 'phone' && (
                <PhoneInput 
                  onSubmit={handlePhoneSubmit} 
                  termsAccepted={termsAccepted}
                  onTermsChange={setTermsAccepted}
                />
              )}
            </div>
            
            {/* Шаг 2: OTP */}
            <div 
              className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out transform ${step === 'otp' ? 'translate-x-0 opacity-100 z-10' : step === 'phone' ? 'translate-x-full opacity-0 z-0' : '-translate-x-full opacity-0 z-0'}`}
            >
              {step === 'otp' && (
                <OtpVerification 
                  phoneNumber={phoneNumber} 
                  onSubmit={handleOtpSubmit} 
                  onBack={() => setStep('phone')}
                />
              )}
            </div>
            
            {/* Шаг 3: Данные пользователя */}
            <div 
              className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out transform ${step === 'user_data' ? 'translate-x-0 opacity-100 z-10' : step === 'otp' ? 'translate-x-full opacity-0 z-0' : '-translate-x-full opacity-0 z-0'}`}
            >
              {step === 'user_data' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setStep('otp')}
                      className="p-2 mr-2 rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 dark:text-gray-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Личные данные
                    </h2>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    handleUserDataSubmit({
                      iin: formData.get('iin') as string,
                      fullName: formData.get('fullName') as string,
                      birthDate: formData.get('birthDate') as string
                    });
                  }} className="space-y-6">
                    <div>
                      <label htmlFor="iin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ИИН (Индивидуальный идентификационный номер)
                      </label>
                      <input
                        type="text"
                        id="iin"
                        name="iin"
                        required
                        maxLength={12}
                        pattern="[0-9]{12}"
                        placeholder="12 цифр"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ФИО (полностью)
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        placeholder="Иванов Иван Иванович"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Дата рождения
                      </label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full relative overflow-hidden group py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span className="absolute inset-0 w-full h-full transition-all duration-1000 ease-out transform translate-x-0 group-hover:translate-x-full bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0"></span>
                        <span className="relative flex items-center justify-center">
                          Сохранить и продолжить
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Индикатор прогресса */}
          <div className="mt-8 flex justify-center space-x-2">
            {['phone', 'otp', 'user_data'].map((s, index) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-indigo-500' : index < ['phone', 'otp', 'user_data'].indexOf(step) ? 'w-6 bg-indigo-300' : 'w-6 bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Минималистичный футер */}
      <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-600 relative z-10">
        © 2025 Kelisim.bar • Все права защищены
      </div>
    </div>
  );
};
