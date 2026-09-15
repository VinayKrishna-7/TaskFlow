import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAuthStore } from '../store/authStore';
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

const STATUS_COLORS = ['#94a3b8', '#6366f1', '#f59e0b', '#10b981'];

export const DashboardPage: React.FC = () => {
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const { user } = useAuthStore();
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-maroon-900/20 transition-all cursor-pointer"
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
              className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4 animate-pulse"
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
          <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-maroon-50 dark:bg-blue-950/50 text-maroon-700 dark:text-blue-300 border border-maroon-200/80 dark:border-blue-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">Total Tasks</p>
              <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.totalTasks}</h3>
            </div>
          </div>

          <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-maroon-50 dark:bg-blue-950/50 text-maroon-700 dark:text-blue-300 border border-maroon-200/80 dark:border-blue-800/60">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">In Progress</p>
              <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.inProgressTasks}</h3>
            </div>
          </div>

          <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">Completion Rate</p>
              <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.completionRate}%</h3>
            </div>
          </div>

          <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-blue-950/50 text-rose-600 dark:text-blue-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">Overdue</p>
              <h3 className="text-xl font-bold text-[#2C1810] dark:text-slate-100">{overview.overdueTasks}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            Tasks by Status
          </h3>
          <div className="h-60 flex items-center justify-center">
            {statusData.length > 0 && statusData.some((d: any) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '12px',
                      border: '1px solid #1f2937',
                      color: '#f9fafb',
                      fontSize: '12px',
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
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
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
                      backgroundColor: '#111827',
                      borderRadius: '12px',
                      border: '1px solid #1f2937',
                      color: '#f9fafb',
                      fontSize: '12px',
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
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
              <p className="text-xs text-[#7C6E65] italic py-4 text-center">No upcoming tasks scheduled.</p>
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
                      <h4 className="text-xs font-semibold text-[#2C1810] dark:text-slate-100 truncate group-hover:text-maroon-700 dark:group-hover:text-blue-400 transition-colors">
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
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 flex items-center gap-1.5">
            <ActivityIcon className="w-4 h-4 text-maroon-700 dark:text-blue-300" />
            Workspace Activity
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {isActivitiesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 text-xs animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-4/5 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-1/4 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))
            ) : !recentActivities || recentActivities.length === 0 ? (
              <p className="text-xs text-[#7C6E65] italic py-4 text-center">No recent activity.</p>
            ) : (
              recentActivities.slice(0, 8).map((act: any) => (
                <div key={act._id} className="flex items-start gap-3 text-xs">
                  <Avatar
                    name={act.actor?.name || 'User'}
                    avatarUrl={act.actor?.avatar}
                    size="xs"
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-[#4A3B32] dark:text-slate-300">
                      <span className="font-semibold text-[#2C1810] dark:text-slate-100">{act.actor?.name}</span>{' '}
                      {act.action.replace('_', ' ').toLowerCase()}{' '}
                      {act.task?.title && <span className="text-maroon-700 dark:text-blue-300 font-medium">"{act.task.title}"</span>}
                    </p>
                    <span className="text-[10px] text-[#7C6E65]">
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