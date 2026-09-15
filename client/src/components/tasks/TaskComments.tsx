import React, { useState, useEffect } from 'react';
import { IComment } from '../../types';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../lib/socket';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from '../../store/toastStore';
import { confirm } from '../../store/confirmStore';
import { Avatar } from '../common/Avatar';

interface TaskCommentsProps {
  taskId: string;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${taskId}`);
      setComments(res.data.data.comments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();

    const socket = getSocket();
    if (socket) {
      const handleNewComment = (comment: IComment) => {
        if (comment.task === taskId) {
          setComments((prev) => [...prev, comment]);
        }
      };
      socket.on('comment:created', handleNewComment);
      return () => {
        socket.off('comment:created', handleNewComment);
      };
    }
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/comments/${taskId}`, { content: content.trim() });
      setContent('');
      fetchComments();
      toast.success('Comment added.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (commentId: string) => {
    confirm({
      title: 'Delete comment?',
      description: 'This comment will be permanently removed.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/comments/${commentId}`);
          setComments((prev) => prev.filter((c) => c._id !== commentId));
          toast.success('Comment deleted.');
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to delete comment.');
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue- dark:text-blue-" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Comments ({comments.length})
        </h4>
      </div>

      {/* Comments feed */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No comments yet. Mention team members with @username.</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="p-3 bg-slate-50 dark:bg-[#111827]/70 rounded-2xl border border-slate-100 dark:border-slate-800/80 group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Avatar src={c.author?.avatar} name={c.author?.name} size="xs" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.author?.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {(user?._id === c.author?._id || user?.role === 'ADMIN') && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c._id)}
                    title="Delete comment"
                    aria-label="Delete comment"
                    className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment or mention @username..."
          className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-/40"
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-blue- hover:bg-blue- text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};