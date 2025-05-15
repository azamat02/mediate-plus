import React, { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Профиль</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление вашей личной информацией и предпочтениями
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
          >
            {isEditing ? 'Отмена' : 'Редактировать профиль'}
          </button>
          {isEditing && (
            <button className="btn btn-primary ml-3">
              Сохранить изменения
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-primary-800 shadow rounded-lg overflow-hidden dark:border dark:border-primary-700">
        <div className="relative h-40 bg-gradient-to-r from-primary-600 to-primary-800">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-white dark:border-primary-800 bg-white dark:bg-primary-700 flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-white">
                ИП
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-accent-500 p-1.5 rounded-full text-white">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        defaultValue="Иван Петров"
                      />
                    ) : (
                      "Иван Петров"
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEditing ? (
                      <input
                        type="text"
                        className="input mt-2"
                        defaultValue="Старший медиатор"
                      />
                    ) : (
                      "Старший медиатор"
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="email"
                        className="input"
                        defaultValue="ivan.petrov@example.com"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">ivan.petrov@example.com</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="tel"
                        className="input"
                        defaultValue="+7 (123) 456-7890"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">+7 (123) 456-7890</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        defaultValue="Москва, Россия"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">Москва, Россия</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Присоединился в январе 2023</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">О себе</h3>
                  {isEditing ? (
                    <textarea
                      className="input w-full"
                      rows={4}
                      defaultValue="Опытный медиатор, специализирующийся на финансовых спорах с более чем 10-летним опытом работы в банковском и финансовом секторе. Сертифицирован Международным институтом медиации."
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Опытный медиатор, специализирующийся на финансовых спорах с более чем 10-летним опытом работы в банковском и финансовом секторе. Сертифицирован Международным институтом медиации.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 dark:bg-primary-700/30 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Статистика</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Обработано дел</span>
                      <span className="font-medium text-gray-900 dark:text-white">87</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 dark:bg-primary-700 rounded-full h-1.5">
                      <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Успешность</span>
                      <span className="font-medium text-gray-900 dark:text-white">92%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 dark:bg-primary-700 rounded-full h-1.5">
                      <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Удовлетворенность клиентов</span>
                      <span className="font-medium text-gray-900 dark:text-white">4.8/5</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 dark:bg-primary-700 rounded-full h-1.5">
                      <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Специализации</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    Финансовые споры
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    Банковское дело
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Корпоративная медиация
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Споры по контрактам
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    Инвестиционные конфликты
                  </span>
                </div>
                {isEditing && (
                  <button className="text-sm text-primary-600 dark:text-primary-400 mt-2">
                    + Добавить специализацию
                  </button>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Языки</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Русский</span>
                    <span className="text-gray-500 dark:text-gray-400">Родной</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Английский</span>
                    <span className="text-gray-500 dark:text-gray-400">Свободно</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Немецкий</span>
                    <span className="text-gray-500 dark:text-gray-400">Средний</span>
                  </div>
                </div>
                {isEditing && (
                  <button className="text-sm text-primary-600 dark:text-primary-400 mt-2">
                    + Добавить язык
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};