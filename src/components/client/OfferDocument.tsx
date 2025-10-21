import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';

interface OfferDocumentProps {
  clientName: string;
  iin: string;
  mfoName: string;
  date: string;
}

export const OfferDocument: React.FC<OfferDocumentProps> = ({ 
  clientName, 
  iin, 
  mfoName, 
  date 
}) => {
  const { theme } = useThemeStore();
  const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img
            src={theme === 'dark'
              ? "/images/logo-dark.svg"
              : "/images/logo-light.svg"
            }
            alt="Kelisim Logo"
            className="h-10 w-auto mr-3"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kelisim.bar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Сервис медиации финансовых споров</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Дата: {formattedDate}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Документ: Оферта</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ОФЕРТА О МЕДИАЦИИ</h2>
        <p className="text-gray-600 dark:text-gray-300">Соглашение о проведении процедуры медиации</p>
      </div>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p>
          Настоящим {mfoName} (далее - "Финансовая организация") и {clientName}, ИИН: {iin} (далее - "Клиент"), 
          совместно именуемые "Стороны", заключают настоящее соглашение о проведении процедуры медиации 
          с целью урегулирования спора, возникшего между Сторонами.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">1. ПРЕДМЕТ СОГЛАШЕНИЯ</h3>
        <p>
          1.1. Стороны соглашаются провести процедуру медиации в отношении спора, возникшего из договора 
          о предоставлении финансовых услуг между Финансовой организацией и Клиентом.
        </p>
        <p>
          1.2. Медиация проводится с участием независимого медиатора, предоставляемого сервисом Kelisim.bar.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">2. ПРИНЦИПЫ МЕДИАЦИИ</h3>
        <p>
          2.1. Процедура медиации основывается на принципах добровольности, конфиденциальности, 
          сотрудничества и равноправия сторон, беспристрастности и независимости медиатора.
        </p>
        <p>
          2.2. Вся информация, относящаяся к процедуре медиации, является конфиденциальной, если 
          стороны не договорились об ином.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">3. ПОРЯДОК ПРОВЕДЕНИЯ МЕДИАЦИИ</h3>
        <p>
          3.1. Медиация проводится в формате онлайн-встреч через платформу Kelisim.bar.
        </p>
        <p>
          3.2. Срок проведения процедуры медиации не может превышать 30 календарных дней.
        </p>
        <p>
          3.3. Стороны обязуются добросовестно участвовать в процедуре медиации и предпринимать 
          усилия для урегулирования спора.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">4. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</h3>
        <p>
          4.1. Настоящее соглашение вступает в силу с момента его подписания Сторонами.
        </p>
        <p>
          4.2. Соглашение может быть изменено или расторгнуто по взаимному согласию Сторон.
        </p>
        <p>
          4.3. Настоящее соглашение составлено в электронной форме и имеет юридическую силу.
        </p>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Финансовая организация:</h4>
            <p className="text-gray-700 dark:text-gray-300">{mfoName}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Клиент:</h4>
            <p className="text-gray-700 dark:text-gray-300">{clientName}</p>
            <p className="text-gray-700 dark:text-gray-300">ИИН: {iin}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Соглашение сформировано в электронном виде через сервис Kelisim.bar.
          Для подтверждения согласия с условиями необходимо нажать кнопку "Принять оферту".
        </p>
      </div>
    </motion.div>
  );
};
