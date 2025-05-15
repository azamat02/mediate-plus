import React, { useState, useEffect, useRef } from 'react';

interface PhoneInputProps {
  onSubmit: (phone: string) => void;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ 
  onSubmit, 
  termsAccepted, 
  onTermsChange 
}) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус на поле ввода при загрузке
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setError('Пожалуйста, введите корректный номер телефона');
      inputRef.current?.focus();
      return;
    }
    
    if (!termsAccepted) {
      setError('Пожалуйста, примите условия оферты');
      return;
    }
    
    // Имитация загрузки для лучшего UX
    setIsLoading(true);
    
    // Format phone to include country code if not present
    let formattedPhone = cleanedPhone;
    if (!cleanedPhone.startsWith('7') && !cleanedPhone.startsWith('8')) {
      formattedPhone = `7${cleanedPhone}`;
    } else if (cleanedPhone.startsWith('8')) {
      formattedPhone = `7${cleanedPhone.substring(1)}`;
    }
    
    // Небольшая задержка для лучшего UX
    setTimeout(() => {
      onSubmit(formattedPhone);
      setIsLoading(false);
    }, 600);
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    
    let formattedValue = '';
    if (digits.length > 0) {
      formattedValue = `+${digits.substring(0, 1)}`;
      if (digits.length > 1) {
        formattedValue += ` (${digits.substring(1, 4)}`;
      }
      if (digits.length > 4) {
        formattedValue += `) ${digits.substring(4, 7)}`;
      }
      if (digits.length > 7) {
        formattedValue += `-${digits.substring(7, 9)}`;
      }
      if (digits.length > 9) {
        formattedValue += `-${digits.substring(9, 11)}`;
      }
    }
    
    setPhone(formattedValue);
    setError('');
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="inline-block transform transition-transform duration-700 hover:scale-105">
            Добро пожаловать
          </span>
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Введите номер телефона для входа или регистрации
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative">
          <div className="relative group">
            <input
              ref={inputRef}
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="+7 (___) ___-__-__"
              className={`peer w-full px-4 pt-6 pb-2 text-lg bg-transparent border-0 border-b-2 ${isFocused || phone ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-300 dark:border-gray-700'} focus:ring-0 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-all duration-300 placeholder-transparent dark:text-white`}
            />
            <label 
              htmlFor="phone" 
              className={`absolute left-4 -top-0.5 text-sm text-gray-500 dark:text-gray-400 transition-all duration-300 ${isFocused || phone ? 'transform scale-75 -translate-y-3' : 'transform translate-y-3'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-3 peer-focus:scale-75 peer-focus:-translate-y-3`}
            >
              Номер телефона
            </label>
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-opacity duration-300 ${phone ? 'opacity-100' : 'opacity-0'}`}>
              {phone.length >= 16 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-2 flex items-center text-red-500 dark:text-red-400 animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">
                {error}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
              className="absolute opacity-0 w-0 h-0"
            />
            <div 
              className={`w-5 h-5 border rounded transition-all duration-200 flex items-center justify-center ${termsAccepted ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-600 dark:border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}
              onClick={() => onTermsChange(!termsAccepted)}
            >
              {termsAccepted && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <div className="ml-3">
            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              Я согласен с <a href="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 border-b border-indigo-600 dark:border-indigo-400 border-dashed hover:border-solid transition-all duration-200">условиями оферты</a>
            </label>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full relative overflow-hidden group py-3.5 px-4 rounded-full text-base font-medium text-white ${isLoading ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed' : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out transform translate-x-0 ${isLoading ? 'translate-x-0' : 'group-hover:translate-x-full'} bg-gradient-to-r from-indigo-500/0 via-indigo-400/30 to-indigo-500/0`}></span>
            <span className="relative flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Отправка...
                </>
              ) : (
                'Продолжить'
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
