import React, { useState } from 'react';
import { useGraduationSettings } from '../hooks/useGraduationSettings.tsx';
import { useAppSettings } from '../hooks/useAppSettings.tsx';
import { IBJJF_BELTS, getBeltKey } from '../constants.ts';
import { Belt, Plan } from '../types.ts';
import { Trash2, PlusCircle } from 'lucide-react';

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

type SettingsTab = 'general' | 'graduation' | 'financial';

const Settings: React.FC = () => {
    const { settings: graduationSettings, updateSettings: updateGraduationSettings } = useGraduationSettings();
    const { settings: appSettings, updateSettings: updateAppSettings, setPlans } = useAppSettings();
    const [activeTab, setActiveTab] = useState<SettingsTab>('graduation');

    const handleGraduationChange = (belt: Belt, field: 'classesForStripe' | 'classesForBelt', value: string) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0) return;

        const beltKey = getBeltKey(belt);
        const newSettings = {
            ...graduationSettings,
            [beltKey]: {
                ...graduationSettings[beltKey],
                [field]: numericValue
            }
        };
        updateGraduationSettings(newSettings);
    };

    const handlePlanChange = (id: string, field: 'name' | 'price', value: string | number) => {
        const newPlans = appSettings.plans.map(p => {
            if (p.id === id) {
                return { ...p, [field]: field === 'price' ? parseFloat(value as string) || 0 : value };
            }
            return p;
        });
        setPlans(newPlans);
    };

    const handleAddPlan = () => {
        const newPlan: Plan = { id: generateId(), name: 'Novo Plano', price: 0 };
        setPlans([...appSettings.plans, newPlan]);
    };

    const handleRemovePlan = (id: string) => {
        setPlans(appSettings.plans.filter(p => p.id !== id));
    };

    const beltsForSettings = IBJJF_BELTS.filter(
        belt => !belt.name.includes('Coral') && !belt.name.includes('Vermelha')
    );
    
    const kidBelts = beltsForSettings.filter(b => b.type === 'Infantil');
    const adultBelts = beltsForSettings.filter(b => b.type === 'Adulto');

    const renderContent = () => {
        switch(activeTab) {
            case 'graduation':
                return (
                    <div>
                        <p className="text-slate-400 mb-6">Defina o número de aulas necessárias para receber um grau ou a próxima faixa.</p>
                        <h3 className="text-lg font-semibold text-white mb-3">Faixas Infantis</h3>
                        <div className="space-y-2 mb-6">
                            {kidBelts.map(belt => <GraduationRow key={getBeltKey(belt)} belt={belt} settings={graduationSettings[getBeltKey(belt)]} onChange={handleGraduationChange} />)}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">Faixas Adultas</h3>
                        <div className="space-y-2">
                            {adultBelts.map(belt => <GraduationRow key={getBeltKey(belt)} belt={belt} settings={graduationSettings[getBeltKey(belt)]} onChange={handleGraduationChange} />)}
                        </div>
                    </div>
                );
            case 'financial':
                return (
                     <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Planos e Mensalidades</h3>
                            <div className="space-y-3">
                                {appSettings.plans.map(plan => (
                                    <div key={plan.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 p-3 bg-slate-700/50 rounded-md">
                                        <input
                                            type="text"
                                            value={plan.name}
                                            onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                                            className="input-style"
                                            placeholder="Nome do Plano"
                                        />
                                        <input
                                            type="number"
                                            value={plan.price}
                                            onChange={(e) => handlePlanChange(plan.id, 'price', e.target.value)}
                                            className="input-style"
                                            placeholder="Preço"
                                        />
                                        <button onClick={() => handleRemovePlan(plan.id)} className="text-red-400 hover:text-red-300 justify-self-end">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddPlan} className="mt-4 flex items-center gap-2 text-sm text-brand-accent hover:text-blue-400">
                                <PlusCircle size={18} /> Adicionar Plano
                            </button>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Configuração de Pagamentos</h3>
                             <label htmlFor="pixKey" className="block text-sm font-medium text-slate-300">Chave PIX da Academia</label>
                             <input
                                id="pixKey"
                                type="text"
                                value={appSettings.pixKey}
                                onChange={e => updateAppSettings({ pixKey: e.target.value })}
                                className="input-style max-w-md"
                                placeholder="email@exemplo.com, CPF, etc."
                            />
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-white mb-3">Cartão de Crédito (Recorrente)</h3>
                             <p className="text-sm text-slate-400">Integração com gateway de pagamento em desenvolvimento.</p>
                        </div>
                     </div>
                );
            case 'general':
                 return (
                    <div className="max-w-xs">
                        <label htmlFor="theme" className="block text-sm font-medium text-slate-300">Tema</label>
                        <select
                            id="theme"
                            value={appSettings.theme}
                            onChange={(e) => updateAppSettings({ theme: e.target.value as 'dark' | 'light' })}
                            className="input-style"
                        >
                            <option value="dark">Escuro</option>
                            <option value="light" disabled>Claro (em breve)</option>
                        </select>
                    </div>
                );
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
            
            <div className="border-b border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    <TabButton label="Graduação" isActive={activeTab === 'graduation'} onClick={() => setActiveTab('graduation')} />
                    <TabButton label="Financeiro" isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
                    <TabButton label="Geral" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                </nav>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
            <style>{`.input-style { display: block; width: 100%; background-color: #334155; border: 1px solid #475569; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #FFFFFF; } .input-style:focus { outline: none; ring: 2px; ring-color: #1565C0; border-color: #1565C0; }`}</style>
        </div>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
     <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            ${isActive
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`
        }
    >
        {label}
    </button>
);

const GraduationRow: React.FC<{belt: Belt, settings: any, onChange: Function}> = ({ belt, settings, onChange }) => {
    const beltKey = getBeltKey(belt);
    const beltSetting = settings || { classesForStripe: 30, classesForBelt: 150 };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-3 bg-slate-700/50 rounded-md">
            <span className="font-medium text-white">{belt.name}</span>
            <div>
                <label htmlFor={`stripe-${beltKey}`} className="block text-xs text-slate-400">Aulas por Grau</label>
                <input
                    id={`stripe-${beltKey}`}
                    type="number"
                    value={beltSetting.classesForStripe}
                    onChange={(e) => onChange(belt, 'classesForStripe', e.target.value)}
                    className="mt-1 w-24 bg-slate-600 text-white p-1.5 rounded-md text-sm"
                />
            </div>
             <div>
                <label htmlFor={`belt-${beltKey}`} className="block text-xs text-slate-400">Aulas para Faixa</label>
                <input
                    id={`belt-${beltKey}`}
                    type="number"
                    value={beltSetting.classesForBelt}
                    onChange={(e) => onChange(belt, 'classesForBelt', e.target.value)}
                    className="mt-1 w-24 bg-slate-600 text-white p-1.5 rounded-md text-sm"
                />
            </div>
        </div>
    )
};

export default Settings;
