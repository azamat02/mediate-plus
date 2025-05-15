import axios from 'axios';

// Получаем API ключ из переменных окружения или используем резервный ключ
const MOBIZON_API_KEY = import.meta.env.VITE_MOBIZON_API_KEY || 'kz263d029f74a2db7aa4f1df60d9610cf9c9c8da12940ff8b47143a43f82a13386eb04';

// Для отладки - показывает, используется ли ключ из .env или резервный
console.log(`[Mobizon] Using ${import.meta.env.VITE_MOBIZON_API_KEY ? 'environment' : 'fallback'} API key`);

// Интерфейс для ответа API Mobizon
interface MobizonResponse {
  code: number;
  message: string;
  data: {
    messageId?: string;
    status?: string;
  };
}

// Класс для работы с API Mobizon
export class MobizonApi {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.mobizon.kz/service';
  }

  /**
   * Отправка SMS сообщения
   * @param recipient Номер телефона получателя в формате +XXXXXXXXXXX
   * @param text Текст сообщения
   * @returns Promise с результатом отправки
   */
  async sendSms(recipient: string, text: string): Promise<boolean> {
    // Объявляем переменную вне блока try для доступа в catch
    let formattedRecipient = '';
    
    try {
      // Проверяем и форматируем номер телефона
      if (!recipient) {
        console.error('[Mobizon] Ошибка: номер телефона не указан');
        return false;
      }
      
      // Удаляем все нецифровые символы из номера
      let formattedRecipient = recipient.replace(/\D/g, '');
      
      // Логика форматирования для казахстанских номеров
      // Если номер начинается с '8', заменяем на '7' (для Казахстана)
      if (formattedRecipient.startsWith('8') && formattedRecipient.length === 11) {
        formattedRecipient = '7' + formattedRecipient.substring(1);
      }
      
      // Если номер не начинается с кода страны и имеет 10 цифр, добавляем '7' (Казахстан)
      if (formattedRecipient.length === 10) {
        formattedRecipient = '7' + formattedRecipient;
      }
      
      // Проверка на минимальную длину номера (должен быть не менее 10 цифр)
      if (formattedRecipient.length < 10) {
        console.error(`[Mobizon] Ошибка: номер телефона слишком короткий: ${formattedRecipient}`);
        return false;
      }
      
      // Если номер не начинается с '+', добавляем его для международного формата
      if (!formattedRecipient.startsWith('+')) {
        formattedRecipient = '+' + formattedRecipient;
      }
      
      console.log(`[Mobizon] Исходный номер: ${recipient}, отформатированный: ${formattedRecipient}`);
      
      // Формируем URL для запроса
      const url = `${this.baseUrl}/message/sendSmsMessage`;
      
      // Формируем параметры запроса
      const params = new URLSearchParams();
      params.append('apiKey', this.apiKey);
      params.append('recipient', formattedRecipient);
      params.append('text', text);
      params.append('output', 'json');
      
      console.log(`[Mobizon] Отправка SMS на номер ${formattedRecipient}`);
      console.log(`[Mobizon] Текст сообщения: ${text}`);
      
      // Отправляем запрос к API Mobizon с таймаутом и повторными попытками
      let retries = 3;
      let response: { data: MobizonResponse } | undefined;
      
      while (retries > 0) {
        try {
          response = await axios.post<MobizonResponse>(url, params, {
            timeout: 15000, // 15 секунд таймаут
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            }
          });
          break; // Если запрос успешен, выходим из цикла
        } catch (error) {
          retries--;
          if (retries === 0) throw error; // Если попытки исчерпаны, пробрасываем ошибку
          console.warn(`[Mobizon] Повторная попытка отправки SMS (осталось попыток: ${retries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Ждем 2 секунды перед повторной попыткой
        }
      }
      
      // Проверяем, получили ли мы ответ
      if (!response) {
        console.error('[Mobizon] Не удалось получить ответ от API после всех попыток');
        return false;
      }
      
      console.log('[Mobizon] Ответ API:', response.data);
      
      // Проверяем успешность запроса
      if (response.data.code === 0) {
        console.log(`[Mobizon] SMS успешно отправлено, ID: ${response.data.data.messageId}`);
        return true;
      } else {
        console.error(`[Mobizon] Ошибка при отправке SMS: ${response.data.message}`);
        return false;
      }
    } catch (error: any) {
      // Сохраняем последний форматированный номер для использования в блоке catch
      const finalRecipient = formattedRecipient;
      
      // Более подробное логирование ошибок
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout
          },
          recipient: finalRecipient,
          apiKeyPresent: !!this.apiKey,
          apiKeyLength: this.apiKey ? this.apiKey.length : 0
        };
        console.error('[Mobizon] Ошибка сети при отправке SMS:', errorDetails);
        
        // Проверка на конкретные ошибки
        if (error.code === 'ECONNABORTED') {
          console.error('[Mobizon] Таймаут соединения. Проверьте интернет-соединение или увеличьте время ожидания.');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('[Mobizon] Ошибка авторизации. Проверьте API ключ.');
        } else if (error.response?.status === 400) {
          console.error('[Mobizon] Неверный запрос. Проверьте формат номера телефона и текст сообщения.');
        }
      } else {
        console.error('[Mobizon] Неизвестная ошибка при отправке SMS:', error);
      }
      return false;
    }
  }

  /**
   * Проверка статуса отправленного сообщения
   * @param messageId ID сообщения
   * @returns Promise со статусом сообщения
   */
  async getMessageStatus(messageId: string): Promise<string | null> {
    try {
      // Формируем URL для запроса
      const url = `${this.baseUrl}/message/getSmsStatus`;
      
      // Формируем параметры запроса
      const params = new URLSearchParams();
      params.append('apiKey', this.apiKey);
      params.append('ids', messageId);
      params.append('output', 'json');
      
      // Отправляем запрос к API Mobizon
      const response = await axios.get<MobizonResponse>(url, { params });
      
      // Проверяем успешность запроса
      if (response.data.code === 0) {
        return response.data.data.status || null;
      } else {
        console.error(`[Mobizon] Ошибка при проверке статуса SMS: ${response.data.message}`);
        return null;
      }
    } catch (error) {
      console.error('Ошибка при проверке статуса SMS через Mobizon:', error);
      return null;
    }
  }

  /**
   * Получение баланса аккаунта
   * @returns Promise с балансом аккаунта
   */
  async getBalance(): Promise<number | null> {
    try {
      // Формируем URL для запроса
      const url = `${this.baseUrl}/user/getownbalance`;
      
      // Формируем параметры запроса
      const params = new URLSearchParams();
      params.append('apiKey', this.apiKey);
      params.append('output', 'json');
      
      // Отправляем запрос к API Mobizon
      const response = await axios.get<MobizonResponse>(url, { params });
      
      // Проверяем успешность запроса
      if (response.data.code === 0 && response.data.data && 'balance' in response.data.data) {
        return parseFloat(response.data.data.balance as string) || null;
      } else {
        console.error(`[Mobizon] Ошибка при получении баланса: ${response.data.message}`);
        return null;
      }
    } catch (error) {
      console.error('Ошибка при получении баланса через Mobizon:', error);
      return null;
    }
  }
}

// Создаем и экспортируем экземпляр API с ключом из переменных окружения
export const mobizonApi = new MobizonApi(MOBIZON_API_KEY);