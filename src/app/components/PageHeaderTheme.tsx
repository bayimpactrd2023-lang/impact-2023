import React, { useEffect } from 'react';
import { useHeaderTheme } from '@/app/context/HeaderThemeContext';

type HeaderTheme = 'transparent' | 'light' | 'blue' | 'blue-to-white';

export const PageHeaderTheme: React.FC<{ theme: HeaderTheme; scrollThreshold?: number }> = ({ theme, scrollThreshold = 50 }) => {
  const { setTheme, setScrollThreshold } = useHeaderTheme();
  useEffect(() => {
    setTheme(theme);
    setScrollThreshold(scrollThreshold);
    // On unmount, we might want to reset, but navigating to another page will set it again.
  }, [theme, scrollThreshold, setTheme, setScrollThreshold]);
  return null;
};