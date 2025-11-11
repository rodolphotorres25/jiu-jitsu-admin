import { Student, AppSettings, GraduationSettings, BeltType, PaymentStatus } from '../types.ts';
import { findBelt, IBJJF_BELTS, DEFAULT_PLANS, getBeltKey } from '../constants.ts';
import { supabase } from './supabaseClient.ts';

export const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// --- Funções de Mock (Dados de Exemplo) ---
// Mantidas apenas como fallback em caso de falha total da API.
const createMockStudents = (): Student[] => {
    const whiteBeltAdult = findBelt('Branca', BeltType.Adult);
    if (!whiteBeltAdult) return [];
    return [
        { id: generateId(), name: 'Aluno de Exemplo', age: 25, belt: whiteBeltAdult, stripes: 1, classesAttended: 20, startDate: new Date().toISOString(), phone: '00 00000-0000', address: 'Carregue seus dados do Supabase', payments: [{ id: generateId(), date: new Date().toISOString(), amount: 150, status: PaymentStatus.Paid, plan: 'Mensal' }], isActive: true, promotionHistory: [{ date: new Date().toISOString(), belt: whiteBeltAdult, stripes: 0 }] },
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

// --- SERVIÇO DE DADOS COM SUPABASE ---

// --- ALUNOS ---
export const loadStudents = async (): Promise<Student[]> => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
        console.error('Erro ao carregar alunos do Supabase:', error);
        alert('Não foi possível carregar os dados dos alunos. Verifique sua conexão e as configurações do Supabase.');
        return createMockStudents(); // Retorna dados de exemplo em caso de erro
    }
    return data || [];
};

export const saveStudents = async (students: Student[]): Promise<void> => {
    // Upsert é uma operação inteligente: atualiza um aluno se o 'id' já existe, ou insere se for novo.
    const { error } = await supabase.from('students').upsert(students);
    if (error) {
        console.error('Erro ao salvar alunos no Supabase:', error);
        alert('Falha ao salvar os dados dos alunos.');
    }
};

// --- CONFIGURAÇÕES DE GRADUAÇÃO ---
export const loadGraduationSettings = async (): Promise<GraduationSettings> => {
    const { data, error } = await supabase
        .from('graduation_settings')
        .select('settings')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error('Erro ao carregar configurações de graduação:', error);
        return generateDefaultGraduationSettings();
    }
    return data.settings;
};

export const saveGraduationSettings = async (settings: GraduationSettings): Promise<void> => {
    const { error } = await supabase
        .from('graduation_settings')
        .upsert({ id: 1, settings: settings });

    if (error) {
        console.error('Erro ao salvar configurações de graduação:', error);
        alert('Falha ao salvar as configurações de graduação.');
    }
};

// --- CONFIGURAÇÕES GERAIS DO APP ---
export const loadAppSettings = async (): Promise<AppSettings> => {
    const { data, error } = await supabase
        .from('app_settings')
        .select('settings')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error('Erro ao carregar configurações do app:', error);
        return defaultAppSettings;
    }
    return data.settings;
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
    const { error } = await supabase
        .from('app_settings')
        .upsert({ id: 1, settings: settings });
        
    if (error) {
        console.error('Erro ao salvar configurações do app:', error);
        alert('Falha ao salvar as configurações do aplicativo.');
    }
};
