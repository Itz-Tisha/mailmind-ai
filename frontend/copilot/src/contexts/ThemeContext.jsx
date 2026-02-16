import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const themeStyles = {
    dark: {
      background: 'linear-gradient(135deg, #0f172a, #020617)',
      cardBg: 'rgba(15,23,42,0.98)',
      cardBgSecondary: 'rgba(15,23,42,0.95)',
      cardBgTertiary: 'rgba(15,23,42,0.85)',
      textPrimary: '#f9fafb',
      textSecondary: '#e5e7eb',
      textTertiary: '#9ca3af',
      textMuted: '#6b7280',
      border: 'rgba(148,163,184,0.3)',
      borderSecondary: 'rgba(55,65,81,0.9)',
      borderTertiary: 'rgba(75,85,99,0.9)',
      inputBg: '#020617',
      inputBorder: 'rgba(75,85,99,0.9)',
      buttonPrimary: 'linear-gradient(135deg, #22c55e, #16a34a)',
      buttonSecondary: 'rgba(15,23,42,0.8)',
      buttonText: '#0b1120',
      buttonTextSecondary: '#e5e7eb',
      errorBg: 'rgba(127,29,29,0.18)',
      errorBorder: 'rgba(248,113,113,0.6)',
      errorText: '#fecaca',
      accent: '#38bdf8',
      accentSecondary: '#6366f1',
      shadow: '0 24px 80px rgba(0,0,0,0.65)',
      shadowCard: '0 10px 25px rgba(0,0,0,0.48)',
    },
    light: {
      background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
      cardBg: 'rgba(255,255,255,0.98)',
      cardBgSecondary: 'rgba(255,255,255,0.95)',
      cardBgTertiary: 'rgba(255,255,255,0.85)',
      textPrimary: '#0f172a',
      textSecondary: '#1e293b',
      textTertiary: '#475569',
      textMuted: '#64748b',
      border: 'rgba(148,163,184,0.2)',
      borderSecondary: 'rgba(203,213,225,0.8)',
      borderTertiary: 'rgba(226,232,240,0.9)',
      inputBg: '#ffffff',
      inputBorder: 'rgba(203,213,225,0.8)',
      buttonPrimary: 'linear-gradient(135deg, #22c55e, #16a34a)',
      buttonSecondary: 'rgba(255,255,255,0.9)',
      buttonText: '#ffffff',
      buttonTextSecondary: '#0f172a',
      errorBg: 'rgba(254,226,226,0.8)',
      errorBorder: 'rgba(239,68,68,0.6)',
      errorText: '#991b1b',
      accent: '#0ea5e9',
      accentSecondary: '#6366f1',
      shadow: '0 24px 80px rgba(0,0,0,0.15)',
      shadowCard: '0 10px 25px rgba(0,0,0,0.1)',
    },
  };

  const colors = themeStyles[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
