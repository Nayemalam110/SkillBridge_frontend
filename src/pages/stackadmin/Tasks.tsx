import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { jobSeekers } from '@/data/dummyData';
import type { Application, Task } from '@/types';
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Code,
  Palette,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export function StackAdminTasks() {
  const { user } = useAuth();
  const { applications, jobs, stacks, updateApplication } = useSite();
  const [selectedTask, setSelectedTask] = useState<{ app: Application; task: Task } | null>(null);
  const [feedback, setFeedback] = useState('');

  // Filter to only show tasks for assigned stacks
  const assignedStackIds = user?.assignedStacks || ['stack-1', 'stack-2'];
  const tasksToReview = applications.filter((a) => {
    const job = jobs.find((j) => j.id === a.jobId);
    return job && assignedStackIds.includes(job.stackId) && a.task;
  });

  // Get applicant profile
  const getApplicantProfile = (userId: string) => {
    return jobSeekers.find((js) => js.id === userId);
  };

  const pendingReview = tasksToReview.filter(
    (a) => a.task && a.task.status === 'submitted'
  );
  const inProgress = tasksToReview.filter(
    (a) => a.task && ['pending', 'in_progress'].includes(a.task.status)
  );
  const completed = tasksToReview.filter(
    (a) => a.task && ['approved', 'rejected'].includes(a.task.status)
  );

  const handleApprove = () => {
    if (!selectedTask) return;

    const updatedTask: Task = {
      ...selectedTask.task,
      status: 'approved',
      feedback,
    };

    updateApplication(selectedTask.app.id, {
      task: updatedTask,
      status: 'interview',
    });

    setSelectedTask(null);
    setFeedback('');
  };

  const handleReject = () => {
    if (!selectedTask) return;

    const updatedTask: Task = {
      ...selectedTask.task,
      status: 'rejected',
      feedback,
    };

    updateApplication(selectedTask.app.id, {
      task: updatedTask,
      status: 'rejected',
    });

    setSelectedTask(null);
    setFeedback('');
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="purple">Awaiting Review</Badge>;
      case 'reviewing':
        return <Badge variant="info">Reviewing</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const TaskCard = ({ app, showReviewButton = false }: { app: Application; showReviewButton?: boolean }) => {
    const task = app.task!;
    const job = jobs.find((j) => j.id === app.jobId);
    const profile = getApplicantProfile(app.userId);
    const stack = stacks.find((s) => s.id === job?.stackId);

    return (
      <div className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
        <div className="flex items-start gap-4">
          {/* Applicant Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {app.userName.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-900">{app.userName}</h4>
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{profile?.headline || 'Applicant'}</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                <span className="text-lg">{stack?.icon}</span>
                <span className="text-sm font-medium text-slate-700">{app.stackName}</span>
              </div>
            </div>

            {/* Task Info */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {task.type === 'coding' ? (
                  <Code className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Palette className="h-4 w-4 text-pink-600" />
                )}
                <span className="font-semibold text-slate-800">{task.title}</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
            </div>

            {/* Timeline */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Sent: {new Date(task.sentAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Deadline: {new Date(task.deadline).toLocaleDateString()}
              </span>
              {task.submittedAt && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  Submitted: {new Date(task.submittedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Submission Details */}
            {task.submissionFileName && (
              <div className="mt-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky-600" />
                    <span className="font-medium text-slate-800">{task.submissionFileName}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                {task.submissionNotes && (
                  <div className="mt-2 pt-2 border-t border-sky-100">
                    <p className="text-sm text-slate-600">
                      <strong className="text-slate-700">Notes:</strong> {task.submissionNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask({ app, task })}
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
              {showReviewButton && task.status === 'submitted' && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setSelectedTask({ app, task });
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Review & Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
        <p className="text-slate-600">Review submitted tasks from applicants</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingReview.length}</p>
                <p className="text-sm text-slate-500">Awaiting Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{inProgress.length}</p>
                <p className="text-sm text-slate-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completed.length}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Review Section */}
      {pendingReview.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Awaiting Your Review ({pendingReview.length})
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingReview.map((app) => (
              <TaskCard key={app.id} app={app} showReviewButton />
            ))}
          </CardContent>
        </Card>
      )}

      {/* In Progress Tasks */}
      {inProgress.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-bold text-slate-900">
                In Progress ({inProgress.length})
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgress.map((app) => (
              <TaskCard key={app.id} app={app} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Completed ({completed.length})
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed.map((app) => (
              <TaskCard key={app.id} app={app} />
            ))}
          </CardContent>
        </Card>
      )}

      {tasksToReview.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No tasks yet</h3>
            <p className="text-slate-600 mt-2">Tasks will appear here when you assign them to applicants</p>
          </CardContent>
        </Card>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setFeedback('');
        }}
        title="Review Task Submission"
        size="xl"
      >
        {selectedTask && (() => {
          const profile = getApplicantProfile(selectedTask.app.userId);
          const job = jobs.find((j) => j.id === selectedTask.app.jobId);
          const stack = stacks.find((s) => s.id === job?.stackId);

          return (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {selectedTask.app.userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{selectedTask.app.userName}</h3>
                  <p className="text-slate-600">{profile?.headline || 'Applicant'}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Mail className="h-4 w-4" />
                      {selectedTask.app.userEmail}
                    </span>
                    {profile?.experience && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-4 w-4" />
                        {profile.experience} experience
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Applied Position */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Applied for</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stack?.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedTask.app.jobTitle}</p>
                    <p className="text-sm text-slate-600">{selectedTask.app.stackName}</p>
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  {selectedTask.task.type === 'coding' ? (
                    <Code className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Palette className="h-5 w-5 text-pink-600" />
                  )}
                  Task: {selectedTask.task.title}
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-700">{selectedTask.task.description}</p>
                  {selectedTask.task.requirements.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">Requirements:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {selectedTask.task.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission */}
              {selectedTask.task.submissionFileName && (
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky-600" />
                    Submission
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{selectedTask.task.submissionFileName}</p>
                        <p className="text-sm text-slate-500">
                          Submitted {selectedTask.task.submittedAt ? new Date(selectedTask.task.submittedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  {selectedTask.task.submissionNotes && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-sm font-medium text-slate-700 mb-1">Applicant Notes:</p>
                      <p className="text-sm text-slate-600">{selectedTask.task.submissionNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Review Actions */}
              {selectedTask.task.status === 'submitted' && (
                <>
                  <Textarea
                    label="Feedback for Applicant"
                    placeholder="Provide constructive feedback about the submission..."
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelectedTask(null)}>
                      Cancel
                    </Button>
                    <Button variant="danger" onClick={handleReject}>
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button variant="success" onClick={handleApprove}>
                      <CheckCircle className="h-4 w-4" />
                      Approve & Advance
                    </Button>
                  </div>
                </>
              )}

              {/* Already Reviewed */}
              {selectedTask.task.status !== 'submitted' && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Status:</span>
                    {getStatusBadge(selectedTask.task.status)}
                  </div>
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Close
                  </Button>
                </div>
              )}

              {selectedTask.task.feedback && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-medium text-slate-700 mb-1">Previous Feedback:</p>
                  <p className="text-slate-600">{selectedTask.task.feedback}</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
