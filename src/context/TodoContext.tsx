import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Todo, TodoState, TodoAction, TodoFilter, TodoSort, NewTodoForm, PriorityLevel } from '../types';

// Context için başlangıç durumu
const initialState: TodoState = {
  todos: [],
  filter: {
    search: '',
    priority: 'all',
    category: 'all',
    showCompleted: true,
    showArchived: false
  },
  sort: {
    field: 'createdAt',
    direction: 'desc'
  }
};

// Context oluşturulması
const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Todo reducer
const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          {
            ...(action.payload as NewTodoForm),
            id: Date.now(),
            completed: false,
            createdAt: new Date().toISOString(),
            tags: (action.payload as NewTodoForm).tags || [],
            subTasks: [],
            archived: false
          },
          ...state.todos
        ]
      };
      
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo => 
          todo.id === (action.payload as Todo).id
            ? { ...todo, 
                completed: !(action.payload as Todo).completed,
                completedAt: !(action.payload as Todo).completed ? new Date().toISOString() : null 
              }
            : todo
        )
      };
      
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== (action.payload as number))
      };
      
    case 'DELETE_ALL_TODOS':
      return {
        ...state,
        todos: []
      };
      
    case 'ARCHIVE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === (action.payload as Todo).id
            ? { ...todo, archived: true, archivedAt: new Date().toISOString() }
            : todo
        )
      };
      
    case 'RESTORE_FROM_ARCHIVE':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === (action.payload as Todo).id
            ? { ...todo, archived: false, archivedAt: null }
            : todo
        )
      };
      
    case 'EDIT_TODO':
      const { id, updatedTodo } = action.payload as { id: number; updatedTodo: Partial<Todo> };
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id
            ? { ...todo, ...updatedTodo }
            : todo
        )
      };
      
    case 'ADD_SUBTASK':
      const { todoId, text } = action.payload as { todoId: number; text: string };
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === todoId
            ? {
                ...todo,
                subTasks: [
                  ...todo.subTasks,
                  {
                    id: Date.now(),
                    text,
                    completed: false
                  }
                ]
              }
            : todo
        )
      };
      
    case 'TOGGLE_SUBTASK':
      const subtaskData = action.payload as { todoId: number; subTaskId: number };
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === subtaskData.todoId
            ? {
                ...todo,
                subTasks: todo.subTasks.map(subtask =>
                  subtask.id === subtaskData.subTaskId
                    ? { ...subtask, completed: !subtask.completed }
                    : subtask
                )
              }
            : todo
        )
      };
      
    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...(action.payload as Partial<TodoFilter>) }
      };
      
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload as TodoSort
      };
      
    case 'REORDER_TODOS':
      return {
        ...state,
        todos: action.payload as Todo[]
      };
      
    case 'UPDATE_TODO':
      // Bu action hem TOGGLE_TODO, ARCHIVE_TODO gibi işlemleri kapsar
      const todoToUpdate = action.payload as Todo;
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === todoToUpdate.id
            ? { ...todo, ...todoToUpdate }
            : todo
        )
      };
      
    default:
      return state;
  }
};

// Filtreleme yardımcı fonksiyonu
export const applyFilters = (todos: Todo[], filter: TodoFilter, sort: TodoSort) => {
  let result = [...todos];
  
  // Filtreler
  if (!filter.showArchived) {
    result = result.filter(todo => !todo.archived);
  }
  
  if (!filter.showCompleted) {
    result = result.filter(todo => !todo.completed);
  }
  
  if (filter.priority !== 'all') {
    result = result.filter(todo => todo.priority === filter.priority);
  }
  
  if (filter.category !== 'all') {
    result = result.filter(todo => todo.category === filter.category);
  }
  
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    result = result.filter(todo => 
      todo.title.toLowerCase().includes(searchLower) ||
      (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
      (todo.category && todo.category.toLowerCase().includes(searchLower)) ||
      todo.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // Sıralama
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
        const priorityValues: Record<PriorityLevel, number> = { high: 3, medium: 2, low: 1 };
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
  
  return result;
};

// Todo Provider bileşeni
export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage'dan verileri yükle
  const loadState = (): TodoState => {
    try {
      const savedState = localStorage.getItem('todoState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('LocalStorage\'dan veriler yüklenemedi', error);
    }
    return initialState;
  };
  
  // Reducer'ı başlangıç durumuyla çalıştır
  const [state, dispatch] = useReducer(todoReducer, loadState());
  
  // Durum her değiştiğinde LocalStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('todoState', JSON.stringify(state));
    } catch (error) {
      console.error('Veriler LocalStorage\'a kaydedilemedi', error);
    }
  }, [state]);
  
  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
};

// Kullanımı kolaylaştırmak için custom hook
export const useTodos = () => useContext(TodoContext);

export default TodoContext; 