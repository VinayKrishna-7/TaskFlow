import React, { useState } from 'react';
import { ISubtask } from '../../types';
import { CheckSquare, Square, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/axios';

interface SubtasksListProps {
  taskId: string;
  subtasks: ISubtask[];
  onUpdate: () => void;
}

export const SubtasksList: React.FC<SubtasksListProps> = ({ taskId, subtasks, onUpdate }) => {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completed = subtasks.filter((s) => s.completed).length;
  const total = subtasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggle = async (subtaskId: string) => {
    try {
      await api.put(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsAdding(true);
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title: newTitle.trim() });
      setNewTitle('');
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (subtaskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C6E65] dark:text-slate-400">
          Subtasks ({completed}/{total})
        </h4>
        <span className="text-xs font-semibold text-maroon-700 dark:text-[#F9CFE2]">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-maroon-600 dark:bg-[#992355] transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-1.5 pt-1">
        {subtasks.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-[#0D0D0D]/80 group transition-colors"
          >
            <button
              onClick={() => handleToggle(sub.id)}
              className="flex items-center gap-2.5 text-left text-xs text-[#2C1810] dark:text-slate-200 cursor-pointer"
            >
              {sub.completed ? (
                <CheckSquare className="w-4 h-4 text-maroon-700 dark:text-[#F9CFE2] flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-[#7C6E65] flex-shrink-0" />
              )}
              <span className={sub.completed ? 'line-through text-[#7C6E65] dark:text-slate-400' : ''}>
                {sub.title}
              </span>
            </button>
            <button
              onClick={() => handleDelete(sub.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-[#7C6E65] hover:text-rose-500 transition-opacity cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add input */}
      <form onSubmit={handleAdd} className="flex gap-2 pt-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 px-3 py-1.5 bg-[#FAF6EE] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-xs text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:ring-[#992355]/30 dark:focus:border-[#992355]"
        />
        <button
          type="submit"
          disabled={isAdding || !newTitle.trim()}
          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-maroon-700 dark:hover:bg-[#992355] hover:text-white dark:hover:text-white text-[#4A3B32] dark:text-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};