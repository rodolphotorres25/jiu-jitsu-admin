import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, Plan } from '../types.ts';
import { DEFAULT_PLANS } from '../constants.ts';

// Helper to generate a unique ID
const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<Omit<AppSettings, 'plans'>>) => void;
  setPlans: (plans: Plan[]) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  theme: 'dark',
  plans: DEFAULT_PLANS,
  pixKey: '',
};

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const localData = localStorage.getItem('appSettings');
      if (localData) {
        const parsed = JSON.parse(localData);
        // FINAL FIX: Ensure parsed data is a valid object.
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            // Ensure plans always exist and have IDs
            if (!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.some((p: Plan) => !p.id)) {
                parsed.plans = DEFAULT_PLANS.map(p => ({ ...p, id: p.id || generateId() }));
            }
            return { ...defaultSettings, ...parsed };
        }
      }
      return defaultSettings;
    } catch (error) {
      console.error("Could not parse app settings from localStorage, falling back to default.", error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setPlans = (plans: Plan[]) => {
    setSettings(prev => ({ ...prev, plans }));
  }

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, setPlans }}>
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