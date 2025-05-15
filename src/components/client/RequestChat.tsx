import React, { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage } from '../../services/chatService';

// Используем интерфейс из ChatService
interface RequestChatProps {
  requestId: string;
}

export const RequestChat: React.FC<RequestChatProps> = ({ requestId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка сообщений и подписка на обновления
  useEffect(() => {
    setLoading(true);
    
    // Загрузка существующих сообщений
    ChatService.getMessages(requestId)
      .then(messagesData => {
        setMessages(messagesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка при загрузке сообщений:', error);
        setLoading(false);
      });

    // Подписка на новые сообщения в реальном времени
    const unsubscribe = ChatService.subscribeToMessages(requestId, newMessages => {
      setMessages(newMessages);
    });

    // Если чат пустой, отправляем приветственное сообщение от медиатора через 2 секунды
    const timer = setTimeout(() => {
      ChatService.getMessages(requestId).then(messagesData => {
        if (messagesData.length === 0) {
          ChatService.sendMessage(
            requestId, 
            'mediator', 
            'Здравствуйте! Я ваш медиатор. Чем я могу вам помочь с вашим обращением?'
          );
        }
      });
    }, 2000);

    // Отписываемся при размонтировании компонента
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [requestId]);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Отправка сообщения
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setLoading(true);
    
    // Отправляем сообщение через Firebase
    ChatService.sendMessage(requestId, 'client', newMessage.trim())
      .then(() => {
        // Сообщение будет автоматически получено через подписку
        setNewMessage('');
        setLoading(false);
        
        // В реальном приложении модератор будет отвечать сам
        // Для демо можно временно оставить автоматический ответ
        setTimeout(() => {
          const mediatorResponses = [
            'Спасибо за информацию. Я изучу ваш вопрос и свяжусь с финансовой организацией.',
            'Понятно. Давайте обсудим возможные варианты решения этой проблемы.',
            'Я получил ваше сообщение. Мне нужно уточнить несколько деталей, чтобы помочь вам эффективнее.',
            'Благодарю за обращение. Я уже начал работать над вашим вопросом.',
            'Я понимаю вашу ситуацию. Давайте рассмотрим, какие шаги мы можем предпринять.'
          ];
          
          const randomResponse = mediatorResponses[Math.floor(Math.random() * mediatorResponses.length)];
          
          // Отправляем автоматический ответ от медиатора
          ChatService.sendMessage(requestId, 'mediator', randomResponse);
        }, 1000 + Math.random() * 2000);
      })
      .catch(error => {
        console.error('Ошибка при отправке сообщения:', error);
        setLoading(false);
      });
  };

  // Форматирование времени
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Форматирование даты
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Группировка сообщений по дате
  const groupMessagesByDate = () => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({ date, messages }));
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageGroups.length > 0 ? (
          messageGroups.map(({ date, messages: groupMessages }) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                  {date}
                </span>
              </div>
              
              {groupMessages.map((message: ChatMessage) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'client' 
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="text-sm">{message.text}</div>
                    <div className="text-xs text-right mt-1 opacity-70">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>Нет сообщений. Начните общение с медиатором.</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11h4.571a1 1 0 00.725-1.688l-7-8.839z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
