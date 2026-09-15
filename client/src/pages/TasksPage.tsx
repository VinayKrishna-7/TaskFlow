import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { ITask } from '../types';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { EmptyState, TableRowSkeleton, CardSkeleton } from '../components/common/EmptyState';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { getDueStatus } from '../lib/dateUtils';
import {
  Search,
  Plus,
  Clock,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export const TasksPage: React.FC = () => {
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: [
      'tasks',
      activeWorkspace?._id,
      activeProject?._id,
      debouncedSearch,
      statusFilter,
      priorityFilter,
      page,
    ],
    queryFn: async () => {
      let url = `/tasks?page=${page}&limit=15`;
      if (activeProject?._id) url += `&project=${activeProject._id}`;
      else if (activeWorkspace?._id) url += `&workspace=${activeWorkspace._id}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;

      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeWorkspace?._id,
  });

  const tasks: ITask[] = data?.data?.tasks || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const hasActiveFilters = Boolean(search || statusFilter || priorityFilter);

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tasks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage, filter, and track all tasks across your projects ({pagination.total} total)
          </p>
        </div>
        {activeProject && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue- hover:bg-blue- text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-2.5">
        <div className="p-3 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearch('');
                }}
                placeholder="Filter by keyword..."
                aria-label="Filter tasks by keyword"
                className="w-full pl-8 pr-8 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-/40 focus:border-blue- transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  title="Clear search"
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="px-2.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by priority"
              className="px-2.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="List View"
              aria-label="List View"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Grid View"
              aria-label="Grid View"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue- dark:bg-blue-/60 text-blue- dark:text-blue- font-medium border border-blue-/80 dark:border-blue-/60">
                Search: "{search}"
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Remove search filter"
                  className="hover:text-blue- dark:hover:text-blue- ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue- dark:bg-blue-/60 text-blue- dark:text-blue- font-medium border border-blue-/80 dark:border-blue-/60">
                Status: {statusFilter.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  aria-label="Remove status filter"
                  className="hover:text-blue- dark:hover:text-blue- ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priorityFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue- dark:bg-blue-/60 text-blue- dark:text-blue- font-medium border border-blue-/80 dark:border-blue-/60">
                Priority: {priorityFilter}
                <button
                  type="button"
                  onClick={() => setPriorityFilter('')}
                  aria-label="Remove priority filter"
                  className="hover:text-blue- dark:hover:text-blue- ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-blue- dark:text-blue- hover:underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === 'table' ? (
          <TableRowSkeleton rows={6} />
        ) : (
          <CardSkeleton count={6} />
        )
      ) : tasks.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No matching tasks"
            description="We couldn't find any tasks matching your filters. Try adjusting your keyword or clearing active filters."
            actionText="Clear filters"
            onAction={clearAllFilters}
          />
        ) : (
          <EmptyState
            title="No tasks yet"
            description="Create your first task to get started."
            actionText={activeProject ? '+ Create Task' : undefined}
            onAction={activeProject ? () => setIsCreateOpen(true) : undefined}
          />
        )
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Subtasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {tasks.map((task) => {
                  const dueStatus = getDueStatus(task.dueDate, task.status === 'COMPLETED');

                  return (
                    <tr
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue- dark:group-hover:text-blue- transition-colors">
                        {task.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="status" status={task.status}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="priority" priority={task.priority}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {dueStatus ? (
                          <span
                            title={dueStatus.exactDate}
                            className={
                              dueStatus.isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1'
                                : ''
                            }
                          >
                            {dueStatus.isOverdue && <AlertCircle className="w-3 h-3" />}
                            {dueStatus.label}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {task.subtasks && task.subtasks.length > 0 ? (
                          <span>
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const dueStatus = getDueStatus(task.dueDate, task.status === 'COMPLETED');

            return (
              <div
                key={task._id}
                onClick={() => setSelectedTaskId(task._id)}
                className="p-4 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-/50 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="priority" priority={task.priority}>
                    {task.priority}
                  </Badge>
                  <Badge variant="status" status={task.status}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue- dark:group-hover:text-blue- transition-colors line-clamp-2">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <span
                    className={
                      dueStatus?.isOverdue
                        ? 'text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1'
                        : ''
                    }
                  >
                    {dueStatus ? dueStatus.label : 'No due date'}
                  </span>
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
                      <span className="truncate max-w-[100px]">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span>Unassigned</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeProject && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          projectId={activeProject._id}
          workspaceId={activeWorkspace?._id || ''}
          members={activeProject.members}
        />
      )}

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        members={activeProject?.members}
      />
    </div>
  );
};