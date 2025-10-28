import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

interface LoadingContextType {
  loadingState: LoadingState;
  setLoading: (isLoading: boolean, loadingText?: string) => void;
  showLoading: (loadingText?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
  });

  const setLoading = useCallback((isLoading: boolean, loadingText?: string) => {
    setLoadingState({ isLoading, loadingText });
  }, []);

  const showLoading = useCallback((loadingText?: string) => {
    setLoadingState({ isLoading: true, loadingText });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({ isLoading: false });
  }, []);

  const value: LoadingContextType = {
    loadingState,
    setLoading,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      {text && <span className="text-gray-700">{text}</span>}
    </div>
  </div>
);

// Global Loading Component
export const GlobalLoading: React.FC = () => {
  const { loadingState } = useLoading();
  
  if (!loadingState.isLoading) return null;
  
  return <LoadingSpinner text={loadingState.loadingText} />;
};
