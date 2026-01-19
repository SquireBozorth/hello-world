import { useState } from 'react';
import { Calendar, CheckCircle2, Target, TrendingUp, Flame } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { useGoalStore } from '../stores/goalStore';
import { getDateRangeForWeek, formatDate } from '../lib/utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export function WeeklyReview() {
  const { tasks } = useTaskStore();
  const { habits, habitLogs } = useHabitStore();
  const { goals } = useGoalStore();
  const [selectedWeek] = useState(new Date());

  const weekRange = getDateRangeForWeek(selectedWeek);
  const weekStart = startOfWeek(selectedWeek);
  const weekEnd = endOfWeek(selectedWeek);

  // Calculate metrics
  const completedTasks = tasks.filter(
    task =>
      task.status === 'completed' &&
      task.completed_at &&
      task.completed_at >= weekRange.start &&
      task.completed_at <= weekRange.end
  );

  const habitLogsThisWeek = habitLogs.filter(
    log => log.date >= weekRange.start && log.date <= weekRange.end
  );

  const totalHabitDays = habits.length * 7;
  const completedHabitDays = habitLogsThisWeek.length;
  const habitCompletionRate = totalHabitDays > 0 ? Math.round((completedHabitDays / totalHabitDays) * 100) : 0;

  const activeGoals = goals.filter(g => g.status === 'active');
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  // Habit streaks
  const habitStreaks = habits.map(habit => ({
    name: habit.name,
    color: habit.color,
    completedDays: habitLogsThisWeek.filter(log => log.habit_id === habit.id).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Weekly Review</h2>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 text-center">
          Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tasks Completed */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-900">{completedTasks.length}</span>
          </div>
          <h4 className="text-sm font-medium text-blue-900">Tasks Completed</h4>
          <p className="text-xs text-blue-700 mt-1">This week</p>
        </div>

        {/* Habit Consistency */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-orange-900">{habitCompletionRate}%</span>
          </div>
          <h4 className="text-sm font-medium text-orange-900">Habit Consistency</h4>
          <p className="text-xs text-orange-700 mt-1">
            {completedHabitDays} of {totalHabitDays} days
          </p>
        </div>

        {/* Goal Progress */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-900">{avgGoalProgress}%</span>
          </div>
          <h4 className="text-sm font-medium text-green-900">Avg Goal Progress</h4>
          <p className="text-xs text-green-700 mt-1">{activeGoals.length} active goals</p>
        </div>
      </div>

      {/* Completed Tasks Breakdown */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Completed Tasks This Week
        </h3>
        {completedTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks completed this week</p>
        ) : (
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-900">{task.title}</p>
                  {task.completed_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(task.completed_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habit Performance */}
      {habits.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            Habit Performance
          </h3>
          <div className="space-y-3">
            {habitStreaks.map((habit, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{habit.name}</span>
                  <span className="text-sm text-gray-600">
                    {habit.completedDays}/7 days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(habit.completedDays / 7) * 100}%`,
                      backgroundColor: habit.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Insights & Reflections
        </h3>
        <div className="space-y-3 text-sm text-purple-900">
          {completedTasks.length >= 10 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">🎉</span>
              <span>Great productivity! You completed {completedTasks.length} tasks this week.</span>
            </p>
          )}
          {habitCompletionRate >= 80 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">🔥</span>
              <span>Excellent habit consistency at {habitCompletionRate}%!</span>
            </p>
          )}
          {avgGoalProgress >= 50 && activeGoals.length > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <span>Your goals are {avgGoalProgress}% complete on average. Keep going!</span>
            </p>
          )}
          {completedTasks.length === 0 && habitCompletionRate < 50 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">💪</span>
              <span>Every week is a new opportunity. Focus on small wins!</span>
            </p>
          )}
        </div>
      </div>

      {/* Reflection Questions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Reflection</h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-medium mb-2">What went well this week?</p>
            <p className="text-xs text-gray-500">Consider your wins and successes</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-medium mb-2">What could be improved?</p>
            <p className="text-xs text-gray-500">Think about challenges and obstacles</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-medium mb-2">What are your priorities for next week?</p>
            <p className="text-xs text-gray-500">Set intentions for the coming week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
