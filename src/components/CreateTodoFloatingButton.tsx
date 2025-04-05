import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { useSounds } from '../hooks/useSounds';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';
import TodoForm from './TodoForm';

const CreateTodoFloatingButton: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { play } = useSounds();
  const { isSoundEnabled } = useSound();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const openForm = () => {
    setIsFormOpen(true);
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  return (
    <>
      {/* Kayan buton */}
      <motion.button
        className={`fixed bottom-6 right-6 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl transition-all ${
          isFormOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={openForm}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Yeni görev ekle"
        aria-label="Yeni görev ekle"
      >
        <PlusCircle size={26} />
      </motion.button>
      
      {/* Modal arkaplanı */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            className={`fixed inset-0 z-50 ${isDark ? 'bg-black/50' : 'bg-slate-700/30'} backdrop-blur-sm flex items-center justify-center p-2 sm:p-4`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForm}
          >
            {/* Modal içeriği - tıklama olayını durdur */}
            <motion.div
              className="w-full max-w-lg"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Form bileşeni - önceki kapatma butonunu kaldırıp form kapanış işlevini aktarıyoruz */}
              <TodoForm onClose={closeForm} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateTodoFloatingButton; 