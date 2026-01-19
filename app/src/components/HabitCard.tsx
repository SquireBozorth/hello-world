import { Check, Flame } from 'lucide-react';
import { useHabitStore } from '../stores/habitStore';
import type { Habit } from '../types';
import { getTodayString, getLastNDays } from '../lib/utils';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { toggleHabitLog, isHabitCompletedOnDate, getStreak } = useHabitStore();
  const today = getTodayString();
  const isCompletedToday = isHabitCompletedOnDate(habit.id, today);
  const streak = getStreak(habit.id);
  const last7Days = getLastNDays(7);

  const handleToggle = () => {
    toggleHabitLog(habit.id, today);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isCompletedToday
              ? 'bg-green-500 text-white shadow-md scale-110'
              : 'border-2 border-gray-300 hover:border-green-500 hover:bg-green-50'
          }`}
        >
          {isCompletedToday && <Check className="w-5 h-5" />}
        </button>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-1 mb-3 text-orange-600">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-medium">{streak} day streak</span>
        </div>
      )}

      {/* Last 7 days visualization */}
      <div className="flex gap-1">
        {last7Days.map((date) => {
          const isCompleted = isHabitCompletedOnDate(habit.id, date);
          const isToday = date === today;

          return (
            <div
              key={date}
              className={`flex-1 h-8 rounded ${
                isCompleted
                  ? 'bg-green-500'
                  : isToday
                  ? 'border-2 border-gray-300'
                  : 'bg-gray-100'
              } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
              title={date}
            />
          );
        })}
      </div>
    </div>
  );
}
