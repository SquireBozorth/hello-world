export type TaskStatus = 'inbox' | 'today' | 'completed' | 'deleted';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  due_date?: string;
  completed_at?: string;
  time_estimate?: number;
  time_actual?: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  frequency: 'daily' | 'weekly';
  active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  date: string;
  notes?: string;
}

export interface TimeBlock {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  start_time: string;
  end_time: string;
  date: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
  order: number;
}
