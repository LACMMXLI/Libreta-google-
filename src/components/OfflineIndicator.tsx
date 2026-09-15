import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-center gap-2 rounded-xl bg-[#2E2822] px-3.5 py-2 text-xs font-semibold text-[#FAF7F2] shadow-xl border border-[#D5CCBE]"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Modo sin conexión: la libreta sigue funcionando y guardando localmente.</span>
    </div>
  );
};
