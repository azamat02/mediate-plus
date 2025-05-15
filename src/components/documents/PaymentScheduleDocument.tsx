import React from 'react';

interface PaymentEntry {
  paymentNumber: number;
  paymentDate: string;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

interface PaymentScheduleDocumentProps {
  clientName: string;
  contractNumber: string;
  contractDate: string;
  loanAmount: number;
  interestRate: number;
  term: number;
  startDate: string;
  endDate: string;
  payments: PaymentEntry[];
}

export const PaymentScheduleDocument: React.FC<PaymentScheduleDocumentProps> = ({
  clientName,
  contractNumber,
  contractDate,
  loanAmount,
  interestRate,
  term,
  startDate,
  endDate,
  payments
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white p-8 text-gray-900 max-w-4xl mx-auto shadow-lg rounded-lg">
      {/* Шапка документа */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">ГРАФИК ПЛАТЕЖЕЙ</h1>
        <p className="text-xl mb-4">к договору займа № {contractNumber} от {formatDate(contractDate)}</p>
      </div>

      {/* Информация о клиенте */}
      <div className="mb-6">
        <p><strong>Клиент:</strong> {clientName}</p>
        <p><strong>Сумма займа:</strong> {formatCurrency(loanAmount)}</p>
        <p><strong>Процентная ставка:</strong> {interestRate}% годовых</p>
        <p><strong>Срок займа:</strong> {term} месяцев</p>
        <p><strong>Дата выдачи:</strong> {formatDate(startDate)}</p>
        <p><strong>Дата окончания:</strong> {formatDate(endDate)}</p>
      </div>

      {/* Таблица платежей */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">№</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Дата платежа</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Платеж всего</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Погашение основного долга</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Погашение процентов</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Остаток задолженности</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.paymentNumber} className={payment.paymentNumber % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-300 px-4 py-2">{payment.paymentNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{formatDate(payment.paymentDate)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(payment.totalPayment)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(payment.principalPayment)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(payment.interestPayment)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(payment.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Итоговая сумма */}
      <div className="flex justify-between mb-10">
        <div></div>
        <div>
          <p className="font-bold">
            Общая сумма выплат: {formatCurrency(payments.reduce((sum, payment) => sum + payment.totalPayment, 0))}
          </p>
          <p className="font-bold">
            В том числе проценты: {formatCurrency(payments.reduce((sum, payment) => sum + payment.interestPayment, 0))}
          </p>
        </div>
      </div>

      {/* Подписи */}
      <div className="flex justify-between mt-10 pt-8 border-t border-gray-300">
        <div>
          <p className="font-bold mb-10">Кредитор: ТОО "МедиатеПлюс"</p>
          <p>___________________ / В.В. Петров /</p>
          <p className="text-sm mt-1">Подпись, М.П.</p>
        </div>
        <div>
          <p className="font-bold mb-10">Заемщик: {clientName}</p>
          <p>___________________ / _____________ /</p>
          <p className="text-sm mt-1">Подпись</p>
        </div>
      </div>

      {/* Дата и номер документа */}
      <div className="mt-10 text-sm text-gray-500">
        <p>Документ сформирован: {new Date().toLocaleDateString('ru-RU')}</p>
        <p>Исходящий номер: {contractNumber}/Г-{new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
