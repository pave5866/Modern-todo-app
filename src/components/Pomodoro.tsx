import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, CheckCircle, Coffee, Timer, Bell, Check, Trash2 } from 'lucide-react';
import { useSounds } from '../hooks/useSounds';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';

// Pomodoro modları
type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

// Her mod için süre (dakika cinsinden)
const DURATIONS = {
  focus: 25, // 25 dakika
  shortBreak: 5, // 5 dakika
  longBreak: 15 // 15 dakika
};

// Her mod için renkler
const COLORS = {
  focus: 'from-red-500 to-pink-500',
  shortBreak: 'from-green-500 to-emerald-500',
  longBreak: 'from-blue-500 to-indigo-500'
};

// Her mod için ikonlar
const ICONS = {
  focus: <Timer size={20} />,
  shortBreak: <Coffee size={20} />,
  longBreak: <Coffee size={20} />
};

// Her mod için etiketler
const LABELS = {
  focus: 'Çalışma',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola'
};

// Bir sonraki mod fonksiyonu
const getNextMode = (currentMode: PomodoroMode, focusCount: number): PomodoroMode => {
  if (currentMode === 'focus') {
    return (focusCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
  } else {
    return 'focus';
  }
};

const Pomodoro: React.FC = () => {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS[mode] * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusCount, setFocusCount] = useState<number>(() => {
    // localStorage'dan tamamlanan pomodoro sayısını al, yoksa 0
    const savedCount = localStorage.getItem('completedPomodoros');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [nextMode, setNextMode] = useState<PomodoroMode | null>(null);
  const alarmInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const { play, stopAlarm } = useSounds();
  const { isSoundEnabled } = useSound();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Ses çalma fonksiyonu
  const playAlarmSound = useCallback(() => {
    if (isSoundEnabled) {
      if (mode === 'focus') {
        play('pomodoroFocusEnd');
      } else if (mode === 'shortBreak') {
        play('pomodoroShortBreakEnd');
      } else {
        play('pomodoroLongBreakEnd');
      }
    }
  }, [isSoundEnabled, mode, play]);

  // Süreyi formatlama (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // İlerleme yüzdesi
  const progressPercentage = (timeLeft / (DURATIONS[mode] * 60)) * 100;

  // Kullanıcı onayıyla mod değiştirme
  const handleUserConfirmation = useCallback(() => {
    // Alarm sesini durdur
    stopAlarm();
    
    // Alarm tekrarlama interval'ını temizle
    if (alarmInterval.current) {
      clearInterval(alarmInterval.current);
      alarmInterval.current = null;
    }

    // Timer'ı sıfırla
    setTimerCompleted(false);
    
    // Fokus modundan çıkıyorsak sayacı artır
    if (mode === 'focus') {
      setFocusCount(prev => prev + 1);
    }
    
    // Bir sonraki moda geç
    if (nextMode) {
      setMode(nextMode);
      setTimeLeft(DURATIONS[nextMode] * 60);
      setNextMode(null);
    }
  }, [mode, nextMode, stopAlarm]);

  // Modu değiştirme (manuel değişim için)
  const changeMode = useCallback((newMode: PomodoroMode) => {
    // Alarm varsa temizle
    stopAlarm();
    
    if (alarmInterval.current) {
      clearInterval(alarmInterval.current);
      alarmInterval.current = null;
    }

    setMode(newMode);
    setTimeLeft(DURATIONS[newMode] * 60);
    setIsRunning(false);
    setTimerCompleted(false);
    setNextMode(null);
    
    if (isSoundEnabled) {
      // Mod değişimi için özel buton sesi
      play('switchMode');
    }
  }, [isSoundEnabled, play, stopAlarm]);

  // Sayacı başlat/durdur
  const toggleTimer = () => {
    // Timer tamamlandıysa, bu işlevi çalıştırma
    if (timerCompleted) return;
    
    setIsRunning(!isRunning);
    if (isSoundEnabled) {
      if (isRunning) {
        play('taskDelete'); // Durdurma için farklı ses
      } else {
        play('taskAdd'); // Başlatma için farklı ses
      }
    }
  };

  // Sayacı sıfırla
  const resetTimer = () => {
    // Alarm varsa temizle
    stopAlarm();
    
    if (alarmInterval.current) {
      clearInterval(alarmInterval.current);
      alarmInterval.current = null;
    }
    
    setTimeLeft(DURATIONS[mode] * 60);
    setIsRunning(false);
    setTimerCompleted(false);
    setNextMode(null);
    
    if (isSoundEnabled) {
      play('complete'); // Sıfırlama için farklı ses
    }
  };

  // Sayaç tamamlandığında
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    setTimerCompleted(true);
    
    // Bir sonraki modu belirle
    const next = getNextMode(mode, focusCount);
    setNextMode(next);
    
    // Ses çalmaya başla ve aralıklarla tekrar çal
    playAlarmSound();
    
    // Her 5 saniyede bir sesi tekrarla, kullanıcı tamam diyene kadar
    alarmInterval.current = setInterval(() => {
      playAlarmSound();
    }, 5000);
    
  }, [mode, focusCount, playAlarmSound]);

  // Sayaç efekti
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  // Component unmount olduğunda alarm intervalini temizle
  useEffect(() => {
    return () => {
      stopAlarm();
      if (alarmInterval.current) {
        clearInterval(alarmInterval.current);
      }
    };
  }, [stopAlarm]);

  // focusCount değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('completedPomodoros', focusCount.toString());
  }, [focusCount]);

  // Tamamlanan pomodoro sayısını sıfırla
  const resetCompletedPomodoros = () => {
    setFocusCount(0);
    localStorage.removeItem('completedPomodoros');
    if (isSoundEnabled) {
      play('switchMode'); // Temizleme için ses çal
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl shadow-lg p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} mb-8 max-w-md mx-auto`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Pomodoro Sayacı
        </h3>
        <div className="flex gap-1">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-opacity-20 flex items-center gap-1 ${
            mode === 'focus' 
              ? 'bg-red-500 text-red-500' 
              : mode === 'shortBreak'
                ? 'bg-green-500 text-green-500'
                : 'bg-blue-500 text-blue-500'
          }`}>
            {ICONS[mode]}
            {LABELS[mode]}
          </span>
        </div>
      </div>

      {/* Mod seçim butonları */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => changeMode('focus')}
          disabled={timerCompleted}
          className={`flex-1 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            mode === 'focus'
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
              : isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          } ${timerCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Timer size={14} />
          Çalışma
        </button>
        <button
          onClick={() => changeMode('shortBreak')}
          disabled={timerCompleted}
          className={`flex-1 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            mode === 'shortBreak'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
              : isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          } ${timerCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Coffee size={14} />
          Kısa Mola
        </button>
        <button
          onClick={() => changeMode('longBreak')}
          disabled={timerCompleted}
          className={`flex-1 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            mode === 'longBreak'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
              : isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          } ${timerCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Coffee size={14} />
          Uzun Mola
        </button>
      </div>

      {/* Süre göstergesi */}
      <div className="relative mb-4">
        <div 
          className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
        >
          <motion.div 
            className={`h-full rounded-full bg-gradient-to-r ${COLORS[mode]}`}
            initial={{ width: `${progressPercentage}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            0:00
          </span>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatTime(DURATIONS[mode] * 60)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <motion.div 
          className={`text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}
          key={timeLeft}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {formatTime(timeLeft)}
        </motion.div>

        <div className="flex gap-3">
          {!timerCompleted ? (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md ${
                  isDark 
                    ? isRunning ? 'bg-slate-700 text-slate-200' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : isRunning ? 'bg-slate-200 text-slate-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                }`}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md ${
                  isDark 
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <RefreshCw size={20} />
              </motion.button>
            </>
          ) : (
            <AnimatePresence>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUserConfirmation}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white`}
              >
                <Bell size={20} className="animate-pulse" /> 
                <span>Tamam</span>
                <Check size={20} />
              </motion.button>
            </AnimatePresence>
          )}
        </div>
      </div>

      {timerCompleted && nextMode && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
            {mode === 'focus' 
              ? 'Tebrikler! Çalışma periyodunu tamamladınız. Şimdi mola zamanı.' 
              : 'Mola süresi bitti. Çalışmaya devam etmeye hazır mısınız?'}
          </p>
        </motion.div>
      )}

      {/* Pomodoro sayısı */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <CheckCircle size={14} className="text-emerald-500" />
          {focusCount} tamamlanan pomodoro
        </span>
        {focusCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetCompletedPomodoros}
            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${
              isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Tamamlanan pomodoro sayısını sıfırla"
          >
            <Trash2 size={12} className="text-pink-500" />
            Temizle
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Pomodoro;