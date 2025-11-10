import { Student, AppSettings, GraduationSettings, BeltType, PaymentStatus, Stripe, Promotion, Plan } from '../types.ts';
import { findBelt, IBJJF_BELTS, DEFAULT_PLANS, getBeltKey } from '../constants.ts';

const STUDENTS_KEY = 'students';
const GRADUATION_SETTINGS_KEY = 'graduationSettings';
const APP_SETTINGS_KEY = 'appSettings';

export const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

const createMockStudents = (): Student[] => {
    const whiteBeltAdult = findBelt('Branca', BeltType.Adult);
    const blueBeltAdult = findBelt('Azul', BeltType.Adult);
    const purpleBeltAdult = findBelt('Roxa', BeltType.Adult);
    const brownBeltAdult = findBelt('Marrom', BeltType.Adult);
    const blackBeltAdult = findBelt('Preta', BeltType.Adult);
    
    if (!whiteBeltAdult) {
        console.error("FATAL: Could not find the adult 'Branca' belt. Cannot create mock students.");
        return [];
    }

    return [
        { id: generateId(), name: 'Carlos Gracie', age: 28, belt: blueBeltAdult || whiteBeltAdult, stripes: 2, classesAttended: 180, startDate: new Date('2022-01-15').toISOString(), phone: '21 99999-0001', address: 'Rua do Tatame, 100, Rio de Janeiro', payments: [{ id: generateId(), date: new Date().toISOString(), amount: 150, status: PaymentStatus.Paid, plan: 'Mensal' }], isActive: true, promotionHistory: [{ date: new Date('2022-01-15').toISOString(), belt: whiteBeltAdult, stripes: 0 }, { date: new Date('2023-08-01').toISOString(), belt: blueBeltAdult || whiteBeltAdult, stripes: 2 }] },
        { id: generateId(), name: 'Helio Gracie', age: 22, belt: whiteBeltAdult, stripes: 4, classesAttended: 110, startDate: new Date('2023-05-20').toISOString(), phone: '21 99999-0002', address: 'Avenida da Guarda, 200, Rio de Janeiro', payments: [{ id: generateId(), date: new Date('2024-05-18').toISOString(), amount: 150, status: PaymentStatus.Overdue, plan: 'Mensal' }], isActive: true, promotionHistory: [{ date: new Date('2023-05-20').toISOString(), belt: whiteBeltAdult, stripes: 4 }] },
        { id: generateId(), name: 'Rickson Gracie', age: 58, belt: blackBeltAdult || whiteBeltAdult, stripes: 6, classesAttended: 2500, startDate: new Date('1990-01-15').toISOString(), phone: '21 99999-0003', address: 'Rua da Lenda, 1, Rio de Janeiro', payments: [{ id: generateId(), date: new Date().toISOString(), amount: 150, status: PaymentStatus.Paid, plan: 'Mensal' }], isActive: true, promotionHistory: [{ date: new Date('1990-01-15').toISOString(), belt: whiteBeltAdult, stripes: 0 }, { date: new Date('1992-06-10').toISOString(), belt: blueBeltAdult || whiteBeltAdult, stripes: 0 }, { date: new Date('1994-11-20').toISOString(), belt: purpleBeltAdult || whiteBeltAdult, stripes: 0 }, { date: new Date('1996-12-01').toISOString(), belt: brownBeltAdult || whiteBeltAdult, stripes: 0 }, { date: new Date('1998-05-30').toISOString(), belt: blackBeltAdult || whiteBeltAdult, stripes: 6 }] },
    ];
};

const generateDefaultGraduationSettings = (): GraduationSettings => {
  const defaultSettings: GraduationSettings = {};
  IBJJF_BELTS.forEach(belt => {
    defaultSettings[getBeltKey(belt)] = { classesForStripe: 30, classesForBelt: 150 };
  });
  return defaultSettings;
};

const defaultAppSettings: AppSettings = {
  theme: 'dark',
  plans: DEFAULT_PLANS.map(p => ({ ...p, id: p.id || generateId() })),
  pixKey: '',
};

// --- Data Service ---

export const loadStudents = (): Student[] => {
    // TODO: Replace localStorage.getItem with an API call to a database.
    try {
        const localData = localStorage.getItem(STUDENTS_KEY);
        if (localData) {
            const parsedData = JSON.parse(localData);
            if (Array.isArray(parsedData)) {
                const whiteBeltAdult = findBelt('Branca', BeltType.Adult);
                if (!whiteBeltAdult) throw new Error("Default white belt not found for data migration.");
                const migratedData = parsedData.map((s: any) => {
                    if (typeof s !== 'object' || s === null) return null;
                    const student = { ...s };
                    const hasValidBelt = student.belt && typeof student.belt.name === 'string' && typeof student.belt.type === 'string';
                    if (!hasValidBelt) { student.belt = whiteBeltAdult; }
                    student.stripes = typeof student.stripes === 'number' ? student.stripes : 0;
                    student.classesAttended = typeof student.classesAttended === 'number' ? student.classesAttended : 0;
                    student.isActive = typeof student.isActive === 'boolean' ? student.isActive : true;
                    if (!student.startDate) student.startDate = new Date().toISOString();
                    if (!Array.isArray(student.payments)) student.payments = [];
                    if (Array.isArray(student.promotionHistory) && student.promotionHistory.length > 0) {
                        student.promotionHistory = student.promotionHistory.map((promo: any) => {
                            if (!promo || typeof promo !== 'object') return null;
                            const hasValidPromoBelt = promo.belt && typeof promo.belt.name === 'string' && typeof promo.belt.type === 'string';
                            let finalBelt = student.belt;
                            if (hasValidPromoBelt) {
                                const foundBelt = findBelt(promo.belt.name, promo.belt.type as BeltType);
                                if(foundBelt) finalBelt = foundBelt;
                            }
                            return { date: promo.date || student.startDate, belt: finalBelt, stripes: typeof promo.stripes === 'number' ? promo.stripes as Stripe : 0 };
                        }).filter(Boolean);
                    }
                    if (!Array.isArray(student.promotionHistory) || student.promotionHistory.length === 0) {
                        student.promotionHistory = [{ date: student.startDate, belt: student.belt, stripes: student.stripes }];
                    }
                    return student;
                }).filter(Boolean);
                return migratedData as Student[];
            }
        }
        return createMockStudents();
    } catch (error) {
        console.error("Could not load students, resetting data.", error);
        localStorage.removeItem(STUDENTS_KEY);
        return createMockStudents();
    }
};

export const saveStudents = (students: Student[]): void => {
    // TODO: Replace with an API call to save students to a database.
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const loadGraduationSettings = (): GraduationSettings => {
    // TODO: Replace localStorage.getItem with an API call.
    try {
        const localData = localStorage.getItem(GRADUATION_SETTINGS_KEY);
        if (localData) {
            const parsedData = JSON.parse(localData);
            if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                if (Object.keys(parsedData).some(key => !key.includes('-'))) {
                    return generateDefaultGraduationSettings();
                }
                return parsedData;
            }
        }
        return generateDefaultGraduationSettings();
    } catch (error) {
        console.error("Could not load graduation settings, falling back to default.", error);
        return generateDefaultGraduationSettings();
    }
};

export const saveGraduationSettings = (settings: GraduationSettings): void => {
    // TODO: Replace with an API call to save graduation settings.
    localStorage.setItem(GRADUATION_SETTINGS_KEY, JSON.stringify(settings));
};

export const loadAppSettings = (): AppSettings => {
    // TODO: Replace localStorage.getItem with an API call.
    try {
        const localData = localStorage.getItem(APP_SETTINGS_KEY);
        if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                if (!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.some((p: Plan) => !p.id)) {
                    parsed.plans = DEFAULT_PLANS.map(p => ({ ...p, id: p.id || generateId() }));
                }
                return { ...defaultAppSettings, ...parsed };
            }
        }
        return defaultAppSettings;
    } catch (error) {
        console.error("Could not load app settings, falling back to default.", error);
        return defaultAppSettings;
    }
};

export const saveAppSettings = (settings: AppSettings): void => {
    // TODO: Replace with an API call to save app settings.
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
};
