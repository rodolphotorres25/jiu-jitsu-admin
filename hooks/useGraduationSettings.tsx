import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
// Fix: Add file extensions to local imports.
import { GraduationSettings, Belt } from '../types.ts';
import { IBJJF_BELTS } from '../constants.ts';
import { loadGraduationSettings, saveGraduationSettings as saveGraduationSettingsToService } from '../services/dataService.ts';
import { useSyncStatus } from './useSyncStatus.tsx';


interface GraduationSettingsContextType {
  settings: GraduationSettings;
  updateSettings: (newSettings: GraduationSettings) => void;
}

const GraduationSettingsContext = createContext<GraduationSettingsContextType | undefined>(undefined);

export const GraduationSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GraduationSettings>({});
  const { startSync, endSync } = useSyncStatus();
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchSettings = async () => {
        const data = await loadGraduationSettings();
        setSettings(data);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    if (Object.keys(settings).length === 0) return;
    
    const saveData = async () => {
        startSync();
        await saveGraduationSettingsToService(settings);
        endSync();
    };

    const handler = setTimeout(() => {
        saveData();
    }, 1000);

    return () => {
        clearTimeout(handler);
    };
  }, [settings, startSync, endSync]);

  const updateSettings = (newSettings: GraduationSettings) => {
    setSettings(newSettings);
  };

  return (
    <GraduationSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </GraduationSettingsContext.Provider>
  );
};

export const useGraduationSettings = (): GraduationSettingsContextType => {
  const context = useContext(GraduationSettingsContext);
  if (context === undefined) {
    throw new Error('useGraduationSettings must be used within a GraduationSettingsProvider');
  }
  return context;
};