import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { PomodoroMode, PomodoroSettings } from '../types';

interface PomodoroState {
  selectedTodoId: number | null;
  isActive: boolean;
  minutes: number;
  seconds: number;
  mode: PomodoroMode;
  cycles: number;
  settings: PomodoroSettings;
}

type PomodoroAction =
  | { type: 'SELECT_TODO'; payload: number }
  | { type: 'CLOSE_POMODORO' }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'SWITCH_MODE'; payload: PomodoroMode }
  | { type: 'COMPLETE_CYCLE' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<PomodoroSettings> };

interface PomodoroContextType {
  state: PomodoroState;
  dispatch: React.Dispatch<PomodoroAction>;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4
};

const initialState: PomodoroState = {
  selectedTodoId: null,
  isActive: false,
  minutes: DEFAULT_SETTINGS.pomodoro,
  seconds: 0,
  mode: 'pomodoro',
  cycles: 0,
  settings: DEFAULT_SETTINGS
};

const pomodoroReducer = (state: PomodoroState, action: PomodoroAction): PomodoroState => {
  switch (action.type) {
    case 'SELECT_TODO':
      return {
        ...state,
        selectedTodoId: action.payload,
        isActive: false,
        minutes: state.settings.pomodoro,
        seconds: 0,
        mode: 'pomodoro'
      };

    case 'CLOSE_POMODORO':
      return {
        ...state,
        selectedTodoId: null,
        isActive: false
      };

    case 'START_TIMER':
      return {
        ...state,
        isActive: true
      };

    case 'PAUSE_TIMER':
      return {
        ...state,
        isActive: false
      };

    case 'RESET_TIMER': {
      const minutes = state.settings[state.mode];
      return {
        ...state,
        isActive: false,
        minutes,
        seconds: 0
      };
    }

    case 'TICK':
      if (state.seconds === 0) {
        if (state.minutes === 0) {
          // Timer completed, but don't change mode here
          // We'll use COMPLETE_CYCLE action for that
          return state;
        }
        return {
          ...state,
          minutes: state.minutes - 1,
          seconds: 59
        };
      }
      return {
        ...state,
        seconds: state.seconds - 1
      };

    case 'COMPLETE_CYCLE': {
      let newMode: PomodoroMode = 'pomodoro';
      let newCycles = state.cycles;

      if (state.mode === 'pomodoro') {
        newCycles = state.cycles + 1;
        
        if (newCycles % state.settings.longBreakInterval === 0) {
          newMode = 'longBreak';
        } else {
          newMode = 'shortBreak';
        }
      }

      return {
        ...state,
        isActive: false,
        minutes: state.settings[newMode],
        seconds: 0,
        mode: newMode,
        cycles: newCycles
      };
    }

    case 'SWITCH_MODE':
      return {
        ...state,
        isActive: false,
        mode: action.payload,
        minutes: state.settings[action.payload],
        seconds: 0
      };

    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: newSettings,
        minutes: newSettings[state.mode],
        seconds: 0
      };

    default:
      return state;
  }
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState, () => {
    try {
      const savedState = localStorage.getItem('pomodoroState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Pomodoro durumu yüklenirken hata:', error);
    }
    return initialState;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Audio element oluştur
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Active olduğunda timer'ı başlat
  useEffect(() => {
    if (state.isActive) {
      timerRef.current = window.setInterval(() => {
        if (state.minutes === 0 && state.seconds === 0) {
          // Timer completed
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error('Ses çalınamadı:', e));
          }
          
          clearInterval(timerRef.current!);
          timerRef.current = null;
          
          dispatch({ type: 'COMPLETE_CYCLE' });
        } else {
          dispatch({ type: 'TICK' });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.isActive, state.minutes, state.seconds]);

  // localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }, [state]);

  return (
    <PomodoroContext.Provider value={{ state, dispatch }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}; 