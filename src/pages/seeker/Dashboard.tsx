import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApplicationPipeline } from '@/components/ApplicationPipeline';
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export function SeekerDashboard() {
  const { user } = useAuth();
  const { applications, jobs } = useSite();

  const myApplications = applications.filter((app) => app.userId === user?.id);
  const pendingTasks = myApplications.filter(
    (app) => app.task && ['pending', 'in_progress'].includes(app.task.status)
  );
  const activeJobs = jobs.filter((j) => j.status === 'active').length;

  const recentApplications = myApplications.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Here's what's happening with your applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
                <p className="text-sm text-gray-500">Available Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{myApplications.length}</p>
                <p className="text-sm text-gray-500">My Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                <p className="text-sm text-gray-500">Pending Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {myApplications.filter((a) => a.status === 'hired').length}
                </p>
                <p className="text-sm text-gray-500">Offers Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks Alert */}
      {pendingTasks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">
                  You have {pendingTasks.length} pending task{pendingTasks.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-orange-700">
                  Complete your tasks before the deadline to proceed with your application
                </p>
              </div>
              <Link to="/dashboard/tasks">
                <Button size="sm">View Tasks</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link to="/dashboard/applications">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{app.jobTitle}</h3>
                      <p className="text-sm text-gray-500">{app.stackName}</p>
                    </div>
                    <ApplicationPipeline status={app.status} compact />
                  </div>
                  <p className="text-xs text-gray-400">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No applications yet</p>
              <Link to="/dashboard/jobs" className="inline-block mt-4">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
