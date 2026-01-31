import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import {
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  Users,
  Layers,
  FileText,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { settings } = useSite();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                {settings.siteName}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium">
                Home
              </Link>
              <Link to="/jobs" className="px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium">
                Jobs
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={
                      user?.role === 'job_seeker'
                        ? '/dashboard'
                        : user?.role === 'super_admin'
                        ? '/admin'
                        : '/stack-admin'
                    }
                    className="px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium ml-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="ml-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-sky-600 hover:to-indigo-700 transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/jobs"
                className="block px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Jobs
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={
                      user?.role === 'job_seeker'
                        ? '/dashboard'
                        : user?.role === 'super_admin'
                        ? '/admin'
                        : '/stack-admin'
                    }
                    className="block px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="bg-slate-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">{settings.siteName}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{settings.aboutContent.slice(0, 150)}...</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sky-400">Quick Links</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><Link to="/jobs" className="hover:text-white transition-colors flex items-center gap-1"><ChevronRight className="h-4 w-4" />Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors flex items-center gap-1"><ChevronRight className="h-4 w-4" />Register</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors flex items-center gap-1"><ChevronRight className="h-4 w-4" />Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sky-400">Contact</h3>
              <p className="text-slate-400 text-sm">{settings.contactEmail}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sky-400">Follow Us</h3>
              <div className="flex gap-3">
                {settings.socialLinks.twitter && (
                  <a href={settings.socialLinks.twitter} className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-600 hover:text-white transition-colors">
                    𝕏
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a href={settings.socialLinks.linkedin} className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-600 hover:text-white transition-colors">
                    in
                  </a>
                )}
                {settings.socialLinks.github && (
                  <a href={settings.socialLinks.github} className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-600 hover:text-white transition-colors">
                    GH
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
            {settings.footerText}
          </div>
        </div>
      </footer>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'job_seeker' | 'super_admin' | 'stack_admin';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { settings } = useSite();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = {
    job_seeker: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Briefcase, label: 'Browse Jobs', path: '/dashboard/jobs' },
      { icon: ClipboardList, label: 'My Applications', path: '/dashboard/applications' },
      { icon: FileText, label: 'My Tasks', path: '/dashboard/tasks' },
      { icon: User, label: 'Profile', path: '/dashboard/profile' },
    ],
    super_admin: [
      { icon: Home, label: 'Dashboard', path: '/admin' },
      { icon: Layers, label: 'Tech Stacks', path: '/admin/stacks' },
      { icon: Briefcase, label: 'Jobs', path: '/admin/jobs' },
      { icon: ClipboardList, label: 'Applications', path: '/admin/applications' },
      { icon: Users, label: 'Stack Admins', path: '/admin/admins' },
      { icon: Settings, label: 'Site Settings', path: '/admin/settings' },
    ],
    stack_admin: [
      { icon: Home, label: 'Dashboard', path: '/stack-admin' },
      { icon: Briefcase, label: 'My Jobs', path: '/stack-admin/jobs' },
      { icon: ClipboardList, label: 'Applications', path: '/stack-admin/applications' },
      { icon: FileText, label: 'Tasks', path: '/stack-admin/tasks' },
    ],
  };

  const items = navItems[role];

  const roleColors = {
    job_seeker: 'from-emerald-500 to-teal-600',
    super_admin: 'from-violet-500 to-purple-600',
    stack_admin: 'from-sky-500 to-indigo-600',
  };

  const roleBgColors = {
    job_seeker: 'bg-emerald-500/10 text-emerald-600',
    super_admin: 'bg-violet-500/10 text-violet-600',
    stack_admin: 'bg-sky-500/10 text-sky-600',
  };

  const roleLabels = {
    job_seeker: 'Job Seeker',
    super_admin: 'Super Admin',
    stack_admin: 'Stack Admin',
  };

  return (
    <div className="h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center shadow-lg`}>
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800">{settings.siteName}</span>
              <p className={`text-xs px-2 py-0.5 rounded-full inline-block ml-1 ${roleBgColors[role]}`}>
                {roleLabels[role]}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${roleColors[role]} text-white shadow-lg`
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center shadow-md`}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm sticky top-0 z-30 border-b border-slate-200">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleColors[role]} flex items-center justify-center`}>
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">{settings.siteName}</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
