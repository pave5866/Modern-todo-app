export interface SubTask {
  id: number;
  text: string;
  completed: boolean;
}

export enum Category {
  GENEL = 'Genel',
  IS = 'İş',
  KISISEL = 'Kişisel',
  ALISVERIS = 'Alışveriş',
  SAGLIK = 'Sağlık',
  EGITIM = 'Eğitim'
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
  dueDate?: string | null;
  priority: PriorityLevel;
  tags: string[];
  category?: string;
  subTasks: SubTask[];
  archived: boolean;
  archivedAt?: string | null;
}

export interface PriorityConfig {
  label: string;
  color: string;
  bgColor: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface PrioritiesConfig {
  [key: string]: PriorityConfig;
}

export interface NewTodoForm {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: PriorityLevel;
  category?: string;
  tags?: string[];
}

export interface TodoFilter {
  search: string;
  priority: PriorityLevel | 'all';
  category: string | 'all';
  showCompleted: boolean;
  showArchived: boolean;
}

export interface TodoSort {
  field: 'title' | 'dueDate' | 'priority' | 'createdAt' | 'completedAt';
  direction: 'asc' | 'desc';
}

export type PomodoroMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

export type ThemeType = 'dark' | 'light';

export interface Sounds {
  click: string;
  complete: string;
  success: string;
  error: string;
  delete: string;
}

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  sort: TodoSort;
}

export type TodoActionType = 
  | 'ADD_TODO'
  | 'TOGGLE_TODO' 
  | 'DELETE_TODO'
  | 'ARCHIVE_TODO'
  | 'RESTORE_FROM_ARCHIVE'
  | 'EDIT_TODO'
  | 'ADD_SUBTASK'
  | 'TOGGLE_SUBTASK'
  | 'SET_FILTER'
  | 'SET_SORT'
  | 'REORDER_TODOS'
  | 'UPDATE_TODO'
  | 'DELETE_ALL_TODOS';

export interface TodoAction {
  type: TodoActionType;
  payload: 
    | Todo  // ADD_TODO, TOGGLE_TODO, ARCHIVE_TODO, RESTORE_FROM_ARCHIVE
    | number  // DELETE_TODO (id)
    | { id: number; updatedTodo: Partial<Todo> }  // EDIT_TODO
    | { todoId: number; text: string }  // ADD_SUBTASK
    | { todoId: number; subTaskId: number }  // TOGGLE_SUBTASK
    | Partial<TodoFilter>  // SET_FILTER
    | TodoSort  // SET_SORT
    | Todo[];  // REORDER_TODOS
} 