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
  ArrowRight,
  AlertCircle,
  Sparkles,
  Trophy,
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
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/30">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
          <p className="text-slate-600">Here's what's happening with your applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{activeJobs}</p>
                <p className="text-sm text-slate-500 font-medium">Available Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{myApplications.length}</p>
                <p className="text-sm text-slate-500 font-medium">My Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{pendingTasks.length}</p>
                <p className="text-sm text-slate-500 font-medium">Pending Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {myApplications.filter((a) => a.status === 'hired').length}
                </p>
                <p className="text-sm text-slate-500 font-medium">Offers Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks Alert */}
      {pendingTasks.length > 0 && (
        <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900">
                  You have {pendingTasks.length} pending task{pendingTasks.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-700">
                  Complete your tasks before the deadline to proceed with your application
                </p>
              </div>
              <Link to="/dashboard/tasks">
                <Button className="bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/30">
                  View Tasks
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            </div>
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
                  className="p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{app.jobTitle}</h3>
                      <p className="text-slate-600">{app.stackName}</p>
                    </div>
                    <ApplicationPipeline status={app.status} compact />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    {app.task && (
                      <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                        <FileText className="h-4 w-4" />
                        Task: {app.task.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900">No applications yet</p>
              <p className="text-slate-500 mt-1">Start applying to jobs to see them here</p>
              <Link to="/dashboard/jobs" className="inline-block mt-4">
                <Button>
                  <Briefcase className="h-4 w-4" />
                  Browse Jobs
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
