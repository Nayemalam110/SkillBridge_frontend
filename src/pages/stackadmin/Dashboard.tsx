import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, FileText, Clock, ArrowRight, CheckCircle } from 'lucide-react';

export function StackAdminDashboard() {
  const { user } = useAuth();
  const { jobs, applications, stacks } = useSite();

  // For stack admin, filter by assigned stacks
  const assignedStackIds = user?.assignedStacks || ['stack-1', 'stack-2']; // Demo default
  const assignedStacks = stacks.filter((s) => assignedStackIds.includes(s.id));
  
  const myJobs = jobs.filter((j) => assignedStackIds.includes(j.stackId));
  const myApplications = applications.filter((a) => {
    const job = jobs.find((j) => j.id === a.jobId);
    return job && assignedStackIds.includes(job.stackId);
  });

  const pendingTasks = myApplications.filter(
    (a) => a.task && ['submitted'].includes(a.task.status)
  );

  const recentApplications = myApplications
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stack Admin Dashboard</h1>
        <p className="text-gray-600">
          Managing: {assignedStacks.map((s) => s.name).join(', ')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">My Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{myJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{myApplications.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tasks to Review</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hired</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {myApplications.filter((a) => a.status === 'hired').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Stacks */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Your Assigned Stacks</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {assignedStacks.map((stack) => (
              <div
                key={stack.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-3xl">{stack.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{stack.name}</p>
                  <p className="text-sm text-gray-500">{stack.jobCount} jobs</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link to="/stack-admin/applications">
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
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{app.userName}</p>
                    <p className="text-sm text-gray-500">{app.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        app.status === 'applied'
                          ? 'warning'
                          : app.status === 'hired'
                          ? 'success'
                          : app.status === 'rejected'
                          ? 'danger'
                          : 'info'
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
            <p className="text-center text-gray-500 py-8">No applications yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
