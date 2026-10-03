import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  Sparkles,
  Check,
  Trash2,
  Clock,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
} from 'lucide-react';
import { api } from '../../lib/axios';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IProject } from '../../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  workspaceId?: string;
}

interface GeneratedTask {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
}

const QUICK_PROMPTS = [
  { label: '🛒 E-Commerce & Stripe', prompt: 'Build an e-commerce platform with cart and Stripe payment checkout' },
  { label: '🔐 Auth & 2FA', prompt: 'Implement JWT authentication with Two-Factor 2FA and RBAC permissions' },
  { label: '📱 Mobile App UI', prompt: 'Design and build cross-platform mobile app with offline synchronization' },
  { label: '🎨 Landing Page Redesign', prompt: 'Redesign marketing landing page with interactive showcase and dark mode' },
  { label: '🚀 DevOps & CI/CD', prompt: 'Containerize application with Docker, set up GitHub Actions CI/CD pipeline' },
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  projectId,
  workspaceId,
}) => {
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingProgress, setCreatingProgress] = useState<{ current: number; total: number } | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const queryClient = useQueryClient();

  const effectiveWorkspaceId = workspaceId || activeWorkspace?._id;

  // Fetch available projects for workspace
  const { data: workspaceProjects = [] } = useQuery({
    queryKey: ['projects', effectiveWorkspaceId],
    queryFn: async () => {
      if (!effectiveWorkspaceId) return [];
      const res = await api.get(`/projects?workspaceId=${effectiveWorkspaceId}`);
      return (res.data?.data?.projects || []) as IProject[];
    },
    enabled: !!effectiveWorkspaceId && isOpen,
    staleTime: 0,
  });

  // Target project selection
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Automatically sync target project: respect user selection, newly created projects, and full workspace list
  useEffect(() => {
    // 1. If explicit projectId prop passed (e.g. on ProjectDetailPage), use it
    if (projectId) {
      setSelectedProjectId(projectId);
      return;
    }

    // 2. If user already picked a valid project that exists in current workspaceProjects, preserve it
    if (selectedProjectId && workspaceProjects.some((p) => p._id === selectedProjectId)) {
      return;
    }

    // 3. If activeProject exists in workspaceProjects, default to it
    if (activeProject?._id && workspaceProjects.some((p) => p._id === activeProject._id)) {
      setSelectedProjectId(activeProject._id);
      return;
    }

    // 4. Default to the newest/first project in the workspace
    if (workspaceProjects.length > 0) {
      setSelectedProjectId(workspaceProjects[0]._id);
    }
  }, [projectId, activeProject?._id, workspaceProjects, selectedProjectId]);

  const targetProject = workspaceProjects.find((p) => p._id === selectedProjectId);

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt !== undefined ? customPrompt : prompt;
    const trimmed = textToUse.trim();

    if (!trimmed) {
      setErrorMessage('Please describe the goal or feature you want to build.');
      return;
    }
    if (trimmed.length < 3) {
      setErrorMessage('Prompt must be at least 3 characters long.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsGenerating(true);
    try {
      const res = await api.post('/ai/breakdown', { prompt: trimmed });
      setGeneratedTasks(res.data.data.tasks);
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to generate task plan. Please try again with a descriptive prompt.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemove = (index: number) => {
    setGeneratedTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTask = (index: number, updates: Partial<GeneratedTask>) => {
    setGeneratedTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...updates } : t))
    );
  };

  const handleCreateAll = async () => {
    if (!effectiveWorkspaceId) {
      setErrorMessage('No active workspace found. Please select a workspace.');
      return;
    }

    let finalProjectId = selectedProjectId;

    // If no projects exist in the workspace, create one automatically
    if (!finalProjectId) {
      if (workspaceProjects.length > 0) {
        finalProjectId = workspaceProjects[0]._id;
      } else {
        setIsCreating(true);
        try {
          const newProjRes = await api.post('/projects', {
            workspace: effectiveWorkspaceId,
            name: 'General Project',
            key: 'GEN',
            description: 'Auto-generated project for AI Planner tasks',
          });
          finalProjectId = newProjRes.data.data.project._id;
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        } catch (projErr) {
          setErrorMessage('Please create a project first before adding tasks.');
          setIsCreating(false);
          return;
        }
      }
    }

    if (generatedTasks.length === 0) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsCreating(true);
    setCreatingProgress({ current: 0, total: generatedTasks.length });

    try {
      for (let i = 0; i < generatedTasks.length; i++) {
        const t = generatedTasks[i];
        setCreatingProgress({ current: i + 1, total: generatedTasks.length });
        await api.post('/tasks', {
          project: finalProjectId,
          workspace: effectiveWorkspaceId,
          title: t.title,
          description: t.description,
          priority: t.priority,
          estimatedHours: t.estimatedHours,
          status: 'TODO',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      const targetProj = workspaceProjects.find((p) => p._id === finalProjectId);
      setSuccessMessage(
        `Successfully scheduled ${generatedTasks.length} tasks in ${targetProj?.name || 'project'}!`
      );
      setGeneratedTasks([]);
      setPrompt('');

      // Auto-close after brief confirmation
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create tasks:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save generated tasks to project.');
    } finally {
      setIsCreating(false);
      setCreatingProgress(null);
    }
  };

  const priorityColors = {
    LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#E6DACB] dark:border-slate-700',
    MEDIUM: 'bg-maroon-50 text-maroon-700 dark:bg-[#38061B]/60 dark:text-[#F9CFE2] border border-maroon-200/80 dark:border-[#821946]/60',
    HIGH: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    URGENT: 'bg-rose-50 dark:bg-[#38061B]/60 text-rose-700 dark:text-[#F9CFE2] border-rose-200/80 dark:border-[#821946]/60',
  };

  // Sticky modal footer
  const modalFooter = (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <FolderKanban className="w-4 h-4 text-maroon-700 dark:text-[#F9CFE2] flex-shrink-0" />
        <span className="text-xs font-semibold text-[#4A3B32] dark:text-slate-300 whitespace-nowrap">
          Target:
        </span>
        {workspaceProjects.length > 0 ? (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1.5 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#2C1810] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 truncate max-w-[200px]"
          >
            {workspaceProjects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-[#7C6E65] italic">Auto-creates project</span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isCreating}
        >
          Cancel
        </Button>
        {generatedTasks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGeneratedTasks([])}
            disabled={isCreating}
          >
            Clear
          </Button>
        )}
        <Button
          onClick={handleCreateAll}
          isLoading={isCreating}
          disabled={generatedTasks.length === 0 || isGenerating}
          size="sm"
        >
          {isCreating && creatingProgress ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              Adding ({creatingProgress.current}/{creatingProgress.total})...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 mr-1" />
              Add {generatedTasks.length > 0 ? `${generatedTasks.length} Tasks` : 'Tasks'}{targetProject ? ` to ${targetProject.name}` : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Task Planner & Breakdown"
      maxWidth="3xl"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* Intro banner */}
        {!generatedTasks.length && (
          <div className="p-3 bg-maroon-50/70 dark:bg-[#38061B]/40 border border-maroon-200/80 dark:border-[#821946]/60 rounded-xl flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-maroon-600 dark:bg-[#992355] text-white flex-shrink-0 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-[#4A3B32] dark:text-slate-200 leading-relaxed">
              <span className="font-bold text-maroon-700 dark:text-[#F9CFE2]">
                Intelligent Project Decomposition:
              </span>{' '}
              Describe a goal or feature. AI Planner will architect actionable development tasks with estimates and priorities ready to add to your board.
            </div>
          </div>
        )}

        {/* Prominent Target Project Selector Banner */}
        <div className="p-3.5 bg-[#FAF6EE] dark:bg-[#000000] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-maroon-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2C1810] dark:text-slate-100">
                  Target Project:
                </span>
                {targetProject && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-maroon-50 dark:bg-[#38061B]/80 text-maroon-700 dark:text-[#F9CFE2] border border-maroon-200/80 dark:border-[#821946]/60">
                    {targetProject.key}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7C6E65] dark:text-slate-400">
                Choose which created project will receive these tasks
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {workspaceProjects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full sm:w-auto min-w-[220px] px-3 py-2 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-xs font-bold text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 cursor-pointer shadow-xs"
              >
                {workspaceProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">
                No projects created yet (will auto-create)
              </span>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-[#38061B]/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-[#E66E9F] flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Input & Action */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            What do you want to build or plan?
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. Build authentication with 2FA, or Design Stripe checkout flow"
              className="flex-1 px-4 py-2.5 bg-[#FFFDF9] dark:bg-[#000000] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-[#992355] shadow-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button
              onClick={() => handleGenerate()}
              isLoading={isGenerating}
              disabled={!prompt.trim()}
              className="flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Generate Plan
            </Button>
          </div>

          {/* Quick-Start Suggestion Chips */}
          <div className="pt-1.5">
            <span className="text-[11px] font-semibold text-[#7C6E65] block mb-1.5">
              Quick prompts to try:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(item.prompt);
                    handleGenerate(item.prompt);
                  }}
                  className="px-2.5 py-1 bg-slate-100/80 hover:bg-maroon-50 dark:bg-slate-800/80 dark:hover:bg-blue-950/50 border border-[#E6DACB]/80 dark:border-slate-700/80 hover:border-maroon-200 dark:hover:border-blue-700/60 rounded-lg text-[11px] font-medium text-[#4A3B32] dark:text-slate-300 hover:text-maroon-700 dark:hover:text-[#F9CFE2] transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isGenerating && (
          <div className="p-8 text-center space-y-3 bg-slate-50/50 dark:bg-[#000000]/50 border border-dashed border-maroon-200 dark:border-[#821946]/60 rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-maroon-700 dark:text-[#F9CFE2] mx-auto" />
            <p className="text-xs font-semibold text-[#4A3B32] dark:text-slate-300">
              AI Planner is architecting tasks, estimates, and milestones...
            </p>
          </div>
        )}

        {/* Generated Plan Section */}
        {generatedTasks.length > 0 && !isGenerating && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C6E65] dark:text-slate-400 flex items-center gap-2">
                <span>Proposed Tasks ({generatedTasks.length})</span>
                <span className="text-maroon-700 dark:text-[#F9CFE2] bg-maroon-50 dark:bg-[#38061B]/60 border border-maroon-200/80 dark:border-[#821946]/60 px-2 py-0.5 rounded-full text-[11px]">
                  Ready to add
                </span>
              </h4>
              <span className="text-xs font-semibold text-[#7C6E65] dark:text-slate-400">
                Total Est: <span className="text-maroon-700 dark:text-[#F9CFE2] font-bold">{generatedTasks.reduce((acc, curr) => acc + curr.estimatedHours, 0)}h</span>
              </span>
            </div>

            {/* Task list */}
            <div className="space-y-2.5">
              {generatedTasks.map((t, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-slate-50/70 dark:bg-[#000000] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl flex items-start justify-between gap-3 group hover:border-maroon-200 dark:hover:border-blue-500/50 transition-all shadow-xs"
                >
                  <div className="flex-1 min-w-0">
                    {/* Header: Number, Title, and Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-maroon-50 dark:bg-[#38061B] text-maroon-700 dark:text-[#F9CFE2] text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-maroon-200/60 dark:border-[#821946]/60">
                        {index + 1}
                      </span>
                      <h5 className="text-xs font-bold text-[#2C1810] dark:text-slate-100 flex-1 min-w-[200px] break-words">
                        {t.title}
                      </h5>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityColors[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-[11px] font-medium text-[#7C6E65] dark:text-slate-400 flex items-center gap-1 bg-[#FFFDF9] dark:bg-[#0D0D0D] px-2 py-0.5 rounded-full border border-[#E6DACB] dark:border-slate-800">
                          <Clock className="w-3 h-3 text-maroon-700 dark:text-[#F9CFE2]" /> {t.estimatedHours}h
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed break-words">
                      {t.description}
                    </p>
                  </div>

                  {/* Remove Action */}
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-1.5 text-[#7C6E65] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    title="Remove task"
                    aria-label="Remove task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};