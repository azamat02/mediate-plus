import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, Camera, Mail, Phone, Calendar, User, CreditCard } from 'lucide-react';
import { useClientAuthStore } from '../../store/clientAuthStore';
import { PageTransition } from '../../components/ui/PageTransition';

interface UserProfile {
  phoneNumber: string;
  iin: string;
  fullName: string;
  email: string;
  birthDate: string;
}

export const ClientProfilePage: React.FC = () => {
  const { phoneNumber, iin, fullName, birthDate } = useClientAuthStore();
  const [profile, setProfile] = useState<UserProfile>({
    phoneNumber: phoneNumber || '',
    iin: iin || '',
    fullName: fullName || '',
    email: '',
    birthDate: birthDate || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Функция для получения инициалов пользователя
  const getUserInitials = () => {
    if (profile.fullName) {
      const nameParts = profile.fullName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return profile.fullName.charAt(0).toUpperCase();
    }
    return 'M';
  };

  useEffect(() => {
    // Инициализируем профиль данными из хранилища состояния
    setProfile({
      phoneNumber: phoneNumber || '',
      iin: iin || '',
      fullName: fullName || '',
      birthDate: birthDate || '',
      email: ''
    });
    
    // Для демо также используем localStorage для дополнительных данных
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        if (parsedProfile.phoneNumber === phoneNumber) {
          // Объединяем данные из хранилища состояния и localStorage
          const combinedProfile = {
            ...parsedProfile,
            phoneNumber: phoneNumber || parsedProfile.phoneNumber,
            iin: iin || parsedProfile.iin,
            fullName: fullName || parsedProfile.fullName,
            birthDate: birthDate || parsedProfile.birthDate
          };
          setProfile(combinedProfile);
          setFormData(combinedProfile);
        }
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  }, [phoneNumber, iin, fullName, birthDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // В реальном приложении здесь был бы запрос к API
      // Для демо используем localStorage
      localStorage.setItem('userProfile', JSON.stringify(formData));
      setProfile(formData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Профиль успешно обновлен' });
      
      // В реальном приложении здесь было бы обновление данных в базе данных
      // Например, запрос к Supabase для обновления данных пользователя
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Ошибка при обновлении профиля' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Мой профиль</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление личной информацией
          </p>
        </div>
        
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Редактировать
          </button>
        )}
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Аватар с возможностью загрузки */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {getUserInitials()}
                </div>
                <button 
                  type="button" 
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ФИО
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm transition-colors duration-200"
                      placeholder="Введите ваше полное имя"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="iin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ИИН
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="iin"
                      name="iin"
                      value={formData.iin}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm transition-colors duration-200"
                      placeholder="Введите ваш ИИН"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Дата рождения
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm transition-colors duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm transition-colors duration-200"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Номер телефона
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      disabled
                      className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Номер телефона нельзя изменить</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profile);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <X size={18} className="mr-2" />
                Отмена
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Сохранение...
                  </div>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Сохранить
                  </>
                )}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {/* Профиль с аватаром */}
            <div className="flex flex-col items-center mb-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg"
              >
                {getUserInitials()}
              </motion.div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{profile.fullName || 'Не указано'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profile.phoneNumber}</p>
                {profile.email && <p className="text-sm text-indigo-600 dark:text-indigo-400">{profile.email}</p>}
              </div>
            </div>
            
            {/* Информация о профиле */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">Личная информация</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <CreditCard size={18} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ИИН</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{profile.iin || 'Не указано'}</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <User size={18} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ФИО</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{profile.fullName || 'Не указано'}</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <Calendar size={18} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Дата рождения</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{profile.birthDate || 'Не указано'}</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <Mail size={18} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{profile.email || 'Не указано'}</p>
                  </motion.div>
                </div>
              </div>
              
              {/* Кнопка редактирования */}
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <Edit2 size={18} className="mr-2" />
                  Редактировать профиль
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};
