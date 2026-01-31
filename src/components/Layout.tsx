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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">{settings.siteName}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/jobs" className="text-gray-600 hover:text-gray-900">
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
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>

            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                className="block text-gray-600 hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/jobs"
                className="block text-gray-600 hover:text-gray-900"
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
                    className="block text-gray-600 hover:text-gray-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-600 hover:text-gray-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-gray-600 hover:text-gray-900"
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

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-6 w-6" />
                <span className="text-lg font-bold">{settings.siteName}</span>
              </div>
              <p className="text-gray-400 text-sm">{settings.aboutContent.slice(0, 150)}...</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">{settings.contactEmail}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {settings.socialLinks.twitter && (
                  <a href={settings.socialLinks.twitter} className="text-gray-400 hover:text-white">
                    Twitter
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a href={settings.socialLinks.linkedin} className="text-gray-400 hover:text-white">
                    LinkedIn
                  </a>
                )}
                {settings.socialLinks.github && (
                  <a href={settings.socialLinks.github} className="text-gray-400 hover:text-white">
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-600" />
            <span className="font-bold">{settings.siteName}</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="hidden lg:flex items-center gap-2 px-6 h-16 border-b">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              <span className="font-bold">{settings.siteName}</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto mt-16 lg:mt-0">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center gap-3 px-4 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
