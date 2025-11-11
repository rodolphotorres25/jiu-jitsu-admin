import React, { useState, useEffect } from 'react';
import { useSyncStatus } from '../hooks/useSyncStatus.tsx';
import { Cloud, RefreshCw, CheckCircle } from 'lucide-react';

const SyncIndicator: React.FC = () => {
  const { isSyncing, lastSyncTime } = useSyncStatus();
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    if (!isSyncing && lastSyncTime) {
      setShowSynced(true);
      const timer = setTimeout(() => {
        setShowSynced(false);
      }, 3000); // Show "Synced" message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSyncing, lastSyncTime]);

  const getStatus = () => {
    if (isSyncing) {
      return {
        icon: <RefreshCw size={16} className="animate-spin" />,
        text: 'Sincronizando...',
        color: 'text-yellow-400'
      };
    }
    if (showSynced) {
      return {
        icon: <CheckCircle size={16} />,
        text: 'Salvo na nuvem',
        color: 'text-green-400'
      };
    }
    return {
      icon: <Cloud size={16} />,
      text: 'Todos dados salvos',
      color: 'text-slate-400'
    };
  };

  const { icon, text, color } = getStatus();

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs transition-colors ${color}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

export default SyncIndicator;
