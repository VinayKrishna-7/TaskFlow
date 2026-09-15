import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { IProject } from '../types';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { CardSkeleton, EmptyState } from '../components/common/EmptyState';
import { toast } from '../store/toastStore';
import { confirm } from '../store/confirmStore';

export const ProjectsPage: React.FC = () => {
  const { activeWorkspace, setActiveProject } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', activeWorkspace?._id],
    queryFn: async () => {
      if (!activeWorkspace?._id) return [];
      const res = await api.get(`/projects?workspaceId=${activeWorkspace._id}`);
      return res.data.data.projects as IProject[];
    },
    enabled: !!activeWorkspace?._id,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim() || !activeWorkspace?._id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/projects', {
        workspace: activeWorkspace._id,
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
      });
      const created = res.data?.data?.project;
      if (created) {
        setActiveProject(created);
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created.');
      setIsModalOpen(false);
      setName('');
      setKey('');
      setDescription('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, p: IProject) => {
    e.stopPropagation();
    confirm({
      title: 'Delete project?',
      description: `Permanently delete "${p.name}" and all of its tasks. This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${p._id}`);
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          toast.success('Project deleted.');
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to delete project.');
        }
      },
    });
  };

  const openProject = (p: IProject) => {
    setActiveProject(p);
    navigate(`/projects/${p._id}/board`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Projects</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workspaces projects, roadmaps, and progress tracking
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue- hover:bg-blue- text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to start organizing your work and tracking tasks."
          actionText="+ Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const stats = project.stats || {
              total: 0,
              completed: 0,
              inProgress: 0,
              completionPercentage: 0,
            };

            return (
              <div
                key={project._id}
                onClick={() => openProject(project)}
                className="p-5 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-/50 transition-all cursor-pointer group flex flex-col justify-between relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue- text-blue- dark:bg-blue-/60 dark:text-blue- border border-blue-/80 dark:border-blue-/60">
                      {project.key}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">
                        {stats.total} {stats.total === 1 ? 'task' : 'tasks'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProject(e, project)}
                        title="Delete project"
                        aria-label="Delete project"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue- dark:group-hover:text-blue- transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-blue- dark:text-blue-">
                        {stats.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue- dark:bg-blue- rounded-full transition-all"
                        style={{ width: `${stats.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{stats.completed} done</span>
                    </div>
                    <span className="flex items-center gap-1 text-blue- dark:text-blue- group-hover:translate-x-1 transition-transform font-semibold">
                      Open Board &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!key) {
                setKey(e.target.value.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, ''));
              }
            }}
            placeholder="e.g. Core Platform V2"
          />

          <Input
            label="Project Key (uppercase alphanumeric)"
            required
            maxLength={6}
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder="e.g. CORE"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the goal of this project?"
              className="w-full px-3.5 py-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-/40 focus:border-blue-"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Creating project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};