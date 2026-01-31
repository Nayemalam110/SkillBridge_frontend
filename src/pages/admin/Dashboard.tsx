import { Link } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Layers,
  Briefcase,
  Users,
  FileText,
  ArrowRight,
  TrendingUp,
  Plus,
  Settings,
} from 'lucide-react';

export function AdminDashboard() {
  const { stacks, jobs, applications, invites } = useSite();

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const pendingApplications = applications.filter((a) => a.status === 'applied').length;
  const pendingInvites = invites.filter((i) => i.status === 'pending').length;
  const submittedTasks = applications.filter((a) => a.task?.status === 'submitted').length;

  const recentApplications = applications
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your job portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Tech Stacks</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stacks.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Layers className="h-7 w-7 text-white" />
              </div>
            </div>
            <Link to="/admin/stacks" className="text-sm text-sky-600 hover:text-sky-700 font-semibold mt-4 inline-flex items-center gap-1 group">
              Manage stacks 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Jobs</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{activeJobs}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
            </div>
            <Link to="/admin/jobs" className="text-sm text-sky-600 hover:text-sky-700 font-semibold mt-4 inline-flex items-center gap-1 group">
              View all jobs 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Applications</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{applications.length}</p>
                <div className="flex gap-2 mt-2">
                  {pendingApplications > 0 && (
                    <Badge variant="warning" size="sm">{pendingApplications} new</Badge>
                  )}
                  {submittedTasks > 0 && (
                    <Badge variant="purple" size="sm">{submittedTasks} tasks</Badge>
                  )}
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
            <Link to="/admin/applications" className="text-sm text-sky-600 hover:text-sky-700 font-semibold mt-4 inline-flex items-center gap-1 group">
              Review applications 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Stack Admins</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">3</p>
                {pendingInvites > 0 && (
                  <Badge variant="info" size="sm" className="mt-2">{pendingInvites} pending</Badge>
                )}
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
            <Link to="/admin/admins" className="text-sm text-sky-600 hover:text-sky-700 font-semibold mt-4 inline-flex items-center gap-1 group">
              Manage admins 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
              <Link to="/admin/applications">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {app.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{app.userName}</p>
                        <p className="text-sm text-slate-500">{app.jobTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          app.status === 'applied' ? 'warning' :
                          app.status === 'hired' ? 'success' :
                          app.status === 'rejected' ? 'danger' : 
                          app.task?.status === 'submitted' ? 'purple' : 'info'
                        }
                      >
                        {app.task?.status === 'submitted' ? 'Task Submitted' : app.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No applications yet</p>
            )}
          </CardContent>
        </Card>

        {/* Jobs by Stack */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Jobs by Stack</h2>
              <Link to="/admin/stacks">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stacks.map((stack) => (
                <div key={stack.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${stack.color}20` }}
                    >
                      {stack.icon}
                    </div>
                    <span className="font-semibold text-slate-900">{stack.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-slate-700">{stack.jobCount} jobs</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/jobs">
              <Button>
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            </Link>
            <Link to="/admin/stacks">
              <Button variant="secondary">
                <Layers className="h-4 w-4" />
                Add Tech Stack
              </Button>
            </Link>
            <Link to="/admin/admins">
              <Button variant="secondary">
                <Users className="h-4 w-4" />
                Invite Admin
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4" />
                Site Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
