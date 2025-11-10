import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Fix: Import PaymentStatus enum to use for payment status values.
import { Student, Payment, Belt, BeltType, Stripe, PaymentStatus, Promotion } from '../types.ts';
import { IBJJF_BELTS, findBelt, getBeltKey } from '../constants.ts';
import { useGraduationSettings } from './useGraduationSettings.tsx';
import { loadStudents as loadStudentsFromService, saveStudents, generateId } from '../services/dataService.ts';

interface StudentsContextType {
    students: Student[];
    addStudent: (studentData: Omit<Student, 'id' | 'payments' | 'classesAttended' | 'stripes' | 'promotionHistory'>) => void;
    updateStudent: (studentId: string, updatedData: Partial<Student>) => void;
    logClassForStudent: (studentId: string) => void;
    promoteStudent: (studentId: string) => void;
    addPaymentForStudent: (studentId: string, paymentData: Omit<Payment, 'id'>) => void;
    loadStudents: (students: Student[]) => void;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useGraduationSettings();
    
    const [students, setStudents] = useState<Student[]>(loadStudentsFromService);

    useEffect(() => {
        saveStudents(students);
    }, [students]);

    const addStudent = (studentData: Omit<Student, 'id' | 'payments' | 'classesAttended' | 'stripes' | 'promotionHistory'>) => {
        const newStudent: Student = {
            ...studentData,
            id: generateId(),
            payments: [],
            classesAttended: 0,
            stripes: 0,
            promotionHistory: [{
                date: studentData.startDate,
                belt: studentData.belt,
                stripes: 0,
            }]
        };
        setStudents(prev => [...prev, newStudent]);
    };
    
    const updateStudent = (studentId: string, updatedData: Partial<Student>) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updatedData } : s));
    };

    const logClassForStudent = (studentId: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return { ...s, classesAttended: s.classesAttended + 1 };
            }
            return s;
        }));
    };
    
    const promoteStudent = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const isBlackBelt = student.belt.name === 'Preta';
        let newStripes = student.stripes;
        let newBelt = student.belt;

        // Black belts can get up to 6 degrees. Other belts get 4 stripes then promote.
        if (isBlackBelt) {
            if (newStripes < 6) {
                newStripes = (newStripes + 1) as Stripe;
            } else {
                alert("Este aluno já atingiu o número máximo de graus para a faixa preta.");
                return;
            }
        } else { // For all other belts
            if (newStripes < 4) {
                newStripes = (newStripes + 1) as Stripe;
            } else {
                const currentBeltIndex = IBJJF_BELTS.findIndex(b => b.name === student.belt.name && b.type === student.belt.type);
                const nextBelt = IBJJF_BELTS[currentBeltIndex + 1];

                // Don't promote to Coral/Red belts automatically
                if (nextBelt && nextBelt.type === student.belt.type && !nextBelt.name.includes('Coral') && !nextBelt.name.includes('Vermelha')) {
                    newStripes = 0;
                    newBelt = nextBelt;
                } else {
                    alert("Este aluno está no final de sua faixa ou na faixa mais alta antes das faixas de coral/vermelha, que requerem avaliação especial.");
                    return;
                }
            }
        }
        
        const newPromotion: Promotion = {
            date: new Date().toISOString(),
            belt: newBelt,
            stripes: newStripes
        };

        const updatedHistory = [...(student.promotionHistory || []), newPromotion];
        
        updateStudent(studentId, { belt: newBelt, stripes: newStripes, promotionHistory: updatedHistory });
        alert(`${student.name} promovido!`);
    };

    const addPaymentForStudent = (studentId: string, paymentData: Omit<Payment, 'id'>) => {
        const newPayment: Payment = {
            ...paymentData,
            id: generateId(),
        };
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return { ...s, payments: [newPayment, ...s.payments] };
            }
            return s;
        }));
    };

    const loadStudents = (newStudents: Student[]) => {
        setStudents(newStudents);
    };

    return (
        <StudentsContext.Provider value={{ students, addStudent, updateStudent, logClassForStudent, promoteStudent, addPaymentForStudent, loadStudents }}>
            {children}
        </StudentsContext.Provider>
    );
};

export const useStudents = (): StudentsContextType => {
    const context = useContext(StudentsContext);
    if (context === undefined) {
        throw new Error('useStudents must be used within a StudentsProvider');
    }
    return context;
};