import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';

interface SoundToggleProps {
  className?: string;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ className = '' }) => {
  const { toggleSound, isSoundEnabled } = useSound();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Butonun durumunu ve aktifliğini izlemek için state ekleyelim
  const [isActive, setIsActive] = useState(true);
  const [currentState, setCurrentState] = useState(isSoundEnabled);
  
  // Prop değişimini takip ederek state'i güncelleyelim
  useEffect(() => {
    setCurrentState(isSoundEnabled);
  }, [isSoundEnabled]);
  
  const handleToggle = () => {
    // Eğer buton devre dışıysa (hala animasyon çalışıyorsa), tıklamayı işleme
    if (!isActive) return;
    
    // Butonun durumunu değiştir ve geçici olarak devre dışı bırak
    setIsActive(false);
    toggleSound();
    
    // Animasyon tamamlanma süresi kadar bekledikten sonra butonu tekrar aktif et
    // 600ms: animasyon süresi + biraz fazla tolerans
    setTimeout(() => {
      setIsActive(true);
      setCurrentState(!currentState);
    }, 600);
  };
  
  return (
    <motion.button
      onClick={handleToggle}
      disabled={!isActive}
      className={`relative overflow-hidden rounded-full transition-all duration-300 ${
        isDark 
          ? currentState 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : currentState 
            ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30' 
            : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
      } ${className} w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg
      ${!isActive ? 'opacity-70 cursor-wait' : 'opacity-100 cursor-pointer'}`}
      aria-label={currentState ? 'Sesi kapat' : 'Sesi aç'}
      title={currentState ? 'Sesi kapat' : 'Sesi aç'}
      whileHover={isActive ? { scale: 1.05 } : { scale: 1 }}
      whileTap={isActive ? { scale: 0.95 } : { scale: 1 }}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.2, 1],
          rotateY: currentState ? 0 : 180
        }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 200
        }}
      >
        {currentState ? (
          <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </motion.div>
      <span className="sr-only">{currentState ? 'Sesi kapat' : 'Sesi aç'}</span>
    </motion.button>
  );
};

export default SoundToggle; 