import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Goal, Milestone } from '../types';

interface GoalStore {
  goals: Goal[];
  milestones: Record<string, Milestone[]>;
  loading: boolean;
  error: string | null;

  // Actions
  fetchGoals: () => Promise<void>;
  fetchMilestones: (goalId: string) => Promise<void>;
  addGoal: (title: string, description?: string, targetDate?: string) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  addMilestone: (goalId: string, title: string) => Promise<void>;
  toggleMilestone: (milestoneId: string, completed: boolean) => Promise<void>;
  updateGoalProgress: (goalId: string) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  milestones: {},
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ goals: data || [], loading: false });

      // Fetch milestones for all goals
      if (data) {
        for (const goal of data) {
          await get().fetchMilestones(goal.id);
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchMilestones: async (goalId: string) => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('order', { ascending: true });

      if (error) throw error;

      set(state => ({
        milestones: {
          ...state.milestones,
          [goalId]: data || [],
        },
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addGoal: async (title: string, description?: string, targetDate?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newGoal = {
        title,
        description,
        target_date: targetDate,
        user_id: user.id,
        status: 'active' as const,
        progress: 0,
      };

      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        goals: [data, ...state.goals],
        milestones: { ...state.milestones, [data.id]: [] },
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateGoal: async (id: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === id ? { ...goal, ...updates } : goal
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteGoal: async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        milestones: Object.fromEntries(
          Object.entries(state.milestones).filter(([key]) => key !== id)
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  completeGoal: async (id: string) => {
    try {
      await get().updateGoal(id, {
        status: 'completed',
        progress: 100,
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addMilestone: async (goalId: string, title: string) => {
    try {
      const currentMilestones = get().milestones[goalId] || [];
      const order = currentMilestones.length;

      const newMilestone = {
        goal_id: goalId,
        title,
        order,
        completed: false,
      };

      const { data, error } = await supabase
        .from('milestones')
        .insert([newMilestone])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        milestones: {
          ...state.milestones,
          [goalId]: [...(state.milestones[goalId] || []), data],
        },
      }));

      await get().updateGoalProgress(goalId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  toggleMilestone: async (milestoneId: string, completed: boolean) => {
    try {
      const updates = completed
        ? { completed: true, completed_at: new Date().toISOString() }
        : { completed: false, completed_at: undefined };

      const { error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', milestoneId);

      if (error) throw error;

      // Update local state
      set(state => {
        const newMilestones = { ...state.milestones };
        for (const goalId in newMilestones) {
          newMilestones[goalId] = newMilestones[goalId].map(m =>
            m.id === milestoneId ? { ...m, ...updates } : m
          );
        }
        return { milestones: newMilestones };
      });

      // Find which goal this milestone belongs to
      const goalId = Object.entries(get().milestones).find(([_, milestones]) =>
        milestones.some(m => m.id === milestoneId)
      )?.[0];

      if (goalId) {
        await get().updateGoalProgress(goalId);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateGoalProgress: async (goalId: string) => {
    try {
      const milestones = get().milestones[goalId] || [];
      if (milestones.length === 0) return;

      const completedCount = milestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / milestones.length) * 100);

      await get().updateGoal(goalId, { progress });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
