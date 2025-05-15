import { database } from '../lib/firebase';
import { ref, push, get, set, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  requestId: string;
  sender: 'client' | 'mediator' | 'mfo';
  text: string;
  timestamp: string;
}

export class ChatService {
  private static messagesRef = ref(database, 'chatMessages');
  
  // Получение всех сообщений для конкретного запроса
  static async getMessages(requestId: string): Promise<ChatMessage[]> {
    try {
      const messagesQuery = query(
        this.messagesRef,
        orderByChild('requestId'),
        equalTo(requestId)
      );
      
      const snapshot = await get(messagesQuery);
      const messages: ChatMessage[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val() as ChatMessage;
          messages.push({
            ...message,
            id: childSnapshot.key || message.id,
          });
        });
        
        // Сортировка сообщений по времени
        messages.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
      }
      
      return messages;
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
      return [];
    }
  }
  
  // Отправка нового сообщения
  static async sendMessage(requestId: string, senderType: 'client' | 'mediator' | 'mfo', text: string): Promise<ChatMessage | null> {
    try {
      const newMessageRef = push(this.messagesRef);
      
      const messageData: ChatMessage = {
        id: newMessageRef.key || uuidv4(),
        requestId,
        sender: senderType,
        text,
        timestamp: new Date().toISOString()
      };
      
      await set(newMessageRef, messageData);
      return messageData;
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      return null;
    }
  }
  
  // Подписка на обновления сообщений в реальном времени
  static subscribeToMessages(requestId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesQuery = query(
      this.messagesRef,
      orderByChild('requestId'),
      equalTo(requestId)
    );
    
    const handleSnapshot = (snapshot: any) => {
      const messages: ChatMessage[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot: any) => {
          const message = childSnapshot.val() as ChatMessage;
          messages.push({
            ...message,
            id: childSnapshot.key || message.id,
          });
        });
        
        // Сортировка сообщений по времени
        messages.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        
        callback(messages);
      } else {
        callback([]);
      }
    };
    
    onValue(messagesQuery, handleSnapshot);
    
    // Возвращаем функцию отписки для очистки при размонтировании компонента
    return () => off(messagesQuery);
  }
}
