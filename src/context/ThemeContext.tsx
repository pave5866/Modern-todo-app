import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeType } from '../types';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // localStorage'dan tema tercihi yükle veya sistem tercihini kullan
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // Tarayıcının tema tercihini kontrol et
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'dark'; // Varsayılan olarak koyu tema
  });
  
  // Tema değiştiğinde document.documentElement'e tema class'ını ekle
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.backgroundColor = '#1e293b'; // slate-800
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    
    // localStorage'a kaydet
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Sistem tema değişikliğini dinle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
    };
    
    // Event listener ekle
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // @ts-ignore - Eski tarayıcılar için geri dönüş
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      // Event listener temizleme
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore - Eski tarayıcılar için geri dönüş
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      return newTheme;
    });
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 