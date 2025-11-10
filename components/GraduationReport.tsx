import React from 'react';
import { useStudents } from '../hooks/useStudents.tsx';
import { Student, BeltType } from '../types.ts';
import { Award } from 'lucide-react';
import BeltIndicator from './BeltIndicator.tsx';

const GraduationReport: React.FC = () => {
    const { students } = useStudents();

    const blackBelts = students.filter(student => 
        student.belt.name === 'Preta' && student.belt.type === BeltType.Adult
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Award size={32} className="text-gold" />
                <h1 className="text-3xl font-bold text-white">Hall da Fama - Faixas Pretas</h1>
            </div>
            
            <p className="text-slate-400">
                Uma homenagem aos alunos que alcançaram o prestigioso nível de faixa preta.
            </p>

            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    {blackBelts.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Nome do Aluno</th>
                                    <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider hidden md:table-cell">Data de Início</th>
                                    <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Faixa Atual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {blackBelts.map((student: Student) => (
                                    <tr key={student.id}>
                                        <td className="p-4 text-white font-medium">{student.name}</td>
                                        <td className="p-4 text-slate-300 hidden md:table-cell">
                                            {new Date(student.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <BeltIndicator belt={student.belt} stripes={student.stripes} size="sm" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <p>Nenhum aluno atingiu a faixa preta ainda.</p>
                            <p className="mt-2 text-sm">A jornada continua!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GraduationReport;
