import { create } from 'zustand';
import { mobizonApi } from '../lib/mobizon';
import { auth, firestore, createDocument, getDocument, updateDocument } from '../lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface UserData {
  phoneNumber: string;
  iin?: string;
  fullName?: string;
  birthDate?: string;
  createdAt: string;
}

interface ClientAuthState {
  phoneNumber: string;
  iin: string;
  fullName: string;
  birthDate: string;
  isAuthenticated: boolean;
  isNewUser: boolean;
  loading: boolean;
  error: string | null;
  otpCode: string | null; // Хранение OTP кода
  userData: UserData | null;
  
  // Actions
  setPhoneNumber: (phone: string) => void;
  verifyPhone: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>; // Returns true if new user
  submitUserData: (data: { iin: string; fullName: string; birthDate: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resendOtp: () => Promise<void>; // Повторная отправка OTP
  loadState: () => void; // Явная загрузка состояния из localStorage
}

// Функция для сохранения состояния в localStorage
const saveStateToStorage = (state: Partial<ClientAuthState>) => {
  try {
    const currentState = JSON.parse(localStorage.getItem('clientAuthState') || '{}');
    const newState = { ...currentState, ...state };
    localStorage.setItem('clientAuthState', JSON.stringify(newState));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

// Функция для загрузки состояния из localStorage
const loadStateFromStorage = (): Partial<ClientAuthState> => {
  try {
    const savedState = localStorage.getItem('clientAuthState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
  return {};
};

// Загружаем сохраненное состояние
const savedState = loadStateFromStorage();

export const useClientAuthStore = create<ClientAuthState>((set, get) => ({
  // Инициализируем состояние из localStorage или используем значения по умолчанию
  phoneNumber: savedState.phoneNumber || '',
  iin: savedState.iin || '',
  fullName: savedState.fullName || '',
  birthDate: savedState.birthDate || '',
  isAuthenticated: savedState.isAuthenticated || false,
  isNewUser: savedState.isNewUser || false,
  loading: false,
  error: null,
  otpCode: null,
  userData: savedState.userData || null,
  
  setPhoneNumber: (phone) => {
    const newState = { phoneNumber: phone };
    set(newState);
    saveStateToStorage(newState);
  },
  
  verifyPhone: async (phone: string) => {
    try {
      set({ loading: true, error: null });
      
      // Проверяем, существует ли пользователь в Firestore
      let isNewUser = true;
      let userData: UserData | null = null;
      
      try {
        // Проверяем, существует ли пользователь в Firestore
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        
        // Запрос к Firestore для поиска пользователя по номеру телефона
        const usersQuery = query(
          collection(firestore, 'client_users'),
          where('phoneNumber', '==', formattedPhone)
        );
        const querySnapshot = await getDocs(usersQuery);
        
        // Преобразуем результаты запроса в массив объектов
        const users: UserData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.phoneNumber && data.createdAt) {
            users.push({ ...data, id: doc.id } as UserData);
          }
        });
        
        if (users.length > 0) {
          // Пользователь существует
          isNewUser = false;
          userData = users[0];
          
          // Обновляем состояние данными пользователя
          set({
            iin: userData.iin || '',
            fullName: userData.fullName || '',
            birthDate: userData.birthDate || '',
          });
          
          console.log('Пользователь найден в Firestore:', userData);
        } else {
          console.log('Пользователь не найден, это новый пользователь');
        }
      } catch (firestoreError) {
        console.error('Ошибка при проверке пользователя в Firestore:', firestoreError);
        // Продолжаем процесс верификации, даже если была ошибка Firestore
      }
      
      try {
        // Форматируем номер телефона
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        
        // Генерируем код подтверждения (4 цифры)
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Уникальный ID для верификации
        const verificationId = uuidv4();
        
        // Сохраняем код в Firestore
        await createDocument('verifications', {
          code: otpCode,
          phoneNumber: formattedPhone,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 минут
          verified: false
        }, verificationId);
        
        // Отправляем SMS через Mobizon
        const message = `Ваш код подтверждения для Mediate+: ${otpCode}`;
        const smsResult = await mobizonApi.sendSms(formattedPhone, message);
        
        if (!smsResult) {
          throw new Error('Не удалось отправить SMS с кодом подтверждения');
        }
        
        console.log('Код подтверждения отправлен на номер', formattedPhone);
        
        // Имитация задержки для лучшего UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Сохраняем ID верификации в глобальной переменной для последующей проверки
        // @ts-ignore - добавляем свойство в window для доступа из любого места
        window.verificationId = verificationId;
        
        // Обновляем состояние
        set({
          phoneNumber: formattedPhone,
          loading: false,
          isNewUser
        });
        
        saveStateToStorage({
          phoneNumber: formattedPhone,
          isNewUser
        });
      } catch (smsError) {
        console.error('Ошибка при отправке SMS через Mobizon:', smsError);
        set({ 
          loading: false,
          error: smsError instanceof Error ? smsError.message : 'Ошибка при отправке SMS верификации'
        });
        throw smsError;
      }
    } catch (error) {
      console.error('Error verifying phone:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при верификации телефона'
      });
      throw error;
    }
  },
  
  verifyOtp: async (otp: string) => {
    try {
      const phone = get().phoneNumber;
      const isNewUser = get().isNewUser;
      
      if (!phone) {
        throw new Error('Номер телефона не указан');
      }
      
      set({ loading: true, error: null });
      
      // @ts-ignore - доступ к verificationId, сохраненному ранее
      const verificationId = window.verificationId;
      
      if (!verificationId) {
        throw new Error('Не найден ID верификации. Пожалуйста, запросите код повторно');
      }
      
      // Получаем запись верификации из Firestore
      const verification = await getDocument('verifications', verificationId);
      
      if (!verification) {
        throw new Error('Запись верификации не найдена. Пожалуйста, запросите код повторно');
      }
      
      // Проверяем срок действия кода
      const expiresAt = verification.expiresAt?.toDate?.() || new Date(verification.expiresAt);
      if (expiresAt < new Date()) {
        throw new Error('Срок действия кода истек. Пожалуйста, запросите новый код');
      }
      
      // Проверяем, что код совпадает
      if (verification.code !== otp) {
        throw new Error('Неверный код подтверждения. Пожалуйста, попробуйте еще раз');
      }
      
      // Обновляем запись верификации
      await updateDocument('verifications', verificationId, {
        verified: true,
        verifiedAt: new Date()
      });
      
      // Если дошли до этой точки, значит верификация прошла успешно
      const currentState = get();
      const userIsNew = currentState.isNewUser;
      
      // Если это новый пользователь, мы должны перевести его на экран заполнения данных
      // Если существующий - считаем его аутентифицированным
      const newState = {
        loading: false,
        isAuthenticated: !userIsNew,
        otpCode: otp // Сохраняем код для возможных дальнейших действий
      };
      
      set(newState);
      saveStateToStorage({
        isAuthenticated: !userIsNew
      });
      
      return userIsNew;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Неверный код подтверждения. Пожалуйста, попробуйте еще раз';
      
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
  
  submitUserData: async (data: { iin: string; fullName: string; birthDate: string }) => {
    try {
      set({ loading: true, error: null });
      
      // Валидация ИИН
      const cleanedIin = data.iin.replace(/\D/g, '');
      if (cleanedIin.length !== 12) {
        throw new Error('ИИН должен содержать 12 цифр');
      }
      
      const phoneNumber = get().phoneNumber;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      try {
        // Разделяем полное имя на имя и фамилию
        const nameParts = data.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Создаем объект данных пользователя
        const userData = {
          phoneNumber: formattedPhone,
          iin: cleanedIin,
          fullName: data.fullName,
          firstName: firstName,
          lastName: lastName,
          birthDate: data.birthDate,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        // Проверяем, существует ли пользователь с таким номером телефона
        const usersQuery = query(
          collection(firestore, 'client_users'),
          where('phoneNumber', '==', formattedPhone)
        );
        const querySnapshot = await getDocs(usersQuery);
        
        // Если пользователь уже существует, обновляем его данные
        if (!querySnapshot.empty) {
          // Получаем ID первого (и скорее всего единственного) найденного пользователя
          const docId = querySnapshot.docs[0].id;
          const docRef = doc(firestore, 'client_users', docId);
          
          // Обновляем данные пользователя, сохраняя createdAt от исходной записи
          const existingData = querySnapshot.docs[0].data();
          const updateData = {
            ...userData,
            createdAt: existingData.createdAt || userData.createdAt
          };
          
          // Удаляем ненужные поля для обновления
          delete updateData.createdAt;
          
          await updateDoc(docRef, updateData);
          console.log('Данные пользователя успешно обновлены');
        } else {
          // Создаем нового пользователя
          const userRef = doc(collection(firestore, 'client_users'));
          await setDoc(userRef, userData);
          console.log('Новый пользователь успешно создан');
        }
        
        // Обновляем данные в хранилище состояния
        const updatedState = {
          iin: cleanedIin,
          fullName: data.fullName,
          birthDate: data.birthDate,
          isAuthenticated: true,
          loading: false,
          userData: { ...userData } as UserData
        };
        set(updatedState);
        saveStateToStorage(updatedState);
        
        console.log('Данные пользователя успешно сохранены');
      } catch (dbError) {
        console.error('Ошибка базы данных:', dbError);
        throw new Error('Ошибка при сохранении данных пользователя');
      }
      
    } catch (error) {
      console.error('Ошибка при отправке данных пользователя:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при сохранении данных'
      });
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      set({ loading: true });
      // Выход из Firebase Auth
      await firebaseSignOut(auth);
      
      // Очищаем все данные пользователя
      const resetState = { 
        phoneNumber: '',
        iin: '',
        fullName: '',
        birthDate: '',
        isAuthenticated: false,
        isNewUser: false,
        loading: false,
        error: null,
        otpCode: null,
        userData: null
      };
      set(resetState);
      // Удаляем данные из localStorage
      localStorage.removeItem('clientAuthState');
      
      console.log('Пользователь успешно вышел из системы');
    } catch (error) {
      console.error('Error signing out:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при выходе из системы'
      });
    }
  },
  
  // Повторная отправка кода подтверждения
  resendOtp: async () => {
    try {
      const phone = get().phoneNumber;
      
      if (!phone) {
        throw new Error('Номер телефона не указан');
      }
      
      set({ loading: true, error: null });
      
      try {
        // Форматируем номер телефона
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        
        // Генерируем новый код подтверждения
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Уникальный ID для новой верификации
        const verificationId = uuidv4();
        
        // Сохраняем код в Firestore
        await createDocument('verifications', {
          code: otpCode,
          phoneNumber: formattedPhone,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 минут
          verified: false
        }, verificationId);
        
        // Отправляем SMS через Mobizon
        const message = `Ваш новый код подтверждения для Mediate+: ${otpCode}`;
        const smsResult = await mobizonApi.sendSms(formattedPhone, message);
        
        if (!smsResult) {
          throw new Error('Не удалось отправить SMS с кодом подтверждения');
        }
        
        // Сохраняем ID верификации в глобальной переменной для последующей проверки
        // @ts-ignore - добавляем свойство в window для доступа из любого места
        window.verificationId = verificationId;
        
        console.log('Повторный код подтверждения отправлен на номер', formattedPhone);
        
        // Имитация задержки для лучшего UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Обновляем состояние
        set({ loading: false });
        
      } catch (smsError) {
        console.error('Ошибка при повторной отправке SMS через Mobizon:', smsError);
        set({ 
          loading: false,
          error: smsError instanceof Error ? smsError.message : 'Ошибка при повторной отправке SMS верификации'
        });
        throw smsError;
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при повторной отправке кода'
      });
      throw error;
    }
  },
  
  // Явная загрузка состояния из localStorage
  loadState: () => {
    try {
      const savedState = loadStateFromStorage();
      if (Object.keys(savedState).length > 0) {
        // Загружаем все сохраненные данные, кроме состояния загрузки и ошибок
        const stateToSet = {
          ...savedState,
          loading: false,
          error: null,
          otpCode: null // Не загружаем OTP код из соображений безопасности
        };
        set(stateToSet);
        console.log('Состояние аутентификации успешно загружено из localStorage');
      }
    } catch (error) {
      console.error('Error loading state:', error);
      // В случае ошибки не меняем состояние
    }
  }
}));
