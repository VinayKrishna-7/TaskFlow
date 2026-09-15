import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { ITask, TaskStatus } from '../../types';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: ITask[];
  onTaskClick: (task: ITask) => void;
  onAddTask: (status: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const columnColors = {
    TODO: 'border-t-slate-400',
    IN_PROGRESS: 'border-t-maroon-600 dark:border-t-blue-500',
    IN_REVIEW: 'border-t-amber-500',
    COMPLETED: 'border-t-emerald-500',
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-72 md:w-80 flex-shrink-0 bg-slate-100/70 dark:bg-[#111827]/50 rounded-2xl p-3.5 border border-[#E6DACB]/80 dark:border-slate-800/80 flex flex-col max-h-[calc(100vh-12rem)] border-t-4 ${
        columnColors[status]
      } ${isOver ? 'ring-2 ring-maroon-600/30 bg-maroon-50/20 dark:ring-blue-500/40 dark:bg-blue-950/30' : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-1.5 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            {title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFFDF9] dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs border border-[#E6DACB] dark:border-slate-700">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 rounded-lg text-[#7C6E65] hover:text-slate-600 dark:hover:text-slate-200 hover:bg-[#FFFDF9] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[150px] scrollbar-thin">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
          {tasks.length === 0 && (
            <div
              className={`h-28 border border-dashed rounded-2xl flex flex-col items-center justify-center text-xs transition-colors ${
                isOver
                  ? 'border-maroon-200 bg-maroon-50/30 dark:border-blue-700/60 dark:bg-blue-950/30 text-maroon-700 dark:text-blue-300 font-semibold'
                  : 'border-[#E6DACB] dark:border-slate-800 text-[#7C6E65]'
              }`}
            >
              <span>Drop task here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};