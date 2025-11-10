
import React, { useEffect, useState } from 'react';
// Fix: Add file extensions to local imports.
import { useStudents } from '../hooks/useStudents.tsx';
import { getJiuJitsuTip } from '../services/geminiService.ts';
import { Users, UserX, DollarSign, BrainCircuit } from 'lucide-react';
import { PaymentStatus } from '../types.ts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { students } = useStudents();
  const [tip, setTip] = useState<string>('Carregando dica do dia...');
  const [isLoadingTip, setIsLoadingTip] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      setIsLoadingTip(true);
      const newTip = await getJiuJitsuTip();
      setTip(newTip);
      setIsLoadingTip(false);
    };
    fetchTip();
  }, []);

  const totalStudents = students.length;
  
  const overdueStudents = students.filter(s => 
    s.payments.some(p => p.status === PaymentStatus.Overdue || p.status === PaymentStatus.Pending)
  ).length;

  const monthlyRevenue = students.reduce((acc, student) => {
    const lastPayment = student.payments.find(p => p.status === PaymentStatus.Paid);
    if(lastPayment) {
        // Simple logic: assumes last paid payment is for the current month
        return acc + lastPayment.amount;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total de Alunos" value={totalStudents} icon={<Users size={24} className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Pagamentos Pendentes" value={overdueStudents} icon={<UserX size={24} className="text-white"/>} color="bg-red-500" />
        <StatCard title="Receita Mensal (Estimada)" value={`R$ ${monthlyRevenue.toFixed(2)}`} icon={<DollarSign size={24} className="text-white"/>} color="bg-green-500" />
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <BrainCircuit size={24} className="text-brand-accent mr-3" />
          <h2 className="text-xl font-semibold text-white">Dica de Jiu-Jitsu do Dia</h2>
        </div>
        {isLoadingTip ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-3 py-1">
              <div className="h-2 bg-slate-700 rounded"></div>
              <div className="h-2 bg-slate-700 rounded"></div>
            </div>
          </div>
        ) : (
          <p className="text-slate-300 italic">"{tip}"</p>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
