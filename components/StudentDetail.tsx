import React, { useState } from 'react';
import { Student, Belt } from '../types.ts';
import BeltIndicator from './BeltIndicator.tsx';
import { useStudents } from '../hooks/useStudents.tsx';
import { useGraduationSettings } from '../hooks/useGraduationSettings.tsx';
import { BookOpen, ChevronsUp, DollarSign, Edit } from 'lucide-react';
import Modal from './Modal.tsx';
import PaymentForm from './PaymentForm.tsx';

interface StudentDetailProps {
    student: Student;
    onClose: () => void;
    onEdit: () => void;
}

const getBeltKey = (belt: Belt): string => `${belt.name}-${belt.type}`;

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onClose, onEdit }) => {
    const { logClassForStudent, promoteStudent } = useStudents();
    const { settings } = useGraduationSettings();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const graduationConfig = settings[getBeltKey(student.belt)] || { classesForStripe: 30, classesForBelt: 150 };

    // This calculation now uses the belt-specific setting for total classes to promotion
    const classesForCurrentBelt = student.classesAttended % graduationConfig.classesForBelt;
    
    const progressToNextStripe = (classesForCurrentBelt % graduationConfig.classesForStripe) / graduationConfig.classesForStripe * 100;


    const handleLogClass = () => {
        logClassForStudent(student.id);
    };

    const handlePromote = () => {
        promoteStudent(student.id);
    };

    return (
        <div className="p-2 space-y-6 text-slate-300">
            {/* Header with Edit button */}
            <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                    <p className="text-sm">{student.age} anos</p>
                </div>
                <button onClick={onEdit} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <Edit size={16} />
                    Editar
                </button>
            </div>

            {/* Student Info & Belt */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <div>
                    <p>{student.phone}</p>
                    <p>{student.address}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <BeltIndicator belt={student.belt} stripes={student.stripes} size="lg" />
                </div>
            </div>
            
            {/* Graduation Progress */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Progresso de Graduação</h3>
                <div className="bg-slate-700 p-4 rounded-lg">
                    <p>Total de aulas: <span className="font-bold text-white">{student.classesAttended}</span></p>
                    <div className="mt-2">
                        <p className="text-sm">Progresso para o próximo grau:</p>
                        <div className="w-full bg-slate-600 rounded-full h-2.5 mt-1">
                            <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${progressToNextStripe}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1">{classesForCurrentBelt % graduationConfig.classesForStripe} / {graduationConfig.classesForStripe} aulas</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={handleLogClass} className="action-button bg-slate-600 hover:bg-slate-500">
                    <BookOpen size={20} className="mr-2"/> Registrar Aula
                </button>
                <button onClick={handlePromote} className="action-button bg-blue-600 hover:bg-blue-500">
                    <ChevronsUp size={20} className="mr-2"/> Promover Aluno
                </button>
                <button onClick={() => setIsPaymentModalOpen(true)} className="action-button bg-green-600 hover:bg-green-500">
                    <DollarSign size={20} className="mr-2"/> Realizar Pagamento
                </button>
            </div>
            <style>{`.action-button { display: flex; align-items: center; justify-content: center; padding: 0.75rem; border-radius: 0.5rem; transition: background-color 0.2s; font-weight: 500; }`}</style>

            {/* Payment History */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Histórico de Pagamentos</h3>
                <div className="bg-slate-700 p-4 rounded-lg max-h-48 overflow-y-auto">
                    {student.payments.length > 0 ? (
                        <ul className="space-y-2">
                            {student.payments.map(p => (
                                <li key={p.id} className="flex justify-between items-center text-sm">
                                    <span>{new Date(p.date).toLocaleDateString()} - {p.plan}</span>
                                    <span className="font-semibold">R$ {p.amount.toFixed(2)} - {p.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400">Nenhum pagamento registrado.</p>
                    )}
                </div>
            </div>

            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Pagamento para ${student.name}`}>
                <PaymentForm studentId={student.id} onClose={() => setIsPaymentModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default StudentDetail;
