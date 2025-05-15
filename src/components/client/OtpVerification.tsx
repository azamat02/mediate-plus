import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useClientAuthStore } from '../../store/clientAuthStore';

interface OtpVerificationProps {
  phoneNumber: string;
  onSubmit: (otp: string) => void;
  onBack: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  phoneNumber, 
  onSubmit, 
  onBack 
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { resendOtp, loading: resendLoading } = useClientAuthStore();
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Start countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // If pasting multiple digits, distribute them
      const digits = value.split('').slice(0, 4);
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus on the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex(val => val === '');
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 4) {
        inputRefs[nextEmptyIndex].current?.focus();
      } else {
        inputRefs[3].current?.focus();
      }
    } else {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
    
    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Пожалуйста, введите 4-значный код');
      return;
    }
    
    onSubmit(otpValue);
  };

  const handleResendCode = async () => {
    if (!canResend || resendLoading) return;
    
    try {
      // Reset timer and resend flag
      setTimer(60);
      setCanResend(false);
      
      // Вызываем функцию повторной отправки OTP из store
      await resendOtp();
      
      // Clear inputs
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      // Если произошла ошибка, разрешаем повторную отправку
      setCanResend(true);
      setTimer(0);
    }
  };

  // Format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="p-2 mr-2 rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 dark:text-gray-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Подтверждение
        </h2>
      </div>
      
      <div className="relative overflow-hidden p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/30">
        <div className="absolute top-0 right-0 w-16 h-16 -mt-6 -mr-6 bg-blue-100 dark:bg-blue-800/20 rounded-full opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 -mb-4 -ml-4 bg-indigo-100 dark:bg-indigo-800/20 rounded-full opacity-70"></div>
        
        <div className="flex items-center relative z-10">
          <div className="flex-shrink-0 mr-4 bg-indigo-100 dark:bg-indigo-700/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-indigo-800 dark:text-indigo-200">
              Мы отправили код подтверждения
            </p>
            <p className="text-lg text-indigo-700 dark:text-indigo-300 font-bold">
              {formatPhoneForDisplay(phoneNumber)}
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Введите код из СМС
            </label>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Для демо: <span className="font-medium text-indigo-600 dark:text-indigo-400">1234</span>
            </div>
          </div>
          
          <div className="flex justify-between gap-3">
            {otp.map((digit, index) => (
              <div key={index} className="relative w-full">
                <input
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all duration-200 animate-borderPulse"
                />
                {index < 3 && (
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    -
                  </div>
                )}
              </div>
            ))}
          </div>
          {error && (
            <div className="mt-3 flex items-center text-red-600 dark:text-red-400 animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">
                {error}
              </p>
            </div>
          )}
        </div>
        
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              Отправить код повторно
            </button>
          ) : (
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 py-2 px-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Отправить код повторно через <span className="font-medium">{timer}</span> сек</span>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            className="w-full relative overflow-hidden group py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="absolute inset-0 w-full h-full transition-all duration-1000 ease-out transform translate-x-0 group-hover:translate-x-full bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0"></span>
            <span className="relative flex items-center justify-center">
              Подтвердить
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
