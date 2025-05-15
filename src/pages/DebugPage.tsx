import React from 'react';

export const DebugPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Страница отладки</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Если вы видите эту страницу, значит базовый рендеринг React работает корректно.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Проверка стилей Tailwind CSS.
          </p>
        </div>
      </div>
    </div>
  );
};
