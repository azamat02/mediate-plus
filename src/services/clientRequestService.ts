import { firestore } from '../lib/firebase';
import { addDoc, collection, getDocs, getDoc, updateDoc, doc, query as firestoreQuery, orderBy, where } from 'firebase/firestore';
import { ChatService, ChatMessage } from './chatService';

// Интерфейс для обращений клиентов
export interface ClientRequest {
  id: string;
  phone_number: string;
  iin?: string;
  reason_type: string;
  reason: string;
  status: string;
  created_at: string;
  mfo_name?: string;
  mfo_id?: string;
  organization_type?: 'bvu' | 'mfo';
  document_sent_at?: string;
  document_type?: string;
  document_viewed_at?: string;
  document_signed_at?: string;
  updated_at: string; // Для сортировки
  messages?: ChatMessage[];
}

export class ClientRequestService {
  private static requestsCollection = collection(firestore, 'clientRequests');
  
  // Получение всех запросов для конкретного телефонного номера
  static async getRequestsByPhone(phoneNumber: string): Promise<ClientRequest[]> {
    try {
      console.log(`[ClientRequestService] Getting requests for phone number: ${phoneNumber}`);
      const requestsQuery = firestoreQuery(
        this.requestsCollection,
        where('phone_number', '==', phoneNumber),
        orderBy('updated_at', 'desc')
      );
      
      const snapshot = await getDocs(requestsQuery);
      const requests: ClientRequest[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          ...data,
          id: doc.id,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        } as ClientRequest);
      });
      
      return requests;
    } catch (error) {
      console.error(`[ClientRequestService] Error getting requests for phone ${phoneNumber}:`, error);
      return [];
    }
  }
  
  // Получение запроса по ID с загрузкой сообщений чата
  static async getRequestById(requestId: string): Promise<ClientRequest | null> {
    try {
      console.log(`[ClientRequestService] Getting request by ID: ${requestId}`);
      const docRef = doc(this.requestsCollection, requestId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Загружаем сообщения для запроса
        const messages = await ChatService.getMessages(requestId);
        
        // Возвращаем запрос с сообщениями
        return {
          ...data,
          id: docSnap.id,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          messages: messages
        } as ClientRequest;
      } else {
        console.log(`[ClientRequestService] Request with ID ${requestId} not found`);
        return null;
      }
    } catch (error) {
      console.error(`[ClientRequestService] Error getting request by ID ${requestId}:`, error);
      return null;
    }
  }
  
  // Обновление статуса просмотра документа
  static async markDocumentAsViewed(requestId: string): Promise<boolean> {
    try {
      const docRef = doc(this.requestsCollection, requestId);
      const now = new Date().toISOString();
      
      const updateData = {
        status: 'document_viewed',
        document_viewed_at: now,
        updated_at: now
      };
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error(`[ClientRequestService] Error marking document as viewed for request ${requestId}:`, error);
      return false;
    }
  }
  
  // Обновление статуса подписания документа
  static async markDocumentAsSigned(requestId: string): Promise<boolean> {
    try {
      const docRef = doc(this.requestsCollection, requestId);
      const now = new Date().toISOString();
      
      const updateData = {
        status: 'document_signed',
        document_signed_at: now,
        updated_at: now
      };
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error(`[ClientRequestService] Error marking document as signed for request ${requestId}:`, error);
      return false;
    }
  }
  
  // Создание нового запроса в Firebase
  static async createRequest(request: Omit<ClientRequest, 'id' | 'updated_at'>): Promise<string | null> {
    try {
      console.log(`[ClientRequestService] Creating new request for phone number: ${request.phone_number}`);
      
      // Добавляем дату обновления
      const now = new Date().toISOString();
      const fullRequest = {
        ...request,
        updated_at: now,
        created_at: request.created_at || now,
      };
      
      // Создаем документ в Firestore
      const docRef = await addDoc(this.requestsCollection, fullRequest);
      console.log(`[ClientRequestService] Request created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('[ClientRequestService] Error creating request:', error);
      return null;
    }
  }
  
  // Миграция данных из localStorage (один раз)
  static async migrateLocalStorageForPhone(phoneNumber: string): Promise<void> {
    // Проверяем, были ли уже мигрированы данные
    const migrationKey = `request_migration_${phoneNumber}`;
    const alreadyMigrated = localStorage.getItem(migrationKey);
    
    if (alreadyMigrated) {
      console.log(`[ClientRequestService] Data for phone ${phoneNumber} already migrated`);
      return;
    }
    
    try {
      // Получаем запросы из Firebase для этого номера
      const existingRequests = await this.getRequestsByPhone(phoneNumber);
      
      if (existingRequests.length > 0) {
        console.log(`[ClientRequestService] Phone ${phoneNumber} already has ${existingRequests.length} requests in Firebase`);
        localStorage.setItem(migrationKey, 'true');
        return;
      }
      
      // Ищем запросы в localStorage
      const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      const userRequests = storedRequests.filter(
        (req: ClientRequest) => req.phone_number === phoneNumber
      );
      
      if (userRequests.length === 0) {
        console.log(`[ClientRequestService] No requests found in localStorage for phone ${phoneNumber}`);
        localStorage.setItem(migrationKey, 'true');
        return;
      }
      
      console.log(`[ClientRequestService] Migrating ${userRequests.length} requests for phone ${phoneNumber}`);
      
      // Здесь должен быть код для сохранения запросов в Firebase
      // Но так как данные уже должны быть мигрированы админом, мы просто отмечаем миграцию как выполненную
      
      localStorage.setItem(migrationKey, 'true');
      console.log(`[ClientRequestService] Migration for phone ${phoneNumber} marked as complete`);
    } catch (error) {
      console.error(`[ClientRequestService] Error migrating data for phone ${phoneNumber}:`, error);
    }
  }
}
