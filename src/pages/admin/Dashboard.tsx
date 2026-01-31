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
  Clock,
} from 'lucide-react';

export function AdminDashboard() {
  const { stacks, jobs, applications, invites } = useSite();

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const pendingApplications = applications.filter((a) => a.status === 'applied').length;
  const pendingInvites = invites.filter((i) => i.status === 'pending').length;

  const recentApplications = applications
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your job portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tech Stacks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stacks.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Link to="/admin/stacks" className="text-sm text-indigo-600 hover:underline mt-3 inline-block">
              Manage stacks →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeJobs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link to="/admin/jobs" className="text-sm text-indigo-600 hover:underline mt-3 inline-block">
              View all jobs →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</p>
                {pendingApplications > 0 && (
                  <Badge variant="warning" className="mt-1">{pendingApplications} pending</Badge>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Link to="/admin/applications" className="text-sm text-indigo-600 hover:underline mt-3 inline-block">
              Review applications →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stack Admins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                {pendingInvites > 0 && (
                  <Badge variant="info" className="mt-1">{pendingInvites} pending</Badge>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <Link to="/admin/admins" className="text-sm text-indigo-600 hover:underline mt-3 inline-block">
              Manage admins →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
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
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{app.userName}</p>
                      <p className="text-sm text-gray-500">{app.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          app.status === 'applied' ? 'warning' :
                          app.status === 'hired' ? 'success' :
                          app.status === 'rejected' ? 'danger' : 'info'
                        }
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No applications yet</p>
            )}
          </CardContent>
        </Card>

        {/* Jobs by Stack */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Jobs by Stack</h2>
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
                <div key={stack.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stack.icon}</span>
                    <span className="font-medium text-gray-900">{stack.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">{stack.jobCount} jobs</span>
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
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/jobs">
              <Button>
                <Briefcase className="h-4 w-4" />
                Post New Job
              </Button>
            </Link>
            <Link to="/admin/stacks">
              <Button variant="outline">
                <Layers className="h-4 w-4" />
                Add Tech Stack
              </Button>
            </Link>
            <Link to="/admin/admins">
              <Button variant="outline">
                <Users className="h-4 w-4" />
                Invite Admin
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="outline">
                <Clock className="h-4 w-4" />
                Site Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
