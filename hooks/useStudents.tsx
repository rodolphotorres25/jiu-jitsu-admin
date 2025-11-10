import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Fix: Import PaymentStatus enum to use for payment status values.
import { Student, Payment, Belt, BeltType, Stripe, PaymentStatus } from '../types.ts';
import { IBJJF_BELTS, findBelt, getBeltKey } from '../constants.ts';
import { useGraduationSettings } from './useGraduationSettings.tsx';

// Helper to generate a unique ID
const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock data for initial state
const createMockStudents = (): Student[] => {
    const whiteBeltAdult = findBelt('Branca', BeltType.Adult)!;
    const blueBeltAdult = findBelt('Azul', BeltType.Adult)!;
    const blackBeltAdult = findBelt('Preta', BeltType.Adult)!;
    return [
        {
            id: generateId(),
            name: 'Carlos Gracie',
            age: 28,
            belt: blueBeltAdult,
            stripes: 2,
            classesAttended: 180,
            startDate: new Date('2022-01-15').toISOString(),
            phone: '21 99999-0001',
            address: 'Rua do Tatame, 100, Rio de Janeiro',
            // Fix: Use PaymentStatus.Paid enum member instead of string literal.
            payments: [{ id: generateId(), date: new Date().toISOString(), amount: 150, status: PaymentStatus.Paid, plan: 'Mensal' }],
            isActive: true,
        },
        {
            id: generateId(),
            name: 'Helio Gracie',
            age: 22,
            belt: whiteBeltAdult,
            stripes: 4,
            classesAttended: 110,
            startDate: new Date('2023-05-20').toISOString(),
            phone: '21 99999-0002',
            address: 'Avenida da Guarda, 200, Rio de Janeiro',
            // Fix: Use PaymentStatus.Overdue enum member instead of string literal.
            payments: [{ id: generateId(), date: new Date('2024-05-18').toISOString(), amount: 150, status: PaymentStatus.Overdue, plan: 'Mensal' }],
            isActive: true,
        },
        {
            id: generateId(),
            name: 'Rickson Gracie',
            age: 58,
            belt: blackBeltAdult,
            stripes: 6,
            classesAttended: 2500,
            startDate: new Date('1990-01-15').toISOString(),
            phone: '21 99999-0003',
            address: 'Rua da Lenda, 1, Rio de Janeiro',
            payments: [{ id: generateId(), date: new Date().toISOString(), amount: 150, status: PaymentStatus.Paid, plan: 'Mensal' }],
            isActive: true,
        },
    ];
};

interface StudentsContextType {
    students: Student[];
    addStudent: (studentData: Omit<Student, 'id' | 'payments' | 'classesAttended' | 'stripes'>) => void;
    updateStudent: (studentId: string, updatedData: Partial<Student>) => void;
    logClassForStudent: (studentId: string) => void;
    promoteStudent: (studentId: string) => void;
    addPaymentForStudent: (studentId: string, paymentData: Omit<Payment, 'id'>) => void;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useGraduationSettings();
    
    const [students, setStudents] = useState<Student[]>(() => {
        try {
            const localData = localStorage.getItem('students');
            if (localData) {
                const parsedData = JSON.parse(localData);
                // FINAL FIX: Ensure the parsed data is a valid array before using it.
                if (Array.isArray(parsedData)) {
                    return parsedData;
                }
            }
            return createMockStudents();
        } catch (error) {
            console.error("Could not parse students from localStorage, falling back to default.", error);
            return createMockStudents();
        }
    });

    useEffect(() => {
        localStorage.setItem('students', JSON.stringify(students));
    }, [students]);

    const addStudent = (studentData: Omit<Student, 'id' | 'payments' | 'classesAttended' | 'stripes'>) => {
        const newStudent: Student = {
            ...studentData,
            id: generateId(),
            payments: [],
            classesAttended: 0,
            stripes: 0,
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

        const beltKey = getBeltKey(student.belt);
        const graduationConfig = settings[beltKey] || { classesForStripe: 30, classesForBelt: 150 };

        const currentBeltIndex = IBJJF_BELTS.findIndex(b => b.name === student.belt.name && b.type === student.belt.type);

        let newStripes = student.stripes;
        let newBelt = student.belt;

        // Simple promotion logic: add a stripe. If stripes > 4, go to next belt.
        if (newStripes < 4) {
            newStripes = (newStripes + 1) as Stripe;
        } else {
            const nextBelt = IBJJF_BELTS[currentBeltIndex + 1];
            if (nextBelt && nextBelt.type === student.belt.type) { // Only promote within same type (kid/adult)
                newStripes = 0;
                newBelt = nextBelt;
            } else {
                // Can't promote further (e.g. at highest belt)
                alert("Este aluno já está na faixa mais alta!");
                return;
            }
        }
        
        updateStudent(studentId, { belt: newBelt, stripes: newStripes });
        alert(`${student.name} promovido!`);
    };

    const addPaymentForStudent = (studentId: string, paymentData: Omit<Payment, 'id'>) => {
        const newPayment: Payment = {
            ...paymentData,
            id: generateId(),
        };
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                // Prepend to have the latest payment first
                return { ...s, payments: [newPayment, ...s.payments] };
            }
            return s;
        }));
    };

    return (
        <StudentsContext.Provider value={{ students, addStudent, updateStudent, logClassForStudent, promoteStudent, addPaymentForStudent }}>
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