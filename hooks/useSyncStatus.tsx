import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SyncStatusContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  startSync: () => void;
  endSync: () => void;
}

const SyncStatusContext = createContext<SyncStatusContextType | undefined>(undefined);

export const SyncStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncTimeoutId, setSyncTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const startSync = useCallback(() => {
    if (syncTimeoutId) {
      clearTimeout(syncTimeoutId);
    }
    setIsSyncing(true);
  }, [syncTimeoutId]);

  const endSync = useCallback(() => {
    const newTimeoutId = setTimeout(() => {
        setIsSyncing(false);
        setLastSyncTime(new Date());
    }, 500); // Small delay to avoid flickering
    setSyncTimeoutId(newTimeoutId);
  }, []);

  return (
    <SyncStatusContext.Provider value={{ isSyncing, lastSyncTime, startSync, endSync }}>
      {children}
    </SyncStatusContext.Provider>
  );
};

export const useSyncStatus = (): SyncStatusContextType => {
  const context = useContext(SyncStatusContext);
  if (context === undefined) {
    throw new Error('useSyncStatus must be used within a SyncStatusProvider');
  }
  return context;
};
