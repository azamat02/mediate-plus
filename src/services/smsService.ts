import { firestore } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Интерфейсы для Kazinfoteh API
export interface KazinfotehSendRequest {
  from: string;           // Заголовок (сендер) смс сообщения (3-17 символов)
  to: string;             // Номер телефона в формате 7XXXXXXXXX (11-15 символов)
  text: string;           // Текст смс сообщения (1-1000 символов)
  sent_at?: string;       // Дата и время отправки в формате YYYY-MM-DD HH:mm:ss
  extra_id?: string;      // Ваш ID сообщения (до 50 символов)
  notify_url?: string;    // URL для получения статусов (webhook)
  prioritet?: 0 | 1;      // Приоритет: 0 - обычный, 1 - повышенный
}

export interface KazinfotehSuccessResponse {
  bulk_id: string;        // ID массовой рассылки
  message_id: string;     // Уникальный ID сообщения
  extra_id: string | null;// Ваш ID, если указывали в запросе
  to: string;             // Номер телефона
  sender: string;         // Заголовок (сендер) сообщения
  text: string;           // Текст сообщения
  sent_at: string;        // Время отправки
  done_at: string | null; // Время доставки/не доставки
  sms_count: string;      // Количество SMS в длинном сообщении
  priority: string;       // Приоритет сообщения
  callback_data: string | null;
  status: 'send' | 'sending' | 'sent' | 'delivered' | 'undelivered';
  mnc: '1' | '2' | '77' | '7' | '55'; // Код оператора
  err: string | null;     // Описание ошибки (если есть)
}

export interface KazinfotehErrorResponse {
  error_code: number;
  error_message: string;
}

// Интерфейс для SMS сообщения
export interface SmsMessage {
  id?: string;
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'undelivered';
  createdAt: string;
  clientId?: string;
  clientName?: string;
  // Дополнительные поля из Kazinfoteh API
  messageId?: string;     // message_id из API
  bulkId?: string;        // bulk_id из API
  smsCount?: number;      // Количество SMS частей
  mnc?: string;           // Код оператора
  sentAt?: string;        // Время отправки из API
  doneAt?: string | null; // Время доставки
  error?: string | null;  // Описание ошибки
}

// Интерфейс для OTP кода
export interface OtpCode {
  phone: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  verified: boolean;
  attempts: number;
}

/**
 * SMS Сервис для отправки сообщений через Kazinfoteh API
 * Сохраняет все SMS в Firestore для истории
 * Поддерживает OTP коды для верификации телефонов
 */
export class SmsService {
  private static smsCollection = collection(firestore, 'sms_messages');
  private static otpCollection = collection(firestore, 'otp_codes');
  private static KAZINFOTEH_API_URL = 'https://so.kazinfoteh.org/api/sms/send';
  private static OTP_EXPIRY_MINUTES = 5;
  private static MAX_OTP_ATTEMPTS = 3;

  /**
   * Генерация случайного 6-значного OTP кода
   */
  private static generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Отправка OTP кода для верификации телефона
   * @param phone Номер телефона
   * @returns Promise<{ success: boolean; code?: string }> - результат и код (для dev режима)
   */
  static async sendOtpCode(phone: string): Promise<{ success: boolean; code?: string; error?: string }> {
    try {
      const formattedPhone = this.formatPhone(phone);
      if (!formattedPhone) {
        return { success: false, error: 'Неверный формат номера телефона' };
      }

      // Генерируем код
      const code = this.generateOtpCode();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.OTP_EXPIRY_MINUTES * 60000);

      // Сохраняем OTP в Firestore
      const otpData: OtpCode = {
        phone: formattedPhone,
        code,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      };

      // Используем телефон как ID документа для упрощения поиска
      const otpDocRef = doc(this.otpCollection, formattedPhone.replace(/[^0-9]/g, ''));
      await setDoc(otpDocRef, otpData);

      // Формируем сообщение
      const message = `Ваш код подтверждения: ${code}\nДействителен ${this.OTP_EXPIRY_MINUTES} минут.\nKelisim.bar`;

      // В режиме разработки логируем код для удобства тестирования
      if (import.meta.env.DEV) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📱 ОТПРАВКА OTP (DEV MODE)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Телефон:', formattedPhone);
        console.log('Код:', code);
        console.log('Истекает:', expiresAt.toLocaleString('ru-RU'));
        console.log('Сообщение:');
        console.log(message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

      // Отправляем SMS через SMSC (реально отправляем даже в dev режиме)
      const sent = await this.sendSms(formattedPhone, message);

      if (!sent) {
        return { success: false, error: 'Ошибка при отправке SMS' };
      }

      console.log(`[SMS] OTP код отправлен на ${formattedPhone}`);
      return { success: true };

    } catch (error) {
      console.error('[SMS] Ошибка при отправке OTP:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  /**
   * Проверка OTP кода
   * @param phone Номер телефона
   * @param code Введенный код
   * @returns Promise<{ valid: boolean; error?: string }>
   */
  static async verifyOtpCode(phone: string, code: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const formattedPhone = this.formatPhone(phone);
      if (!formattedPhone) {
        return { valid: false, error: 'Неверный формат номера телефона' };
      }

      // Получаем OTP из Firestore
      const otpDocRef = doc(this.otpCollection, formattedPhone.replace(/[^0-9]/g, ''));
      const otpDoc = await getDoc(otpDocRef);

      if (!otpDoc.exists()) {
        return { valid: false, error: 'Код не найден. Запросите новый код' };
      }

      const otpData = otpDoc.data() as OtpCode;

      // Проверяем количество попыток
      if (otpData.attempts >= this.MAX_OTP_ATTEMPTS) {
        return { valid: false, error: 'Превышено количество попыток. Запросите новый код' };
      }

      // Проверяем срок действия
      const now = new Date();
      const expiresAt = new Date(otpData.expiresAt);
      if (now > expiresAt) {
        return { valid: false, error: 'Срок действия кода истек. Запросите новый код' };
      }

      // Увеличиваем счетчик попыток
      await setDoc(otpDocRef, {
        ...otpData,
        attempts: otpData.attempts + 1
      });

      // Проверяем код
      if (otpData.code !== code) {
        const attemptsLeft = this.MAX_OTP_ATTEMPTS - (otpData.attempts + 1);
        return {
          valid: false,
          error: attemptsLeft > 0
            ? `Неверный код. Осталось попыток: ${attemptsLeft}`
            : 'Превышено количество попыток. Запросите новый код'
        };
      }

      // Код верный - помечаем как проверенный
      await setDoc(otpDocRef, {
        ...otpData,
        verified: true,
        attempts: otpData.attempts + 1
      });

      console.log(`[SMS] OTP код верифицирован для ${formattedPhone}`);
      return { valid: true };

    } catch (error) {
      console.error('[SMS] Ошибка при проверке OTP:', error);
      return { valid: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  /**
   * Отправка SMS через Kazinfoteh API (новый JSON API)
   * @private
   */
  private static async sendViaKazinfoteh(
    phone: string,
    message: string
  ): Promise<{
    success: boolean;
    data?: KazinfotehSuccessResponse;
    error?: string
  }> {
    try {
      const username = import.meta.env.VITE_KAZINFOTEH_USERNAME;
      const password = import.meta.env.VITE_KAZINFOTEH_PASSWORD;
      const originator = import.meta.env.VITE_KAZINFOTEH_ORIGINATOR || 'KiT_Notify';

      if (!username || !password) {
        return { success: false, error: 'Kazinfoteh credentials не найдены' };
      }

      // Формируем Basic Auth токен
      const authToken = btoa(`${username}:${password}`);

      // Формируем тело запроса согласно новому API
      const requestBody: KazinfotehSendRequest = {
        from: originator,
        to: phone.replace('+', ''),  // Убираем + из номера
        text: message,
        prioritet: 0  // Обычный приоритет
      };

      console.log('[SMS] 📤 Отправка запроса к Kazinfoteh API:', {
        url: this.KAZINFOTEH_API_URL,
        to: requestBody.to,
        from: requestBody.from
      });

      const response = await fetch(this.KAZINFOTEH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });

      // Обрабатываем JSON ответ
      const responseData = await response.json();

      // Проверяем успешность ответа
      if (!response.ok) {
        const errorResponse = responseData as KazinfotehErrorResponse;
        console.error('[SMS] ❌ Ошибка API:', errorResponse);
        return {
          success: false,
          error: `[${errorResponse.error_code}] ${errorResponse.error_message}`
        };
      }

      const successResponse = responseData as KazinfotehSuccessResponse;

      console.log('[SMS] ✅ Успешный ответ от API:', {
        message_id: successResponse.message_id,
        status: successResponse.status,
        sms_count: successResponse.sms_count,
        mnc: successResponse.mnc
      });

      return {
        success: true,
        data: successResponse
      };
    } catch (error) {
      console.error('[SMS] ❌ Исключение при отправке:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Отправка SMS сообщения через Kazinfoteh API
   * @param phone Номер телефона в формате +7XXXXXXXXXX
   * @param message Текст сообщения
   * @param clientId ID клиента (опционально)
   * @param clientName Имя клиента (опционально)
   * @returns Promise<boolean> - успешность отправки
   */
  static async sendSms(
    phone: string,
    message: string,
    clientId?: string,
    clientName?: string
  ): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhone(phone);
      if (!formattedPhone) {
        console.error('[SMS] Неверный формат номера телефона:', phone);
        return false;
      }

      // Создаем запись SMS в Firestore (убираем undefined поля)
      const smsData: any = {
        phone: formattedPhone,
        message,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Добавляем опциональные поля только если они определены
      if (clientId) smsData.clientId = clientId;
      if (clientName) smsData.clientName = clientName;

      const docRef = await addDoc(this.smsCollection, smsData);

      // Отправляем через Kazinfoteh API
      console.log('[SMS] 📤 Отправка через Kazinfoteh API...');
      const result = await this.sendViaKazinfoteh(formattedPhone, message);

      if (result.success && result.data) {
        const apiData = result.data;

        console.log('[SMS] ✅ Успешно отправлено через Kazinfoteh, ID:', apiData.message_id);

        // Обновляем запись с данными из API
        const { updateDoc } = await import('firebase/firestore');
        const smsDoc = doc(this.smsCollection, docRef.id);
        await updateDoc(smsDoc, {
          status: apiData.status,           // Актуальный статус из API
          messageId: apiData.message_id,    // ID сообщения из API
          bulkId: apiData.bulk_id,          // ID рассылки
          smsCount: parseInt(apiData.sms_count), // Количество SMS частей
          mnc: apiData.mnc,                 // Код оператора
          sentAt: apiData.sent_at,          // Время отправки из API
          doneAt: apiData.done_at,          // Время доставки (если есть)
          error: apiData.err                // Ошибка (если есть)
        });

        return true;
      }

      console.error('[SMS] ❌ Ошибка отправки через Kazinfoteh:', result.error);

      // Обновляем статус на failed и сохраняем ошибку
      const { updateDoc } = await import('firebase/firestore');
      const smsDoc = doc(this.smsCollection, docRef.id);
      await updateDoc(smsDoc, {
        status: 'failed',
        error: result.error
      });

      return false;

    } catch (error) {
      console.error('[SMS] Ошибка при отправке:', error);
      return false;
    }
  }

  /**
   * Форматирование номера телефона
   * @param phone Исходный номер
   * @returns Отформатированный номер или null
   */
  private static formatPhone(phone: string): string | null {
    if (!phone) return null;

    // Удаляем все нецифровые символы
    let formatted = phone.replace(/\D/g, '');

    // Если начинается с 8 и длина 11 цифр, заменяем на 7
    if (formatted.startsWith('8') && formatted.length === 11) {
      formatted = '7' + formatted.substring(1);
    }

    // Если 10 цифр, добавляем 7 в начало (Казахстан/Россия)
    if (formatted.length === 10) {
      formatted = '7' + formatted;
    }

    // Проверяем корректность
    if (formatted.length < 10 || formatted.length > 15) {
      return null;
    }

    // Возвращаем с +
    return '+' + formatted;
  }

  /**
   * Обновление статуса SMS
   * @param smsId ID SMS документа
   * @param status Новый статус
   */
  private static async updateSmsStatus(
    smsId: string,
    status: 'pending' | 'send' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed'
  ): Promise<void> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const smsDoc = doc(this.smsCollection, smsId);
      await updateDoc(smsDoc, { status });
    } catch (error) {
      console.error('[SMS] Ошибка при обновлении статуса SMS:', error);
    }
  }

  /**
   * Получение истории SMS для клиента
   * @param clientId ID клиента
   * @returns Массив SMS сообщений
   */
  static async getSmsHistory(clientId: string): Promise<SmsMessage[]> {
    try {
      const { query, where, orderBy, getDocs } = await import('firebase/firestore');

      const q = query(
        this.smsCollection,
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const messages: SmsMessage[] = [];

      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as SmsMessage);
      });

      return messages;
    } catch (error) {
      console.error('[SMS] Ошибка при получении истории SMS:', error);
      return [];
    }
  }
}

// Экспортируем экземпляр для удобства
export const smsService = SmsService;
