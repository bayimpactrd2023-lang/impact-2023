import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force immediate scroll to top on navigation
    window.scrollTo(0, 0);
    // Also ensure document element is scrolled to top
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};