import React from 'react';
import { Plus, Search } from 'lucide-react';

export const PartnersPage: React.FC = () => {
  const partners = [
    {
      id: 1,
      name: 'Финансовые Медиационные Услуги',
      type: 'Медиационная фирма',
      location: 'Москва',
      cases: 24,
      status: 'Активен',
      contact: 'info@fms.ru'
    },
    {
      id: 2,
      name: 'Группа Юридических Решений',
      type: 'Юридическая фирма',
      location: 'Санкт-Петербург',
      cases: 18,
      status: 'Активен',
      contact: 'contact@lsg.ru'
    },
    {
      id: 3,
      name: 'Разрешение Бизнес-Споров',
      type: 'Медиационная фирма',
      location: 'Казань',
      cases: 12,
      status: 'Активен',
      contact: 'info@bdr.ru'
    },
    {
      id: 4,
      name: 'Корпоративные Медиационные Партнеры',
      type: 'Медиационная фирма',
      location: 'Новосибирск',
      cases: 9,
      status: 'Неактивен',
      contact: 'office@cmp.ru'
    },
    {
      id: 5,
      name: 'Ассоциация Финансовых Консультантов',
      type: 'Отраслевая ассоциация',
      location: 'Москва',
      cases: 15,
      status: 'Активен',
      contact: 'members@faa.ru'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Партнеры</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление вашими медиационными партнерами и сотрудниками
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Добавить партнера
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-primary-800 shadow rounded-lg overflow-hidden dark:border dark:border-primary-700">
        <div className="p-4 border-b border-gray-200 dark:border-primary-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Поиск партнеров..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-primary-700">
            <thead className="bg-gray-50 dark:bg-primary-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Название
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Тип
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Местоположение
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дела
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Контакт
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-primary-800 divide-y divide-gray-200 dark:divide-primary-700">
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {partner.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {partner.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {partner.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {partner.cases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      partner.status === 'Активен' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {partner.contact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Просмотр
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-primary-700/50 flex items-center justify-between border-t border-gray-200 dark:border-primary-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="btn btn-outline">
              Предыдущая
            </button>
            <button className="btn btn-outline ml-3">
              Следующая
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Показано <span className="font-medium">1</span> - <span className="font-medium">5</span> из{' '}
                <span className="font-medium">12</span> результатов
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-primary-600">
                  <span className="sr-only">Предыдущая</span>
                  &larr;
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-primary-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-primary-600">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-primary-600">
                  <span className="sr-only">Следующая</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};