import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/animations.css';
import { setupTestUser } from './lib/supabase.ts';

// Добавляем обработчик для отлова глобальных ошибок
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка:', event.error);
});

// Функция для очистки проблемных данных из localStorage
const cleanupLocalStorage = () => {
  try {
    // Список ключей, которые могут вызывать проблемы
    const keysToCheck = [
      'theme-storage',
      'mediate-plus-auth-token',
      'client-auth-state',
      'clientRequests'
    ];
    
    // Проверяем каждый ключ и пытаемся прочитать его значение
    // Если возникает ошибка, удаляем этот ключ
    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          JSON.parse(value); // Проверяем, что значение - валидный JSON
        }
      } catch (e) {
        console.warn(`Найдены поврежденные данные в localStorage для ключа ${key}, удаляем...`);
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Ошибка при очистке localStorage:', e);
  }
};

// Запускаем очистку при загрузке приложения
cleanupLocalStorage();

// Initialize theme from localStorage if available
const savedTheme = localStorage.getItem('theme-storage');
if (savedTheme) {
  try {
    const themeState = JSON.parse(savedTheme);
    if (themeState.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    console.error('Error parsing theme from localStorage', e);
    // Удаляем поврежденные данные темы
    localStorage.removeItem('theme-storage');
  }
}

// Инициализируем приложение независимо от успеха setupTestUser
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  
  // Рендерим приложение
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Setup test user for development без блокировки рендеринга
  if (import.meta.env.DEV) {
    // Выполняем асинхронно, чтобы не блокировать рендеринг
    setTimeout(() => {
      setupTestUser().catch(error => {
        console.error('Ошибка при настройке тестового пользователя:', error);
      });
    }, 0);
  }
} else {
  console.error('Элемент с id "root" не найден!');
}