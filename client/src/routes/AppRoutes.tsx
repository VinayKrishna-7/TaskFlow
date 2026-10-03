import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

// Lazy-loaded pages for fast initial bundle and zero-lag loading
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TasksPage = lazy(() => import('../pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const CalendarPage = lazy(() => import('../pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const TeamPage = lazy(() => import('../pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoader: React.FC = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
    <div className="w-7 h-7 border-2 border-maroon-600 dark:border-[#992355] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-medium text-[#7C6E65]">Loading...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let pageTitle = 'TaskFlow — Project & Task Management';
    if (path.includes('/dashboard')) pageTitle = 'Dashboard · TaskFlow';
    else if (path.includes('/tasks')) pageTitle = 'My Tasks · TaskFlow';
    else if (path.includes('/projects')) pageTitle = 'Projects · TaskFlow';
    else if (path.includes('/calendar')) pageTitle = 'Calendar · TaskFlow';
    else if (path.includes('/team')) pageTitle = 'Team · TaskFlow';
    else if (path.includes('/analytics')) pageTitle = 'Analytics · TaskFlow';
    else if (path.includes('/settings') || path.includes('/profile')) pageTitle = 'Settings · TaskFlow';
    else if (path.includes('/login')) pageTitle = 'Sign In · TaskFlow';
    else if (path.includes('/register')) pageTitle = 'Create Account · TaskFlow';
    else if (path.includes('/forgot-password')) pageTitle = 'Forgot Password · TaskFlow';
    else if (path.includes('/reset-password')) pageTitle = 'Reset Password · TaskFlow';
    
    document.title = pageTitle;
  }, [location]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected SaaS Layout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id/*" element={<ProjectDetailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<SettingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};