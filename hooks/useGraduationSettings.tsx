import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Fix: Add file extensions to local imports.
import { GraduationSettings, Belt } from '../types.ts';
import { IBJJF_BELTS } from '../constants.ts';
import { loadGraduationSettings, saveGraduationSettings } from '../services/dataService.ts';

interface GraduationSettingsContextType {
  settings: GraduationSettings;
  updateSettings: (newSettings: GraduationSettings) => void;
}

const GraduationSettingsContext = createContext<GraduationSettingsContextType | undefined>(undefined);

export const GraduationSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GraduationSettings>(loadGraduationSettings);

  useEffect(() => {
    saveGraduationSettings(settings);
  }, [settings]);

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
