/**
 * Переводы статусов и хелперы для работы с ними
 */

/**
 * Получение русского перевода статуса обращения или документа
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    // Общие статусы
    case 'new':
      return 'Новое';
    case 'in_progress':
      return 'В обработке';
    case 'completed':
      return 'Завершено';
    case 'rejected':
      return 'Отклонено';

    // Статусы документов
    case 'document_sent':
      return 'Документ отправлен';
    case 'document_viewed':
      return 'Документ просмотрен';
    case 'document_signed':
      return 'Документ подписан';
    case 'new_schedule':
      return 'Новый график';
    
    default:
      return status;
  }
};

/**
 * Получение класса цвета для статуса
 */
export const getStatusColor = (status: string): { text: string; bg: string } => {
  switch (status) {
    case 'new':
      return { text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/50' };
    case 'in_progress':
      return { text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/50' };
    case 'completed':
      return { text: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/50' };
    case 'rejected':
      return { text: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/50' };
    case 'document_sent':
      return { text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/50' };
    case 'document_viewed':
      return { text: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/50' };
    case 'document_signed':
      return { text: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-900/50' };
    default:
      return { text: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-900/50' };
  }
};

/**
 * Формирование класса для статус-бейджа
 */
export const getStatusBadgeClass = (status: string): string => {
  const { text, bg } = getStatusColor(status);
  return `${text} ${bg} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`;
};
