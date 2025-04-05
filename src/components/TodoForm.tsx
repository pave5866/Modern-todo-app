import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { useSounds } from '../hooks/useSounds';
import { useSound } from '../context/SoundContext';
import { PriorityLevel, Todo, Category } from '../types';
import { getTodayFormatted } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

interface TodoFormProps {
  initialTodo?: Todo;
  onClose?: () => void;
}

const CategoryButtons: React.FC<{
  selectedCategory: string;
  onSelect: (category: string) => void;
}> = ({ selectedCategory, onSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
      {Object.values(Category).map((category) => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-colors ${
            selectedCategory === category
              ? 'bg-emerald-500 text-white shadow-lg' 
              : isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          onClick={() => onSelect(category)}
          type="button"
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

const TodoForm: React.FC<TodoFormProps> = ({ 
  initialTodo, 
  onClose = () => {} 
}) => {
  const { dispatch } = useTodos();
  const { play } = useSounds();
  const { isSoundEnabled } = useSound();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const isEditing = !!initialTodo;
  
  // Form alanları için state'ler
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    priority: PriorityLevel;
    dueDate: string;
  }>({
    title: initialTodo?.title || '',
    description: initialTodo?.description || '',
    category: initialTodo?.category || Category.GENEL,
    priority: initialTodo?.priority || 'medium',
    dueDate: initialTodo?.dueDate || ''
  });
  
  // Form değişikliği işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  // Öncelik değişikliği işleyicisi
  const handlePriorityChange = (priority: PriorityLevel) => {
    setFormData(prev => ({ ...prev, priority }));
    if (isSoundEnabled) {
      play('switchMode');
    }
  };
  
  // Form gönderimi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSoundEnabled) {
      play('success');
    }
    
    if (isEditing && initialTodo) {
      dispatch({
        type: 'EDIT_TODO',
        payload: {
          id: initialTodo.id,
          updatedTodo: {
            ...formData,
            updatedAt: new Date().toISOString()
          }
        }
      });
    } else {
      const newTodo: Todo = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: formData.priority,
        tags: [],
        category: formData.category,
        dueDate: formData.dueDate || null,
        subTasks: [],
        archived: false
      };
      
      dispatch({
        type: 'ADD_TODO',
        payload: newTodo
      });
    }
    
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDark ? 'bg-slate-900/95' : 'bg-slate-100/95'
      } backdrop-blur-sm px-4 py-6`}
      onClick={onClose}
    >
      <motion.div
        className={`relative rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto ${
          isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
        } max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-purple-500/5" />
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onClose) onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          } z-50 cursor-pointer pointer-events-auto`}
          type="button"
        >
          <X size={20} />
        </button>
        
        <div className="p-4 sm:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 sm:mb-6 relative">
            {isEditing ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="mb-4 sm:mb-6">
              <label htmlFor="title" className={`block mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Başlık
              </label>
              <input
                type="text"
                id="title"
                placeholder="Görev başlığı"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400'
                } outline-none transition-colors`}
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4 sm:mb-6">
              <label htmlFor="description" className={`block mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Açıklama (İsteğe bağlı)
              </label>
              <textarea
                id="description"
                placeholder="Görev açıklaması"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400'
                } outline-none transition-colors min-h-[80px] sm:min-h-[120px]`}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
              <p className={`block mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kategori</p>
              <CategoryButtons 
                selectedCategory={formData.category || Category.GENEL}
                onSelect={(category) => setFormData(prev => ({ ...prev, category }))} 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label htmlFor="priority" className={`block mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Öncelik
                </label>
                <div className={`flex items-center border rounded-lg ${
                  isDark ? 'border-slate-600' : 'border-slate-200'
                }`}>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-l-lg transition-colors ${
                      formData.priority === 'low' 
                        ? 'bg-blue-500 text-white' 
                        : isDark 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => handlePriorityChange('low')}
                  >
                    Düşük
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 transition-colors ${
                      formData.priority === 'medium' 
                        ? 'bg-yellow-500 text-white' 
                        : isDark 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => handlePriorityChange('medium')}
                  >
                    Orta
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-r-lg transition-colors ${
                      formData.priority === 'high' 
                        ? 'bg-red-500 text-white' 
                        : isDark 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => handlePriorityChange('high')}
                  >
                    Yüksek
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="dueDate" className={`block mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Bitiş Tarihi (İsteğe bağlı)
                </label>
                <div className="relative">
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => {
                      const dateInput = document.getElementById('dueDate') as HTMLInputElement;
                      if (dateInput) {
                        try {
                          dateInput.showPicker();
                        } catch (e) {
                          dateInput.click();
                        }
                      }
                    }}
                  >
                    <input
                      type="date"
                      id="dueDate"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-400'
                      } outline-none transition-colors`}
                      value={formData.dueDate}
                      onChange={handleChange}
                      min={getTodayFormatted()}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2.5 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                İptal
              </button>
              
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                <Check size={18} />
                <span>
                  {isEditing ? 'Güncelle' : 'Kaydet'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TodoForm; 