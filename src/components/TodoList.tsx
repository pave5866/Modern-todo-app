import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodos } from '../context/TodoContext';
import Todo from './Todo';
import { PlusCircle, ListFilter, AlertCircle } from 'lucide-react';
import { Todo as TodoType } from '../types';
import { useTheme } from '../context/ThemeContext';

const TodoList: React.FC = () => {
  const { state, dispatch } = useTodos();
  const { todos, filter, sort } = state;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [filteredTodos, setFilteredTodos] = useState<TodoType[]>([]);
  
  // Görevleri filtrele ve sırala
  useEffect(() => {
    let result = [...todos];
    
    // Arşivleme filtresini uygula
    if (!filter.showArchived) {
      result = result.filter(todo => !todo.archived);
    }
    
    // Tamamlanma durumu filtresini uygula
    if (!filter.showCompleted) {
      result = result.filter(todo => !todo.completed);
    }
    
    // Öncelik filtresini uygula
    if (filter.priority !== 'all') {
      result = result.filter(todo => todo.priority === filter.priority);
    }
    
    // Kategori filtresini uygula
    if (filter.category !== 'all') {
      result = result.filter(todo => todo.category === filter.category);
    }
    
    // Arama filtresini uygula
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
        (todo.category && todo.category.toLowerCase().includes(searchLower)) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Sıralama uygula
    result.sort((a, b) => {
      let valueA, valueB;
      
      // Sıralama alanına göre değerleri al
      switch (sort.field) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'dueDate':
          valueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1 };
          valueA = priorityValues[a.priority];
          valueB = priorityValues[b.priority];
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'completedAt':
          valueA = a.completedAt ? new Date(a.completedAt).getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.completedAt ? new Date(b.completedAt).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
      }
      
      // Sıralama yönüne göre karşılaştır
      if (sort.direction === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
    
    setFilteredTodos(result);
  }, [todos, filter, sort]);
  
  // Görev olup olmadığını kontrol et
  const hasAnyTodos = todos.length > 0;
  const hasFilteredTodos = filteredTodos.length > 0;
  
  // Görev oluşturma sayfasına yönlendir
  const goToCreateTodo = () => {
    // Modal açma örneği
    const addButton = document.querySelector('button[aria-label="Yeni görev ekle"]') as HTMLButtonElement | null;
    if (addButton) {
      addButton.click();
    }
  };
  
  const clearFilters = () => {
    dispatch({ 
      type: 'SET_FILTER', 
      payload: { 
        priority: 'all', 
        category: 'all',
        search: '',
        showCompleted: true,
        showArchived: false
      } 
    });
  };
  
  return (
    <div className="px-4 relative">
      <AnimatePresence>
        {!hasAnyTodos && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <ListFilter size={64} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
            <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Henüz Görev Yok</h3>
            <p className={`max-w-sm mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Yapılacak bir görev ekleyerek başlayın. Görevleri kategorilere ayırabilir, öncelik belirleyebilir ve bitiş tarihi ekleyebilirsiniz.
            </p>
            <button
              onClick={goToCreateTodo}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={18} />
              <span>Görev Ekle</span>
            </button>
          </motion.div>
        )}
        
        {hasAnyTodos && !hasFilteredTodos && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <AlertCircle size={64} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
            <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Görev Bulunamadı</h3>
            <p className={`max-w-sm mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Mevcut filtrelere uygun görev bulunamadı. Farklı filtre seçeneklerini deneyebilir veya yeni bir görev ekleyebilirsiniz.
            </p>
            <div className="flex gap-4">
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg ${
                  isDark ? 'bg-slate-600 hover:bg-slate-500 text-slate-200' : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                }`}
              >
                <ListFilter size={18} />
                <span>Filtreleri Temizle</span>
              </button>
              
              <button
                onClick={goToCreateTodo}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <PlusCircle size={18} />
                <span>Görev Ekle</span>
              </button>
            </div>
          </motion.div>
        )}
        
        {hasFilteredTodos && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 pb-24"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredTodos.map(todo => (
                <Todo key={todo.id} todo={todo} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoList; 