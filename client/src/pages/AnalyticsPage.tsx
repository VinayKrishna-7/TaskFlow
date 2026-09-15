import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const STATUS_COLORS = ['#94a3b8', '#6366f1', '#f59e0b', '#10b981'];

export const AnalyticsPage: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'deep', activeWorkspace?._id],
    queryFn: async () => {
      if (!activeWorkspace?._id) return null;
      const res = await api.get(`/analytics/workspace/${activeWorkspace._id}`);
      return res.data.data.analytics;
    },
    enabled: !!activeWorkspace?._id,
  });

  const overview = analytics?.overview || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    overdueRate: 0,
  };

  const tasksByStatus = analytics?.tasksByStatus || [];
  const tasksByPriority = analytics?.tasksByPriority || [];
  const teamWorkload = analytics?.teamWorkload || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
          Productivity & Performance Analytics
        </h1>
        <p className="text-xs text-[#7C6E65] dark:text-slate-400">
          Metrics, velocity trends, and resource workloads for {activeWorkspace?.name}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">Total Created</p>
          <h3 className="text-2xl font-bold text-[#2C1810] dark:text-slate-100">{overview.totalTasks}</h3>
        </div>
        <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">Completion Rate</p>
          <h3 className="text-2xl font-bold text-maroon-700 dark:text-blue-300">{overview.completionRate}%</h3>
        </div>
        <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">In Flight</p>
          <h3 className="text-2xl font-bold text-maroon-600 dark:text-blue-300">{overview.inProgressTasks}</h3>
        </div>
        <div className="p-4 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65]">Overdue Ratio</p>
          <h3 className="text-2xl font-bold text-rose-600 dark:text-blue-400">{overview.overdueRate}%</h3>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            Task Status Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            {tasksByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tasksByStatus.map((_: any, index: number) => (
                      <Cell key={`status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '12px',
                      border: '1px solid #1f2937',
                      color: '#f9fafb',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[#7C6E65]">No data</p>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            Tasks by Priority Level
          </h3>
          <div className="h-64 flex items-center justify-center">
            {tasksByPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByPriority}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '12px',
                      border: '1px solid #1f2937',
                      color: '#f9fafb',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[#7C6E65]">No priority data</p>
            )}
          </div>
        </div>

        {/* Team Workload Distribution */}
        <div className="p-5 bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            Team Workload & Hours Logged
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6EE] dark:bg-slate-800/60 border-b border-[#E6DACB]/80 dark:border-slate-800 text-[11px] uppercase font-bold text-[#7C6E65]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Total Tasks</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Logged Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {teamWorkload.map((tw: any) => (
                  <tr key={tw.user?._id}>
                    <td className="py-3 px-4 font-semibold text-[#2C1810] dark:text-slate-200">
                      {tw.user?.name}
                    </td>
                    <td className="py-3 px-4 text-[#7C6E65] uppercase text-[10px] font-bold">
                      {tw.role}
                    </td>
                    <td className="py-3 px-4">{tw.total}</td>
                    <td className="py-3 px-4 text-maroon-700 dark:text-blue-300 font-semibold">{tw.completed}</td>
                    <td className="py-3 px-4 text-[#7C6E65]">{tw.pending}</td>
                    <td className="py-3 px-4 font-mono">{tw.actualHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};