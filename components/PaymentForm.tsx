import React, { useState, useEffect } from 'react';
import { useStudents } from '../hooks/useStudents.tsx';
import { useAppSettings } from '../hooks/useAppSettings.tsx';
import { PaymentStatus } from '../types.ts';
import { CreditCard, Landmark } from 'lucide-react';

interface PaymentFormProps {
    studentId: string;
    onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ studentId, onClose }) => {
    const { addPaymentForStudent } = useStudents();
    const { settings } = useAppSettings();

    const [activeTab, setActiveTab] = useState<'plan' | 'creditCard'>('plan');

    // State for plan/boleto payment
    const [amount, setAmount] = useState('0.00');
    const [plan, setPlan] = useState('');
    const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.Paid);

    // State for credit card payment
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);


    useEffect(() => {
        if (settings.plans.length > 0) {
            const firstPlan = settings.plans[0];
            setPlan(firstPlan.name);
            setAmount(String(firstPlan.price));
        }
    }, [settings.plans]);

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPlanName = e.target.value;
        const selectedPlan = settings.plans.find(p => p.name === selectedPlanName);
        setPlan(selectedPlanName);
        if (selectedPlan) {
            setAmount(String(selectedPlan.price));
        }
    };

    const handlePlanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!studentId || isNaN(numericAmount) || numericAmount < 0) {
            alert('Por favor, preencha os dados corretamente.');
            return;
        }
        addPaymentForStudent(studentId, {
            amount: numericAmount,
            plan,
            status,
            date: new Date().toISOString(),
        });
        onClose();
    };

    const handleCreditCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardName || !cardNumber || !expiryDate || !cvv) {
            alert('Por favor, preencha todos os dados do cartão.');
            return;
        }

        setIsProcessing(true);

        // Simulate API call to payment gateway
        setTimeout(() => {
            const numericAmount = parseFloat(amount);
            addPaymentForStudent(studentId, {
                amount: numericAmount,
                plan,
                status: PaymentStatus.Paid, // Credit card payments are immediately 'Paid'
                date: new Date().toISOString(),
            });

            setIsProcessing(false);
            alert('Pagamento com cartão de crédito processado com sucesso!');
            onClose();
        }, 2000); // 2-second delay to simulate processing
    };

    const TabButton: React.FC<{label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void}> = ({ label, icon, isActive, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                ${isActive
                    ? 'border-b-2 border-brand-accent text-white'
                    : 'text-slate-400 hover:text-white'
                }`
            }
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex border-b border-slate-700 mb-6">
                <TabButton label="Plano / Boleto" icon={<Landmark size={18} />} isActive={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
                <TabButton label="Cartão de Crédito" icon={<CreditCard size={18} />} isActive={activeTab === 'creditCard'} onClick={() => setActiveTab('creditCard')} />
            </div>

            {activeTab === 'plan' && (
                <form onSubmit={handlePlanSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="plan" className="block text-sm font-medium text-slate-300">Plano</label>
                        <select id="plan" value={plan} onChange={handlePlanChange} className="input-style">
                            {settings.plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Valor (R$)</label>
                        <input type="number" id="amount" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-style" required/>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-300">Status</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)} className="input-style">
                            <option value={PaymentStatus.Paid}>Pago</option>
                            <option value={PaymentStatus.Pending}>Pendente</option>
                            <option value={PaymentStatus.Overdue}>Atrasado</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-brand-accent text-white rounded-md hover:bg-blue-600">
                            Salvar Pagamento
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'creditCard' && (
                 <form onSubmit={handleCreditCardSubmit} className="space-y-4">
                    <div className="bg-slate-700 p-3 rounded-md text-center">
                        <p className="text-sm">Plano Selecionado: <span className="font-bold">{plan}</span></p>
                        <p className="text-lg">Valor a Pagar: <span className="font-bold text-green-400">R$ {amount}</span></p>
                    </div>
                    <div>
                        <label htmlFor="cardName" className="block text-sm font-medium text-slate-300">Nome no Cartão</label>
                        <input type="text" id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} className="input-style" required placeholder="NOME COMPLETO"/>
                    </div>
                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-300">Número do Cartão</label>
                        <input type="text" id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="input-style" required placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-300">Validade</label>
                            <input type="text" id="expiryDate" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="input-style" required placeholder="MM/AA"/>
                        </div>
                        <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-slate-300">CVV</label>
                            <input type="text" id="cvv" value={cvv} onChange={(e) => setCvv(e.target.value)} className="input-style" required placeholder="123" />
                        </div>
                    </div>
                     <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed w-48">
                            {isProcessing ? 'Processando...' : `Pagar R$ ${amount}`}
                        </button>
                    </div>
                 </form>
            )}
             <style>{`.input-style { margin-top: 4px; display: block; width: 100%; background-color: #334155; border: 1px solid #475569; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.5rem 0.75rem; color: #FFFFFF; } .input-style:focus { outline: none; ring: 2px; ring-color: #1565C0; border-color: #1565C0; }`}</style>
        </div>
    );
};

export default PaymentForm;
