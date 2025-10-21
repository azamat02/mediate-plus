import { SmsService } from './smsService';
import { createDocument, updateDocument, getDocument } from '../lib/firebase';

// Интерфейс для хранения верификации
interface VerificationData {
  id?: string;
  code: string;
  userId: string;
  documentId: string;
  phoneNumber: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date;
}

// Интерфейс для документа
interface DocumentModel {
  id?: string;
  status: 'created' | 'sent' | 'viewed' | 'signed';
  signedAt?: Date;
}

/**
 * Отправка кода подтверждения для подписания документа
 * @param userId ID пользователя
 * @param phoneNumber Номер телефона для отправки кода
 * @param documentId ID документа, который нужно подписать
 * @returns Объект с информацией об успешности операции
 */
export const sendOTPForDocumentSign = async (
  userId: string, 
  phoneNumber: string, 
  documentId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Генерация 4-значного кода
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Формирование текста сообщения
    const message = `Ваш код подтверждения для подписания документа в Kelisim.bar: ${code}`;

    // Отправка SMS через Kazinfoteh API
    const success = await SmsService.sendSms(phoneNumber, message);
    
    if (success) {
      // Создание записи о верификации в Firestore
      await createDocument<VerificationData>('verifications', {
        code,
        userId,
        documentId,
        phoneNumber,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 минут
        verified: false
      }, `${documentId}_${userId}`);
      
      return { 
        success: true, 
        message: 'Код подтверждения отправлен на ваш номер телефона' 
      };
    } else {
      return { 
        success: false, 
        message: 'Не удалось отправить SMS. Пожалуйста, проверьте номер телефона и попробуйте снова' 
      };
    }
  } catch (error) {
    console.error('Ошибка при отправке кода подтверждения:', error);
    return { 
      success: false, 
      message: 'Произошла ошибка при отправке кода подтверждения' 
    };
  }
};

/**
 * Проверка кода подтверждения для подписания документа
 * @param userId ID пользователя
 * @param documentId ID документа
 * @param code Код подтверждения, введенный пользователем
 * @returns Объект с информацией об успешности операции
 */
export const verifyOTPForDocumentSign = async (
  userId: string, 
  documentId: string, 
  code: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Получение данных верификации из Firestore
    const verification = await getDocument<VerificationData>('verifications', `${documentId}_${userId}`);
    
    if (!verification) {
      return { 
        success: false, 
        message: 'Код подтверждения не найден. Пожалуйста, запросите новый код' 
      };
    }
    
    // Проверка срока действия кода
    if (verification.expiresAt.getTime() < Date.now()) {
      return { 
        success: false, 
        message: 'Срок действия кода истек. Пожалуйста, запросите новый код' 
      };
    }
    
    // Проверка на ранее подтвержденный код
    if (verification.verified) {
      return { 
        success: false, 
        message: 'Этот код уже был использован' 
      };
    }
    
    // Проверка правильности кода
    if (verification.code !== code) {
      return { 
        success: false, 
        message: 'Неверный код подтверждения. Пожалуйста, попробуйте еще раз' 
      };
    }
    
    // Обновление статуса верификации
    await updateDocument<VerificationData>('verifications', `${documentId}_${userId}`, {
      verified: true,
      verifiedAt: new Date()
    });
    
    // Обновление статуса документа
    await updateDocument<DocumentModel>('documents', documentId, {
      status: 'signed',
      signedAt: new Date()
    });
    
    return { 
      success: true, 
      message: 'Документ успешно подписан' 
    };
  } catch (error) {
    console.error('Ошибка при проверке кода подтверждения:', error);
    return { 
      success: false, 
      message: 'Произошла ошибка при проверке кода подтверждения' 
    };
  }
};

/**
 * Получение информации о статусе верификации документа
 * @param userId ID пользователя
 * @param documentId ID документа
 * @returns Объект с информацией о статусе верификации
 */
export const getVerificationStatus = async (
  userId: string, 
  documentId: string
): Promise<{ verified: boolean; expiresAt?: Date }> => {
  try {
    const verification = await getDocument<VerificationData>('verifications', `${documentId}_${userId}`);
    
    if (!verification) {
      return { verified: false };
    }
    
    return { 
      verified: verification.verified,
      expiresAt: verification.expiresAt
    };
  } catch (error) {
    console.error('Ошибка при получении статуса верификации:', error);
    return { verified: false };
  }
};

/**
 * Проверка возможности запроса нового кода
 * @param userId ID пользователя
 * @param documentId ID документа
 * @returns Объект со статусом возможности запроса нового кода
 */
export const canRequestNewCode = async (
  userId: string, 
  documentId: string
): Promise<{ canRequest: boolean; waitTime?: number }> => {
  try {
    const verification = await getDocument<VerificationData>('verifications', `${documentId}_${userId}`);
    
    if (!verification) {
      return { canRequest: true };
    }
    
    // Если уже подтверждено, не даём запрашивать новый код
    if (verification.verified) {
      return { canRequest: false };
    }
    
    // Проверяем, прошло ли не менее 2 минут с момента последнего запроса
    const lastRequestTime = verification.createdAt.getTime();
    const currentTime = Date.now();
    const waitTimeMs = 2 * 60 * 1000; // 2 минуты
    
    if (currentTime - lastRequestTime < waitTimeMs) {
      const remainingTime = Math.ceil((waitTimeMs - (currentTime - lastRequestTime)) / 1000);
      return { 
        canRequest: false,
        waitTime: remainingTime
      };
    }
    
    return { canRequest: true };
  } catch (error) {
    console.error('Ошибка при проверке возможности запроса нового кода:', error);
    return { canRequest: true };
  }
};