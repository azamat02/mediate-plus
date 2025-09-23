import React, { useState } from 'react';
import { mobizonApi } from '../../lib/mobizon';

const MobizonTest: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+77905488851');
  const [message, setMessage] = useState('Тест сообщения для Mediate+: 1234');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTestBalance = async () => {
    setIsLoading(true);
    setResult('Проверка баланса...');
    
    try {
      const balance = await mobizonApi.getBalance();
      if (balance !== null) {
        setResult(`✓ Баланс: ${balance} тенге`);
      } else {
        setResult('✗ Не удалось получить баланс');
      }
    } catch (error) {
      setResult(`✗ Ошибка проверки баланса: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!phoneNumber || !message) {
      setResult('✗ Введите номер телефона и сообщение');
      return;
    }

    setIsLoading(true);
    setResult('Отправка SMS...');
    
    try {
      console.log('[MobizonTest] Отправка SMS на номер:', phoneNumber);
      console.log('[MobizonTest] Текст сообщения:', message);
      
      const success = await mobizonApi.sendSms(phoneNumber, message);
      setResult(success ? '✓ SMS отправлено успешно' : '✗ Ошибка отправки SMS');
    } catch (error) {
      console.error('[MobizonTest] Ошибка:', error);
      setResult(`✗ Ошибка отправки: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Тест Mobizon API</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleTestBalance}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Проверка...' : 'Проверить баланс'}
        </button>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Номер телефона:
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+77905488851"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Поддерживаемые форматы: +77905488851, 87905488851, 77905488851
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Сообщение:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите текст сообщения"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500">
            Символов: {message.length}/160
          </p>
        </div>

        <button
          onClick={handleSendSms}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Отправка...' : 'Отправить SMS'}
        </button>

        {result && (
          <div className={`p-3 rounded-md ${
            result.startsWith('✓') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {result}
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded-md">
          <p><strong>Согласно документации Mobizon:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Номер должен содержать <strong>только цифры</strong></li>
            <li>Формат: 77273573423 (без символа "+")</li>
            <li>Для Казахстана: 11 цифр, начинающихся с "7"</li>
            <li>Символ "+" автоматически удаляется</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobizonTest;