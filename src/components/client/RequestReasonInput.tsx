import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface RequestReasonInputProps {
  onSubmit: (reason: string, reasonType: string) => void;
  onBack: () => void;
}

export const RequestReasonInput: React.FC<RequestReasonInputProps> = ({ onSubmit, onBack }) => {
  const [reasonType, setReasonType] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const reasonTypes = [
    { id: 'payment_schedule', label: 'Запросить новый график платежей' },
    { id: 'payment_difficulty', label: 'Сложности с выплатой' },
    { id: 'contract_dispute', label: 'Спор по условиям договора' },
    { id: 'other', label: 'Другое' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reasonType) {
      setError('Пожалуйста, выберите причину обращения');
      return;
    }
    
    if (reasonType === 'other' && !reason.trim()) {
      setError('Пожалуйста, опишите причину обращения');
      return;
    }
    
    onSubmit(reason, reasonType);
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
          Причина обращения
        </h2>
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 flex items-center">
        <div className="bg-indigo-100 dark:bg-indigo-800 rounded-full p-3 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
          Пожалуйста, укажите причину вашего обращения
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Выберите причину
          </label>
          <div className="space-y-3">
            {reasonTypes.map((type) => (
              <div 
                key={type.id} 
                className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${reasonType === type.id 
                  ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/30' 
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'}`}
              >
                <input
                  id={`reason-${type.id}`}
                  name="reasonType"
                  type="radio"
                  value={type.id}
                  checked={reasonType === type.id}
                  onChange={() => {
                    setReasonType(type.id);
                    setError('');
                  }}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <label
                  htmlFor={`reason-${type.id}`}
                  className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer w-full"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
          
          {reasonType === 'other' && (
            <div className="mt-5 transition-all duration-300 animate-fadeIn">
              <label htmlFor="reason-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Опишите причину обращения
              </label>
              <div>
                <textarea
                  id="reason-text"
                  name="reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                  }}
                  className="appearance-none block w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                  placeholder="Опишите вашу ситуацию подробнее..."
                />
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-3 flex items-center text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">
                {error}
              </p>
            </div>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Отправить запрос
          </button>
        </div>
      </form>
    </div>
  );
};
