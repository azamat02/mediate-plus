import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Страница не найдена</h2>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Извините, мы не смогли найти страницу, которую вы ищете.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};