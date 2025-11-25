import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

// Valid routes that exist in the application
const validRoutes = new Set([
  '/',
  '/add',
  '/recognize',
  '/gallery',
  '/sketch',
  '/sketches/recent',
  '/about',
  '/login',
  '/register',
  '/register/verify-otp',
]);

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/add': 'Add Face',
  '/recognize': 'Face Recognition',
  '/gallery': 'Gallery',
  '/sketch': 'Create Sketch',
  '/sketches/recent': 'Recent Sketches',
  '/about': 'About',
};

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();

  return useMemo(() => {
    const pathname = location.pathname;
    const items: BreadcrumbItem[] = [];

    // Always start with Dashboard
    items.push({
      label: 'Dashboard',
      path: '/',
      isLast: pathname === '/',
    });

    // If not on dashboard, add current route
    if (pathname !== '/') {
      const pathSegments = pathname.split('/').filter(Boolean);
      let currentPath = '';

      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        
        // Only include breadcrumb items for valid routes
        // Skip intermediate paths that don't exist as routes
        if (validRoutes.has(currentPath) || isLast) {
          // Get label from routeLabels or capitalize segment
          const label = routeLabels[currentPath] || 
            segment.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

          items.push({
            label,
            path: currentPath,
            isLast,
          });
        }
      });
    }

    return items;
  }, [location.pathname]);
};

