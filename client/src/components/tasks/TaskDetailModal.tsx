import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SubtasksList } from './SubtasksList';
import { TimeTracker } from './TimeTracker';
import { TaskComments } from './TaskComments';
import { ITask, TaskPriority, TaskStatus, IUser } from '../../types';
import { api } from '../../lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../../store/toastStore';
import { confirm } from '../../store/confirmStore';
import {
  Calendar,
  Paperclip,
  Trash2,
  Copy,
  Upload,
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  members?: IUser[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  isOpen,
  onClose,
  members = [],
}) => {
  const [task, setTask] = useState<ITask | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const [taskRes, actRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/activity/task/${taskId}`),
      ]);
      setTask(taskRes.data.data.task);
      setActivities(actRes.data.data.activities);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  if (!task) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Task Details" maxWidth="4xl">
        <div className="space-y-4 p-4 animate-pulse">
          <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </Modal>
    );
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTaskDetails();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    try {
      await api.put(`/tasks/${task._id}`, { priority: newPriority });
      fetchTaskDetails();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task priority updated.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update priority.');
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    try {
      await api.put(`/tasks/${task._id}`, { assignee: newAssigneeId || null });
      fetchTaskDetails();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task assignee updated.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update assignee.');
    }
  };

  const handleDelete = () => {
    confirm({
      title: 'Delete task?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/tasks/${task._id}`);
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          toast.success('Task deleted.');
          onClose();
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to delete task.');
        }
      },
    });
  };

  const handleDuplicate = async () => {
    try {
      await api.post(`/tasks/${task._id}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task duplicated.');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to duplicate task.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      await api.post(`/tasks/${task._id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchTaskDetails();
      toast.success('Attachment uploaded.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} maxWidth="4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue- text-blue- dark:text-blue-'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Details & Subtasks
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'comments'
                  ? 'border-b-2 border-blue- text-blue- dark:text-blue-'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'activity'
                  ? 'border-b-2 border-blue- text-blue- dark:text-blue-'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Activity Timeline
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Description
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-[#111827]/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Subtasks checklist */}
              <SubtasksList
                taskId={task._id}
                subtasks={task.subtasks || []}
                onUpdate={fetchTaskDetails}
              />

              {/* Attachments list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    Attachments ({task.attachments?.length || 0})
                  </h4>
                  <label className="cursor-pointer text-xs text-blue- dark:text-blue- font-semibold hover:underline flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {task.attachments?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No attachments uploaded</p>
                  ) : (
                    task.attachments?.map((att) => (
                      <a
                        key={att.id}
                        href={`http://localhost:5000${att.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">{att.originalName}</span>
                        <span className="text-[10px] text-slate-400">({Math.round(att.size / 1024)} KB)</span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && <TaskComments taskId={task._id} />}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No activities recorded yet.</p>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5">
                      {act.actor?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-slate-200">
                        <span className="font-semibold">{act.actor?.name}</span> {act.action.replace('_', ' ').toLowerCase()}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {format(new Date(act.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Metadata Controls & Time Tracking */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/80 dark:bg-[#111827]/70 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-/40"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-/40"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assignee
              </label>
              <select
                value={task.assignee?._id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-/40"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {task.dueDate && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Due Date
                </label>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Time Tracking Widget */}
          <TimeTracker
            taskId={task._id}
            estimatedHours={task.estimatedHours}
            actualHours={task.actualHours}
            onUpdate={fetchTaskDetails}
          />

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDuplicate}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};