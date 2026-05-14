import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useHeaderTheme } from '@/app/context/HeaderThemeContext';

// Re-export type for convenience
type HeaderTheme = 'transparent' | 'light' | 'blue' | 'blue-to-white' | 'dark';

interface SectionThemeProps {
  theme: HeaderTheme;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionTheme: React.FC<SectionThemeProps> = ({ theme, children, className, id }) => {
  const { ref, inView } = useInView({
    threshold: 0.3, // Trigger when 30% visible to catch it earlier
    rootMargin: '-10% 0px -60% 0px', // Active when near top
  });
  const { setTheme } = useHeaderTheme();

  useEffect(() => {
    if (inView) {
      setTheme(theme);
    }
  }, [inView, theme, setTheme]);

  return (
    <div ref={ref} className={className} id={id}>
      {children}
    </div>
  );
};