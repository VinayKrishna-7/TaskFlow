import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { UserRole } from '../types';
import { api } from '../lib/axios';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { toast } from '../store/toastStore';
import {
  User,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Mail,
  AtSign,
  Image,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Check,
  Palette,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, setUser, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [username, setUsername] = useState(user?.username || '');
  const [role, setRole] = useState<UserRole>((user?.role as UserRole) || 'USER');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setUsername(user.username || '');
      setRole((user.role as UserRole) || 'USER');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      setProfileError('Username must be at least 3 characters long.');
      setIsUpdatingProfile(false);
      return;
    }

    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        avatar: avatar.trim(),
        username: cleanUsername,
        role,
      });
      setUser(res.data.data.user);
      setProfileSuccess('Profile details updated successfully!');
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile details.';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      toast.error('New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPassSuccess('Password updated successfully!');
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password. Please check your current password.';
      setPassError(msg);
      toast.error(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDirectLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header with Direct Logout Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
            Account Settings
          </h1>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Manage your personal profile, appearance preferences, and account security
          </p>
        </div>

        <button
          type="button"
          onClick={handleDirectLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-[#38061B]/40 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-600 dark:text-[#E66E9F] transition-colors shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Appearance & Theme Selector Card */}
      <div className="p-6 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6DACB]/60 dark:border-slate-800/80">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 flex items-center gap-2">
            <Palette className="w-4 h-4 text-maroon-700 dark:text-[#F9CFE2]" />
            Appearance & Theme
          </h2>
          <span className="text-xs text-[#7C6E65]">
            Current: <span className="font-semibold capitalize text-[#4A3B32] dark:text-slate-200">{theme}</span>
          </span>
        </div>

        <p className="text-xs text-[#7C6E65] dark:text-slate-400">
          Customize how TaskFlow looks across your device. Switch between light, dark, or sync with your operating system.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              theme === 'light' ? 'border-maroon-600 dark:border-[#992355] bg-maroon-50/40 dark:bg-[#38061B]/30 ring-2 ring-maroon-600/30 dark:ring-[#992355]/30 shadow-sm'
                : 'border-[#E6DACB] dark:border-slate-800 hover:border-[#E6DACB] dark:hover:border-slate-700 bg-[#FFFDF9] dark:bg-[#0D0D0D]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              {theme === 'light' && (
                <span className="w-5 h-5 rounded-full bg-maroon-600 dark:bg-[#992355] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C1810] dark:text-slate-100">Light Mode</p>
              <p className="text-[11px] text-[#7C6E65]">Clean & bright porcelain</p>
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              theme === 'dark' ? 'border-maroon-600 dark:border-[#992355] bg-maroon-50/40 dark:bg-[#38061B]/30 ring-2 ring-maroon-600/30 dark:ring-[#992355]/30 shadow-sm'
                : 'border-[#E6DACB] dark:border-slate-800 hover:border-[#E6DACB] dark:hover:border-slate-700 bg-[#FFFDF9] dark:bg-[#0D0D0D]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-maroon-50 dark:bg-[#38061B]/50 text-maroon-700 dark:text-[#F9CFE2]">
                <Moon className="w-5 h-5" />
              </div>
              {theme === 'dark' && (
                <span className="w-5 h-5 rounded-full bg-maroon-600 dark:bg-[#992355] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C1810] dark:text-slate-100">Dark Mode</p>
              <p className="text-[11px] text-[#7C6E65]">Deep obsidian & zinc</p>
            </div>
          </button>

          {/* System Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              theme === 'system' ? 'border-maroon-600 dark:border-[#992355] bg-maroon-50/40 dark:bg-[#38061B]/30 ring-2 ring-maroon-600/30 dark:ring-[#992355]/30 shadow-sm'
                : 'border-[#E6DACB] dark:border-slate-800 hover:border-[#E6DACB] dark:hover:border-slate-700 bg-[#FFFDF9] dark:bg-[#0D0D0D]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Laptop className="w-5 h-5" />
              </div>
              {theme === 'system' && (
                <span className="w-5 h-5 rounded-full bg-maroon-600 dark:bg-[#992355] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C1810] dark:text-slate-100">System Auto</p>
              <p className="text-[11px] text-[#7C6E65]">Syncs with device OS</p>
            </div>
          </button>
        </div>
      </div>

      {/* User Details Profile Card */}
      <div className="p-6 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6DACB]/60 dark:border-slate-800/80">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-maroon-700 dark:text-[#F9CFE2]" />
            User Details
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-maroon-50 text-maroon-700 dark:bg-[#38061B]/60 dark:text-[#F9CFE2] border border-maroon-200 dark:border-[#821946] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {user?.role}
          </span>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3 bg-rose-50 dark:bg-[#38061B]/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-[#E66E9F]">
            {profileError}
          </div>
        )}

        {/* Profile Avatar Preview */}
        <div className="flex items-center gap-4 py-2">
          <Avatar
            name={name || user?.name || 'User'}
            avatarUrl={avatar}
            size="xl"
            className="border-2 border-maroon-200 dark:border-[#992355] shadow-sm"
          />
          <div>
            <h3 className="text-sm font-bold text-[#2C1810] dark:text-slate-100">{name || user?.name}</h3>
            <p className="text-xs text-[#7C6E65]">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your full name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-[#7C6E65]" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="unique_username"
                className="w-full px-3.5 py-2 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-[#992355] transition-all shadow-xs"
              />
              <p className="mt-1 text-[11px] text-[#7C6E65]">Custom handle for tagging and collaboration.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7C6E65]" />
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-[#992355] transition-all shadow-xs"
              >
                <option value="USER">Member (Tasks & Projects)</option>
                <option value="PROJECT_MANAGER">Project Manager (Create & Manage Projects)</option>
                <option value="ADMIN">Administrator (Full Control)</option>
              </select>
              <p className="mt-1 text-[11px] text-[#7C6E65]">Your role across workspaces.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#7C6E65]" />
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3.5 py-2 bg-slate-100/70 dark:bg-slate-800/50 border border-[#E6DACB] dark:border-slate-800 rounded-xl text-sm text-[#7C6E65] cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-[#7C6E65]">Primary authentication identity (cannot be changed).</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-[#7C6E65]" />
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/... or leave blank"
              className="w-full px-3.5 py-2 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isUpdatingProfile}>
              Save Profile Details
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="p-6 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-5">
        <div className="pb-3 border-b border-[#E6DACB]/60 dark:border-slate-800/80">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-maroon-700 dark:text-[#F9CFE2]" />
            Security & Password
          </h2>
          <p className="text-[11px] text-[#7C6E65] mt-0.5">
            Ensure your account uses a secure password with at least 8 characters
          </p>
        </div>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="p-3 bg-rose-50 dark:bg-[#38061B]/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-[#E66E9F]">
            {passError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter new password"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isChangingPass}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Account Session / Direct Logout Card */}
      <div className="p-6 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              Account Session
            </h2>
            <p className="text-xs text-[#7C6E65] dark:text-slate-400">
              Sign out of your TaskFlow account on this device. You can log back in at any time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDirectLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-600/20 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Log Out Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};