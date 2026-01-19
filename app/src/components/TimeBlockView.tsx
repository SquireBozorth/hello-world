import { useEffect, useState } from 'react';
import { Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTimeBlockStore } from '../stores/timeBlockStore';
import { format, addDays } from 'date-fns';
import { getTodayString, formatTime } from '../lib/utils';

export function TimeBlockView() {
  const { timeBlocks, loading, fetchTimeBlocks, addTimeBlock, deleteTimeBlock } = useTimeBlockStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockStartTime, setNewBlockStartTime] = useState('09:00');
  const [newBlockEndTime, setNewBlockEndTime] = useState('10:00');

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    fetchTimeBlocks(dateString);
  }, [dateString]);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle.trim()) return;

    const startDateTime = `${dateString}T${newBlockStartTime}:00`;
    const endDateTime = `${dateString}T${newBlockEndTime}:00`;

    await addTimeBlock(newBlockTitle.trim(), startDateTime, endDateTime, dateString);

    setNewBlockTitle('');
    setNewBlockStartTime('09:00');
    setNewBlockEndTime('10:00');
    setShowAddForm(false);
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === getTodayString();

  // Generate time slots for the day (6am - 10pm)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Time Blocks</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Block
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
        <button
          onClick={goToPreviousDay}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={goToNextDay}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Add Block Form */}
      {showAddForm && (
        <form onSubmit={handleAddBlock} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Block Title *
              </label>
              <input
                type="text"
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                placeholder="e.g., Deep work, Meeting, Exercise..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={newBlockStartTime}
                onChange={(e) => setNewBlockStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={newBlockEndTime}
                onChange={(e) => setNewBlockEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Block
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewBlockTitle('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Timeline View */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading schedule...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {timeSlots.map(hour => {
              const blocksInHour = timeBlocks.filter(block => {
                const blockHour = new Date(block.start_time).getHours();
                return blockHour === hour;
              });

              return (
                <div key={hour} className="flex">
                  {/* Time Label */}
                  <div className="w-20 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      {format(new Date().setHours(hour, 0), 'h:mm a')}
                    </span>
                  </div>

                  {/* Blocks */}
                  <div className="flex-1 p-2 min-h-[60px]">
                    {blocksInHour.length > 0 ? (
                      <div className="space-y-2">
                        {blocksInHour.map(block => (
                          <div
                            key={block.id}
                            className="group relative bg-blue-100 border-l-4 border-blue-600 p-3 rounded hover:bg-blue-200 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{block.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {formatTime(block.start_time)} - {formatTime(block.end_time)}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this time block?')) {
                                    deleteTimeBlock(block.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No blocks scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {timeBlocks.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No time blocks for this day</p>
          <p className="text-sm text-gray-500">
            Schedule your day by adding time blocks
          </p>
        </div>
      )}
    </div>
  );
}
