import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white dark:bg-gray-950 flex flex-col"
    >
      {/* Декоративные элементы для минималистичного дизайна */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-tl from-blue-500/10 via-indigo-500/5 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Назад
          </button>
          
          <div className="flex items-center">
            <img 
              src={document.documentElement.classList.contains('dark') 
                ? "https://ucarecdn.com/db58423a-4747-4ab8-bc44-ba8209fd3940/mediate_logo.png"
                : "https://ucarecdn.com/3071e706-b43d-4cfb-a448-f28a64061678/logo_white.png"
              } 
              alt="Mediate Logo" 
              className="h-8 w-auto" 
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Публичная оферта</h1>
          
          <div className="prose prose-indigo dark:prose-invert max-w-none">
            <h2>1. Общие положения</h2>
            <p>
              Настоящий документ представляет собой публичную оферту ТОО "Mediate+" (далее — «Компания») о заключении договора на оказание услуг медиации (далее — «Договор») на изложенных ниже условиях.
            </p>
            <p>
              В соответствии с пунктом 2 статьи 407 Гражданского кодекса Республики Казахстан (ГК РК), в случае принятия изложенных ниже условий и оплаты услуг, физическое или юридическое лицо, производящее акцепт этой оферты, становится Заказчиком (в соответствии с пунктом 3 статьи 396 ГК РК акцепт оферты равносилен заключению договора на условиях, изложенных в оферте).
            </p>
            
            <h2>2. Предмет договора</h2>
            <p>
              Компания обязуется оказать Заказчику услуги медиации по разрешению споров и конфликтов с финансовыми организациями, а Заказчик обязуется принять и оплатить эти услуги в соответствии с условиями настоящего Договора.
            </p>
            <p>
              Под услугами медиации понимается деятельность Компании по организации процедуры медиации, направленной на содействие сторонам в урегулировании спора (конфликта) путем переговоров.
            </p>
            
            <h2>3. Права и обязанности сторон</h2>
            <h3>3.1. Компания обязуется:</h3>
            <ul>
              <li>Оказывать услуги медиации в соответствии с Законом Республики Казахстан «О медиации»;</li>
              <li>Сохранять конфиденциальность информации, полученной в ходе оказания услуг;</li>
              <li>Обеспечивать беспристрастность и независимость при оказании услуг;</li>
              <li>Информировать Заказчика о ходе оказания услуг.</li>
            </ul>
            
            <h3>3.2. Заказчик обязуется:</h3>
            <ul>
              <li>Предоставлять достоверную информацию, необходимую для оказания услуг;</li>
              <li>Соблюдать правила проведения процедуры медиации;</li>
              <li>Оплачивать услуги Компании в соответствии с условиями настоящего Договора;</li>
              <li>Не разглашать конфиденциальную информацию, полученную в ходе процедуры медиации.</li>
            </ul>
            
            <h2>4. Стоимость услуг и порядок расчетов</h2>
            <p>
              Стоимость услуг Компании определяется в соответствии с тарифами, размещенными на официальном сайте Компании.
            </p>
            <p>
              Оплата услуг производится в порядке 100% предоплаты путем перечисления денежных средств на расчетный счет Компании или иным способом, согласованным Сторонами.
            </p>
            
            <h2>5. Ответственность сторон</h2>
            <p>
              За неисполнение или ненадлежащее исполнение обязательств по настоящему Договору Стороны несут ответственность в соответствии с действующим законодательством Республики Казахстан.
            </p>
            <p>
              Компания не несет ответственности за результат процедуры медиации и за неисполнение сторонами спора достигнутых в ходе процедуры медиации договоренностей.
            </p>
            
            <h2>6. Срок действия и порядок расторжения договора</h2>
            <p>
              Настоящий Договор вступает в силу с момента акцепта оферты Заказчиком и действует до полного исполнения Сторонами своих обязательств.
            </p>
            <p>
              Договор может быть расторгнут по соглашению Сторон, а также в одностороннем порядке в случаях, предусмотренных действующим законодательством Республики Казахстан.
            </p>
            
            <h2>7. Заключительные положения</h2>
            <p>
              Все споры и разногласия, возникающие между Сторонами по настоящему Договору или в связи с ним, разрешаются путем переговоров.
            </p>
            <p>
              В случае невозможности разрешения споров путем переговоров, они подлежат рассмотрению в судебном порядке в соответствии с действующим законодательством Республики Казахстан.
            </p>
            <p>
              Настоящая публичная оферта вступает в силу с момента ее размещения на официальном сайте Компании и действует до момента ее отзыва Компанией.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Вернуться назад
          </button>
        </div>
      </div>
      
      {/* Минималистичный футер */}
      <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-600 relative z-10 mt-auto">
        © 2025 Mediate+ • Все права защищены
      </div>
    </motion.div>
  );
};
