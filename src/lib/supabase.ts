import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Расширяем функциональность Supabase клиента для безопасной работы с одной записью
const createSupabaseClientWithHelpers = () => {
  const client = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'mediate-plus-auth-token',
        storage: {
        getItem: (key) => {
          try {
            const value = localStorage.getItem(key);
            return value;
          } catch (error) {
            console.error('Error getting auth from localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error setting auth in localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing auth from localStorage:', error);
          }
        }
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'mediate-plus',
        'apikey': supabaseAnonKey || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
};

// Создаем экземпляр Supabase клиента с расширенной функциональностью
export const supabase = createSupabaseClientWithHelpers();

/**
 * Безопасный метод для получения одной записи из таблицы
 * Избегает ошибки PGRST116 при использовании .single() или .maybeSingle()
 */
export const getSingleRecord = async <T>(
  table: string,
  query: Record<string, any>
): Promise<T | null> => {
  try {
    // Используем .limit(1) вместо .single() или .maybeSingle()
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .match(query)
      .limit(1);
    
    if (error) {
      console.error(`Error fetching from ${table}:`, error);
      return null;
    }
    
    // Возвращаем первую запись или null, если записей нет
    return (data && data.length > 0) ? data[0] as T : null;
  } catch (error) {
    console.error(`Error in getSingleRecord for ${table}:`, error);
    return null;
  }
};

// Setup test user if it doesn't exist (for development purposes)
export const setupTestUser = async () => {
  try {
    const testEmail = import.meta.env.VITE_TEST_EMAIL;
    const testPassword = import.meta.env.VITE_TEST_PASSWORD;
    
    if (!testEmail || !testPassword) {
      console.warn('Test user credentials not found in environment variables');
      return;
    }
    
    // Check if user exists
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      try {
        // Create test user
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });
        
        if (error) {
          if (error.message !== 'User already registered') {
            console.error('Error creating test user:', error);
          }
        } else if (data?.user) {
          console.log('Test user created successfully');
          
          // Create profile for test user
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: testEmail,
            first_name: 'Test',
            last_name: 'User',
            created_at: new Date().toISOString()
          });
        }
      } catch (signUpError) {
        console.error('Error in signup process:', signUpError);
      }
    }
  } catch (error) {
    console.error('Error setting up test user:', error);
  }
};