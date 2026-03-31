import React, { createContext, useContext, useState, ReactNode } from 'react';

type HeaderTheme = 'transparent' | 'light' | 'blue' | 'blue-to-white';

interface HeaderThemeContextType {
  theme: HeaderTheme;
  setTheme: (theme: HeaderTheme) => void;
  scrollThreshold: number;
  setScrollThreshold: (threshold: number) => void;
}

const HeaderThemeContext = createContext<HeaderThemeContextType | undefined>(undefined);

export const HeaderThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<HeaderTheme>('transparent');
  const [scrollThreshold, setScrollThreshold] = useState<number>(50);

  return (
    <HeaderThemeContext.Provider value={{ theme, setTheme, scrollThreshold, setScrollThreshold }}>
      {children}
    </HeaderThemeContext.Provider>
  );
};

export const useHeaderTheme = () => {
  const context = useContext(HeaderThemeContext);
  if (!context) {
    throw new Error('useHeaderTheme must be used within a HeaderThemeProvider');
  }
  return context;
};