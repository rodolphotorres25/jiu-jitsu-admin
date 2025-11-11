import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppSettings, Plan } from '../types.ts';
import { loadAppSettings, saveAppSettings as saveAppSettingsToService } from '../services/dataService.ts';
import { useSyncStatus } from './useSyncStatus.tsx';

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<Omit<AppSettings, 'plans'>>) => void;
  setPlans: (plans: Plan[]) => void;
  loadSettings: (settings: AppSettings) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings);
  const { startSync, endSync } = useSyncStatus();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }

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