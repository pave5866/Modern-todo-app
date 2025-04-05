import React from 'react';
import { ListTodo, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import SoundToggle from './SoundToggle';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center gap-3 mb-8">
      <div className="flex items-center justify-between w-full px-4 mb-6">
        <div className="flex items-center gap-2">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2
            }}
            className="relative"
          >
            <ListTodo className="text-emerald-500" size={32} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="text-purple-500" size={16} />
            </motion.div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            TodoApp
          </motion.h2>
        </div>
        <div className="flex items-center gap-3">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </div>
      
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-purple-500"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          bounce: 0.5,
          delay: 0.4
        }}
      >
        Yapılacaklar
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`text-center text-sm md:text-base max-w-md ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
      >
        Görevlerinizi ekleyin, düzenleyin, tamamlayın ve daha üretken olun.
      </motion.p>
    </div>
  );
};

export default Header; 