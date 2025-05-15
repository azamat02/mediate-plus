import { supabase } from './supabase';

/**
 * Безопасная обертка для Supabase QueryBuilder, которая перехватывает ошибки PGRST116
 * и другие распространенные ошибки Supabase
 */
const safeQueryBuilder = <T = any>(tableName: string) => {
  // Получаем исходный QueryBuilder
  const queryBuilder = supabase.from(tableName);
  
  // Создаем безопасную версию метода single()
  const safeSingle = async () => {
    try {
      // Используем limit(1) вместо single() и обрабатываем результат вручную
      const { data, error } = await queryBuilder
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`Error in safeSingle for ${tableName}:`, error);
        return { data: null, error };
      }
      
      // Возвращаем первый элемент или null, если результат пустой
      return { 
        data: data && data.length > 0 ? data[0] : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Exception in safeSingle for ${tableName}:`, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  };
  
  // Заменяем исходный метод single() нашей безопасной версией
  const originalSingle = queryBuilder.single;
  queryBuilder.single = function() {
    console.warn('Calling unsafe single() method - consider using safeQuery.single() instead');
    return originalSingle.apply(this);
  };
  
  // Заменяем исходный метод maybeSingle() нашей безопасной версией
  const originalMaybeSingle = queryBuilder.maybeSingle;
  queryBuilder.maybeSingle = function() {
    console.warn('Calling unsafe maybeSingle() method - consider using safeQuery.single() instead');
    return originalMaybeSingle.apply(this);
  };
  
  // Возвращаем модифицированный QueryBuilder с дополнительным безопасным методом
  return {
    ...queryBuilder,
    safeSingle
  };
};

/**
 * Перехватывает и исправляет ошибки, связанные с PGRST116
 */
export const handleSupabaseError = (error: any) => {
  if (error && error.code === 'PGRST116') {
    // Это нормальная ситуация, когда запрос не вернул результатов
    console.warn('Caught PGRST116 error (no rows returned)');
    return null;
  }
  
  // Для других ошибок просто возвращаем их
  return error;
};

/**
 * Создает безопасную обертку для запросов Supabase
 */
export const safeQuery = <T = any>(tableName: string) => {
  return safeQueryBuilder<T>(tableName);
};

/**
 * Получает безопасно один объект из таблицы
 */
export const getSafeRecord = async <T = any>(
  tableName: string,
  conditions: Record<string, any> = {}
): Promise<T | null> => {
  try {
    let query = safeQuery<T>(tableName).select('*');
    
    // Добавляем все условия
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    // Используем безопасный метод для получения одного объекта
    const { data, error } = await query.safeSingle();
    
    if (error) {
      console.error(`Error getting record from ${tableName}:`, error);
      return null;
    }
    
    return data as T || null;
  } catch (error) {
    console.error(`Exception in getSafeRecord for ${tableName}:`, error);
    return null;
  }
};

// Экспортируем оригинальный Supabase клиент для базовых операций
export { supabase };
