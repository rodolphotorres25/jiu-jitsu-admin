
import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents.tsx';
import { useGraduationSettings } from '../hooks/useGraduationSettings.tsx';
import { useAppSettings } from '../hooks/useAppSettings.tsx';
import { UploadCloud, DownloadCloud, Clipboard, Check, AlertTriangle, Cloud } from 'lucide-react';
import { BackupData, Student, GraduationSettings, AppSettings } from '../types.ts';

const SyncCenter: React.FC = () => {
    const { students, loadStudents } = useStudents();
    const { settings: graduationSettings, updateSettings: updateGraduationSettings } = useGraduationSettings();
    const { settings: appSettings, loadSettings } = useAppSettings();

    const [exportData, setExportData] = useState<string>('');
    const [importData, setImportData] = useState<string>('');
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerateExportCode = () => {
        try {
            const backupData: BackupData = {
                students,
                graduationSettings,
                appSettings,
            };
            const jsonString = JSON.stringify(backupData);
            setExportData(jsonString);
        } catch (error) {
            alert('Ocorreu um erro ao gerar o código de exportação.');
            console.error("Export error:", error);
        }
    };

    const handleCopyToClipboard = () => {
        if (!exportData) return;
        navigator.clipboard.writeText(exportData).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            alert('Falha ao copiar para a área de transferência.');
            console.error('Clipboard error:', err);
        });
    };

    const handleImport = () => {
        if (!importData.trim()) {
            alert('Por favor, cole o código de sincronização na área de texto.');
            return;
        }

        try {
            const data: BackupData = JSON.parse(importData);

            if (!data.students || !data.graduationSettings || !data.appSettings || !Array.isArray(data.students)) {
                throw new Error('O código fornecido parece ser inválido ou está corrompido.');
            }

            const confirmation = window.confirm(
                'ATENÇÃO: A importação substituirá TODOS os dados atuais neste dispositivo (alunos, finanças e configurações). Esta ação não pode ser desfeita. Deseja continuar?'
            );

            if (confirmation) {
                loadStudents(data.students as Student[]);
                updateGraduationSettings(data.graduationSettings as GraduationSettings);
                loadSettings(data.appSettings as AppSettings);
                alert('Dados importados com sucesso! A aplicação será recarregada para aplicar todas as mudanças.');
                window.location.reload();
            }
        } catch (error) {
            alert(`Erro ao importar dados: ${error instanceof Error ? error.message : 'Verifique se o código foi colado corretamente.'}`);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Centro de Sincronização</h1>
            
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg border-2 border-dashed border-brand-accent">
                <div className="flex items-center gap-3 mb-4">
                    <Cloud className="text-brand-accent" size={24}/>
                    <h2 className="text-xl font-semibold text-white">Sincronização Automática (Em Breve)</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                    Estamos trabalhando em uma solução de banco de dados online para sincronizar seus dados
                    automaticamente entre todos os seus dispositivos. Em breve, você não precisará mais
                    usar o método de transferência manual.
                </p>
                <button disabled className="w-full bg-slate-700 text-slate-500 px-4 py-2 rounded-lg cursor-not-allowed">
                    Ativar Sincronização na Nuvem
                </button>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white">Sincronização Manual</h2>
                <p className="text-slate-400 max-w-3xl mt-2">
                    Enquanto a sincronização automática não está disponível, você pode usar o método manual abaixo para transferir dados entre dispositivos.
                    Este processo <span className="font-semibold text-yellow-400">não é automático</span> e precisa ser repetido sempre que quiser sincronizar suas informações.
                </p>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Export Card */}
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <DownloadCloud className="text-brand-accent" size={24}/>
                        <h2 className="text-xl font-semibold text-white">1. Exportar Dados</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">Gere um código contendo todos os dados do seu aplicativo. Copie este código e envie-o para seu outro dispositivo (via e-mail, WhatsApp, etc).</p>
                    
                    {!exportData ? (
                        <button onClick={handleGenerateExportCode} className="w-full bg-brand-accent text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            Gerar Código para Transferência
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                readOnly
                                value={exportData}
                                className="w-full h-40 bg-slate-900 text-slate-300 text-xs p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                aria-label="Código de exportação"
                            />
                            <button onClick={handleCopyToClipboard} className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500 transition-colors">
                                {isCopied ? <><Check size={20} className="text-green-400"/> Copiado!</> : <><Clipboard size={20}/> Copiar Código</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* Import Card */}
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <UploadCloud className="text-green-500" size={24}/>
                        <h2 className="text-xl font-semibold text-white">2. Importar Dados</h2>
                    </div>
                     <p className="text-sm text-slate-400 mb-4">Cole o código que você copiou do outro dispositivo aqui para substituir os dados locais.</p>
                    
                     <div className="flex flex-col flex-grow space-y-4">
                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            placeholder="Cole o código de sincronização aqui..."
                            className="w-full flex-grow bg-slate-900 text-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            aria-label="Área para colar o código de importação"
                        />
                        <div className="flex items-start gap-2 bg-red-900/50 text-red-300 p-3 rounded-md text-xs">
                            <AlertTriangle size={28} className="shrink-0"/>
                            <span><strong>Atenção:</strong> A importação substituirá permanentemente todos os dados existentes neste dispositivo.</span>
                        </div>
                        <button onClick={handleImport} disabled={!importData.trim()} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500">
                            Importar e Substituir Dados
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SyncCenter;