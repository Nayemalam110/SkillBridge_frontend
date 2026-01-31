import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

export function StackAdminTasks() {
  const { user } = useAuth();
  const { applications, jobs, updateApplication } = useSite();
  const [selectedTask, setSelectedTask] = useState<{ app: Application; task: Task } | null>(null);
  const [feedback, setFeedback] = useState('');

  // Filter to only show tasks for assigned stacks
  const assignedStackIds = user?.assignedStacks || ['stack-1', 'stack-2'];
  const tasksToReview = applications.filter((a) => {
    const job = jobs.find((j) => j.id === a.jobId);
    return job && assignedStackIds.includes(job.stackId) && a.task;
  });

  const pendingReview = tasksToReview.filter(
    (a) => a.task && a.task.status === 'submitted'
  );
  const allTasks = tasksToReview;

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
        return <Badge variant="info">Submitted</Badge>;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-600">Review submitted tasks from applicants</p>
      </div>

      {/* Pending Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Pending Review ({pendingReview.length})
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {pendingReview.length > 0 ? (
            <div className="space-y-4">
              {pendingReview.map((app) => {
                const task = app.task!;
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100"
                  >
                    <div className="flex items-center gap-4">
                      {task.type === 'coding' ? (
                        <Code className="h-6 w-6 text-indigo-600" />
                      ) : (
                        <Palette className="h-6 w-6 text-pink-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{app.userName}</p>
                        <p className="text-sm text-gray-600">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          Submitted: {task.submittedAt ? new Date(task.submittedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTask({ app, task })}
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No tasks pending review</p>
          )}
        </CardContent>
      </Card>

      {/* All Tasks */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Tasks ({allTasks.length})</h2>
        </CardHeader>
        <CardContent>
          {allTasks.length > 0 ? (
            <div className="space-y-3">
              {allTasks.map((app) => {
                const task = app.task!;
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {task.type === 'coding' ? (
                        <Code className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Palette className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{app.userName}</p>
                        <p className="text-sm text-gray-600">{task.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(task.status)}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTask({ app, task })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No tasks yet</p>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setFeedback('');
        }}
        title="Review Task Submission"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="font-medium">{selectedTask.app.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{selectedTask.app.jobTitle}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Task</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{selectedTask.task.title}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedTask.task.description}</p>
              </div>
            </div>

            {selectedTask.task.submissionFileName && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Submission</p>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span className="flex-1">{selectedTask.task.submissionFileName}</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {selectedTask.task.submissionNotes && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Applicant Notes</p>
                <p className="bg-gray-50 p-4 rounded-lg text-gray-700">
                  {selectedTask.task.submissionNotes}
                </p>
              </div>
            )}

            {selectedTask.task.status === 'submitted' && (
              <>
                <Textarea
                  label="Feedback"
                  placeholder="Provide feedback for the applicant..."
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
                  <Button onClick={handleApprove}>
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </>
            )}

            {selectedTask.task.status !== 'submitted' && (
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedTask.task.status)}
                </div>
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Close
                </Button>
              </div>
            )}

            {selectedTask.task.feedback && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Previous Feedback</p>
                <p className="bg-gray-50 p-4 rounded-lg">{selectedTask.task.feedback}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
