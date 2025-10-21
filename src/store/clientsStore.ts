import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Client, ClientStatus, ClientsState } from '../types';
import { firestore } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { smsService } from '../services/smsService';

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  // Инициализация - загрузка клиентов из Firestore
  initialize: async () => {
    try {
      set({ loading: true, error: null });

      // Получаем клиентов из Firestore
      const clientsCollection = collection(firestore, 'clients');
      const clientsQuery = query(clientsCollection, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(clientsQuery);

      // Преобразуем данные из БД в формат клиентов для приложения
      const clients: Client[] = [];
      snapshot.forEach((doc) => {
        const item = doc.data();
        clients.push({
          id: item.id,
          name: item.name,
          phone: item.phone,
          debtAmount: Number(item.debt_amount),
          status: item.status as ClientStatus,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          isNew: item.is_new,
          documentUrl: item.document_url
        });
      });

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
      
      // Сохраняем клиента в Firestore
      const clientDoc = doc(firestore, 'clients', newClient.id);
      await setDoc(clientDoc, {
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

      // Обновляем статус в Firestore
      const clientDoc = doc(firestore, 'clients', id);
      await updateDoc(clientDoc, {
        status,
        updated_at: new Date().toISOString(),
        is_new: false
      });

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
        console.error('[ClientsStore] Ошибка: клиент или номер телефона не указаны');
        set({
          loading: false,
          error: 'Ошибка: номер телефона не указан'
        });
        return false;
      }

      // Формируем текст сообщения с полным URL
      const message = `Здравствуйте, ${client.name}!
Это платформа Kelisim.bar.
Мы предлагаем вам новые условия реструктуризации вашей задолженности.
Для ознакомления с предложением перейдите по ссылке: ${client.documentUrl}`;

      console.log('[ClientsStore] Отправка SMS клиенту:', {
        id: client.id,
        name: client.name,
        phone: client.phone
      });

      // Отправляем SMS через новый сервис
      const success = await smsService.sendSms(
        client.phone,
        message,
        client.id,
        client.name
      );

      if (success) {
        console.log(`[ClientsStore] SMS успешно отправлено клиенту ${client.name}`);
        // Обновляем статус клиента
        await get().updateClientStatus(client.id, 'Отправлено сообщение');
        set({ loading: false });
        return true;
      } else {
        console.error(`[ClientsStore] Не удалось отправить SMS клиенту ${client.name}`);
        set({
          loading: false,
          error: 'Не удалось отправить SMS. Проверьте номер телефона и попробуйте снова.'
        });
        return false;
      }
    } catch (error) {
      console.error('[ClientsStore] Ошибка при отправке SMS:', error);

      const errorMessage = error instanceof Error
        ? `Ошибка при отправке SMS: ${error.message}`
        : 'Ошибка при отправке SMS';

      set({
        loading: false,
        error: errorMessage
      });
      return false;
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