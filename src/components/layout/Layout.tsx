import { useState, createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useNotifications } from '../../contexts/NotificationContext';

interface LayoutContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isOnline, wasOffline } = useOnlineStatus();
  const { info, warning } = useNotifications();
  const previousOnlineStatusRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (previousOnlineStatusRef.current === null) {
      previousOnlineStatusRef.current = isOnline;
      return;
    }

    if (previousOnlineStatusRef.current !== isOnline) {
      if (isOnline && wasOffline) {
        info('Back Online', 'Your connection has been restored.');
      } else if (!isOnline) {
        warning('You\'re Offline', 'Some features may be limited. Your work is being saved locally.');
      }
      previousOnlineStatusRef.current = isOnline;
    }
  }, [isOnline, wasOffline, info, warning]);

  return (
    <LayoutContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {children}
      </div>
    </LayoutContext.Provider>
  );
};
