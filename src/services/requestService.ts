import { firestore } from '../lib/firebase';
import { collection, addDoc, getDocs, getDoc, updateDoc, doc, query as firestoreQuery, orderBy, setDoc } from 'firebase/firestore';
import { ChatMessage } from './chatService';

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
  document_signed_at?: string;
  updated_at: string; // Для сортировки
  messages?: ChatMessage[];
}

export class RequestService {
  private static requestsCollection = collection(firestore, 'clientRequests');
  
  // Получение всех запросов
  static async getAllRequests(): Promise<ClientRequest[]> {
    try {
      console.log('[RequestService] Getting all requests from Firestore');
      const requestsQuery = firestoreQuery(
        this.requestsCollection,
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
      console.error('[RequestService] Error getting all requests:', error);
      return [];
    }
  }
  
  // Получение запроса по ID
  static async getRequestById(requestId: string): Promise<ClientRequest | null> {
    try {
      const docRef = doc(this.requestsCollection, requestId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        } as ClientRequest;
      } else {
        console.log(`[RequestService] Request with ID ${requestId} not found`);
        return null;
      }
    } catch (error) {
      console.error(`[RequestService] Error getting request by ID ${requestId}:`, error);
      return null;
    }
  }
  
  // Создание нового запроса
  static async createRequest(requestData: Omit<ClientRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ClientRequest | null> {
    try {
      const now = new Date().toISOString();
      
      const newRequest = {
        ...requestData,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(this.requestsCollection, newRequest);
      
      return {
        ...newRequest,
        id: docRef.id
      } as ClientRequest;
    } catch (error) {
      console.error('[RequestService] Error creating request:', error);
      return null;
    }
  }
  
  // Обновление существующего запроса
  static async updateRequest(requestId: string, updateData: Partial<ClientRequest>): Promise<boolean> {
    try {
      const docRef = doc(this.requestsCollection, requestId);
      
      // Добавляем поле updated_at
      const updateObj = {
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      await updateDoc(docRef, updateObj);
      return true;
    } catch (error) {
      console.error(`[RequestService] Error updating request ${requestId}:`, error);
      return false;
    }
  }
  
  // Обновление статуса запроса
  static async updateRequestStatus(requestId: string, newStatus: string): Promise<boolean> {
    return this.updateRequest(requestId, { status: newStatus });
  }
  
  // Отправка документа (обновление статуса и добавление информации о документе)
  static async sendDocument(requestId: string, documentType: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      
      const updateData = {
        status: 'document_sent',
        document_sent_at: now,
        document_type: documentType,
        updated_at: now
      };
      
      return await this.updateRequest(requestId, updateData);
    } catch (error) {
      console.error(`[RequestService] Error sending document for request ${requestId}:`, error);
      return false;
    }
  }
  
  // Подписка на обновления запросов в реальном времени
  static subscribeToRequests(callback: (requests: ClientRequest[]) => void): () => void {
    const requestsQuery = firestoreQuery(this.requestsCollection, orderBy('updated_at', 'desc'));
    
    // Загружаем данные однократно и отправляем в коллбэк
    getDocs(requestsQuery).then((snapshot) => {
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
      
      callback(requests);
    });
    
    // В реальном приложении здесь должен быть onSnapshot, но упрощаем для примера
    return () => {
      // Отписка от обновлений
      console.log('[RequestService] Unsubscribed from requests updates');
    };
  }
  
  // Миграция данных из localStorage в Firestore (одноразовая операция)
  static async migrateFromLocalStorage(): Promise<boolean> {
    try {
      const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
      
      if (storedRequests.length === 0) {
        console.log('[RequestService] No requests in localStorage to migrate');
        return true;
      }
      
      console.log(`[RequestService] Migrating ${storedRequests.length} requests from localStorage to Firestore`);
      
      // Добавляем все запросы из localStorage в Firestore
      for (const request of storedRequests) {
        // Проверяем, что запрос имеет все необходимые поля
        if (!request.id || !request.phone_number || !request.reason_type || !request.status) {
          console.error('[RequestService] Invalid request data:', request);
          continue;
        }
        
        // Добавляем поле updated_at, если его нет
        const requestWithTimestamp = {
          ...request,
          updated_at: request.updated_at || request.created_at || new Date().toISOString()
        };
        
        // Сохраняем с тем же ID
        const docRef = doc(this.requestsCollection, request.id);
        await setDoc(docRef, requestWithTimestamp);
      }
      
      console.log('[RequestService] Migration from localStorage completed successfully');
      
      // Очищаем localStorage после успешной миграции
      localStorage.removeItem('clientRequests');
      
      return true;
    } catch (error) {
      console.error('[RequestService] Error migrating data from localStorage:', error);
      return false;
    }
  }
}
