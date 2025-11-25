import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    // Also scroll main content area if it exists
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
  }, [pathname]);

  return null;
};

