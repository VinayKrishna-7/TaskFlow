import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ITask } from '../../types';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { CheckSquare, Clock, Paperclip, AlertCircle } from 'lucide-react';
import { getDueStatus } from '../../lib/dateUtils';
import { cn } from '../../lib/utils';

interface TaskCardProps {
  task: ITask;
  onClick: (task: ITask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const dueStatus = getDueStatus(task.dueDate, task.status === 'COMPLETED');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        'p-3.5 bg-[#FFFDF9] dark:bg-[#111827] border rounded-2xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group active:scale-[0.99] select-none',
        isDragging
          ? 'border-dashed border-maroon-400 dark:border-blue-500 bg-maroon-50/20 dark:bg-blue-950/20'
          : 'border-[#E6DACB]/80 dark:border-slate-800/80 hover:border-maroon-500/50 dark:hover:border-blue-500/50'
      )}
    >
      {/* Top Meta: Priority and Due Date */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge variant="priority" priority={task.priority}>
          {task.priority}
        </Badge>

        {dueStatus && (
          <span
            title={`Due: ${dueStatus.exactDate}`}
            className={cn(
              'text-[11px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors',
              dueStatus.isOverdue
                ? 'bg-rose-50 dark:bg-blue-950/40 text-rose-600 dark:text-blue-400 border border-rose-200/80 dark:border-rose-900/60 font-semibold'
                : dueStatus.isToday
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold'
                : 'text-[#7C6E65] dark:text-slate-400'
            )}
          >
            {dueStatus.isOverdue ? (
              <AlertCircle className="w-3 h-3 text-rose-500" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span>{dueStatus.label}</span>
          </span>
        )}
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-[#2C1810] dark:text-slate-100 group-hover:text-maroon-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
        {task.title}
      </h4>

      {/* Description Snippet Preview */}
      {task.description && (
        <p className="text-xs text-[#7C6E65] dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {task.labels.slice(0, 3).map((l, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {l}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-[#7C6E65]">+{task.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Bottom Footer Info */}
      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#E6DACB]/60 dark:border-slate-800/80 text-[11px] text-[#7C6E65]">
        <div className="flex items-center gap-3">
          {totalSubtasks > 0 && (
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
              <CheckSquare className="w-3.5 h-3.5 text-maroon-600 dark:text-blue-400" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1" title={`${task.attachments.length} attachments`}>
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task.attachments.length}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar with Initials Fallback */}
        {task.assignee && (
          <Avatar
            src={task.assignee.avatar}
            name={task.assignee.name}
            size="sm"
            className="ring-2 ring-white dark:ring-[#111827]"
          />
        )}
      </div>
    </div>
  );
});