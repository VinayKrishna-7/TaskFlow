import { create } from 'zustand';
import { IWorkspace, IProject } from '../types';

interface WorkspaceState {
  workspaces: IWorkspace[];
  activeWorkspace: IWorkspace | null;
  activeProject: IProject | null;
  setWorkspaces: (workspaces: IWorkspace[]) => void;
  setActiveWorkspace: (workspace: IWorkspace | null) => void;
  setActiveProject: (project: IProject | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspace: JSON.parse(localStorage.getItem('taskflow_active_workspace') || 'null'),
  activeProject: JSON.parse(localStorage.getItem('taskflow_active_project') || 'null'),

  setWorkspaces: (workspaces) => {
    set({ workspaces });
  },

  setActiveWorkspace: (workspace) => {
    if (workspace) {
      localStorage.setItem('taskflow_active_workspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('taskflow_active_workspace');
    }
    set({ activeWorkspace: workspace });
  },

  setActiveProject: (project) => {
    if (project) {
      localStorage.setItem('taskflow_active_project', JSON.stringify(project));
    } else {
      localStorage.removeItem('taskflow_active_project');
    }
    set({ activeProject: project });
  },
}));