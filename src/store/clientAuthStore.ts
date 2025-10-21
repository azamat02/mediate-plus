import { create } from 'zustand';
import { firestore } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { SmsService } from '../services/smsService';

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

      // Форматируем номер телефона
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // Проверяем, существует ли пользователь в Firestore
      let isNewUser = true;
      let userData: UserData | null = null;

      try {
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

          console.log('[ClientAuth] Пользователь найден в Firestore:', userData);
        } else {
          console.log('[ClientAuth] Пользователь не найден, это новый пользователь');
        }
      } catch (firestoreError) {
        console.error('[ClientAuth] Ошибка при проверке пользователя в Firestore:', firestoreError);
        // Продолжаем процесс верификации, даже если была ошибка Firestore
      }

      // Отправляем OTP через Kazinfoteh SMS API
      console.log('[ClientAuth] Отправка OTP через Kazinfoteh на номер:', formattedPhone);
      const otpResult = await SmsService.sendOtpCode(formattedPhone);

      if (!otpResult.success) {
        const errorMessage = otpResult.error || 'Ошибка при отправке SMS верификации';
        set({
          loading: false,
          error: errorMessage
        });
        throw new Error(errorMessage);
      }

      console.log('[ClientAuth] OTP успешно отправлен через Kazinfoteh');

      // Сохраняем состояние
      set({
        phoneNumber: formattedPhone,
        loading: false,
        isNewUser
      });

      saveStateToStorage({
        phoneNumber: formattedPhone,
        isNewUser
      });

    } catch (error) {
      console.error('[ClientAuth] Error verifying phone:', error);
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

      console.log('[ClientAuth] Проверка OTP кода через SmsService');

      // Проверяем код через наш SmsService
      const verifyResult = await SmsService.verifyOtpCode(phone, otp);

      if (!verifyResult.valid) {
        const errorMessage = verifyResult.error || 'Неверный код подтверждения';
        set({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }

      console.log('[ClientAuth] OTP код верифицирован успешно');

      // Если это новый пользователь, мы должны перевести его на экран заполнения данных
      // Если существующий - считаем его аутентифицированным
      const newState = {
        loading: false,
        isAuthenticated: !isNewUser,
        otpCode: otp // Сохраняем код для возможных дальнейших действий
      };

      set(newState);
      saveStateToStorage({
        isAuthenticated: !isNewUser
      });

      console.log('[ClientAuth] Пользователь успешно аутентифицирован. isNewUser:', isNewUser);

      return isNewUser;
    } catch (error) {
      console.error('[ClientAuth] Error verifying OTP:', error);
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

      // Форматируем номер телефона
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      console.log('[ClientAuth] Повторная отправка OTP через Kazinfoteh на номер:', formattedPhone);

      // Отправляем OTP через наш SmsService
      const otpResult = await SmsService.sendOtpCode(formattedPhone);

      if (!otpResult.success) {
        const errorMessage = otpResult.error || 'Ошибка при повторной отправке SMS';
        set({
          loading: false,
          error: errorMessage
        });
        throw new Error(errorMessage);
      }

      console.log('[ClientAuth] Повторный OTP успешно отправлен через Kazinfoteh');

      set({ loading: false });

    } catch (error) {
      console.error('[ClientAuth] Error resending OTP:', error);
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
