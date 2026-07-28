import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.setItem('spendwise_theme', 'light');
  }, []);

  const toggleTheme = () => {
    // Light mode only - toggle disabled
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'light', isDark: false, toggleTheme: () => {} };
  }
  return context;
};

export default ThemeContext;
