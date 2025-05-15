import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface IinInputProps {
  onSubmit: (iin: string) => void;
  onBack: () => void;
}

export const IinInput: React.FC<IinInputProps> = ({ onSubmit, onBack }) => {
  const [iin, setIin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const cleanedIin = iin.replace(/\D/g, '');
    if (!cleanedIin || cleanedIin.length !== 12) {
      setError('ИИН должен содержать 12 цифр');
      return;
    }
    
    onSubmit(cleanedIin);
  };

  const handleIinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 12) {
      setIin(digits);
      setError('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="p-2 mr-2 rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 dark:text-gray-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Введите ИИН
        </h2>
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 flex items-center">
        <div className="bg-indigo-100 dark:bg-indigo-800 rounded-full p-3 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
          Для продолжения нам необходим ваш индивидуальный идентификационный номер (ИИН)
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label htmlFor="iin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ИИН
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
            </div>
            <input
              id="iin"
              name="iin"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              required
              value={iin}
              onChange={handleIinChange}
              placeholder="Введите 12 цифр"
              className="appearance-none block w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
            />
          </div>
          {error && (
            <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">
                {error}
              </p>
            </div>
          )}
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Ваш ИИН используется для идентификации и не будет передан третьим лицам
            </p>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Продолжить
          </button>
        </div>
      </form>
    </div>
  );
};
