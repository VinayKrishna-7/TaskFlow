import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TaskPriority, TaskStatus, IUser, IProject } from '../../types';
import { api } from '../../lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../../store/toastStore';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projects?: IProject[];
  workspaceId: string;
  defaultStatus?: TaskStatus;
  members?: IUser[];
  defaultDueDate?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projects,
  workspaceId,
  defaultStatus = 'TODO',
  members = [],
  defaultDueDate,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState(defaultDueDate || '');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [labels, setLabels] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('NONE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (defaultDueDate) {
      setDueDate(defaultDueDate);
    }
  }, [defaultDueDate, isOpen]);

  React.useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    } else if (projects && projects.length > 0) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projectId, projects, isOpen]);

  const effectiveProjectId = selectedProjectId || projectId || (projects?.[0]?._id ?? '');
  const currentMembers =
    (projects?.find((p) => p._id === effectiveProjectId)?.members?.length
      ? projects.find((p) => p._id === effectiveProjectId)?.members
      : members) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/tasks', {
        project: effectiveProjectId,
        workspace: workspaceId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee: assignee || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
        labels: labels ? labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
        recurrence: {
          type: recurrenceType,
          interval: 1,
        },
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created.');
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('MEDIUM');
      setAssignee('');
      setDueDate('');
      setEstimatedHours('');
      setLabels('');
      setRecurrenceType('NONE');
    } catch (err: any) {
      console.error('Failed to create task:', err);
      toast.error(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {projects && projects.length > 1 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={effectiveProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500"
            >
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Task Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Design responsive dashboard UI"
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description, requirements, or acceptance criteria..."
            className="w-full px-3.5 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Assignee
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {currentMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Estimated Hours"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Recurrence
            </label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500"
            >
              <option value="NONE">None</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        </div>

        <Input
          label="Labels (comma separated)"
          placeholder="Frontend, Bug, UI"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E6DACB] dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating task...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};