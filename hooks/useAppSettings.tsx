import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppSettings, Plan } from '../types.ts';
import { loadAppSettings, saveAppSettings as saveAppSettingsToService } from '../services/dataService.ts';
import { useSyncStatus } from './useSyncStatus.tsx';
import { DEFAULT_PLANS } from '../constants.ts';

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<Omit<AppSettings, 'plans'>>) => void;
  setPlans: (plans: Plan[]) => void;
  loadSettings: (settings: AppSettings) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const initialSettings: AppSettings = {
  theme: 'dark',
  plans: DEFAULT_PLANS,
  pixKey: '',
};

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const { startSync, endSync } = useSyncStatus();
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchSettings = async () => {
        const data = await loadAppSettings();
        setSettings(data);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    // Evita salvar o estado inicial vazio antes do carregamento
    if (settings.plans.length === 0) return;

    const saveData = async () => {
        startSync();
        await saveAppSettingsToService(settings);
        endSync();
    };
    
    const handler = setTimeout(() => {
        saveData();
    }, 1000);

    return () => {
        clearTimeout(handler);
    };
  }, [settings, startSync, endSync]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setPlans = (plans: Plan[]) => {
    setSettings(prev => ({ ...prev, plans }));
  }

  const loadSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, setPlans, loadSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsContextType => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};