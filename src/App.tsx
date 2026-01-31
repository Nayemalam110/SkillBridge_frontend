import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SiteProvider } from '@/contexts/SiteContext';
import { PublicLayout, DashboardLayout } from '@/components/Layout';
import { ScrollToTop } from '@/components/ScrollToTop';

// Public pages
import { HomePage } from '@/pages/public/HomePage';
import { JobsPage } from '@/pages/public/JobsPage';
import { JobDetailPage } from '@/pages/public/JobDetailPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';

// Job Seeker pages
import { SeekerDashboard } from '@/pages/seeker/Dashboard';
import { SeekerApplications } from '@/pages/seeker/Applications';
import { SeekerTasks } from '@/pages/seeker/Tasks';
import { SeekerProfile } from '@/pages/seeker/Profile';

// Super Admin pages
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminStacks } from '@/pages/admin/Stacks';
import { AdminJobs } from '@/pages/admin/Jobs';
import { AdminApplications } from '@/pages/admin/Applications';
import { AdminAdmins } from '@/pages/admin/Admins';
import { AdminSettings } from '@/pages/admin/Settings';

// Stack Admin pages
import { StackAdminDashboard } from '@/pages/stackadmin/Dashboard';
import { StackAdminJobs } from '@/pages/stackadmin/Jobs';
import { StackAdminApplications } from '@/pages/stackadmin/Applications';
import { StackAdminTasks } from '@/pages/stackadmin/Tasks';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/jobs" element={<PublicLayout><JobsPage /></PublicLayout>} />
        <Route path="/jobs/:id" element={<PublicLayout><JobDetailPage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />

        {/* Job Seeker routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['job_seeker']}>
            <DashboardLayout role="job_seeker"><SeekerDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/jobs" element={
          <ProtectedRoute allowedRoles={['job_seeker']}>
            <DashboardLayout role="job_seeker"><JobsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/applications" element={
          <ProtectedRoute allowedRoles={['job_seeker']}>
            <DashboardLayout role="job_seeker"><SeekerApplications /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/tasks" element={
          <ProtectedRoute allowedRoles={['job_seeker']}>
            <DashboardLayout role="job_seeker"><SeekerTasks /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute allowedRoles={['job_seeker']}>
            <DashboardLayout role="job_seeker"><SeekerProfile /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Super Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout role="super_admin"><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/stacks" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout role="super_admin"><AdminStacks /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/jobs" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout role="super_admin"><AdminJobs /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/applications" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout role="super_admin"><AdminApplications /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/admins" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout role="super_admin"><AdminAdmins /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout role="super_admin"><AdminSettings /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Stack Admin routes */}
        <Route path="/stack-admin" element={
          <ProtectedRoute allowedRoles={['stack_admin']}>
            <DashboardLayout role="stack_admin"><StackAdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/stack-admin/jobs" element={
          <ProtectedRoute allowedRoles={['stack_admin']}>
            <DashboardLayout role="stack_admin"><StackAdminJobs /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/stack-admin/applications" element={
          <ProtectedRoute allowedRoles={['stack_admin']}>
            <DashboardLayout role="stack_admin"><StackAdminApplications /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/stack-admin/tasks" element={
          <ProtectedRoute allowedRoles={['stack_admin']}>
            <DashboardLayout role="stack_admin"><StackAdminTasks /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SiteProvider>
    </BrowserRouter>
  );
}
