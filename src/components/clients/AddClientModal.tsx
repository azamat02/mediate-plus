import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useClientsStore } from '../../store/clientsStore';
import { Spinner } from '../ui/Spinner';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clientId: string) => void;
}

interface AddClientFormData {
  name: string;
  phone: string;
  debtAmount: number;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const { addClient, loading, error, getClientByPhone } = useClientsStore();
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<AddClientFormData>();

  if (!isOpen) return null;

  const onSubmit = async (data: AddClientFormData) => {
    try {
      // Проверяем, существует ли клиент с таким номером телефона
      const existingClient = getClientByPhone(data.phone);
      if (existingClient) {
        setPhoneError('Клиент с таким номером телефона уже существует');
        return;
      }

      // Добавляем клиента
      const client = await addClient({
        name: data.name,
        phone: data.phone,
        debtAmount: data.debtAmount
      });
      
      // Сбрасываем форму
      reset();
      setPhoneError(null);
      
      // Закрываем модальное окно и вызываем callback
      onClose();
      onSuccess(client.id);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-primary-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-primary-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Добавить нового клиента
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ФИО клиента
              </label>
              <input
                id="name"
                type="text"
                className="input mt-1"
                placeholder="Иванов Иван Иванович"
                {...register('name', { 
                  required: 'ФИО клиента обязательно',
                  minLength: {
                    value: 3,
                    message: 'ФИО должно содержать минимум 3 символа'
                  }
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Номер телефона
              </label>
              <input
                id="phone"
                type="tel"
                className="input mt-1"
                placeholder="+7 (XXX) XXX-XX-XX"
                {...register('phone', { 
                  required: 'Номер телефона обязателен',
                  pattern: {
                    value: /^\+7\d{10}$/,
                    message: 'Введите номер в формате +7XXXXXXXXXX'
                  }
                })}
                onChange={() => setPhoneError(null)}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
              )}
              {phoneError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{phoneError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="debtAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Сумма задолженности (₽)
              </label>
              <input
                id="debtAmount"
                type="number"
                className="input mt-1"
                placeholder="50000"
                min="1"
                step="1"
                {...register('debtAmount', { 
                  required: 'Сумма задолженности обязательна',
                  min: {
                    value: 1,
                    message: 'Сумма должна быть положительной'
                  },
                  valueAsNumber: true
                })}
              />
              {errors.debtAmount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.debtAmount.message}</p>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Добавление...
                </span>
              ) : (
                'Добавить клиента'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};