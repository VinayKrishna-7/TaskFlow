import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { ITask, IProject } from '../types';
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
  FolderKanban,
} from 'lucide-react';
import { format } from 'date-fns';

export const TasksPage: React.FC = () => {
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const urlProject = searchParams.get('project') || '';
  const urlStatus = searchParams.get('status') || '';
  const urlOverdue = searchParams.get('overdue') === 'true';

  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState(urlProject);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [isOverdueFilter, setIsOverdueFilter] = useState(urlOverdue);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Sync state if URL searchParams change (e.g. from top Navbar search or navigation)
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    if (currentUrlSearch !== search) {
      setSearch(currentUrlSearch);
      setDebouncedSearch(currentUrlSearch);
      setPage(1);
    }
    const currentUrlProject = searchParams.get('project') || '';
    if (currentUrlProject !== selectedProjectFilter) {
      setSelectedProjectFilter(currentUrlProject);
      setPage(1);
    }
    const currentUrlStatus = searchParams.get('status') || '';
    if (currentUrlStatus !== statusFilter) {
      setStatusFilter(currentUrlStatus);
      setPage(1);
    }
    const currentUrlOverdue = searchParams.get('overdue') === 'true';
    if (currentUrlOverdue !== isOverdueFilter) {
      setIsOverdueFilter(currentUrlOverdue);
      setPage(1);
    }
  }, [searchParams]);

  // Debounce search input by 300ms and sync with URL query params
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);

      const params = new URLSearchParams(window.location.search);
      if (search.trim()) {
        params.set('search', search.trim());
      } else {
        params.delete('search');
      }
      if (selectedProjectFilter) {
        params.set('project', selectedProjectFilter);
      } else {
        params.delete('project');
      }
      if (statusFilter) {
        params.set('status', statusFilter);
      } else {
        params.delete('status');
      }
      if (isOverdueFilter) {
        params.set('overdue', 'true');
      } else {
        params.delete('overdue');
      }
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(handler);
  }, [search, selectedProjectFilter, statusFilter, isOverdueFilter]);

  // Fetch projects in workspace
  const { data: projectsData } = useQuery({
    queryKey: ['projects', activeWorkspace?._id],
    queryFn: async () => {
      if (!activeWorkspace?._id) return [];
      const res = await api.get(`/projects?workspaceId=${activeWorkspace._id}`);
      return (res.data?.data?.projects || res.data?.data || []) as IProject[];
    },
    enabled: !!activeWorkspace?._id,
  });

  const projects = projectsData || [];

  const { data, isLoading } = useQuery({
    queryKey: [
      'tasks',
      activeWorkspace?._id,
      selectedProjectFilter,
      debouncedSearch,
      statusFilter,
      isOverdueFilter,
      priorityFilter,
      page,
    ],
    queryFn: async () => {
      let url = `/tasks?page=${page}&limit=15`;
      if (selectedProjectFilter) {
        url += `&project=${selectedProjectFilter}`;
      } else if (activeWorkspace?._id) {
        url += `&workspace=${activeWorkspace._id}`;
      }
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      if (isOverdueFilter) url += `&overdue=true`;

      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeWorkspace?._id,
  });

  const tasks: ITask[] = data?.data?.tasks || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const hasActiveFilters = Boolean(search || statusFilter || priorityFilter || selectedProjectFilter || isOverdueFilter);

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setSelectedProjectFilter('');
    setIsOverdueFilter(false);
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const selectedProjectObj = projects.find((p) => p._id === selectedProjectFilter);
  const effectiveCreateProjectId = selectedProjectFilter || activeProject?._id || (projects[0]?._id ?? '');
  const effectiveCreateProjectMembers =
    (projects.find((p) => p._id === effectiveCreateProjectId)?.members) ||
    activeProject?.members ||
    activeWorkspace?.members ||
    [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">My Tasks</h1>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Manage, filter, and track all tasks across your projects ({pagination.total} total)
          </p>
        </div>
        {(activeProject || projects.length > 0) && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white rounded-xl text-xs font-semibold shadow-sm shadow-maroon-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-2.5">
        <div className="p-3 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-3.5 h-3.5 text-[#7C6E65] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearch('');
                }}
                placeholder="Filter by keyword, title, tag, #id..."
                aria-label="Filter tasks by keyword"
                className="w-full pl-8 pr-8 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border border-[#E6DACB] dark:border-slate-700/80 rounded-xl text-xs text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-[#992355] transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  title="Clear search"
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#7C6E65] hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Project Filter Selector */}
            <select
              value={selectedProjectFilter}
              onChange={(e) => {
                setSelectedProjectFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by project"
              className="px-2.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border border-[#E6DACB] dark:border-slate-700/80 rounded-xl text-xs text-[#4A3B32] dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="px-2.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border border-[#E6DACB] dark:border-slate-700/80 rounded-xl text-xs text-[#4A3B32] dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by priority"
              className="px-2.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border border-[#E6DACB] dark:border-slate-700/80 rounded-xl text-xs text-[#4A3B32] dark:text-slate-300 focus:outline-none cursor-pointer"
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
                  ? 'bg-[#FFFDF9] dark:bg-[#0D0D0D] text-[#2C1810] dark:text-slate-100 shadow-sm'
                  : 'text-[#7C6E65] hover:text-[#2C1810] dark:hover:text-slate-200'
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
                  ? 'bg-[#FFFDF9] dark:bg-[#0D0D0D] text-[#2C1810] dark:text-slate-100 shadow-sm'
                  : 'text-[#7C6E65] hover:text-[#2C1810] dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
            <span className="text-[#7C6E65] font-medium">Active filters:</span>
            {selectedProjectFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-maroon-50 dark:bg-[#38061B]/60 text-maroon-700 dark:text-[#F9CFE2] font-medium border border-maroon-200/80 dark:border-[#821946]/60">
                Project: {selectedProjectObj?.name || 'Selected'}
                <button
                  type="button"
                  onClick={() => setSelectedProjectFilter('')}
                  aria-label="Remove project filter"
                  className="hover:text-maroon-700 dark:hover:text-[#E66E9F] ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-maroon-50 dark:bg-[#38061B]/60 text-maroon-700 dark:text-[#F9CFE2] font-medium border border-maroon-200/80 dark:border-[#821946]/60">
                Search: "{search}"
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Remove search filter"
                  className="hover:text-maroon-700 dark:hover:text-[#E66E9F] ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-maroon-50 dark:bg-[#38061B]/60 text-maroon-700 dark:text-[#F9CFE2] font-medium border border-maroon-200/80 dark:border-[#821946]/60">
                Status: {statusFilter.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  aria-label="Remove status filter"
                  className="hover:text-maroon-700 dark:hover:text-[#E66E9F] ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priorityFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-maroon-50 dark:bg-[#38061B]/60 text-maroon-700 dark:text-[#F9CFE2] font-medium border border-maroon-200/80 dark:border-[#821946]/60">
                Priority: {priorityFilter}
                <button
                  type="button"
                  onClick={() => setPriorityFilter('')}
                  aria-label="Remove priority filter"
                  className="hover:text-maroon-700 dark:hover:text-[#E66E9F] ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isOverdueFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium border border-rose-200/80 dark:border-rose-800/60">
                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                Overdue Tasks
                <button
                  type="button"
                  onClick={() => {
                    setIsOverdueFilter(false);
                    const params = new URLSearchParams(searchParams);
                    params.delete('overdue');
                    setSearchParams(params, { replace: true });
                  }}
                  aria-label="Remove overdue filter"
                  className="hover:text-rose-700 dark:hover:text-rose-400 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-maroon-700 dark:text-[#E66E9F] hover:underline ml-1 cursor-pointer"
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
            actionText={(activeProject || projects.length > 0) ? '+ Create Task' : undefined}
            onAction={(activeProject || projects.length > 0) ? () => setIsCreateOpen(true) : undefined}
          />
        )
      ) : viewMode === 'table' ? (
        <div className="bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] dark:bg-slate-800/60 border-b border-[#E6DACB]/80 dark:border-slate-800 text-[11px] uppercase font-bold text-[#7C6E65]">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Project</th>
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
                  const projectName = typeof task.project === 'object' && task.project ? task.project.name : null;

                  return (
                    <tr
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-semibold text-[#2C1810] dark:text-slate-200 group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors">
                        {task.title}
                      </td>
                      <td className="py-3 px-4">
                        {projectName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F3ECE2] dark:bg-slate-800 text-[#4A3B32] dark:text-slate-300 border border-[#E6DACB]/80 dark:border-slate-700/80">
                            {projectName}
                          </span>
                        ) : (
                          <span className="text-[#7C6E65] text-xs">—</span>
                        )}
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
                            <span className="text-[#4A3B32] dark:text-slate-300 truncate max-w-[120px]">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#7C6E65] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#7C6E65]">
                        {dueStatus ? (
                          <span
                            title={dueStatus.exactDate}
                            className={
                              dueStatus.isOverdue
                                ? 'text-rose-600 dark:text-[#E66E9F] font-semibold flex items-center gap-1'
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
                      <td className="py-3 px-4 text-[#7C6E65]">
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
            const projectName = typeof task.project === 'object' && task.project ? task.project.name : null;

            return (
              <div
                key={task._id}
                onClick={() => setSelectedTaskId(task._id)}
                className="p-4 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-maroon-200/50 dark:hover:border-blue-500/50 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="priority" priority={task.priority}>
                      {task.priority}
                    </Badge>
                    <Badge variant="status" status={task.status}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {projectName && (
                    <span className="text-[11px] font-medium text-[#7C6E65] dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-[#E6DACB]/60 dark:border-slate-700/60 truncate max-w-[130px]" title={projectName}>
                      {projectName}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-[#2C1810] dark:text-slate-100 group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors line-clamp-2">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-[#7C6E65] dark:text-slate-400 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DACB]/60 dark:border-slate-800 text-xs text-[#7C6E65]">
                  <span
                    className={
                      dueStatus?.isOverdue
                        ? 'text-rose-600 dark:text-[#E66E9F] font-semibold flex items-center gap-1'
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
          <p className="text-xs text-[#7C6E65]">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-[#E6DACB] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-[#E6DACB] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {(activeProject || projects.length > 0) && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          projectId={effectiveCreateProjectId}
          projects={projects}
          workspaceId={activeWorkspace?._id || ''}
          members={effectiveCreateProjectMembers}
        />
      )}

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        members={activeWorkspace?.members || activeProject?.members || []}
      />
    </div>
  );
};