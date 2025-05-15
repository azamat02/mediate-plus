import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Client, ClientStatus, ClientsState } from '../types';
import { supabase } from '../lib/supabase';
import { mobizonApi } from '../lib/mobizon';

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  // Инициализация - загрузка клиентов из Supabase
  initialize: async () => {
    try {
      set({ loading: true, error: null });
      
      // Получаем клиентов из базы данных
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Преобразуем данные из БД в формат клиентов для приложения
      const clients: Client[] = data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        debtAmount: Number(item.debt_amount),
        status: item.status as ClientStatus,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isNew: item.is_new,
        documentUrl: item.document_url
      }));
      
      set({ clients, loading: false });
    } catch (error) {
      console.error('Error initializing clients:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при загрузке клиентов'
      });
    }
  },

  // Добавление нового клиента
  addClient: async (clientData) => {
    try {
      set({ loading: true, error: null });
      
      // Генерируем ID клиента
      const id = `CL-${nanoid(6).toUpperCase()}`;
      const now = new Date().toISOString();
      
      // Создаем полный URL для документа
      // Используем динамическое определение базового URL
      let baseUrl = '';
      
      // В браузере используем window.location.origin
      if (typeof window !== 'undefined') {
        baseUrl = window.location.origin;
      } else {
        // Резервный URL для серверного рендеринга или тестов
        baseUrl = 'https://mediate-plus.windsurf.build';
      }
      
      const documentUrl = `${baseUrl}/client/${id}/offer`;
      
      console.log('Creating new client with URL:', documentUrl);
      
      // Создаем объект клиента
      const newClient: Client = {
        ...clientData,
        id,
        status: 'Создан',
        createdAt: now,
        updatedAt: now,
        isNew: true,
        documentUrl
      };
      
      // Сохраняем клиента в базе данных
      const { error } = await supabase.from('clients').insert({
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone,
        debt_amount: newClient.debtAmount,
        status: newClient.status,
        created_at: newClient.createdAt,
        updated_at: newClient.updatedAt,
        is_new: newClient.isNew,
        document_url: newClient.documentUrl
      });
      
      if (error) {
        throw error;
      }
      
      // Добавляем клиента в локальное состояние
      set((state) => ({
        clients: [newClient, ...state.clients],
        loading: false
      }));
      
      // Автоматически отправляем SMS после добавления клиента
      setTimeout(() => {
        get().sendSms(newClient);
      }, 1000);
      
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при добавлении клиента'
      });
      throw error;
    }
  },

  // Обновление статуса клиента
  updateClientStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      
      // Обновляем статус в базе данных
      const { error } = await supabase
        .from('clients')
        .update({ 
          status, 
          updated_at: new Date().toISOString(),
          is_new: false 
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Обновляем статус клиента в локальном состоянии
      set((state) => ({
        clients: state.clients.map(client => 
          client.id === id 
            ? { ...client, status, updatedAt: new Date().toISOString(), isNew: false } 
            : client
        ),
        loading: false
      }));
      
    } catch (error) {
      console.error('Error updating client status:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при обновлении статуса клиента'
      });
    }
  },

  // Отправка SMS клиенту
  sendSms: async (client) => {
    try {
      set({ loading: true, error: null });
      
      if (!client || !client.phone) {
        console.error('Ошибка: клиент или номер телефона не указаны', client);
        set({ 
          loading: false,
          error: 'Ошибка: номер телефона не указан'
        });
        return false;
      }
      
      // Проверяем формат номера телефона перед отправкой
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      const cleanPhone = client.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('8') && cleanPhone.length === 11 
        ? '+7' + cleanPhone.substring(1) 
        : (cleanPhone.length === 10 ? '+7' + cleanPhone : '+' + cleanPhone);
      
      if (!phoneRegex.test(formattedPhone)) {
        console.error(`Неверный формат номера телефона: ${client.phone} (форматированный: ${formattedPhone})`);
        set({
          loading: false,
          error: `Неверный формат номера телефона: ${client.phone}. Номер должен содержать от 10 до 15 цифр.`
        });
        return false;
      }
      
      // Формируем текст сообщения с полным URL
      const message = `Здравствуйте, ${client.name}!
Это платформа Mediate+.
Мы предлагаем вам новые условия реструктуризации вашей задолженности.
Для ознакомления с предложением перейдите по ссылке: ${client.documentUrl}`;
      
      console.log('Отправка SMS клиенту:', {
        id: client.id,
        name: client.name,
        phone: client.phone,
        formattedPhone,
        messageLength: message.length
      });
      
      // Проверяем длину сообщения (для SMS обычно ограничение 160 символов для одного сообщения)
      if (message.length > 160) {
        console.warn(`Внимание: длина сообщения (${message.length} символов) превышает стандартный лимит в 160 символов для одного SMS`);
      }
      
      // Проверяем доступность API ключа
      if (!import.meta.env.VITE_MOBIZON_API_KEY) {
        console.warn('API ключ Mobizon не найден в переменных окружения. Используется резервный ключ.');
      }
      
      // Отправляем SMS через Mobizon API с использованием предварительно отформатированного номера
      const success = await mobizonApi.sendSms(formattedPhone, message);
      
      if (success) {
        console.log(`SMS успешно отправлено клиенту ${client.name} (${formattedPhone})`);
        // Обновляем статус клиента
        await get().updateClientStatus(client.id, 'Отправлено сообщение');
        return true;
      } else {
        console.error(`Не удалось отправить SMS клиенту ${client.name} (${formattedPhone})`);
        set({ 
          error: 'Не удалось отправить SMS. Проверьте номер телефона и попробуйте снова.'
        });
        return false;
      }
    } catch (error) {
      console.error('Ошибка при отправке SMS:', error);
      
      // Более детальное сообщение об ошибке
      let errorMessage = 'Ошибка при отправке SMS';
      
      if (error instanceof Error) {
        errorMessage = `Ошибка при отправке SMS: ${error.message}`;
        
        // Добавляем специфичные сообщения для распространенных ошибок
        if (error.message.includes('timeout')) {
          errorMessage = 'Превышено время ожидания при отправке SMS. Проверьте интернет-соединение.'; 
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Ошибка сети при отправке SMS. Проверьте интернет-соединение.'; 
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Ошибка авторизации при отправке SMS. Проверьте API ключ Mobizon.'; 
        }
      }
      
      set({ 
        loading: false,
        error: errorMessage
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Получение клиента по номеру телефона
  getClientByPhone: (phone) => {
    return get().clients.find(client => client.phone === phone);
  },

  // Получение клиента по ID
  getClientById: (id) => {
    const client = get().clients.find(client => client.id === id);
    console.log('Getting client by ID:', id, 'Result:', client);
    return client;
  }
}));