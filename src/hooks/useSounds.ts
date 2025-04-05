import { useState, useCallback, useEffect, useRef } from 'react';

type SoundType = 'click' | 'success' | 'error' | 'taskAdd' | 'taskDelete' | 'complete' | 'switchMode' | 'pomodoroAlarm' | 'pomodoroFocusEnd' | 'pomodoroShortBreakEnd' | 'pomodoroLongBreakEnd';

// Ses kaynakları için public/sounds klasöründeki dosyaları kullanacağız
const SOUND_URLS = {
  click: '/sounds/click.mp3',
  success: '/sounds/complete.mp3',
  error: '/sounds/notification.mp3',
  taskAdd: '/sounds/task-add.mp3',
  taskDelete: '/sounds/task-delete.mp3',
  complete: '/sounds/task-complete.mp3', 
  switchMode: '/sounds/switch.mp3',
  pomodoroAlarm: '/sounds/task-complete.mp3',
  pomodoroFocusEnd: '/sounds/task-complete.mp3', // Tüm pomodoro bitimlerinde complete sesi
  pomodoroShortBreakEnd: '/sounds/task-complete.mp3', 
  pomodoroLongBreakEnd: '/sounds/task-complete.mp3'
};

// Ses önbelleği
const audioCache: Record<string, HTMLAudioElement> = {};

// Ses dosyasını oluştur veya önbellekten getir
const getAudio = (type: SoundType): HTMLAudioElement => {
  if (audioCache[type]) {
    return audioCache[type];
  }

  const audio = new Audio(SOUND_URLS[type]);
  
  // Ses düzeylerini ayarla
  switch (type) {
    case 'switchMode':
      audio.volume = 0.2;
      break;
    case 'success':
      audio.volume = 0.4;
      break;
    case 'error':
      audio.volume = 0.25;
      break;
    case 'taskAdd':
      audio.volume = 0.3;
      break;
    case 'taskDelete':
      audio.volume = 0.25;
      break;
    case 'complete':
      audio.volume = 0.5;
      break;
    case 'pomodoroAlarm':
    case 'pomodoroFocusEnd': 
    case 'pomodoroShortBreakEnd':
    case 'pomodoroLongBreakEnd':
      audio.volume = 0.7; // Tüm pomodoro bitimlerinde aynı ses seviyesi
      break;
    default:
      audio.volume = 0.3;
  }

  // Önbelleğe ekle
  audioCache[type] = audio;
  
  return audio;
};

export const useSounds = () => {
  // localStorage'dan ses durumunu al, varsayılan olarak açık
  const [enabled, setEnabled] = useState<boolean>(() => {
    const savedState = localStorage.getItem('soundEnabled');
    return savedState ? savedState === 'true' : true; // Varsayılan olarak açık
  });

  // Son çalan pomodoro alarm sesini tutmak için referans
  const lastAlarmRef = useRef<HTMLAudioElement | null>(null);
  
  // Ses durumu değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('soundEnabled', String(enabled));
  }, [enabled]);

  // Sesleri ön yükleme
  useEffect(() => {
    if (enabled) {
      // Sesleri önbelleğe al
      Object.keys(SOUND_URLS).forEach((type) => {
        getAudio(type as SoundType);
      });
    }
  }, [enabled]);
  
  const play = useCallback((type: SoundType) => {
    if (!enabled) return;
    
    try {
      // Ses türüne göre farklı davranışlar
      const isPomodoroAlarm = ['pomodoroFocusEnd', 'pomodoroShortBreakEnd', 'pomodoroLongBreakEnd'].includes(type);
      
      // Eğer pomodoro alarmı değilse, diğer tüm sesleri durdur
      if (!isPomodoroAlarm) {
        Object.values(audioCache).forEach(audio => {
          if (!audio.paused && audio !== lastAlarmRef.current) {
            try {
              audio.pause();
            } catch (e) {
              // Pause hatasını yok say
            }
          }
        });
      }
      
      // Sonra yeni sesi çal
      const audio = getAudio(type);
      
      // Sesi baştan başlat
      audio.currentTime = 0;
      
      // Pomodoro alarmları için özel davranış
      if (isPomodoroAlarm) {
        // Önceki pomodoro alarmını durdur
        if (lastAlarmRef.current && lastAlarmRef.current !== audio) {
          try {
            lastAlarmRef.current.pause();
          } catch (e) {
            // Hata yok say
          }
        }
        
        // Yeni alarmı referansa kaydet
        lastAlarmRef.current = audio;
        
        // 2 kez çal - sadece 2 kez tekrarla
        let counter = 0;
        const maxPlays = 2;
        
        const endHandler = function(this: HTMLAudioElement) {
          counter++;
          if (counter < maxPlays) {
            this.currentTime = 0;
            this.play().catch(() => {});
          } else {
            // Sadece bir kere daha çal, başka bir event listener yok
            this.removeEventListener('ended', endHandler);
          }
        };
        
        // Önce eski event listener'ları temizle
        audio.removeEventListener('ended', endHandler);
        
        // Yeni event listener ekle
        audio.addEventListener('ended', endHandler);
      }
      
      // Sesi çal
      const playPromise = audio.play();
      
      // Eğer promise dönerse, hata yönetimiyle ilgilen
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Ses çalma hatası:', err);
          }
        });
      }
      
      return audio; // Ses objesini döndür
    } catch (error) {
      console.error('Ses oluşturma hatası:', error);
      return null;
    }
  }, [enabled]);
  
  const stopAlarm = useCallback(() => {
    if (lastAlarmRef.current) {
      try {
        lastAlarmRef.current.pause();
        lastAlarmRef.current = null;
      } catch (e) {
        console.error('Alarm durdurma hatası:', e);
      }
    }
  }, []);
  
  const toggleSound = useCallback(() => {
    let newState = false;
    
    // Önce lokalde durumu değiştir, sonra localStorage'a kaydet
    setEnabled(prev => {
      newState = !prev;
      // LocalStorage'ı hemen güncelle (useEffect'i beklemeden)
      try {
        localStorage.setItem('soundEnabled', String(newState));
      } catch (e) {
        console.error('localStorage hatası:', e);
      }
      return newState;
    });
    
    // Kullanıcıya görsel geri bildirim sağlamak için ses çal
    if (newState) {
      // Ses açıldığında hafif bir tık sesi çal
      try {
        // click ses dosyası değil, switchMode ses dosyasını kullan (daha hafif)
        const audio = getAudio('switchMode');
        audio.volume = 0.1; // Çok düşük ses seviyesi
        audio.play().catch(err => {
          console.error('Ses çalma hatası:', err);
        });
      } catch (error) {
        console.error('Ses oluşturma hatası:', error);
      }
    }
    
    return newState;
  }, []);
  
  const isSoundEnabled = useCallback(() => enabled, [enabled]);
  
  return { play, toggleSound, isSoundEnabled, stopAlarm };
};

export default useSounds; 