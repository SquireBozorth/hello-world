import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Task, TaskStatus } from '../types';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (title: string, status?: TaskStatus) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  moveToToday: (id: string) => Promise<void>;

  // Realtime subscription
  subscribeToTasks: () => () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tasks: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addTask: async (title: string, status: TaskStatus = 'inbox') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newTask = {
        title,
        status,
        user_id: user.id,
        priority: 0,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        tasks: [data, ...state.tasks]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTask: async (id: string) => {
    try {
      // Soft delete by setting status to 'deleted'
      await get().updateTask(id, { status: 'deleted' });

      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  completeTask: async (id: string) => {
    try {
      await get().updateTask(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  moveToToday: async (id: string) => {
    try {
      await get().updateTask(id, { status: 'today' });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  subscribeToTasks: () => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          set(state => {
            let updatedTasks = [...state.tasks];

            if (eventType === 'INSERT') {
              updatedTasks = [newRecord as Task, ...updatedTasks];
            } else if (eventType === 'UPDATE') {
              updatedTasks = updatedTasks.map(task =>
                task.id === newRecord.id ? newRecord as Task : task
              );
            } else if (eventType === 'DELETE') {
              updatedTasks = updatedTasks.filter(task => task.id !== oldRecord.id);
            }

            return { tasks: updatedTasks };
          });
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
