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
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Subtasks ({completed}/{total})
        </h4>
        <span className="text-xs font-semibold text-blue- dark:text-blue-">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue- dark:bg-blue- transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-1.5 pt-1">
        {subtasks.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#111827]/80 group transition-colors"
          >
            <button
              onClick={() => handleToggle(sub.id)}
              className="flex items-center gap-2.5 text-left text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {sub.completed ? (
                <CheckSquare className="w-4 h-4 text-blue- dark:text-blue- flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span className={sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                {sub.title}
              </span>
            </button>
            <button
              onClick={() => handleDelete(sub.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
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
          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-/40"
        />
        <button
          type="submit"
          disabled={isAdding || !newTitle.trim()}
          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-blue- hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};