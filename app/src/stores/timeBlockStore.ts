import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { TimeBlock } from '../types';

interface TimeBlockStore {
  timeBlocks: TimeBlock[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTimeBlocks: (date: string) => Promise<void>;
  addTimeBlock: (
    title: string,
    startTime: string,
    endTime: string,
    date: string,
    taskId?: string
  ) => Promise<void>;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => Promise<void>;
  deleteTimeBlock: (id: string) => Promise<void>;
}

export const useTimeBlockStore = create<TimeBlockStore>((set) => ({
  timeBlocks: [],
  loading: false,
  error: null,

  fetchTimeBlocks: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('date', date)
        .order('start_time', { ascending: true });

      if (error) throw error;
      set({ timeBlocks: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addTimeBlock: async (
    title: string,
    startTime: string,
    endTime: string,
    date: string,
    taskId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newBlock = {
        title,
        start_time: startTime,
        end_time: endTime,
        date,
        task_id: taskId,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('time_blocks')
        .insert([newBlock])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        timeBlocks: [...state.timeBlocks, data].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTimeBlock: async (id: string, updates: Partial<TimeBlock>) => {
    try {
      const { error } = await supabase
        .from('time_blocks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        timeBlocks: state.timeBlocks.map(block =>
          block.id === id ? { ...block, ...updates } : block
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTimeBlock: async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        timeBlocks: state.timeBlocks.filter(block => block.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
