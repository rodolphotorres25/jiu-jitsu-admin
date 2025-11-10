import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Fix: Add file extensions to local imports.
import { GraduationSettings, Belt } from '../types.ts';
import { IBJJF_BELTS } from '../constants.ts';

// Helper to create a unique key for each belt (e.g., "Branca-Adulto")
const getBeltKey = (belt: Belt): string => `${belt.name}-${belt.type}`;

interface GraduationSettingsContextType {
  settings: GraduationSettings;
  updateSettings: (newSettings: GraduationSettings) => void;
}

const GraduationSettingsContext = createContext<GraduationSettingsContextType | undefined>(undefined);

const generateDefaultSettings = (): GraduationSettings => {
  const defaultSettings: GraduationSettings = {};
  IBJJF_BELTS.forEach(belt => {
    // Use the unique key
    defaultSettings[getBeltKey(belt)] = {
      classesForStripe: 30,
      classesForBelt: 150,
    };
  });
  return defaultSettings;
};

export const GraduationSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GraduationSettings>(() => {
    try {
      const localData = localStorage.getItem('graduationSettings');
       if (localData) {
        const parsedData = JSON.parse(localData);
        // FINAL FIX: Ensure the parsed data is a valid object before using it.
        if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            // Simple check to see if the data is in the old format (keys don't contain '-')
            if (Object.keys(parsedData).some(key => !key.includes('-'))) {
                return generateDefaultSettings(); // If old format, regenerate to fix it
            }
            return parsedData;
        }
      }
      return generateDefaultSettings();
    } catch (error) {
      console.error("Could not parse graduation settings from localStorage, falling back to default.", error);
      return generateDefaultSettings();
    }
  });

  useEffect(() => {
    localStorage.setItem('graduationSettings', JSON.stringify(settings));
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