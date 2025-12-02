import { useState, useEffect, useRef } from 'react';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
}

export const useOnlineStatus = (): UseOnlineStatusReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  
  const wasOfflineRef = useRef<boolean>(false);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      const wasOfflineBefore = !isOnline;
      setIsOnline(true);
      if (wasOfflineBefore) {
        wasOfflineRef.current = true;
        setWasOffline(true);
        setTimeout(() => {
          wasOfflineRef.current = false;
          setWasOffline(false);
        }, 100);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isOnline]);

  return { isOnline, wasOffline };
};

