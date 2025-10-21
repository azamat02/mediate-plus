import { firestore } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Интерфейс для SMS сообщения
export interface SmsMessage {
  id?: string;
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  clientId?: string;
  clientName?: string;
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
 * SMS Сервис для отправки сообщений через SMSC.kz
 * Сохраняет все SMS в Firestore для истории
 * Поддерживает OTP коды для верификации телефонов
 */
export class SmsService {
  private static smsCollection = collection(firestore, 'sms_messages');
  private static otpCollection = collection(firestore, 'otp_codes');
  private static SMSC_API_URL = 'https://smsc.kz/sys/send.php';
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
   * Отправка через обычную SMS
   * @private
   */
  private static async sendViaSms(phone: string, message: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const apiKey = import.meta.env.VITE_SMSC_API_KEY;
      if (!apiKey) {
        return { success: false, error: 'API ключ не найден' };
      }

      const params = new URLSearchParams({
        apikey: apiKey,
        phones: phone.replace('+', ''),
        mes: message,
        charset: 'utf-8',
        fmt: '3'
      });

      const response = await fetch(`${this.SMSC_API_URL}?${params.toString()}`);
      const result = await response.json();

      if (result.error || result.error_code) {
        return { success: false, error: result.error || `Код ошибки: ${result.error_code}` };
      }

      return { success: true, id: result.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
    }
  }

  /**
   * Отправка через Telegram
   * @private
   */
  private static async sendViaTelegram(phone: string, message: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const apiKey = import.meta.env.VITE_SMSC_API_KEY;
      if (!apiKey) {
        return { success: false, error: 'API ключ не найден' };
      }

      const params = new URLSearchParams({
        apikey: apiKey,
        phones: phone.replace('+', ''),
        mes: message,
        tg: '1', // Telegram флаг
        charset: 'utf-8',
        fmt: '3'
      });

      const response = await fetch(`${this.SMSC_API_URL}?${params.toString()}`);
      const result = await response.json();

      if (result.error || result.error_code) {
        return { success: false, error: result.error || `Код ошибки: ${result.error_code}` };
      }

      return { success: true, id: result.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
    }
  }

  /**
   * Отправка через WhatsApp
   * @private
   */
  private static async sendViaWhatsApp(phone: string, message: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const apiKey = import.meta.env.VITE_SMSC_API_KEY;
      const whatsappBot = import.meta.env.VITE_SMSC_WHATSAPP_BOT;

      if (!apiKey) {
        return { success: false, error: 'API ключ не найден' };
      }

      if (!whatsappBot) {
        return { success: false, error: 'WhatsApp бот не настроен' };
      }

      const params = new URLSearchParams({
        apikey: apiKey,
        phones: phone.replace('+', ''),
        mes: message,
        bot: `wa:${whatsappBot}`, // WhatsApp бот
        charset: 'utf-8',
        fmt: '3'
      });

      const response = await fetch(`${this.SMSC_API_URL}?${params.toString()}`);
      const result = await response.json();

      if (result.error || result.error_code) {
        return { success: false, error: result.error || `Код ошибки: ${result.error_code}` };
      }

      return { success: true, id: result.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
    }
  }

  /**
   * Отправка сообщения с fallback: SMS → Telegram → WhatsApp
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

      // Пробуем отправить через SMS
      console.log('[SMS] 📤 Попытка #1: Отправка через SMS...');
      let result = await this.sendViaSms(formattedPhone, message);

      if (result.success) {
        console.log('[SMS] ✅ Успешно отправлено через SMS, ID:', result.id);
        await this.updateSmsStatus(docRef.id, 'sent');
        return true;
      }

      console.warn('[SMS] ❌ SMS не удалось:', result.error);

      // Пробуем отправить через Telegram
      console.log('[SMS] 📤 Попытка #2: Отправка через Telegram...');
      result = await this.sendViaTelegram(formattedPhone, message);

      if (result.success) {
        console.log('[SMS] ✅ Успешно отправлено через Telegram, ID:', result.id);
        await this.updateSmsStatus(docRef.id, 'sent');
        return true;
      }

      console.warn('[SMS] ❌ Telegram не удалось:', result.error);

      // Пробуем отправить через WhatsApp
      console.log('[SMS] 📤 Попытка #3: Отправка через WhatsApp...');
      result = await this.sendViaWhatsApp(formattedPhone, message);

      if (result.success) {
        console.log('[SMS] ✅ Успешно отправлено через WhatsApp, ID:', result.id);
        await this.updateSmsStatus(docRef.id, 'sent');
        return true;
      }

      console.error('[SMS] ❌ WhatsApp не удалось:', result.error);
      console.error('[SMS] 💥 Все каналы отправки не сработали (SMS → Telegram → WhatsApp)');
      await this.updateSmsStatus(docRef.id, 'failed');
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
    status: 'sent' | 'failed'
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
