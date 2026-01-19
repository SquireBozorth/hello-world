import { Check, Flag, Plus, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useGoalStore } from '../stores/goalStore';
import type { Goal } from '../types';
import { formatDate } from '../lib/utils';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { milestones, addMilestone, toggleMilestone, deleteGoal, completeGoal } = useGoalStore();
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const goalMilestones = milestones[goal.id] || [];
  const completedMilestones = goalMilestones.filter(m => m.completed).length;

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    await addMilestone(goal.id, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
    setShowAddMilestone(false);
  };

  const handleCompleteGoal = () => {
    if (confirm('Mark this goal as completed?')) {
      completeGoal(goal.id);
    }
  };

  const handleDeleteGoal = () => {
    if (confirm('Delete this goal and all its milestones?')) {
      deleteGoal(goal.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Flag className={`w-5 h-5 ${goal.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {goal.title}
            </h3>
          </div>
          {goal.description && (
            <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
          )}
          {goal.target_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              Target: {formatDate(goal.target_date)}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {goal.status !== 'completed' && (
            <button
              onClick={handleCompleteGoal}
              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Mark as completed"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDeleteGoal}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">Progress</span>
          <span className="text-xs font-bold text-blue-600">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {completedMilestones} of {goalMilestones.length} milestones completed
        </div>
      </div>

      {/* Milestones */}
      {goalMilestones.length > 0 && (
        <div className="space-y-2 mb-3">
          {goalMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
            >
              <button
                onClick={() => toggleMilestone(milestone.id, !milestone.completed)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  milestone.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {milestone.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className={`text-sm flex-1 ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {milestone.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Milestone */}
      {showAddMilestone ? (
        <form onSubmit={handleAddMilestone} className="flex gap-2">
          <input
            type="text"
            value={newMilestoneTitle}
            onChange={(e) => setNewMilestoneTitle(e.target.value)}
            placeholder="Milestone title..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddMilestone(false);
              setNewMilestoneTitle('');
            }}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowAddMilestone(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      )}
    </div>
  );
}
