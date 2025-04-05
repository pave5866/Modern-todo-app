import React, { createContext, useContext, ReactNode } from 'react';
import { useSounds as useRealSounds } from '../hooks/useSounds';

// SoundContext için tipler
interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => boolean;
}

// Context oluştur
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Provider bileşeni
export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // useSounds hook'undan gerçek durumu ve fonksiyonları alıyoruz
  const { toggleSound, isSoundEnabled } = useRealSounds();
  
  return (
    <SoundContext.Provider value={{ 
      isSoundEnabled: isSoundEnabled(),
      toggleSound
    }}>
      {children}
    </SoundContext.Provider>
  );
};

// Kullanım için hook
export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  
  return context;
}; 