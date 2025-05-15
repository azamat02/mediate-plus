import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors } 
  } = useForm<LoginFormData>({
    defaultValues: {
      email: import.meta.env.VITE_TEST_EMAIL || '',
      password: import.meta.env.VITE_TEST_PASSWORD || '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth store
      console.error('Login form submission error:', err);
    }
  };

  const handleFillTestCredentials = () => {
    setValue('email', import.meta.env.VITE_TEST_EMAIL || 'test@mediate.com');
    setValue('password', import.meta.env.VITE_TEST_PASSWORD || 'mediate123');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="input bg-primary-800/50 border-primary-700 text-white placeholder-gray-400"
          placeholder="your@email.com"
          {...register('email', { 
            required: 'Email обязателен',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Неверный формат email'
            }
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-white">
            Пароль
          </label>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="input bg-primary-800/50 border-primary-700 text-white placeholder-gray-400 pr-10"
            placeholder="••••••••"
            {...register('password', { 
              required: 'Пароль обязателен',
              minLength: {
                value: 6,
                message: 'Пароль должен содержать минимум 6 символов'
              }
            })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
            Запомнить меня
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="text-accent-500 hover:text-accent-400 font-medium">
            Забыли пароль?
          </a>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Spinner size="sm" className="mr-2" />
            Вход...
          </span>
        ) : (
          'Войти'
        )}
      </button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={handleFillTestCredentials}
          className="text-sm text-accent-500 hover:text-accent-400"
        >
          Использовать тестовый аккаунт
        </button>
      </div>
    </form>
  );
};