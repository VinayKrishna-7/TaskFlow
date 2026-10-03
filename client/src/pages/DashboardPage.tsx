import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Activity as ActivityIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { getDueStatus } from '../lib/dateUtils';
import { cn } from '../lib/utils';
import { ITask } from '../types';
import { format } from 'date-fns';

const STATUS_COLORS = ['#94a3b8', '#992355', '#f59e0b', '#10b981'];
const STATUS_COLOR_MAP: Record<string, string> = {
  'To Do': '#94a3b8',
  'In Progress': '#992355',
  'In Review': '#f59e0b',
  'Completed': '#10b981',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics', activeWorkspace?._id],
    queryFn: async () => {
      if (!activeWorkspace?._id) return null;
      const res = await api.get(`/analytics/workspace/${activeWorkspace._id}`);
      return res.data.data.analytics;
    },
    enabled: !!activeWorkspace?._id,
  });

  const { data: recentTasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'dashboard', activeWorkspace?._id],
    queryFn: async () => {
      if (!activeWorkspace?._id) return [];
      const res = await api.get(`/tasks?workspace=${activeWorkspace._id}&limit=5&sortBy=dueDate&sortOrder=asc`);
      return res.data.data.tasks as ITask[];
    },
    enabled: !!activeWorkspace?._id,
  });

  const { data: recentActivities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['activities', 'dashboard', activeWorkspace?._id],
    queryFn: async () => {
      if (!activeWorkspace?._id) return [];
      const res = await api.get(`/activity/workspace/${activeWorkspace._id}`);
      return res.data.data.activities;
    },
    enabled: !!activeWorkspace?._id,
  });

  const overview = analyticsData?.overview || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  };

  const statusData = analyticsData?.tasksByStatus || [];
  const filteredStatusData = statusData.filter((d: any) => d.value > 0);
  const trendData = analyticsData?.completionTrend || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Here's what is happening in <span className="font-semibold text-[#4A3B32] dark:text-slate-200">{activeWorkspace?.name || 'your workspace'}</span>
          </p>
        </div>
        {activeProject && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white rounded-xl text-xs font-semibold shadow-sm shadow-maroon-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      {isAnalyticsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 animate-pulse"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tasks */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tasks')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/tasks')}
            title="Click to view all tasks"
            className="p-4 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-maroon-300 dark:hover:border-blue-500/60 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-maroon-50 dark:bg-[#38061B]/50 text-maroon-700 dark:text-[#F9CFE2] border border-maroon-200/80 dark:border-[#821946]/60 group-hover:scale-105 transition-transform flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65] group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors truncate">
                  Total Tasks
                </p>
                <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.totalTasks}</h3>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-semibold text-maroon-700 dark:text-[#E66E9F] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <span className="hidden sm:inline">View</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tasks?status=IN_PROGRESS')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/tasks?status=IN_PROGRESS')}
            title="Click to view in-progress tasks"
            className="p-4 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-maroon-300 dark:hover:border-blue-500/60 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-maroon-50 dark:bg-[#38061B]/50 text-maroon-700 dark:text-[#F9CFE2] border border-maroon-200/80 dark:border-[#821946]/60 group-hover:scale-105 transition-transform flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65] group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors truncate">
                  In Progress
                </p>
                <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.inProgressTasks}</h3>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-semibold text-maroon-700 dark:text-[#E66E9F] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <span className="hidden sm:inline">View</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tasks?status=COMPLETED')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/tasks?status=COMPLETED')}
            title="Click to view completed tasks"
            className="p-4 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-500/60 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  Completion Rate
                </p>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.completionRate}%</h3>
                  <span className="text-[10px] text-[#7C6E65] font-normal truncate">({overview.completedTasks} done)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <span className="hidden sm:inline">View</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>

          {/* Card 4: Overdue */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tasks?overdue=true')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/tasks?overdue=true')}
            title="Click to view overdue tasks"
            className="p-4 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-rose-300 dark:hover:border-rose-500/60 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                  Overdue
                </p>
                <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.overdueTasks}</h3>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-semibold text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <span className="hidden sm:inline">View</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            Tasks by Status
          </h3>
          <div className="h-60 flex items-center justify-center">
            {filteredStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    stroke={isDark ? '#0D0D0D' : '#FFFDF9'}
                    strokeWidth={2}
                    dataKey="value"
                  >
                    {filteredStatusData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${entry.name || index}`}
                        fill={STATUS_COLOR_MAP[entry.name] || STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: isDark
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                        : '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
                      padding: '8px 12px',
                    }}
                    itemStyle={{
                      color: isDark ? '#F9FAFB' : '#0F172A',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                    labelStyle={{
                      color: isDark ? '#94A3B8' : '#475569',
                      fontWeight: 600,
                      fontSize: '11px',
                      marginBottom: '4px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[#7C6E65]">No tasks status data available</p>
            )}
          </div>
        </div>

        {/* 7-Day Completion Trend */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            Completion Velocity (Last 7 Days)
          </h3>
          <div className="h-60 flex items-center justify-center">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: isDark
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                        : '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
                      padding: '8px 12px',
                    }}
                    itemStyle={{
                      color: isDark ? '#F9FAFB' : '#0F172A',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                    labelStyle={{
                      color: isDark ? '#94A3B8' : '#475569',
                      fontWeight: 600,
                      fontSize: '11px',
                      marginBottom: '4px',
                    }}
                  />
                  <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[#7C6E65]">No tasks completed in the last 7 days</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Upcoming Deadlines & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Upcoming Deadlines */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-3.5 flex-shrink-0">
            Upcoming Deadlines
          </h3>
          <div className="space-y-2.5">
            {isTasksLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-[#E6DACB]/60 dark:border-slate-800/50 flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="w-3/4 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-1/3 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              ))
            ) : !recentTasks || recentTasks.length === 0 ? (
              <p className="text-xs text-[#7C6E65] italic py-6 text-center">No upcoming tasks scheduled.</p>
            ) : (
              recentTasks.map((t) => {
                const due = t.dueDate ? getDueStatus(t.dueDate, t.status === 'COMPLETED') : null;
                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTaskId(t._id)}
                    className="p-3 bg-[#FAF6EE] dark:bg-slate-800/40 rounded-xl border border-[#E6DACB]/60 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#2C1810] dark:text-slate-100 truncate group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors">
                        {t.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#7C6E65] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : 'No due date'}
                        </span>
                        {due && (
                          <span className={cn('text-[9px] font-semibold px-1.5 py-0.2 rounded-md', due.color)}>
                            {due.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="status" status={t.status}>
                      {t.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 flex items-center gap-1.5 mb-3.5 flex-shrink-0">
            <ActivityIcon className="w-4 h-4 text-maroon-700 dark:text-[#F9CFE2]" />
            Workspace Activity
          </h3>
          <div className="space-y-2.5 overflow-y-auto pr-1.5 max-h-[380px]">
            {isActivitiesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 text-xs animate-pulse p-1">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-4/5 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-1/4 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))
            ) : !recentActivities || recentActivities.length === 0 ? (
              <p className="text-xs text-[#7C6E65] italic py-6 text-center">No recent activity.</p>
            ) : (
              recentActivities.slice(0, 10).map((act: any) => (
                <div key={act._id} className="flex items-start gap-3 text-xs p-1.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                  <Avatar
                    name={act.actor?.name || 'User'}
                    avatarUrl={act.actor?.avatar}
                    size="xs"
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#4A3B32] dark:text-slate-300 leading-snug">
                      <span className="font-semibold text-[#2C1810] dark:text-slate-100">{act.actor?.name || 'User'}</span>{' '}
                      {act.action ? act.action.replace('_', ' ').toLowerCase() : 'updated'}{' '}
                      {act.task?.title && <span className="text-maroon-700 dark:text-[#F9CFE2] font-medium">"{act.task.title}"</span>}
                    </p>
                    <span className="text-[10px] text-[#7C6E65] block mt-0.5">
                      {format(new Date(act.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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