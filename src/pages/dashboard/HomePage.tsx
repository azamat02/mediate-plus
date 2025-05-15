import React from 'react';
import { BarChart2, Users, Handshake, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const stats = [
    { 
      label: 'Активные медиации', 
      value: '12', 
      change: '+2.5%', 
      icon: <Handshake className="h-6 w-6 text-blue-500" />,
      path: '/dashboard/mediations'
    },
    { 
      label: 'Партнеры', 
      value: '24', 
      change: '+12%', 
      icon: <Users className="h-6 w-6 text-green-500" />,
      path: '/dashboard/partners'
    },
    { 
      label: 'Успешность', 
      value: '87%', 
      change: '+4%', 
      icon: <BarChart2 className="h-6 w-6 text-purple-500" />,
      path: '/dashboard/statistics'
    },
  ];

  const recentMediations = [
    { id: 1, title: 'Спор по контракту - ООО "АБВ"', status: 'В процессе', date: '2025-04-10' },
    { id: 2, title: 'Спор по оплате - ЗАО "ХЮЯ"', status: 'Запланировано', date: '2025-04-15' },
    { id: 3, title: 'Разногласия по инвестициям', status: 'Завершено', date: '2025-04-05' },
    { id: 4, title: 'Проблема с возвратом займа', status: 'В процессе', date: '2025-04-08' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Панель управления</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Добро пожаловать! Вот обзор ваших медиационных активностей.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/dashboard/mediations"
            className="btn btn-primary"
          >
            Новая медиация
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.path}
            className="bg-white dark:bg-primary-800 overflow-hidden rounded-lg shadow transition-all hover:shadow-md dark:border dark:border-primary-700"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.label}
                    </dt>
                    <dd>
                      <div className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                          {stat.change}
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-primary-700/50 px-5 py-3">
              <div className="text-sm flex justify-between items-center">
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  Подробнее
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-primary-800 shadow rounded-lg dark:border dark:border-primary-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-primary-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Недавние медиации
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ваши последние медиационные дела
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-primary-700">
            <thead className="bg-gray-50 dark:bg-primary-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Название
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-primary-800 divide-y divide-gray-200 dark:divide-primary-700">
              {recentMediations.map((mediation) => (
                <tr key={mediation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {mediation.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mediation.status === 'Завершено' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : mediation.status === 'В процессе'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {mediation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {mediation.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/dashboard/mediations/${mediation.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Просмотр
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-primary-700/50 text-right sm:px-6">
          <Link
            to="/dashboard/mediations"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Все медиации
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};