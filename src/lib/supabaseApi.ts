import { supabase } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Проверка наличия переменных окружения
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * Выполняет запрос к Supabase REST API напрямую, минуя клиент Supabase
 * Это решает проблему с ошибкой 406 (Not Acceptable)
 */
export const fetchFromSupabase = async <T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    params?: Record<string, string>;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> => {
  const {
    method = 'GET',
    params = {},
    body,
    headers = {},
  } = options;

  // Формируем URL с параметрами запроса
  let url = `${supabaseUrl}/rest/v1/${path}`;
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value);
  });
  
  const queryString = queryParams.toString();
  if (queryString) {
    url = `${url}?${queryString}`;
  }

  // Формируем заголовки запроса
  const requestHeaders: Record<string, string> = {
    'apikey': supabaseKey || '',
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Prefer': 'return=representation',
    ...headers
  };

  // Выполняем запрос
  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      console.error('Supabase API Error:', response.status, response.statusText);
      throw new Error(`Supabase API Error: ${response.status} ${response.statusText}`);
    }

    // Для запросов DELETE может не быть тела ответа
    if (method === 'DELETE' && response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    throw error;
  }
};

/**
 * Получает данные из таблицы
 */
export const getFromTable = async <T>(
  table: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    limit?: number;
    single?: boolean;
  } = {}
): Promise<T> => {
  const { select = '*', filters = {}, limit, single = false } = options;
  
  // Формируем параметры запроса
  const params: Record<string, string> = {
    select
  };
  
  // Добавляем фильтры
  Object.entries(filters).forEach(([key, value]) => {
    params[`${key}`] = `eq.${value}`;
  });
  
  // Добавляем лимит
  if (limit) {
    params['limit'] = limit.toString();
  }
  
  // Добавляем заголовок для получения одной записи
  const headers: Record<string, string> = {};
  if (single) {
    headers['Prefer'] = 'return=representation,count=exact';
    params['limit'] = '1';
  }
  
  return await fetchFromSupabase<T>(table, {
    params,
    headers
  });
};

/**
 * Создает запись в таблице
 */
export const createInTable = async <T>(
  table: string,
  data: any
): Promise<T> => {
  return await fetchFromSupabase<T>(table, {
    method: 'POST',
    body: data
  });
};

/**
 * Обновляет запись в таблице
 */
export const updateInTable = async <T>(
  table: string,
  filters: Record<string, any>,
  data: any
): Promise<T> => {
  // Формируем параметры запроса с фильтрами
  const params: Record<string, string> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    params[`${key}`] = `eq.${value}`;
  });
  
  return await fetchFromSupabase<T>(table, {
    method: 'PATCH',
    params,
    body: data
  });
};

/**
 * Удаляет запись из таблицы
 */
export const deleteFromTable = async <T>(
  table: string,
  filters: Record<string, any>
): Promise<T> => {
  // Формируем параметры запроса с фильтрами
  const params: Record<string, string> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    params[`${key}`] = `eq.${value}`;
  });
  
  return await fetchFromSupabase<T>(table, {
    method: 'DELETE',
    params
  });
};

// Экспортируем оригинальный Supabase клиент для операций аутентификации
export { supabase };
