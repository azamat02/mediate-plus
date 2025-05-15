import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui/Spinner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuthStore();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary-900">
        <Spinner size="lg" className="border-accent-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-primary-900">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center mb-8">
            <img 
              src="https://ucarecdn.com/db58423a-4747-4ab8-bc44-ba8209fd3940/mediate_logo.png" 
              alt="Mediate Logo" 
              className="h-10 w-auto" 
            />
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">
              Добро пожаловать в Mediate+
            </h2>
            <p className="mt-2 text-gray-400">
              Платформа для медиации финансовых споров
            </p>
          </div>
          
          <LoginForm />
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Регистрируясь, вы соглашаетесь с{' '}
            <a href="#" className="text-accent-500 hover:text-accent-400 font-medium">
              Условиями использования
            </a>
            ,{' '}
            <a href="#" className="text-accent-500 hover:text-accent-400 font-medium">
              Уведомлением о конфиденциальности
            </a>{' '}
            и{' '}
            <a href="#" className="text-accent-500 hover:text-accent-400 font-medium">
              Уведомлением о файлах cookie
            </a>
            .
          </p>
        </div>
      </div>
      
      <div className="hidden md:block md:w-1/2 bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80')" }}>
        <div className="h-full w-full bg-black bg-opacity-50 flex items-center justify-center p-12">
          <div className="max-w-md">
            <blockquote className="text-xl font-medium text-white italic">
              "Mediate+ помогла нам разрешить сложный финансовый спор за считанные дни, сэкономив время и деньги на судебных разбирательствах."
            </blockquote>
            <div className="mt-4 text-white">
              <p className="font-semibold">Алексей Петров</p>
              <p className="text-sm">Финансовый директор, ООО "ТехноСтарт"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};