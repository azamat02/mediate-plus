import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientAuthStore } from '../../store/clientAuthStore';
import { ClientRequestService } from '../../services/clientRequestService';

// Список МФО и БВУ для выбора (в реальном приложении это должно приходить с бэкенда)
const BANKS_LIST = [
  { id: 'bank1', name: 'Каспи Банк', type: 'bvu' },
  { id: 'bank2', name: 'Халык Банк', type: 'bvu' },
  { id: 'bank3', name: 'Евразийский Банк', type: 'bvu' },
  { id: 'bank4', name: 'Банк ЦентрКредит', type: 'bvu' },
  { id: 'bank5', name: 'Forte Bank', type: 'bvu' },
  { id: 'bank6', name: 'Jusan Bank', type: 'bvu' },
  { id: 'bank7', name: 'Нурбанк', type: 'bvu' },
  { id: 'bank8', name: 'Сбербанк Казахстан', type: 'bvu' },
  { id: 'bank9', name: 'Альфа Банк', type: 'bvu' },
  { id: 'mfo1', name: 'JET finance', type: 'mfo' },
  { id: 'mfo2', name: 'OnlineKazFinance (ОнлайнКазФинанс)', type: 'mfo' },
  { id: 'mfo3', name: 'MyCar Finance', type: 'mfo' },
  { id: 'mfo4', name: 'Solva', type: 'mfo' },
  { id: 'mfo5', name: 'Kokeше', type: 'mfo' },
  { id: 'mfo6', name: 'Kredit24', type: 'mfo' },
  { id: 'mfo7', name: 'Shinhan Finance', type: 'mfo' },
  { id: 'mfo8', name: 'MFO Express Finance Group', type: 'mfo' },
];

// Типы обращений
const REQUEST_TYPES = [
  { id: 'new_schedule', name: 'Новый график', description: 'Изменение графика платежей' },
  { id: 'loan_restructuring', name: 'Реструктуризация займа', description: 'Изменение условий выплаты кредита' },
  { id: 'debt_dispute', name: 'Оспаривание задолженности', description: 'Несогласие с суммой долга, штрафами, пени' },
  { id: 'payment_delay', name: 'Отсрочка платежа', description: 'Получение отсрочки по выплате' },
  { id: 'interest_rate', name: 'Снижение процентной ставки', description: 'Уменьшение процентной ставки' },
  { id: 'early_repayment', name: 'Досрочное погашение', description: 'Проблемы с погашением' },
  { id: 'other', name: 'Другое', description: 'Иные вопросы, не указанные в списке' },
];

// Шаблоны текстов для каждого типа запроса
const REQUEST_TEMPLATES = {
  new_schedule: [
    {
      title: 'Изменение графика из-за финансовых трудностей',
      text: 'Прошу рассмотреть возможность изменения графика платежей по займу из-за временных финансовых трудностей. В настоящее время мой доход снизился, и я не могу выплачивать ежемесячные платежи в полном объеме. Хотел бы уменьшить размер ежемесячного платежа и увеличить срок кредита.'
    },
    {
      title: 'Изменение даты платежа',
      text: 'Прошу изменить дату ежемесячного платежа по займу. В связи с изменением даты получения заработной платы, хотел бы перенести дату платежа с текущей на другое число месяца, чтобы избежать просрочек.'
    }
  ],
  loan_restructuring: [
    {
      title: 'Реструктуризация из-за потери работы',
      text: 'Прошу рассмотреть возможность реструктуризации моего займа в связи с потерей работы. В настоящее время нахожусь в поиске нового места работы и временно не имею стабильного дохода. Прошу предоставить возможность реструктуризации с уменьшением ежемесячного платежа.'
    },
    {
      title: 'Реструктуризация из-за болезни',
      text: 'Прошу рассмотреть возможность реструктуризации моего займа в связи с длительной болезнью и временной нетрудоспособностью. В настоящее время нахожусь на больничном и мой доход существенно снизился. Прошу предоставить возможность реструктуризации с отсрочкой платежей на период лечения.'
    }
  ],
  debt_dispute: [
    {
      title: 'Оспаривание начисленных штрафов',
      text: 'Оспариваю сумму начисленных штрафов и пени по займу. Считаю, что штрафы начислены неправомерно, так как платежи вносились своевременно. Прошу пересмотреть сумму задолженности и предоставить детальный расчет начисленных штрафов и пени.'
    },
    {
      title: 'Несогласие с суммой основного долга',
      text: 'Выражаю несогласие с текущей суммой основного долга по займу. По моим расчетам, сумма долга должна быть меньше. Прошу предоставить детальный расчет текущей задолженности с учетом всех внесенных платежей.'
    }
  ],
  payment_delay: [
    {
      title: 'Отсрочка из-за временных трудностей',
      text: 'Прошу предоставить отсрочку платежа по займу на период 3 месяца в связи с временными финансовыми трудностями. Обязуюсь возобновить платежи в полном объеме после указанного периода.'
    },
    {
      title: 'Отсрочка из-за чрезвычайной ситуации',
      text: 'Прошу предоставить отсрочку платежа по займу в связи с чрезвычайной ситуацией (указать какой). Данные обстоятельства временно лишили меня возможности вносить платежи по графику. Прошу предоставить отсрочку на период восстановления.'
    }
  ],
  interest_rate: [
    {
      title: 'Снижение ставки из-за рыночных изменений',
      text: 'Прошу рассмотреть возможность снижения процентной ставки по моему займу в связи со значительным снижением базовой ставки на рынке. Являюсь добросовестным заемщиком и своевременно вношу все платежи.'
    },
    {
      title: 'Снижение ставки для постоянного клиента',
      text: 'Прошу рассмотреть возможность снижения процентной ставки по моему займу, так как являюсь постоянным клиентом вашей организации и имею положительную кредитную историю. Своевременно вношу все платежи и не допускаю просрочек.'
    }
  ],
  early_repayment: [
    {
      title: 'Проблема с досрочным погашением',
      text: 'Столкнулся с проблемой при попытке досрочного погашения займа. Внес сумму для полного погашения, однако в системе до сих пор числится задолженность. Прошу разобраться в ситуации и подтвердить полное погашение займа.'
    },
    {
      title: 'Неверный расчет при частичном погашении',
      text: 'Внес сумму для частичного досрочного погашения займа, однако размер ежемесячного платежа не изменился. Прошу пересчитать график платежей с учетом внесенной суммы и уменьшить размер ежемесячного платежа.'
    }
  ],
  other: [
    {
      title: 'Общий запрос',
      text: 'Прошу рассмотреть мое обращение по вопросу (указать суть проблемы). Данная ситуация требует вмешательства специалистов для справедливого решения.'
    },
    {
      title: 'Запрос документов',
      text: 'Прошу предоставить полный пакет документов по моему займу, включая договор, график платежей и выписку по счету за весь период обслуживания займа.'
    }
  ]
};

export const NewRequestPage: React.FC = () => {
  const [selectedMfo, setSelectedMfo] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<number>(1); // Добавляем шаги для пошагового заполнения формы
  const [orgType, setOrgType] = useState<'bvu' | 'mfo' | ''>(''); // Тип организации: БВУ или МФО
  const [showTemplates, setShowTemplates] = useState(false); // Состояние для отображения/скрытия шаблонов
  
  const navigate = useNavigate();
  const { phoneNumber, iin } = useClientAuthStore();
  
  // Анимация уже определена в компонентах motion.div
  
  // Функция для применения выбранного шаблона текста
  const applyTemplate = (templateText: string) => {
    setDescription(templateText);
    setShowTemplates(false); // Скрываем шаблоны после выбора
  };
  
  // Валидация текущего шага
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!orgType) {
        newErrors.orgType = 'Пожалуйста, выберите тип организации';
      }
    } else if (step === 2) {
      if (!selectedMfo) {
        newErrors.mfo = orgType === 'bvu' ? 'Пожалуйста, выберите банк' : 'Пожалуйста, выберите МФО';
      }
    } else if (step === 3) {
      if (!selectedType) {
        newErrors.type = 'Пожалуйста, выберите тип обращения';
      }
    } else if (step === 4) {
      if (!description.trim()) {
        newErrors.description = 'Пожалуйста, опишите вашу проблему';
      } else if (description.length < 20) {
        newErrors.description = 'Описание должно содержать не менее 20 символов';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Переход к следующему шагу
  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };
  
  // Возврат к предыдущему шагу
  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };
  
  // Функция validateForm удалена, так как она не используется
  // Вместо неё используется validateStep для проверки каждого шага
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Если мы на последнем шаге, отправляем форму
    if (step === 4) {
      if (!validateStep()) {
        return;
      }
      
      setLoading(true);
      
      try {
        // Получаем имя организации по ID
        const organization = BANKS_LIST.find(bank => bank.id === selectedMfo);
        
        // Создаем объект обращения
        const newRequest = {
          phone_number: phoneNumber,
          iin: iin,
          mfo_id: selectedMfo,
          mfo_name: organization?.name || '',
          organization_type: orgType === '' ? undefined : orgType as 'bvu' | 'mfo',
          reason_type: selectedType, // Используем ID типа обращения
          reason: description,
          status: 'new',
          created_at: new Date().toISOString()
        };
        
        // Сохраняем запрос в Firebase
        console.log('Отправка запроса в Firebase:', newRequest);
        const requestId = await ClientRequestService.createRequest(newRequest);
        
        if (requestId) {
          console.log('Запрос успешно создан с ID:', requestId);
          
          // Также сохраняем в localStorage для совместимости с существующим кодом
          const storedRequests = JSON.parse(localStorage.getItem('clientRequests') || '[]');
          storedRequests.push({
            ...newRequest,
            id: requestId
          });
          localStorage.setItem('clientRequests', JSON.stringify(storedRequests));
          
          // Перенаправляем на страницу с обращениями
          navigate('/client/dashboard/requests');
        } else {
          throw new Error('Не удалось создать запрос в базе данных');
        }
      } catch (error) {
        console.error('Error creating request:', error);
        setErrors({
          ...errors,
          submit: 'Произошла ошибка при создании обращения. Пожалуйста, попробуйте еще раз.'
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Если мы не на последнем шаге, переходим к следующему
      nextStep();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Создание нового обращения</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Заполните форму ниже, чтобы создать новое обращение
        </p>
      </div>
      
      {/* Индикатор прогресса */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Шаг {step} из 4</div>
          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {step === 1 ? 'Выбор типа организации' : 
             step === 2 ? 'Выбор организации' : 
             step === 3 ? 'Выбор типа обращения' : 
             'Описание проблемы'}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow-lg overflow-hidden rounded-xl p-6">
        {/* Шаг 1: Выбор типа организации */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Выберите тип финансовой организации</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Выберите тип организации, с которой у вас возникла проблема</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setOrgType('bvu')}
                className={`cursor-pointer p-6 rounded-xl border-2 ${orgType === 'bvu' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'} transition-all duration-200`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 ${orgType === 'bvu' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'} mr-3 flex items-center justify-center`}>
                    {orgType === 'bvu' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Банк второго уровня (БВУ)</h4>
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => setOrgType('mfo')}
                className={`cursor-pointer p-6 rounded-xl border-2 ${orgType === 'mfo' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'} transition-all duration-200`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 ${orgType === 'mfo' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'} mr-3 flex items-center justify-center`}>
                    {orgType === 'mfo' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Микрофинансовая организация (МФО)</h4>
                  </div>
                </div>
              </div>
            </div>
            
            {errors.orgType && (
              <p className="mt-2 text-sm text-red-600">{errors.orgType}</p>
            )}
          </motion.div>
        )}
        
        {/* Шаг 2: Выбор конкретной организации */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {orgType === 'bvu' ? 'Выберите банк' : 'Выберите микрофинансовую организацию'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {orgType === 'bvu' ? 'Выберите банк, с которым у вас возникла проблема' : 'Выберите МФО, с которой у вас возникла проблема'}
              </p>
            </div>
            
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {orgType === 'bvu' ? 'Выберите банк' : 'Выберите МФО'}
              </label>
              <select
                id="organization"
                name="organization"
                value={selectedMfo}
                onChange={(e) => setSelectedMfo(e.target.value)}
                className={`block w-full px-4 py-3 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                  errors.mfo ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">{orgType === 'bvu' ? 'Выберите банк' : 'Выберите МФО'}</option>
                {BANKS_LIST.filter(bank => bank.type === orgType).map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name}
                  </option>
                ))}
              </select>
              {errors.mfo && (
                <p className="mt-2 text-sm text-red-600">{errors.mfo}</p>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Шаг 3: Выбор типа обращения */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Выберите тип обращения</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Укажите, какого рода проблема у вас возникла</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {REQUEST_TYPES.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`cursor-pointer p-4 rounded-lg border ${selectedType === type.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700'} hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 ${selectedType === type.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'} mr-3 flex items-center justify-center`}>
                      {selectedType === type.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{type.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {errors.type && (
              <p className="mt-2 text-sm text-red-600">{errors.type}</p>
            )}
          </motion.div>
        )}
        
        {/* Шаг 4: Описание проблемы */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Опишите вашу проблему</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Подробно опишите суть проблемы и что вы хотели бы решить</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Описание проблемы
                </label>
                <motion.button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  {showTemplates ? 'Скрыть шаблоны' : 'Выбрать готовый шаблон'}
                </motion.button>
              </div>
              
              {/* Шаблоны текстов */}
              <AnimatePresence>
                {showTemplates && selectedType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Выберите шаблон текста:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {REQUEST_TEMPLATES[selectedType as keyof typeof REQUEST_TEMPLATES]?.map((template, index) => (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() => applyTemplate(template.text)}
                            className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
                            whileHover={{ scale: 1.01, x: 5 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{template.title}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">{template.text}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <textarea
                id="description"
                name="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`block w-full px-4 py-3 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Опишите вашу проблему как можно подробнее..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
              
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Минимум 20 символов. Сейчас: {description.length}
              </div>
            </div>
          </motion.div>
        )}
        
        {errors.submit && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          {/* Кнопка возврата назад */}
          {step > 1 ? (
            <button
              type="button"
              onClick={() => prevStep()}
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Назад
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/client/dashboard/requests')}
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Отмена
            </button>
          )}
          
          {/* Кнопка далее или отправить */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Отправка...
              </div>
            ) : step < 4 ? (
              <div className="flex items-center">
                Далее
                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              'Отправить обращение'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
