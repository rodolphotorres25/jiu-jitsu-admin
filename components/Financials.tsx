
import React, { useMemo } from 'react';
// Fix: Add file extensions to local imports.
import { useStudents } from '../hooks/useStudents.tsx';
import { PaymentStatus, Student } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Financials: React.FC = () => {
  const { students } = useStudents();

  const monthlyRevenueData = useMemo(() => {
    const revenueByMonth: { [key: string]: number } = {};

    students.forEach(student => {
      student.payments.forEach(payment => {
        if (payment.status === PaymentStatus.Paid) {
          const date = new Date(payment.date);
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-11
          const key = `${year}-${String(month).padStart(2, '0')}`; // YYYY-MM format

          if (!revenueByMonth[key]) {
            revenueByMonth[key] = 0;
          }
          revenueByMonth[key] += payment.amount;
        }
      });
    });

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return Object.keys(revenueByMonth)
      .sort()
      .map(key => {
        const [year, month] = key.split('-').map(Number);
        const shortYear = new Date(year, month).getFullYear().toString().slice(-2);
        return {
          name: `${monthNames[month]}/${shortYear}`,
          Receita: revenueByMonth[key],
        };
      });
  }, [students]);

  const studentsWithPendingPayments = students.filter(student => {
    const lastPayment = student.payments[0];
    return !lastPayment || 
           lastPayment.status === PaymentStatus.Pending || 
           lastPayment.status === PaymentStatus.Overdue ||
           lastPayment.status === PaymentStatus.BoletoGerado;
  });
  
  const totalRevenue = students.flatMap(s => s.payments)
                               .filter(p => p.status === PaymentStatus.Paid)
                               .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Financeiro</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Receita Mensal (Pagamentos Confirmados)</h2>
           <ResponsiveContainer width="100%" height={300}>
            {monthlyRevenueData.length > 0 ? (
                <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
                    cursor={{ fill: 'rgba(21, 101, 192, 0.2)' }}
                  />
                  <Legend wrapperStyle={{ color: '#f1f5f9' }} />
                  <Bar dataKey="Receita" fill="#1565C0" name="Receita" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Nenhum dado de receita para exibir.</p>
                </div>
              )}
          </ResponsiveContainer>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col">
           <h2 className="text-xl font-semibold text-white mb-4">Sumário</h2>
           <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                 <p className="text-sm text-slate-400">Receita Total (Paga)</p>
                 <p className="text-2xl font-bold text-green-400">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                 <p className="text-sm text-slate-400">Alunos Pendentes</p>
                 <p className="text-2xl font-bold text-yellow-400">{studentsWithPendingPayments.length}</p>
              </div>
           </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Alunos com Pendências</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-900/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Nome</th>
                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Telefone</th>
                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Último Status</th>
              </tr>
            </thead>
            <tbody>
              {studentsWithPendingPayments.map((student: Student) => {
                const lastPayment = student.payments[0];
                let statusText = lastPayment?.status || 'Nenhum Pagamento';
                if (lastPayment?.status === PaymentStatus.BoletoGerado && lastPayment.dueDate) {
                    statusText = `Boleto (Vence: ${new Date(lastPayment.dueDate).toLocaleDateString()})`;
                }
                return (
                  <tr key={student.id} className="border-b border-slate-700">
                    <td className="p-4 text-white">{student.name}</td>
                    <td className="p-4 text-slate-300">{student.phone}</td>
                    <td className="p-4 text-yellow-400">{statusText}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financials;