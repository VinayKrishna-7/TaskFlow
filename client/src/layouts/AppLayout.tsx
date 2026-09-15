import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { api } from '../lib/axios';

import { ToastContainer } from '../components/common/ToastContainer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, accessToken, user, setUser } = useAuthStore();
  const {
    workspaces,
    setWorkspaces,
    activeWorkspace,
    setActiveWorkspace,
    activeProject,
    setActiveProject,
  } = useWorkspaceStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Socket connection lifecycle
  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken);

      // Verify and refresh current user profile
      api.get('/auth/me').then((meRes) => {
        if (meRes.data?.data?.user) {
          setUser(meRes.data.data.user);
        }
      }).catch((meErr) => {
        console.warn('Session verification note:', meErr?.message);
      });

      // Initial workspaces fetch
      api
        .get('/workspaces')
        .then(async (res) => {
          let wsList = res.data?.data?.workspaces || [];
          if (wsList.length === 0 && user) {
            try {
              const createWsRes = await api.post('/workspaces', {
                name: `${user.name}'s Workspace`,
                description: 'Primary workspace for projects and task management',
              });
              const createdWs = createWsRes.data?.data?.workspace;
              if (createdWs) {
                wsList = [createdWs];
              }
            } catch (createErr) {
              console.error('Auto-create workspace error:', createErr);
            }
          }
          setWorkspaces(wsList);
          const isValid = activeWorkspace && wsList.some((w: any) => w._id === activeWorkspace._id);
          if (!isValid) {
            setActiveWorkspace(wsList.length > 0 ? wsList[0] : null);
          }
        })
        .catch((err) => console.error(err));

      return () => {
        disconnectSocket();
      };
    }
  }, [accessToken]);

  // Keep activeProject synchronized with current activeWorkspace
  useEffect(() => {
    if (activeWorkspace?._id) {
      api
        .get(`/projects?workspaceId=${activeWorkspace._id}`)
        .then((res) => {
          const projects = res.data?.data?.projects || [];
          if (projects.length > 0) {
            if (!activeProject || activeProject.workspace !== activeWorkspace._id) {
              setActiveProject(projects[0]);
            }
          } else {
            setActiveProject(null);
          }
        })
        .catch((err) => console.error('Error fetching workspace projects:', err));
    }
  }, [activeWorkspace?._id]);

  return (
    <div className="flex min-h-screen bg-[#FAF6EE] dark:bg-[#0B0F17] text-[#2C1810] dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};