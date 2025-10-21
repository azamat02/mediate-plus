import React, { useState } from 'react';
import { Bell, Mail, Shield, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'email'>('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Настройки</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Управление настройками вашего аккаунта и предпочтениями
        </p>
      </div>

      <div className="bg-white dark:bg-primary-800 shadow rounded-lg overflow-hidden dark:border dark:border-primary-700">
        <div className="border-b border-gray-200 dark:border-primary-700">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'general'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Общие
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Уведомления
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'security'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Безопасность
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'email'
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Шаблоны писем
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Профиль</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Обновите вашу личную информацию
                </p>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Имя
                  </label>
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    autoComplete="given-name"
                    className="input mt-1"
                    defaultValue="Иван"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    autoComplete="family-name"
                    className="input mt-1"
                    defaultValue="Петров"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email адрес
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    className="input mt-1"
                    defaultValue="ivan.petrov@example.com"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    autoComplete="tel"
                    className="input mt-1"
                    defaultValue="+7 (123) 456-7890"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Язык
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="input mt-1"
                    defaultValue="ru"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">Английский</option>
                    <option value="de">Немецкий</option>
                  </select>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 dark:border-primary-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Тема</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Выберите предпочитаемую тему
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-primary-700 dark:text-gray-200 dark:hover:bg-primary-600"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Светлая тема
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Темная тема
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 dark:border-primary-700">
                <div className="flex justify-end">
                  <button type="button" className="btn btn-outline mr-3">
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Уведомления</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Управление способами получения уведомлений
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email-notifications"
                      name="email-notifications"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                      Email уведомления
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      Получать уведомления по email о новых медиациях, обновлениях и результатах.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="browser-notifications"
                      name="browser-notifications"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="browser-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                      Уведомления в браузере
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      Получать уведомления в браузере при использовании платформы.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sms-notifications"
                      name="sms-notifications"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sms-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                      SMS уведомления
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      Получать текстовые сообщения для срочных обновлений и напоминаний.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Типы уведомлений</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="mediation-updates"
                          name="mediation-updates"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="mediation-updates" className="font-medium text-gray-700 dark:text-gray-300">
                          Обновления медиаций
                        </label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="new-partners"
                          name="new-partners"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="new-partners" className="font-medium text-gray-700 dark:text-gray-300">
                          Новые партнеры
                        </label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="platform-updates"
                          name="platform-updates"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="platform-updates" className="font-medium text-gray-700 dark:text-gray-300">
                          Обновления платформы
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 dark:border-primary-700">
                <div className="flex justify-end">
                  <button type="button" className="btn btn-outline mr-3">
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Безопасность</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Управление настройками безопасности вашего аккаунта
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Изменить пароль</h4>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Текущий пароль
                      </label>
                      <input
                        type="password"
                        name="current-password"
                        id="current-password"
                        className="input mt-1"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Новый пароль
                      </label>
                      <input
                        type="password"
                        name="new-password"
                        id="new-password"
                        className="input mt-1"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Подтвердите пароль
                      </label>
                      <input
                        type="password"
                        name="confirm-password"
                        id="confirm-password"
                        className="input mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-200 dark:border-primary-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Двухфакторная аутентификация</h4>
                  <div className="mt-4">
                    <button type="button" className="btn btn-outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Включить двухфакторную аутентификацию
                    </button>
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-200 dark:border-primary-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Сессии</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Управление вашими активными сессиями
                  </p>
                  <div className="mt-4">
                    <div className="bg-gray-50 dark:bg-primary-700/30 p-4 rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Текущая сессия</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Москва, Россия • Chrome на Windows • Начата 2 часа назад
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Активна
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 dark:border-primary-700">
                <div className="flex justify-end">
                  <button type="button" className="btn btn-outline mr-3">
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Шаблоны писем</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Настройте шаблоны писем, отправляемых клиентам
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="welcome-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Приветственное письмо
                  </label>
                  <textarea
                    id="welcome-email"
                    rows={5}
                    className="input mt-1"
                    defaultValue="Уважаемый [Имя клиента],

Добро пожаловать в Kelisim.bar! Мы рады приветствовать вас.

Ваш аккаунт был успешно создан, и теперь вы можете получить доступ к нашей платформе для управления вашими медиационными делами.

С уважением,
Команда Kelisim.bar"
                  />
                </div>

                <div>
                  <label htmlFor="session-reminder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Напоминание о сессии
                  </label>
                  <textarea
                    id="session-reminder"
                    rows={5}
                    className="input mt-1"
                    defaultValue="Уважаемый [Имя клиента],

Напоминаем, что ваша медиационная сессия запланирована на [Дата сессии] в [Время сессии].

Место проведения: [Место проведения]

Пожалуйста, убедитесь, что вы подготовили все необходимые документы для сессии.

С уважением,
Команда Kelisim.bar"
                  />
                </div>

                <div>
                  <label htmlFor="completion-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Завершение дела
                  </label>
                  <textarea
                    id="completion-email"
                    rows={5}
                    className="input mt-1"
                    defaultValue="Уважаемый [Имя клиента],

Мы рады сообщить вам, что ваше медиационное дело [Номер дела] было успешно завершено.

Благодарим вас за выбор Kelisim.bar для ваших медиационных потребностей. Мы будем признательны за ваш отзыв о наших услугах.

С уважением,
Команда Kelisim.bar"
                  />
                </div>

                <div className="pt-5 border-t border-gray-200 dark:border-primary-700">
                  <div className="flex justify-end">
                    <button type="button" className="btn btn-outline mr-3">
                      Сбросить к стандартным
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Сохранить шаблоны
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
     </div>
  );
};