-- Personal Management Platform - Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE task_status AS ENUM ('inbox', 'today', 'completed', 'deleted');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'archived');

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'inbox' NOT NULL,
  priority INTEGER DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_estimate INTEGER, -- minutes
  time_actual INTEGER, -- minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  frequency habit_frequency DEFAULT 'daily' NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habit logs table
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  notes TEXT,
  UNIQUE(habit_id, date)
);

-- Time blocks table
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status goal_status DEFAULT 'active' NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(date);
CREATE INDEX idx_time_blocks_user_id ON time_blocks(user_id);
CREATE INDEX idx_time_blocks_date ON time_blocks(date);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for habits
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for habit_logs
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for time_blocks
CREATE POLICY "Users can view their own time blocks"
  ON time_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time blocks"
  ON time_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time blocks"
  ON time_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time blocks"
  ON time_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for goals
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for milestones
-- Users can access milestones for their own goals
CREATE POLICY "Users can view milestones for their own goals"
  ON milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals
    WHERE goals.id = milestones.goal_id
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert milestones for their own goals"
  ON milestones FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals
    WHERE goals.id = milestones.goal_id
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update milestones for their own goals"
  ON milestones FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM goals
    WHERE goals.id = milestones.goal_id
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete milestones for their own goals"
  ON milestones FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM goals
    WHERE goals.id = milestones.goal_id
    AND goals.user_id = auth.uid()
  ));

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE habit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE time_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
