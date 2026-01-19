import { useEffect } from 'react';
import { Inbox, Calendar, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { TaskInput } from './TaskInput';
import { TaskItem } from './TaskItem';
import type { TaskStatus } from '../types';

export function TaskList() {
  const { tasks, loading, fetchTasks, subscribeToTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
    const unsubscribe = subscribeToTasks();
    return () => unsubscribe();
  }, []);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const todayTasks = getTasksByStatus('today');
  const inboxTasks = getTasksByStatus('inbox');
  const completedTasks = getTasksByStatus('completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Today</h2>
          <span className="text-sm text-gray-500">({todayTasks.length})</span>
        </div>
        <div className="space-y-2">
          <TaskInput status="today" placeholder="Add to today..." autoFocus />
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No tasks for today. Add one above or move from inbox.
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inbox Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Inbox className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
          <span className="text-sm text-gray-500">({inboxTasks.length})</span>
        </div>
        <div className="space-y-2">
          <TaskInput status="inbox" placeholder="Quick capture..." />
          {inboxTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Inbox is empty. Great job staying organized!
            </div>
          ) : (
            <div className="space-y-2">
              {inboxTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Completed</h2>
            <span className="text-sm text-gray-500">({completedTasks.length})</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {completedTasks.slice(0, 10).map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
