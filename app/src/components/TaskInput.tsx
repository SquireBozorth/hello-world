import { useState, type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import type { TaskStatus } from '../types';

interface TaskInputProps {
  status?: TaskStatus;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TaskInput({ status = 'inbox', placeholder = 'Add a task...', autoFocus = false }: TaskInputProps) {
  const [input, setInput] = useState('');
  const addTask = useTaskStore(state => state.addTask);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    await addTask(input.trim(), status);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
      />
      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      {input && (
        <button
          onClick={handleSubmit}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      )}
    </div>
  );
}
