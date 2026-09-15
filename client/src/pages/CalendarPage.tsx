import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { ITask } from '../types';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Badge } from '../components/common/Badge';
import { getDueStatus } from '../lib/dateUtils';
import { cn } from '../lib/utils';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CalendarDays,
  ListTodo,
} from 'lucide-react';

const TIME_SLOTS = [
  { hour: 8, label: '08:00 AM' },
  { hour: 9, label: '09:00 AM' },
  { hour: 10, label: '10:00 AM' },
  { hour: 11, label: '11:00 AM' },
  { hour: 12, label: '12:00 PM' },
  { hour: 13, label: '01:00 PM' },
  { hour: 14, label: '02:00 PM' },
  { hour: 15, label: '03:00 PM' },
  { hour: 16, label: '04:00 PM' },
  { hour: 17, label: '05:00 PM' },
  { hour: 18, label: '06:00 PM' },
  { hour: 19, label: '07:00 PM' },
  { hour: 20, label: '08:00 PM' },
];

export const CalendarPage: React.FC = () => {
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), 'EEE, MMM d • h:mm a'));

  // Live time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'EEE, MMM d • h:mm a'));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch projects for modal fallback if activeProject is not set
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', activeWorkspace?._id],
    queryFn: async () => {
      if (!activeWorkspace?._id) return [];
      const res = await api.get(`/projects?workspaceId=${activeWorkspace._id}`);
      return res.data.data.projects;
    },
    enabled: !!activeWorkspace?._id,
  });

  const effectiveProject = activeProject || (projects.length > 0 ? projects[0] : null);

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', 'calendar', activeWorkspace?._id, activeProject?._id],
    queryFn: async () => {
      let url = '/tasks?limit=500';
      if (activeProject?._id) url += `&project=${activeProject._id}`;
      else if (activeWorkspace?._id) url += `&workspace=${activeWorkspace._id}`;
      const res = await api.get(url);
      return res.data.data.tasks as ITask[];
    },
    enabled: !!activeWorkspace?._id,
  });

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };
  const goToTomorrow = () => {
    const tmrw = addDays(new Date(), 1);
    setCurrentMonth(tmrw);
    setSelectedDate(tmrw);
  };

  // Filter tasks for the selected date
  const selectedDayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return isSameDay(new Date(t.dueDate), selectedDate);
  });

  // Split tasks into all-day (00:00) vs hourly timed tasks
  const allDayTasks = selectedDayTasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getHours() === 0 && d.getMinutes() === 0;
  });

  const timedTasks = selectedDayTasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getHours() !== 0 || d.getMinutes() !== 0;
  });

  // Quick stats for selected day
  const completedCount = selectedDayTasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressCount = selectedDayTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoCount = selectedDayTasks.filter((t) => t.status === 'TODO' || t.status === 'IN_REVIEW').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue- dark:bg-blue-/50 text-blue- dark:text-blue- border border-blue-/80 dark:border-blue-/60">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Calendar & Timeline
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick a date to view deadlines and schedule tasks across daily time slots
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live time indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-" />
            <span>{currentTime}</span>
          </div>

          {effectiveProject && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue- hover:bg-blue- text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Schedule Task
            </button>
          )}
        </div>
      </div>

      {/* Main Split Grid: Date Navigator & Time Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= DATE SECTION ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
            {/* Header & Month Navigator */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Date Section
                </h2>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Jumps */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={goToTomorrow}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
            </div>

            {/* 7-Column Mini-Calendar */}
            <div className="space-y-1">
              {/* Day Name Headers */}
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 pb-1">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const isCurrent = isSameMonth(day, currentMonth);
                  const isDaySelected = isSameDay(day, selectedDate);
                  const isDayToday = isToday(day);
                  const dayTasks = tasks.filter(
                    (t) => t.dueDate && isSameDay(new Date(t.dueDate), day)
                  );
                  const dayTaskCount = dayTasks.length;
                  const hasOverdue = dayTasks.some(
                    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
                  );

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`h-9 w-full rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold cursor-pointer ${
                        isDaySelected
                          ? 'bg-blue- text-white shadow-md shadow-blue-/25 font-bold'
                          : isDayToday
                          ? 'border border-blue- text-blue- dark:text-blue- font-bold bg-blue-/50 dark:bg-blue-/30'
                          : isCurrent
                          ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <span>{format(day, 'd')}</span>
                      {dayTaskCount > 0 && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                            isDaySelected
                              ? 'bg-white'
                              : hasOverdue
                              ? 'bg-rose-500 ring-1 ring-rose-400'
                              : 'bg-blue-'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Summary Card */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Selected Date
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {format(selectedDate, 'EEEE, MMM d, yyyy')}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue- dark:bg-blue-/60 text-blue- dark:text-blue- border border-blue-/80 dark:border-blue-/60">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {/* Quick Status Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">To Do</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {todoCount}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40">
                <span className="text-[10px] uppercase font-bold text-blue-500 block">In Progress</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {inProgressCount}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Done</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {completedCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TIME SECTION ================= */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-blue- dark:text-blue-" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Time Section
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Hourly schedule for {format(selectedDate, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {effectiveProject && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue- dark:text-blue- hover:bg-blue- dark:hover:bg-blue-/50 rounded-lg transition-colors border border-blue-/80 dark:border-blue-/60 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              )}
            </div>

            {/* Timeline Scrollable Content */}
            <div className="max-h-[500px] overflow-y-auto pr-1.5 space-y-3">
              {/* All-Day / Unscheduled tasks for selected day */}
              {allDayTasks.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <ListTodo className="w-3.5 h-3.5 text-blue-" />
                    <span>All-Day / Anytime Due Date ({allDayTasks.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {allDayTasks.map((t) => {
                      const due = t.dueDate ? getDueStatus(t.dueDate, t.status === 'COMPLETED') : null;
                      return (
                        <div
                          key={t._id}
                          onClick={() => setSelectedTaskId(t._id)}
                          className="p-2.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-/50 cursor-pointer transition-all flex items-center justify-between gap-2 shadow-xs group"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue- dark:group-hover:text-blue- transition-colors">
                              {t.title}
                            </h4>
                            {due && due.isOverdue && (
                              <span className={cn('inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded-md mt-0.5', due.color)}>
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="priority" priority={t.priority}>
                              {t.priority}
                            </Badge>
                            <Badge variant="status" status={t.status}>
                              {t.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hourly Slots */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {TIME_SLOTS.map((slot) => {
                  const slotTasks = timedTasks.filter((t) => {
                    const taskHour = new Date(t.dueDate!).getHours();
                    return taskHour === slot.hour;
                  });

                  return (
                    <div
                      key={slot.hour}
                      className="py-2.5 flex items-start gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                    >
                      {/* Time Label */}
                      <div className="w-18 flex-shrink-0 pt-0.5">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          {slot.label}
                        </span>
                      </div>

                      {/* Time Slot Content */}
                      <div className="flex-1 min-w-0">
                        {slotTasks.length > 0 ? (
                          <div className="space-y-1.5">
                            {slotTasks.map((t) => {
                              const due = t.dueDate ? getDueStatus(t.dueDate, t.status === 'COMPLETED') : null;
                              return (
                                <div
                                  key={t._id}
                                  onClick={() => setSelectedTaskId(t._id)}
                                  className="p-2.5 bg-blue-/50 dark:bg-blue-/30 border border-blue-/80 dark:border-blue-/60 rounded-xl hover:shadow-xs cursor-pointer transition-all flex items-center justify-between gap-2 group/task"
                                >
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover/task:text-blue- dark:group-hover/task:text-blue-">
                                      {t.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-slate-400">
                                        Due at {format(new Date(t.dueDate!), 'h:mm a')}
                                      </span>
                                      {due && due.isOverdue && (
                                        <span className={cn('text-[9px] font-semibold px-1.5 py-0.2 rounded-md', due.color)}>
                                          Overdue
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Badge variant="priority" priority={t.priority}>
                                      {t.priority}
                                    </Badge>
                                    <Badge variant="status" status={t.status}>
                                      {t.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            onClick={() => setIsCreateOpen(true)}
                            className="h-6 flex items-center text-[11px] text-slate-300 dark:text-slate-600 hover:text-blue- dark:hover:text-blue- cursor-pointer transition-colors"
                          >
                            <span className="hidden group-hover:inline-flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Add at {slot.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day completely empty fallback */}
              {selectedDayTasks.length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    No tasks scheduled for {format(selectedDate, 'MMM d, yyyy')}
                  </p>
                  {effectiveProject && (
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="inline-flex items-center gap-1 text-xs text-blue- dark:text-blue- hover:underline font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule a task for this date
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation & Detail Modals */}
      {effectiveProject && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          projectId={effectiveProject._id}
          workspaceId={activeWorkspace?._id || ''}
          defaultDueDate={format(selectedDate, 'yyyy-MM-dd')}
          members={effectiveProject.members}
        />
      )}

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        members={effectiveProject?.members}
      />
    </div>
  );
};