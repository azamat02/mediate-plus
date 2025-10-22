import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Инициализация Firebase Admin
admin.initializeApp();

// Backend API URL (HTTP сервер)
const BACKEND_API_URL = 'http://85.202.192.21:3001';

/**
 * HTTPS прокси для SMS API
 * Принимает HTTPS запросы от фронта и перенаправляет на HTTP backend
 */
export const smsProxy = functions.https.onRequest(async (request, response) => {
  // Настройка CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обработка preflight запроса
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  try {
    // Получаем путь из URL (например, /api/sms/send)
    const path = request.path || '/api/sms/send';
    const targetUrl = `${BACKEND_API_URL}${path}`;

    console.log('[SMS Proxy] Запрос:', {
      method: request.method,
      path: path,
      targetUrl: targetUrl,
      body: request.body
    });

    // Делаем запрос к backend API
    const fetch = (await import('node-fetch')).default;
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' ? JSON.stringify(request.body) : undefined,
    });

    const data = await backendResponse.json();

    console.log('[SMS Proxy] Ответ от backend:', {
      status: backendResponse.status,
      data: data
    });

    // Возвращаем ответ клиенту
    response.status(backendResponse.status).json(data);

  } catch (error) {
    console.error('[SMS Proxy] Ошибка:', error);
    response.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Внутренняя ошибка прокси'
      }
    });
  }
});
