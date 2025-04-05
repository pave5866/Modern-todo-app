import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSounds } from '../hooks/useSounds';
import { useSound } from '../context/SoundContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { play } = useSounds();
  const { isSoundEnabled } = useSound();

  const handleToggle = () => {
    if (isSoundEnabled) {
      play('switchMode');
    }
    toggleTheme();
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`relative overflow-hidden rounded-full transition-all duration-300 ${
        isDark 
          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
          : 'bg-indigo-500/20 text-indigo-600 hover:bg-indigo-500/30'
      } ${className} w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg`}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ 
          rotate: isDark ? 180 : 0,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 200
        }}
      >
        {isDark ? (
          <Sun className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <Moon className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </motion.div>
      <span className="sr-only">{isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}</span>
    </motion.button>
  );
};

export default ThemeToggle; 