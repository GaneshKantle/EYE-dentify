import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { useAuthStore } from '../../store/authStore';

export const BreadcrumbNav = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs();

  // Hide breadcrumbs on auth pages
  const authPages = ['/login', '/register', '/register/verify-otp'];
  if (!isAuthenticated || authPages.includes(location.pathname)) {
    return null;
  }

  // Don't show breadcrumbs if only on dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm border-b border-slate-200/50 sticky top-16 z-40">
      <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-9xl 3xl:max-w-[140rem] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-2 xs:py-2.5 sm:py-3">
        <Breadcrumb>
          <BreadcrumbList className="text-xs xs:text-sm text-slate-600 gap-1 xs:gap-1.5">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.path}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage className="text-xs xs:text-sm font-medium text-slate-900 truncate max-w-[120px] xs:max-w-[200px] sm:max-w-none">
                      {index === 0 ? (
                        <Home className="w-3 h-3 xs:w-3.5 xs:h-3.5 inline-block" />
                      ) : (
                        item.label
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.path}
                        className="text-xs xs:text-sm hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 truncate max-w-[120px] xs:max-w-[200px] sm:max-w-none"
                      >
                        {index === 0 ? (
                          <>
                            <Home className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" />
                            <span className="hidden xs:inline">Dashboard</span>
                          </>
                        ) : (
                          item.label
                        )}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

