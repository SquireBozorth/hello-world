import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Habit, HabitLog } from '../types';

interface HabitStore {
  habits: Habit[];
  habitLogs: HabitLog[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchHabits: () => Promise<void>;
  fetchHabitLogs: (startDate?: string, endDate?: string) => Promise<void>;
  addHabit: (name: string, frequency: 'daily' | 'weekly', color?: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;

  // Helpers
  getStreak: (habitId: string) => number;
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  habitLogs: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ habits: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchHabitLogs: async (startDate?: string, endDate?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('habit_logs')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ habitLogs: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addHabit: async (name: string, frequency: 'daily' | 'weekly' = 'daily', color: string = '#3B82F6') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newHabit = {
        name,
        frequency,
        color,
        user_id: user.id,
        active: true,
      };

      const { data, error } = await supabase
        .from('habits')
        .insert([newHabit])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        habits: [data, ...state.habits]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateHabit: async (id: string, updates: Partial<Habit>) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        habits: state.habits.map(habit =>
          habit.id === id ? { ...habit, ...updates } : habit
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteHabit: async (id: string) => {
    try {
      await get().updateHabit(id, { active: false });
      set(state => ({
        habits: state.habits.filter(habit => habit.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  toggleHabitLog: async (habitId: string, date: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if log exists for this date
      const existingLog = get().habitLogs.find(
        log => log.habit_id === habitId && log.date === date
      );

      if (existingLog) {
        // Delete the log
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existingLog.id);

        if (error) throw error;

        set(state => ({
          habitLogs: state.habitLogs.filter(log => log.id !== existingLog.id)
        }));
      } else {
        // Create new log
        const newLog = {
          habit_id: habitId,
          user_id: user.id,
          date,
          completed_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('habit_logs')
          .insert([newLog])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          habitLogs: [data, ...state.habitLogs]
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getStreak: (habitId: string) => {
    const logs = get().habitLogs
      .filter(log => log.habit_id === habitId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      logDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  isHabitCompletedOnDate: (habitId: string, date: string) => {
    return get().habitLogs.some(
      log => log.habit_id === habitId && log.date === date
    );
  },
}));
