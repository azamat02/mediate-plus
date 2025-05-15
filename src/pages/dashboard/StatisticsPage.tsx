import React from 'react';
import { Calendar, Download } from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const monthlyStats = [
    { month: 'Янв', mediations: 8, completed: 6, success: 5 },
    { month: 'Фев', mediations: 12, completed: 10, success: 8 },
    { month: 'Мар', mediations: 15, completed: 12, success: 10 },
    { month: 'Апр', mediations: 10, completed: 8, success: 7 },
    { month: 'Май', mediations: 14, completed: 11, success: 9 },
    { month: 'Июн', mediations: 18, completed: 15, success: 13 },
  ];

  const mediationTypes = [
    { type: 'Споры по контрактам', count: 24, percentage: 35 },
    { type: 'Проблемы с оплатой', count: 18, percentage: 26 },
    { type: 'Конфликты партнерства', count: 12, percentage: 17 },
    { type: 'Разногласия по инвестициям', count: 9, percentage: 13 },
    { type: 'Возврат займов', count: 6, percentage: 9 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Статистика</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Аналитика и показатели эффективности ваших медиационных активностей
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <select className="input pl-10">
              <option>Последние 6 месяцев</option>
              <option>Последние 12 месяцев</option>
              <option>С начала года</option>
              <option>Произвольный период</option>
            </select>
          </div>
          <button className="btn btn-outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-primary-800 shadow rounded-lg p-6 dark:border dark:border-primary-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Успешность медиаций</h2>
          <div className="flex items-center justify-center h-64">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40">
                <circle
                  className="text-gray-200 dark:text-primary-700"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-accent-500"
                  strokeWidth="10"
                  strokeDasharray="440"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
              </svg>
              <span className="absolute text-3xl font-bold text-gray-900 dark:text-white">75%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">68</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Всего дел</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">51</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Успешных</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-500">+12%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">к прошлому году</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-primary-800 shadow rounded-lg p-6 dark:border dark:border-primary-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ежемесячные медиации</h2>
          <div className="h-64 flex items-end space-x-2">
            {monthlyStats.map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex flex-col items-center">
                  <div 
                    className="bg-primary-100 dark:bg-primary-700 w-full rounded-t-sm" 
                    style={{ height: `${(stat.mediations / 20) * 180}px` }}
                  ></div>
                  <div 
                    className="absolute bottom-0 bg-primary-300 dark:bg-primary-600 w-full rounded-t-sm" 
                    style={{ height: `${(stat.completed / 20) * 180}px` }}
                  ></div>
                  <div 
                    className="absolute bottom-0 bg-accent-500 w-full rounded-t-sm" 
                    style={{ height: `${(stat.success / 20) * 180}px` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{stat.month}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-100 dark:bg-primary-700 mr-2"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Всего медиаций</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-300 dark:bg-primary-600 mr-2"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Завершено</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-accent-500 mr-2"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Успешно</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-primary-800 shadow rounded-lg p-6 dark:border dark:border-primary-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Типы медиаций</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              {mediationTypes.map((type, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{type.type}</span>
                    <span className="text-gray-700 dark:text-gray-300">{type.count} ({type.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-2">
                    <div 
                      className="bg-accent-500 h-2 rounded-full" 
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-64 h-64" viewBox="0 0 200 200">
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#B4E66E" 
                  strokeWidth="40" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="0"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#0066FF" 
                  strokeWidth="40" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="88"
                  transform="rotate(-90 100 100)"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#3385FF" 
                  strokeWidth="40" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="163"
                  transform="rotate(-90 100 100)"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#66A3FF" 
                  strokeWidth="40" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="213"
                  transform="rotate(-90 100 100)"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#99C2FF" 
                  strokeWidth="40" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="238"
                  transform="rotate(-90 100 100)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};