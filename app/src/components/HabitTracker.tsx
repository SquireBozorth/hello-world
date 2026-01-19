import { useEffect, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useHabitStore } from '../stores/habitStore';
import { HabitCard } from './HabitCard';
import { getLastNDays } from '../lib/utils';

export function HabitTracker() {
  const { habits, loading, fetchHabits, fetchHabitLogs, addHabit } = useHabitStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#3B82F6');

  useEffect(() => {
    fetchHabits();
    const last30Days = getLastNDays(30);
    fetchHabitLogs(last30Days[0], last30Days[last30Days.length - 1]);
  }, []);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await addHabit(newHabitName.trim(), 'daily', newHabitColor);
    setNewHabitName('');
    setShowAddForm(false);
  };

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Habits</h2>
          <span className="text-sm text-gray-500">({habits.length})</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <form onSubmit={handleAddHabit} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habit Name
              </label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g., Morning exercise, Read 30 minutes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewHabitColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newHabitColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Habit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewHabitName('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No habits yet</p>
          <p className="text-sm text-gray-500">
            Build lasting habits by tracking them daily
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  );
}
