import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Message {
  id: string;
  sender: 'client' | 'mediator' | 'mfo';
  text: string;
  timestamp: string;
}

interface AdminRequestChatProps {
  requestId: string;
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  className?: string;
}

export const AdminRequestChat: React.FC<AdminRequestChatProps> = ({
  requestId,
  messages,
  onSendMessage,
  className = ''
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Прокрутка к последнему сообщению при загрузке или получении новых сообщений
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, HH:mm', { locale: ru });
    } catch (error) {
      return 'Некорректная дата';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    } finally {
      setSending(false);
    }
  };

  const getSenderInfo = (sender: string) => {
    switch (sender) {
      case 'client':
        return {
          name: 'Клиент',
          icon: <User className="h-4 w-4 text-blue-500" />,
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
          align: 'justify-start'
        };
      case 'mediator':
        return {
          name: 'Медиатор',
          icon: <User className="h-4 w-4 text-green-500" />,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
          align: 'justify-end'
        };
      case 'mfo':
        return {
          name: 'МФО',
          icon: <Building2 className="h-4 w-4 text-purple-500" />,
          color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
          align: 'justify-end'
        };
      default:
        return {
          name: 'Неизвестный',
          icon: <User className="h-4 w-4 text-gray-500" />,
          color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
          align: 'justify-start'
        };
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Заголовок чата */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Переписка по обращению</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {requestId}</p>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Нет сообщений</p>
          </div>
        ) : (
          messages.map((message) => {
            const { name, icon, color, align } = getSenderInfo(message.sender);
            
            return (
              <div key={message.id} className={`flex ${align}`}>
                <div className="max-w-[80%]">
                  <div className={`rounded-lg px-4 py-2 shadow-sm ${color}`}>
                    <div className="flex items-center mb-1">
                      <span className="flex items-center text-xs font-medium">
                        {icon}
                        <span className="ml-1">{name}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки сообщения */}
      <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
