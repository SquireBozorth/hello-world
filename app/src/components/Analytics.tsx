import { useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Target, Flame, Calendar } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { useGoalStore } from '../stores/goalStore';
import { getLastNDays } from '../lib/utils';

export function Analytics() {
  const { tasks, fetchTasks } = useTaskStore();
  const { habits, habitLogs, fetchHabits, fetchHabitLogs } = useHabitStore();
  const { goals, fetchGoals } = useGoalStore();

  useEffect(() => {
    fetchTasks();
    fetchHabits();
    const last30Days = getLastNDays(30);
    fetchHabitLogs(last30Days[0], last30Days[last30Days.length - 1]);
    fetchGoals();
  }, []);

  // Overall stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const last7Days = getLastNDays(7);
  const last30Days = getLastNDays(30);

  // Tasks completed in last 7 and 30 days
  const tasksLast7Days = tasks.filter(
    t => t.completed_at && last7Days.includes(t.completed_at.split('T')[0])
  ).length;

  const tasksLast30Days = tasks.filter(
    t => t.completed_at && last30Days.includes(t.completed_at.split('T')[0])
  ).length;

  // Habit stats
  const habitLogsLast7Days = habitLogs.filter(log => last7Days.includes(log.date)).length;
  const habitLogsLast30Days = habitLogs.filter(log => last30Days.includes(log.date)).length;
  const maxPossible7Days = habits.length * 7;
  const maxPossible30Days = habits.length * 30;

  const habitConsistency7Days = maxPossible7Days > 0
    ? Math.round((habitLogsLast7Days / maxPossible7Days) * 100)
    : 0;

  const habitConsistency30Days = maxPossible30Days > 0
    ? Math.round((habitLogsLast30Days / maxPossible30Days) * 100)
    : 0;

  // Goal stats
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  // Daily task completion trend (last 7 days)
  const dailyTaskCompletion = last7Days.map(date => {
    const count = tasks.filter(
      t => t.completed_at && t.completed_at.startsWith(date)
    ).length;
    return { date, count };
  });

  const maxDailyTasks = Math.max(...dailyTaskCompletion.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{completedTasks}</span>
          </div>
          <h4 className="text-sm font-medium text-gray-700">Tasks Done</h4>
          <p className="text-xs text-gray-500 mt-1">{completionRate}% completion rate</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{tasksLast7Days}</span>
          </div>
          <h4 className="text-sm font-medium text-gray-700">Last 7 Days</h4>
          <p className="text-xs text-gray-500 mt-1">Tasks completed</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{habitConsistency7Days}%</span>
          </div>
          <h4 className="text-sm font-medium text-gray-700">Habit Streak</h4>
          <p className="text-xs text-gray-500 mt-1">7-day consistency</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{avgProgress}%</span>
          </div>
          <h4 className="text-sm font-medium text-gray-700">Goal Progress</h4>
          <p className="text-xs text-gray-500 mt-1">{activeGoals.length} active goals</p>
        </div>
      </div>

      {/* Task Completion Trend */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Task Completion Trend (Last 7 Days)
        </h3>
        <div className="space-y-3">
          {dailyTaskCompletion.map(({ date, count }) => (
            <div key={date} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-24">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-blue-600 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(count / maxDailyTasks) * 100}%` }}
                >
                  {count > 0 && (
                    <span className="text-xs font-medium text-white">{count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            Habit Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Last 7 Days</span>
                <span className="text-sm font-semibold text-gray-900">{habitConsistency7Days}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full transition-all"
                  style={{ width: `${habitConsistency7Days}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {habitLogsLast7Days} of {maxPossible7Days} habit days
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Last 30 Days</span>
                <span className="text-sm font-semibold text-gray-900">{habitConsistency30Days}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full transition-all"
                  style={{ width: `${habitConsistency30Days}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {habitLogsLast30Days} of {maxPossible30Days} habit days
              </p>
            </div>
          </div>
        </div>

        {/* Goal Summary */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Goal Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-sm font-medium text-green-900">Active Goals</span>
              <span className="text-2xl font-bold text-green-900">{activeGoals.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <span className="text-sm font-medium text-blue-900">Completed Goals</span>
              <span className="text-2xl font-bold text-blue-900">{completedGoals.length}</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Average Progress</span>
                <span className="text-sm font-semibold text-gray-900">{avgProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Productivity Insights
        </h3>
        <div className="space-y-3 text-sm text-purple-900">
          {tasksLast7Days > 20 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">🚀</span>
              <span>
                Amazing productivity! You've completed {tasksLast7Days} tasks in the last week.
              </span>
            </p>
          )}
          {habitConsistency7Days >= 80 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">⭐</span>
              <span>
                Outstanding habit consistency at {habitConsistency7Days}%! You're building strong routines.
              </span>
            </p>
          )}
          {avgProgress >= 70 && activeGoals.length > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <span>
                Your goals are {avgProgress}% complete on average. You're making excellent progress!
              </span>
            </p>
          )}
          {tasksLast7Days === 0 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Start building momentum by adding a few tasks to your today list.
              </span>
            </p>
          )}
          {habitConsistency7Days < 50 && habits.length > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-lg">💪</span>
              <span>
                Focus on checking off your habits daily to build consistency.
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">30-Day Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-blue-600 mb-1">{tasksLast30Days}</div>
            <div className="text-xs text-gray-600">Tasks Completed</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-orange-600 mb-1">{habitLogsLast30Days}</div>
            <div className="text-xs text-gray-600">Habit Check-ins</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-green-600 mb-1">{completedGoals.length}</div>
            <div className="text-xs text-gray-600">Goals Achieved</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-purple-600 mb-1">{habits.length}</div>
            <div className="text-xs text-gray-600">Active Habits</div>
          </div>
        </div>
      </div>
    </div>
  );
}
