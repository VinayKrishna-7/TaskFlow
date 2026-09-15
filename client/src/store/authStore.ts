import { create } from 'zustand';
import { IUser } from '../types';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: IUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

import { useWorkspaceStore } from './workspaceStore';

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('taskflow_user') || 'null'),
  accessToken: localStorage.getItem('taskflow_access_token'),
  refreshToken: localStorage.getItem('taskflow_refresh_token'),
  isAuthenticated: !!localStorage.getItem('taskflow_access_token'),
  isLoading: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('taskflow_user', JSON.stringify(user));
    localStorage.setItem('taskflow_access_token', accessToken);
    localStorage.setItem('taskflow_refresh_token', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('taskflow_access_token', accessToken);
    localStorage.setItem('taskflow_refresh_token', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('taskflow_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('taskflow_user');
    localStorage.removeItem('taskflow_access_token');
    localStorage.removeItem('taskflow_refresh_token');
    localStorage.removeItem('taskflow_active_workspace');
    localStorage.removeItem('taskflow_active_project');
    try {
      useWorkspaceStore.getState().setActiveWorkspace(null);
      useWorkspaceStore.getState().setActiveProject(null);
      useWorkspaceStore.getState().setWorkspaces([]);
    } catch (e) {
      console.warn('Error clearing workspace state on logout:', e);
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));