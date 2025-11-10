export enum BeltType {
    Kid = 'Infantil',
    Adult = 'Adulto'
}

export enum PaymentStatus {
    Paid = 'Pago',
    Pending = 'Pendente',
    Overdue = 'Atrasado'
}

export type Stripe = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Belt {
    name: string;
    color: string;
    type: BeltType;
}

export interface Payment {
    id: string;
    date: string; // ISO string
    amount: number;
    status: PaymentStatus;
    plan: string; // e.g., 'Mensal', 'Trimestral'
}

export interface Student {
    id: string;
    name: string;
    age: number;
    belt: Belt;
    stripes: Stripe;
    classesAttended: number;
    startDate: string; // ISO string
    phone: string;
    address: string;
    payments: Payment[];
    isActive: boolean;
}

export interface GraduationSettings {
    [beltKey: string]: {
        classesForStripe: number;
        classesForBelt: number;
    };
}

export interface Plan {
    id: string;
    name: string;
    price: number;
}

export interface AppSettings {
    theme: 'dark' | 'light';
    plans: Plan[];
    pixKey: string;
}