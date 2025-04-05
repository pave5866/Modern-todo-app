import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowDownAZ, ArrowUpAZ, Clock, Flag, Check, Archive, Search, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { useSounds } from '../hooks/useSounds';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';
import { TodoSort, PriorityLevel, TodoFilter, Category } from '../types';

const TodoFilters: React.FC = () => {
  const { state, dispatch } = useTodos();
  const { play } = useSounds();
  const { isSoundEnabled } = useSound();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { filter, sort } = state;
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filter.search);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const toggleFilters = () => {
    if (isSoundEnabled) {
      play('switchMode');
    }
    setIsOpen(!isOpen);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ search: searchQuery });
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setFilter({ search: '' });
  };
  
  const toggleShowCompleted = () => {
    setFilter({ showCompleted: !filter.showCompleted });
  };
  
  const toggleShowArchived = () => {
    setFilter({ showArchived: !filter.showArchived });
  };
  
  const handlePriorityChange = (priority: 'all' | PriorityLevel) => {
    setFilter({ priority });
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setFilter({ category });
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  const handleSortChange = (field: TodoSort['field'], direction: TodoSort['direction']) => {
    setSort({
      field,
      direction
    });
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  // Tüm kategorileri topla (sabit ve dinamik)
  const getCategories = () => {
    // Sabit kategorileri al
    const predefinedCategories = Object.values(Category);
    
    // Kullanıcıların oluşturduğu özel kategorileri al
    const customCategories = state.todos
      .map(todo => todo.category)
      .filter((category): category is string => 
        category !== undefined && 
        category !== '' && 
        !predefinedCategories.includes(category as any)
      );
    
    // Tekrarlayan kategorilerden arındırılmış benzersiz liste
    const uniqueCustomCategories = [...new Set(customCategories)];
    
    // Tüm kategorileri birleştir
    return ['all', ...predefinedCategories, ...uniqueCustomCategories];
  };
  
  const allCategories = getCategories();
  
  const isFiltered = 
    filter.priority !== 'all' || 
    filter.category !== 'all' || 
    filter.search !== '' || 
    !filter.showCompleted ||
    filter.showArchived;
  
  // Filtreyi değiştir
  const setFilter = (filterUpdate: Partial<TodoFilter>) => {
    dispatch({
      type: 'SET_FILTER',
      payload: filterUpdate
    });
    
    // Ses efekti
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  // Sıralamayı değiştir
  const setSort = (sort: TodoSort) => {
    dispatch({
      type: 'SET_SORT',
      payload: sort
    });
    
    // Ses efekti
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  const clearFilters = () => {
    setFilter({
      priority: 'all',
      category: 'all',
      search: '',
      showCompleted: true,
      showArchived: false
    });
    setSearchQuery('');
  };
  
  // Tüm todoları sil
  const handleDeleteAllTodos = () => {
    setShowDeleteConfirm(true);
  };

  // Silme işlemini onayla
  const confirmDeleteAllTodos = () => {
    dispatch({ type: 'DELETE_ALL_TODOS', payload: {} });
    setShowDeleteConfirm(false);
    if (isSoundEnabled) {
      play('taskDelete');
    }
  };

  // İptal et
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  return (
    <div className="mb-8 px-4">
      {/* Onay Modalı */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'} p-6 rounded-xl shadow-2xl max-w-md w-full`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold">Tüm Görevleri Sil</h3>
              </div>
              
              <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Tüm görevlerinizi silmek üzeresiniz. Bu işlem geri alınamaz ve tüm görevleriniz kalıcı olarak silinecektir. Devam etmek istediğinize emin misiniz?
              </p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={cancelDelete}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  İptal
                </button>
                <button 
                  onClick={confirmDeleteAllTodos}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Tümünü Sil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Görev ara..."
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border-2 ${
              isDark 
                ? "border-slate-600/50 bg-slate-800/60 text-white placeholder:text-slate-400" 
                : "border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
            } focus:outline-none focus:border-emerald-500/70`}
          />
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <X size={18} />
            </button>
          )}
        </form>
        
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={toggleFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              isDark 
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600" 
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            } transition-colors`}
          >
            <Filter size={16} />
            <span>Filtreler</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <button
            onClick={handleDeleteAllTodos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors"
          >
            <Trash2 size={16} />
            <span>Tüm Görevleri Sil</span>
          </button>
          
          {isFiltered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-sm ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'} transition-colors`}
              onClick={clearFilters}
            >
              Filtreleri Temizle
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Filtreler İçeriği */}
      <motion.div
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        initial={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className={`${isDark ? 'bg-slate-800/30' : 'bg-slate-100'} backdrop-blur-sm rounded-xl border ${isDark ? 'border-slate-700/50' : 'border-slate-300'} p-4 space-y-4`}>
          {/* Tamamlananları Göster ve Arşivi Göster */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleShowCompleted}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                filter.showCompleted 
                  ? isDark 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : isDark
                    ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                    : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
              } transition-colors`}
            >
              <Check size={16} />
              {filter.showCompleted ? 'Tamamlananları Göster' : 'Tamamlananları Gizle'}
            </button>
            
            <button
              onClick={toggleShowArchived}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                filter.showArchived 
                  ? isDark 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                  : isDark
                    ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                    : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
              } transition-colors`}
            >
              <Archive size={16} />
              {filter.showArchived ? 'Arşivi Göster' : 'Arşivi Gizle'}
              {state.todos.filter(todo => todo.archived).length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filter.showArchived
                    ? isDark ? 'bg-blue-400/30 text-blue-100' : 'bg-blue-500/30 text-blue-800'
                    : isDark ? 'bg-slate-600 text-slate-200' : 'bg-slate-300 text-slate-700'
                }`}>
                  {state.todos.filter(todo => todo.archived).length}
                </span>
              )}
            </button>
          </div>
          
          {/* Kategori ve Öncelik Filtreleri */}
          <div className="space-y-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Öncelik</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handlePriorityChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  filter.priority === 'all'
                    ? isDark
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                Tümü
              </button>
              <button 
                onClick={() => handlePriorityChange('low')}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  filter.priority === 'low'
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                Düşük
              </button>
              <button 
                onClick={() => handlePriorityChange('medium')}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  filter.priority === 'medium'
                    ? isDark
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                Orta
              </button>
              <button 
                onClick={() => handlePriorityChange('high')}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  filter.priority === 'high'
                    ? isDark
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-red-100 text-red-700 border border-red-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                Yüksek
              </button>
            </div>
          </div>
          
          {/* Kategori Filtresi */}
          <div className="space-y-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kategori</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleCategoryChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  filter.category === 'all'
                    ? isDark
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                Tüm Kategoriler
              </button>
              {allCategories.filter(category => category !== 'all').map(category => (
                <button 
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${
                    filter.category === category
                      ? isDark
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : isDark
                        ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                        : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                  } transition-colors`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sıralama Seçenekleri */}
          <div className="space-y-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sıralama</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSortChange('createdAt', 'desc')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                  sort.field === 'createdAt' && sort.direction === 'desc'
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                <Clock size={14} />
                <span>Yeniden Eskiye</span>
              </button>
              
              <button
                onClick={() => handleSortChange('createdAt', 'asc')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                  sort.field === 'createdAt' && sort.direction === 'asc'
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                <Clock size={14} />
                <span>Eskiden Yeniye</span>
              </button>
              
              <button
                onClick={() => handleSortChange('title', 'asc')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                  sort.field === 'title' && sort.direction === 'asc'
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                <ArrowDownAZ size={14} />
                <span>A-Z</span>
              </button>
              
              <button
                onClick={() => handleSortChange('title', 'desc')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                  sort.field === 'title' && sort.direction === 'desc'
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                <ArrowUpAZ size={14} />
                <span>Z-A</span>
              </button>
              
              <button
                onClick={() => handleSortChange('priority', 'desc')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                  sort.field === 'priority' && sort.direction === 'desc'
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                <Flag size={14} />
                <span>Öncelik (Yüksek-Düşük)</span>
              </button>
              
              <button
                onClick={() => handleSortChange('priority', 'asc')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                  sort.field === 'priority' && sort.direction === 'asc'
                    ? isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/80'
                      : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                } transition-colors`}
              >
                <Flag size={14} />
                <span>Öncelik (Düşük-Yüksek)</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TodoFilters; 