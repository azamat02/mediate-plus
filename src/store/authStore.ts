import { create } from 'zustand';
import { AuthState, User } from '../types';
import { auth, firestore, onAuthStateChange, firebaseSignOut, getCurrentUser } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true });
      
      console.log('[Auth] Initializing auth state with Firebase...');
      
      // Получаем текущего пользователя из Firebase
      const currentUser = getCurrentUser();
      
      // Добавляем обработчик изменения состояния авторизации
      onAuthStateChange(async (firebaseUser) => {
        console.log(`[Auth] Firebase auth state changed:`, firebaseUser);
        
        if (firebaseUser) {
          try {
            // Загружаем профиль пользователя из Firestore
            const userDocRef = doc(firestore, 'profiles', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            let userData: User;
            
            if (userDocSnap.exists()) {
              // Используем данные из Firestore
              userData = userDocSnap.data() as User;
            } else {
              // Создаем новый профиль, если его нет
              userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                created_at: new Date().toISOString()
              } as User;
              
              // Сохраняем новый профиль в Firestore
              await setDoc(userDocRef, userData);
            }
            
            // Обновляем состояние
            set({ 
              session: {
                user: {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  phone: firebaseUser.phoneNumber
                }
              },
              user: userData,
              loading: false 
            });
          } catch (error) {
            console.error('[Auth] Error fetching/creating user profile:', error);
            set({ 
              loading: false,
              error: error instanceof Error ? error.message : 'Error loading user profile'
            });
          }
        } else {
          // Пользователь не аутентифицирован
          set({ session: null, user: null, loading: false });
        }
      });
      
      // Если нет текущего пользователя, установить состояние 'не аутентифицирован'
      if (!currentUser) {
        set({ session: null, user: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ 
        session: null, 
        user: null, 
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },
  

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      // Аутентификация с Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        // Загружаем профиль пользователя из Firestore
        const userDocRef = doc(firestore, 'profiles', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let userData: User;
        
        if (userDocSnap.exists()) {
          // Используем данные из Firestore
          userData = userDocSnap.data() as User;
        } else {
          // Создаем новый профиль, если его нет
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            created_at: new Date().toISOString()
          } as User;
          
          // Сохраняем новый профиль в Firestore
          await setDoc(userDocRef, userData);
        }
        
        // Обновляем состояние
        set({ 
          session: {
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              phone: firebaseUser.phoneNumber
            }
          },
          user: userData,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error signing in:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка входа. Пожалуйста, проверьте ваши данные и попробуйте снова.'
      });
    }
  },


  signOut: async () => {
    try {
      set({ loading: true });
      await firebaseSignOut();
      set({ session: null, user: null, loading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Ошибка при выходе из системы'
      });
    }
  },
}));