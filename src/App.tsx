import React from 'react';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import Header from './components/Header';
import TodoFilters from './components/TodoFilters';
import TodoList from './components/TodoList';
import CreateTodoFloatingButton from './components/CreateTodoFloatingButton';
import Pomodoro from './components/Pomodoro';
import './styles/index.css';

// Tema değişimine duyarlı bir konteyner bileşeni
const ThemedContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-900 text-slate-100' 
        : 'bg-white text-slate-800'
    }`}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SoundProvider>
      <ThemeProvider>
        <TodoProvider>
          <ThemedContainer>
            <Header />
            <main>
              <Pomodoro />
              <TodoFilters />
              <TodoList />
            </main>
            <CreateTodoFloatingButton />
          </ThemedContainer>
        </TodoProvider>
      </ThemeProvider>
    </SoundProvider>
  );
};

export default App;