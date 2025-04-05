import { useMemo } from 'react';
import { PriorityLevel, PriorityConfig } from '../types';
import { useTheme } from '../context/ThemeContext';

const usePriorities = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const priorityConfig = useMemo(() => {
    return {
      low: {
        label: 'Düşük',
        color: isDark ? '#3b82f6' : '#2563eb', // blue-500 / blue-600
        bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)' // blue-500/15 / blue-600/10
      },
      medium: {
        label: 'Orta',
        color: isDark ? '#eab308' : '#ca8a04', // yellow-500 / yellow-600
        bgColor: isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(202, 138, 4, 0.1)' // yellow-500/15 / yellow-600/10
      },
      high: {
        label: 'Yüksek',
        color: isDark ? '#ef4444' : '#dc2626', // red-500 / red-600
        bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.1)' // red-500/15 / red-600/10
      }
    };
  }, [isDark]);

  const getPriorityConfig = (priority: PriorityLevel): PriorityConfig => {
    return priorityConfig[priority];
  };

  return { getPriorityConfig };
};

export default usePriorities; 