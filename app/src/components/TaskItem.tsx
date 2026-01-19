import { Check, X, Calendar, ArrowRight } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import type { Task } from '../types';
import { formatDate } from '../lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { completeTask, deleteTask, moveToToday } = useTaskStore();

  const handleComplete = () => {
    completeTask(task.id);
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask(task.id);
    }
  };

  const handleMoveToToday = () => {
    moveToToday(task.id);
  };

  return (
    <div className="group flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
      <button
        onClick={handleComplete}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center"
      >
        {task.status === 'completed' && (
          <Check className="w-4 h-4 text-blue-600" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
        )}
        {task.due_date && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatDate(task.due_date)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status === 'inbox' && (
          <button
            onClick={handleMoveToToday}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Move to Today"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
