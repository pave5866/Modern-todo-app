import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Archive, RefreshCw, Check, Clock, Tag, CalendarClock, AlertCircle } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { Todo as TodoType } from '../types';
import TodoForm from './TodoForm';
import usePriorities from '../hooks/usePriorities';
import { useSounds } from '../hooks/useSounds';
import { useSound } from '../context/SoundContext';
import { formatDistanceToNow } from '../utils/formatDate';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TodoProps {
  todo: TodoType;
}

const Todo: React.FC<TodoProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { dispatch } = useTodos();
  const { getPriorityConfig } = usePriorities();
  const { play } = useSounds();
  const { isSoundEnabled } = useSound();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const priorityConfig = getPriorityConfig(todo.priority);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (isSoundEnabled) {
      play('switchMode');
    }
  };

  const handleToggle = () => {
    dispatch({
      type: 'TOGGLE_TODO',
      payload: todo
    });
    
    if (isSoundEnabled) {
      if (!todo.completed) {
        play('complete');
      } else {
        play('switchMode');
      }
    }
  };

  const handleArchive = () => {
    if (todo.archived) {
      dispatch({
        type: 'RESTORE_FROM_ARCHIVE',
        payload: todo
      });
    } else {
      dispatch({
        type: 'ARCHIVE_TODO',
        payload: todo
      });
    }
    if (isSoundEnabled) {
      play('switchMode');
    }
    setIsExpanded(false);
  };

  const handleRestore = () => {
    dispatch({
      type: 'RESTORE_FROM_ARCHIVE',
      payload: todo
    });
    if (isSoundEnabled) {
      play('switchMode');
    }
    setIsExpanded(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(false);
    if (isSoundEnabled) {
      play('switchMode');
    }
  };

  const handleDelete = () => {
    dispatch({
      type: 'DELETE_TODO',
      payload: todo.id
    });
    if (isSoundEnabled) {
      play('taskDelete');
    }
    setIsExpanded(false);
  };

  return (
    <>
      <motion.div 
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all
          ${todo.completed ? 'opacity-80' : 'opacity-100'}
          ${isDark ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-white hover:bg-slate-50'}`}
      >
        <div 
          className="relative border-l-4 h-full flex flex-col cursor-pointer"
          style={{ borderColor: priorityConfig.color }}
          onClick={toggleExpanded}
        >
          {/* Header - always visible */}
          <div className="flex items-center p-3 gap-2 flex-grow">
            {/* Checkbox */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggle}
              className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center focus:outline-none
                ${todo.completed 
                  ? 'bg-emerald-500 border-emerald-400' 
                  : isDark ? 'border-slate-600' : 'border-slate-300'}`}
            >
              {todo.completed && <Check size={14} className="text-white" />}
            </motion.button>
            
            {/* Title and meta info */}
            <div className="flex-1 min-w-0">
              <h3 
                className={`font-medium truncate transition-colors text-sm sm:text-base
                  ${todo.completed 
                    ? (isDark ? 'line-through text-slate-400' : 'line-through text-slate-400') 
                    : (isDark ? 'text-white' : 'text-slate-800')}`}
              >
                {todo.title}
              </h3>
              
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs">
                {/* Due date */}
                {todo.dueDate && (
                  <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <CalendarClock size={14} />
                    <span>{format(new Date(todo.dueDate), 'dd MMM', { locale: tr })}</span>
                    
                    {/* Tarih geçmişse uyarı göster */}
                    {new Date(todo.dueDate) < new Date() && !todo.completed && (
                      <span className="text-red-500 flex items-center">
                        <AlertCircle size={12} className="ml-1" />
                      </span>
                    )}
                  </div>
                )}
                
                {/* Priority */}
                <div 
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white" 
                  style={{ backgroundColor: priorityConfig.color }}
                >
                  <span>{priorityConfig.label}</span>
                </div>
                
                {/* Category */}
                {todo.category && (
                  <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Tag size={14} />
                    <span>{todo.category}</span>
                  </div>
                )}
                
                {/* Created at - only show if expanded */}
                {isExpanded && (
                  <div className={`flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Clock size={14} />
                    <span>{formatDistanceToNow(todo.createdAt)} önce</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Dropdown indicator - transform on open */}
            <motion.div 
              animate={{ rotateX: isExpanded ? 180 : 0 }}
              className={`w-6 h-6 flex items-center justify-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </motion.div>
          </div>
          
          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} p-3`}>
                  {/* Description */}
                  {todo.description && (
                    <p className={`text-sm mb-3 whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {todo.description}
                    </p>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 justify-end">
                    {todo.archived ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestore}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs
                          ${isDark 
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                      >
                        <RefreshCw size={14} />
                        <span>Geri Yükle</span>
                      </motion.button>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleEdit}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs
                            ${isDark 
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                          <Edit size={14} />
                          <span>Düzenle</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleArchive}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs
                            ${isDark 
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                          <Archive size={14} />
                          <span>Arşivle</span>
                        </motion.button>
                      </>
                    )}
                    
                    {/* Delete button, always available */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500 text-white text-xs hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                      <span>Sil</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Edit modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className={`fixed inset-0 z-50 ${isDark ? 'bg-black/50' : 'bg-slate-700/30'} backdrop-blur-sm flex items-center justify-center p-4`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
          >
            <div onClick={e => e.stopPropagation()}>
              <TodoForm 
                onClose={() => setIsEditing(false)} 
                initialTodo={todo} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Todo; 