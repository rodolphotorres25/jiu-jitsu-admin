import React, { useState, useEffect } from 'react';
import { useStudents } from '../hooks/useStudents.tsx';
import { useGraduationSettings } from '../hooks/useGraduationSettings.tsx';
import { Student, PaymentStatus } from '../types.ts';
import { getBeltKey } from '../constants.ts';
import BeltIndicator from './BeltIndicator.tsx';
import Modal from './Modal.tsx';
import StudentDetail from './StudentDetail.tsx';
import StudentForm from './StudentForm.tsx';
import { UserPlus, Search } from 'lucide-react';

const StudentList: React.FC = () => {
    const { students } = useStudents();
    const { settings: graduationSettings } = useGraduationSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // This effect ensures that the data in the modal is always fresh.
    useEffect(() => {
        if (selectedStudent) {
            const updatedStudent = students.find(s => s.id === selectedStudent.id);
            if (updatedStudent) {
                setSelectedStudent(updatedStudent);
            } else {
                // The student might have been deleted, so close the modal.
                setIsDetailModalOpen(false);
                setSelectedStudent(null);
            }
        }
    }, [students, selectedStudent]);

    const handleRowClick = (student: Student) => {
        setSelectedStudent(student);
        setIsDetailModalOpen(true);
    };

    const handleOpenAddForm = () => {
        setSelectedStudent(null);
        setIsFormModalOpen(true);
    }
    
    const handleOpenEditForm = (student: Student) => {
        setIsDetailModalOpen(false); // Close detail modal first
        setSelectedStudent(student);
        setIsFormModalOpen(true);
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: PaymentStatus | undefined | null) => {
        if (!status) return 'bg-gray-500 text-white';
        switch (status) {
            case PaymentStatus.Paid: return 'bg-green-500 text-green-900';
            case PaymentStatus.Pending: return 'bg-yellow-500 text-yellow-900';
            case PaymentStatus.Overdue: return 'bg-red-600 text-red-100';
            case PaymentStatus.BoletoGerado: return 'bg-cyan-500 text-cyan-900';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Alunos</h1>
                <div className="w-full md:w-auto flex gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar aluno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                    </div>
                    <button onClick={handleOpenAddForm} className="flex items-center justify-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shrink-0">
                        <UserPlus size={20} />
                        <span>Adicionar</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Nome</th>
                                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider hidden md:table-cell">Faixa</th>
                                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider hidden lg:table-cell">Aulas</th>
                                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider hidden lg:table-cell">Progresso</th>
                                <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Status Pag.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredStudents.map(student => {
                                const lastPayment = student.payments[0];
                                const beltKey = getBeltKey(student.belt);
                                const graduationConfig = graduationSettings[beltKey] || { classesForStripe: 30, classesForBelt: 150 };
                                const classesForCurrentBelt = student.classesAttended % graduationConfig.classesForBelt;
                                const classesForNextStripe = classesForCurrentBelt % graduationConfig.classesForStripe;
                                const progressToNextStripe = (classesForNextStripe / graduationConfig.classesForStripe) * 100;

                                return (
                                    <tr key={student.id} onClick={() => handleRowClick(student)} className="hover:bg-slate-700/50 cursor-pointer transition-colors">
                                        <td className="p-4 text-white font-medium">{student.name}</td>
                                        <td className="p-4 hidden md:table-cell">
                                            <BeltIndicator belt={student.belt} stripes={student.stripes} size="sm" hideStripes />
                                        </td>
                                        <td className="p-4 text-slate-300 hidden lg:table-cell">{student.classesAttended}</td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-2" title={`${classesForNextStripe} de ${graduationConfig.classesForStripe} aulas para o próximo grau`}>
                                                <div className="w-full max-w-[80px] bg-slate-600 rounded-full h-2">
                                                    <div className="bg-brand-accent h-2 rounded-full" style={{ width: `${progressToNextStripe}%` }}></div>
                                                </div>
                                                <span className="text-xs text-slate-400 tabular-nums">{`${classesForNextStripe}/${graduationConfig.classesForStripe}`}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(lastPayment?.status)}`}>
                                                {lastPayment?.status || 'Nenhum'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedStudent && isDetailModalOpen && (
                 <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detalhes do Aluno">
                    <StudentDetail 
                        student={selectedStudent} 
                        onClose={() => setIsDetailModalOpen(false)}
                        onEdit={() => handleOpenEditForm(selectedStudent)}
                    />
                </Modal>
            )}

            {isFormModalOpen && (
                <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedStudent ? "Editar Aluno" : "Adicionar Aluno"}>
                    <StudentForm student={selectedStudent} onClose={() => setIsFormModalOpen(false)} />
                </Modal>
            )}

        </div>
    );
};

export default StudentList;