import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Fix: Import PaymentStatus enum to use for payment status values.
import { Student, Payment, Belt, BeltType, Stripe, PaymentStatus, Promotion } from '../types.ts';
import { IBJJF_BELTS, findBelt, getBeltKey } from '../constants.ts';
import { useGraduationSettings } from './useGraduationSettings.tsx';

// Helper to generate a unique ID
const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock data for initial state
const createMockStudents = (): Student[] => {
    const whiteBeltAdult = findBelt('Branca', BeltType.Adult);
    const blueBeltAdult = findBelt('Azul', BeltType.Adult);
    const purpleBeltAdult = findBelt('Roxa', BeltType.Adult);
    const brownBeltAdult = findBelt('Marrom', BeltType.Adult);
    const blackBeltAdult = findBelt('Preta', BeltType.Adult);
    
    // If the most basic belt is missing, we cannot safely create mock data.
    if (!whiteBeltAdult) {
        console.error("FATAL: Could not find the adult 'Branca' belt in constants.ts. Cannot create mock students.");
        return [];
    }

    return [
        {
            id: generateId(),
            name: 'Carlos Gracie',
            age: 28,
            belt: blueBeltAdult || whiteBeltAdult,
            stripes: 2,
            classesAttended: 180,
            startDate: new Date('2022-01-15').toISOString(),
            phone: '21 99999-0001',
            address: 'Rua do Tatame, 100, Rio de Janeiro',
            payments: [{ id: generateId(), date: new Date().toISOString(), amount: 150, status: PaymentStatus.Paid, plan: 'Mensal' }],
            isActive: true,
            promotionHistory: [
                { date: new Date('2022-01-15').toISOString(), belt: whiteBeltAdult, stripes: 0 },
                { date: new Date('2023-08-01').toISOString(), belt: blueBeltAdult || whiteBeltAdult, stripes: 2 },
            ],
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
            payments: [{ id: generateId(), date: new Date('2024-05-18').toISOString(), amount: 150, status: PaymentStatus.Overdue, plan: 'Mensal' }],
            isActive: true,
            promotionHistory: [
                { date: new Date('2023-05-20').toISOString(), belt: whiteBeltAdult, stripes: 4 },
            ],
        },
        {
            id: generateId(),
            name: 'Rickson Gracie',
            age: 58,
            belt: blackBeltAdult || whiteBeltAdult,
            stripes: 6,
            classesAttended: 2500,
            startDate: new Date('1990-01-15').toISOString(),
            phone: '21 99999-0003',
            address: 'Rua da Lenda, 1, Rio de Janeiro',
            payments: [{ id: generateId(), date: new Date().toISOString(), amount: 150, status: PaymentStatus.Paid, plan: 'Mensal' }],
            isActive: true,
            promotionHistory: [
                 { date: new Date('1990-01-15').toISOString(), belt: whiteBeltAdult, stripes: 0 },
                 { date: new Date('1992-06-10').toISOString(), belt: blueBeltAdult || whiteBeltAdult, stripes: 0 },
                 { date: new Date('1994-11-20').toISOString(), belt: purpleBeltAdult || whiteBeltAdult, stripes: 0 },
                 { date: new Date('1996-12-01').toISOString(), belt: brownBeltAdult || whiteBeltAdult, stripes: 0 },
                 { date: new Date('1998-05-30').toISOString(), belt: blackBeltAdult || whiteBeltAdult, stripes: 6 },
            ],
        },
    ];
};

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
    
    const [students, setStudents] = useState<Student[]>(() => {
        try {
            const localData = localStorage.getItem('students');
            if (localData) {
                const parsedData = JSON.parse(localData);
                if (Array.isArray(parsedData)) {
                    const whiteBeltAdult = findBelt('Branca', BeltType.Adult);
                    if (!whiteBeltAdult) throw new Error("Default white belt not found for data migration.");
                    
                    const migratedData = parsedData.map((s: any) => {
                        if (typeof s !== 'object' || s === null) return null;

                        const student = { ...s };

                        const hasValidBelt = student.belt && typeof student.belt.name === 'string' && typeof student.belt.type === 'string';
                        if (!hasValidBelt) {
                            student.belt = whiteBeltAdult;
                        }

                        student.stripes = typeof student.stripes === 'number' ? student.stripes : 0;
                        student.classesAttended = typeof student.classesAttended === 'number' ? student.classesAttended : 0;
                        student.isActive = typeof student.isActive === 'boolean' ? student.isActive : true;
                        if (!student.startDate) student.startDate = new Date().toISOString();
                        if (!Array.isArray(student.payments)) student.payments = [];

                        // Deep validation and repair of promotionHistory
                        if (Array.isArray(student.promotionHistory) && student.promotionHistory.length > 0) {
                            student.promotionHistory = student.promotionHistory.map((promo: any) => {
                                if (!promo || typeof promo !== 'object') return null; // Remove invalid entries

                                const hasValidPromoBelt = promo.belt && typeof promo.belt.name === 'string' && typeof promo.belt.type === 'string';
                                
                                let finalBelt = student.belt; // Default to the student's validated current belt
                                if (hasValidPromoBelt) {
                                    const foundBelt = findBelt(promo.belt.name, promo.belt.type as BeltType);
                                    if(foundBelt) finalBelt = foundBelt;
                                }
                                
                                return {
                                    date: promo.date || student.startDate,
                                    belt: finalBelt,
                                    stripes: typeof promo.stripes === 'number' ? promo.stripes as Stripe : 0,
                                };
                            }).filter(Boolean); // Filter out any null entries
                        }
                        
                        // If, after validation, history is empty, create a default one.
                        if (!Array.isArray(student.promotionHistory) || student.promotionHistory.length === 0) {
                            student.promotionHistory = [{
                                date: student.startDate,
                                belt: student.belt,
                                stripes: student.stripes,
                            }];
                        }

                        return student;
                    }).filter(Boolean);

                    return migratedData as Student[];
                }
            }
            return createMockStudents();
        } catch (error) {
            console.error("Could not initialize students state, resetting data.", error);
            localStorage.removeItem('students');
            // If the first createMockStudents fails, this second call would also fail, causing a loop.
            // The fix inside createMockStudents prevents this.
            return createMockStudents();
        }
    });

    useEffect(() => {
        localStorage.setItem('students', JSON.stringify(students));
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
