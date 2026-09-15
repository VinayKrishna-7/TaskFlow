import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAuthStore } from '../store/authStore';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { CardSkeleton, EmptyState, ErrorState } from '../components/common/EmptyState';
import { toast } from '../store/toastStore';
import { confirm } from '../store/confirmStore';

export const TeamPage: React.FC = () => {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const effectiveWorkspace = activeWorkspace || (workspaces.length > 0 ? workspaces[0] : null);

  useEffect(() => {
    if (!activeWorkspace && effectiveWorkspace) {
      setActiveWorkspace(effectiveWorkspace);
    }
  }, [activeWorkspace, effectiveWorkspace, setActiveWorkspace]);

  const {
    data: workspaceData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['workspace', effectiveWorkspace?._id],
    queryFn: async () => {
      if (!effectiveWorkspace?._id) return null;
      const res = await api.get(`/workspaces/${effectiveWorkspace._id}`);
      return res.data.data.workspace;
    },
    enabled: !!effectiveWorkspace?._id,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', effectiveWorkspace?._id],
    queryFn: async () => {
      if (!effectiveWorkspace?._id) return null;
      const res = await api.get(`/analytics/workspace/${effectiveWorkspace._id}`);
      return res.data.data.analytics;
    },
    enabled: !!effectiveWorkspace?._id,
  });

  const rawMembers = workspaceData?.memberDetails || [];
  const members: any[] = (rawMembers.length > 0
    ? rawMembers
    : (workspaceData?.members || []).map((u: any) => ({
        _id: u._id,
        role:
          u._id === workspaceData?.owner?._id || u._id === workspaceData?.owner
            ? 'OWNER'
            : 'MEMBER',
        user: u,
      }))
  ).filter((m: any) => m && m.user);

  // If still empty but owner is defined
  if (members.length === 0 && workspaceData?.owner) {
    const ownerObj = typeof workspaceData.owner === 'object' ? workspaceData.owner : null;
    if (ownerObj) {
      members.push({
        _id: ownerObj._id,
        role: 'OWNER',
        user: ownerObj,
      });
    }
  }

  const teamWorkload = analytics?.teamWorkload || [];

  const currentUserMembership = members.find(
    (m: any) => (m.user?._id || m.user) === user?._id
  );
  const isOwner =
    workspaceData?.owner?._id === user?._id ||
    workspaceData?.owner === user?._id ||
    currentUserMembership?.role === 'OWNER';
  const canManageMembers =
    isOwner ||
    currentUserMembership?.role === 'ADMIN' ||
    user?.role === 'ADMIN';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !effectiveWorkspace?._id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/workspaces/${effectiveWorkspace._id}/invite`, {
        emailOrUsername: emailOrUsername.trim(),
        role,
      });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Invitation sent.');
      setIsInviteOpen(false);
      setEmailOrUsername('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send invite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = (memberUserId: string, memberName: string) => {
    confirm({
      title: 'Remove member?',
      description: `Revoke workspace access for ${memberName}. They will no longer be able to collaborate on workspace projects.`,
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/workspaces/${effectiveWorkspace?._id}/members/${memberUserId}`);
          queryClient.invalidateQueries({ queryKey: ['workspace'] });
          queryClient.invalidateQueries({ queryKey: ['workspaces'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          toast.success('Member removed.');
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to remove member.');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
            Team & Members
          </h1>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Collaborators, roles, and workload distributions ({members.length}{' '}
            {members.length === 1 ? 'member' : 'members'})
          </p>
        </div>
        {canManageMembers && (
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-maroon-900/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {isLoading || (!effectiveWorkspace && workspaces.length === 0) ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState message="Failed to load workspace team members." onRetry={() => refetch()} />
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-maroon-700 dark:text-blue-400" />}
          title="No team members yet"
          description="Invite your team to collaborate on projects, assign tasks, and track workload together."
          actionText={canManageMembers ? 'Invite Member' : undefined}
          onAction={canManageMembers ? () => setIsInviteOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m: any) => {
            const memberUser = m.user || {};
            const memberId = memberUser._id || m._id;
            const memberName = memberUser.name || 'Team Member';
            const memberUsername =
              memberUser.username || memberName.toLowerCase().replace(/\s+/g, '_');
            const memberAvatar = memberUser.avatar;

            const stats = teamWorkload.find(
              (w: any) => (w.user?._id || w.user) === memberId
            ) || {
              total: 0,
              completed: 0,
              pending: 0,
              actualHours: 0,
            };

            const isMemberOwner =
              m.role === 'OWNER' ||
              workspaceData?.owner?._id === memberId ||
              workspaceData?.owner === memberId;
            const isSelf = memberId === user?._id;

            return (
              <div
                key={m._id || memberId}
                className="p-5 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-4 relative group"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar src={memberAvatar} name={memberName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#2C1810] dark:text-slate-100 truncate">
                      {memberName}
                    </h3>
                    <p className="text-xs text-[#7C6E65] truncate">@{memberUsername}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-maroon-50 text-maroon-700 dark:bg-blue-950/60 dark:text-blue-300 border border-maroon-200/80 dark:border-blue-800/60">
                      {m.role || (isMemberOwner ? 'OWNER' : 'MEMBER')}
                    </span>
                    {canManageMembers && !isMemberOwner && !isSelf && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(memberId, memberName)}
                        title="Remove member"
                        aria-label={`Remove ${memberName}`}
                        className="p-1 text-[#7C6E65] hover:text-rose-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#E6DACB]/60 dark:border-slate-800/80">
                  <div className="p-2 bg-[#FAF6EE] dark:bg-[#0B0F17] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-[#7C6E65]">Assigned</span>
                    <p className="text-xs font-bold text-[#2C1810] dark:text-slate-200">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-2 bg-[#FAF6EE] dark:bg-[#0B0F17] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-[#7C6E65]">Done</span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="p-2 bg-[#FAF6EE] dark:bg-[#0B0F17] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-[#7C6E65]">Logged</span>
                    <p className="text-xs font-bold text-[#2C1810] dark:text-slate-200">
                      {stats.actualHours}h
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email or Username"
            required
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="colleague@taskflow.dev or username"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Workspace Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
              className="w-full px-3.5 py-2 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500 cursor-pointer"
            >
              <option value="MEMBER">Member (standard project collaborator)</option>
              <option value="ADMIN">Admin (can manage members & projects)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E6DACB] dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Sending invite...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};