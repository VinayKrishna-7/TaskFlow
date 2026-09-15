import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { AIAssistantModal } from '../components/common/AIAssistantModal';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { ErrorState, Skeleton } from '../components/common/EmptyState';
import { ITask, TaskStatus, IProject } from '../types';
import {
  FolderKanban,
  CheckSquare,
  Plus,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<'board' | 'tasks'>('board');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('TODO');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch Project Details
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data.project as IProject;
    },
    enabled: !!id,
  });

  // Fetch Project Tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: async () => {
      const res = await api.get(`/tasks?project=${id}&limit=200`);
      return res.data.data.tasks as ITask[];
    },
    enabled: !!id,
  });

  const handleAddTaskInColumn = (status: TaskStatus) => {
    setCreateStatus(status);
    setIsCreateOpen(true);
  };

  if (isProjectLoading) {
    return (
      <div className="space-y-6 flex flex-col h-[calc(100vh-6.5rem)] animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
          <Skeleton className="w-32 h-9 rounded-xl" />
        </div>
        <Skeleton className="w-full flex-1 rounded-2xl" />
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C6E65] hover:text-[#2C1810] dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </button>
        <ErrorState
          title="Project not found"
          message="We couldn't retrieve this project. It may have been deleted or your access permissions may have changed."
          onRetry={() => refetchProject()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-maroon-50 dark:bg-blue-950/50 text-maroon-700 dark:text-blue-300 border border-maroon-200/80 dark:border-blue-800/60 shadow-xs">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-maroon-700 dark:text-blue-300">
                {project.key}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
                {project.name}
              </h1>
            </div>
            <p className="text-xs text-[#7C6E65] dark:text-slate-400 line-clamp-1">
              {project.description || 'Collaborative task management'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-maroon-500/10 via-rose-500/10 to-amber-500/10 text-maroon-700 dark:text-blue-300 border border-maroon-200/80 dark:border-blue-800/60 rounded-xl hover:from-maroon-500/20 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-maroon-700 dark:text-blue-300" />
            AI Breakdown
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateStatus('TODO');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-maroon-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E6DACB]/80 dark:border-slate-800/80 gap-6 text-xs font-bold uppercase tracking-wider flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('board')}
          className={`pb-2.5 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'board'
              ? 'border-b-2 border-maroon-600 text-maroon-700 dark:border-blue-500 dark:text-blue-300'
              : 'text-[#7C6E65] hover:text-[#4A3B32] dark:hover:text-slate-300'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Kanban Board
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`pb-2.5 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-b-2 border-maroon-600 text-maroon-700 dark:border-blue-500 dark:text-blue-300'
              : 'text-[#7C6E65] hover:text-[#4A3B32] dark:hover:text-slate-300'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          List View ({tasks.length})
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'board' && (
          <KanbanBoard
            tasks={tasks}
            onTaskClick={(t) => setSelectedTaskId(t._id)}
            onAddTask={handleAddTaskInColumn}
            projectId={project._id}
          />
        )}

        {activeTab === 'tasks' && (
          <div className="bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl border border-[#E6DACB]/80 dark:border-slate-800/80 overflow-y-auto max-h-full shadow-sm">
            {tasks.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-[#2C1810] dark:text-slate-200">
                  No tasks in this project yet
                </p>
                <p className="text-xs text-[#7C6E65]">
                  Add your first task or use AI Breakdown to generate a structured roadmap.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCreateStatus('TODO');
                    setIsCreateOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Task
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EE] dark:bg-slate-800/60 border-b border-[#E6DACB]/80 dark:border-slate-800 text-[11px] uppercase font-bold text-[#7C6E65]">
                  <tr>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Subtasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {tasks.map((task) => (
                    <tr
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-semibold text-[#2C1810] dark:text-slate-200 group-hover:text-maroon-700 dark:group-hover:text-blue-400 transition-colors">
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
                            <span className="text-[#4A3B32] dark:text-slate-300 truncate max-w-[120px]">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#7C6E65] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#7C6E65]">
                        {task.subtasks?.filter((s) => s.completed).length || 0}/{task.subtasks?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={project._id}
        workspaceId={activeWorkspace?._id || ''}
        defaultStatus={createStatus}
        members={project.members}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        members={project.members}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        projectId={project._id}
        workspaceId={activeWorkspace?._id}
      />
    </div>
  );
};