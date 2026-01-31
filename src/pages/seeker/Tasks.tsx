import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import type { Application, Task } from '@/types';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Upload,
  ExternalLink,
  Code,
  Palette,
} from 'lucide-react';

export function SeekerTasks() {
  const { user } = useAuth();
  const { applications, updateApplication } = useSite();
  const [selectedTask, setSelectedTask] = useState<{ app: Application; task: Task } | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myApplications = applications.filter((app) => app.userId === user?.id && app.task);

  const getTaskStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="success">Submitted</Badge>;
      case 'reviewing':
        return <Badge variant="info">Under Review</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { text: 'Overdue', color: 'text-red-600', icon: AlertTriangle };
    } else if (daysLeft <= 1) {
      return { text: 'Due today', color: 'text-orange-600', icon: AlertTriangle };
    } else if (daysLeft <= 3) {
      return { text: `${daysLeft} days left`, color: 'text-yellow-600', icon: Clock };
    } else {
      return { text: `${daysLeft} days left`, color: 'text-green-600', icon: Clock };
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedTask: Task = {
      ...selectedTask.task,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      submissionUrl: submissionFile ? URL.createObjectURL(submissionFile) : undefined,
      submissionFileName: submissionFile?.name,
      submissionNotes,
    };

    updateApplication(selectedTask.app.id, {
      task: updatedTask,
      status: 'task_submitted',
    });

    setSubmitting(false);
    setSelectedTask(null);
    setSubmissionFile(null);
    setSubmissionNotes('');
  };

  const pendingTasks = myApplications.filter(
    (app) => app.task && ['pending', 'in_progress'].includes(app.task.status)
  );
  const completedTasks = myApplications.filter(
    (app) => app.task && !['pending', 'in_progress'].includes(app.task.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">Complete assigned tasks to proceed with your applications</p>
      </div>

      {/* Pending Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Tasks ({pendingTasks.length})
        </h2>
        {pendingTasks.length > 0 ? (
          <div className="space-y-4">
            {pendingTasks.map((app) => {
              const task = app.task!;
              const deadlineStatus = getDeadlineStatus(task.deadline);
              const DeadlineIcon = deadlineStatus.icon;

              return (
                <Card key={app.id} className="border-l-4 border-l-indigo-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {task.type === 'coding' ? (
                            <Code className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <Palette className="h-5 w-5 text-pink-600" />
                          )}
                          <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
                          {getTaskStatusBadge(task.status)}
                        </div>
                        <p className="text-gray-600 mb-2">For: {app.jobTitle}</p>
                        <p className="text-gray-600 text-sm mb-4">{task.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className={`flex items-center gap-1 ${deadlineStatus.color}`}>
                            <DeadlineIcon className="h-4 w-4" />
                            {deadlineStatus.text}
                          </span>
                          <span className="text-gray-500">
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        </div>

                        {task.requirements.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {task.requirements.slice(0, 3).map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                              {task.requirements.length > 3 && (
                                <li className="text-indigo-600">
                                  +{task.requirements.length - 3} more...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button onClick={() => setSelectedTask({ app, task })}>
                          <Upload className="h-4 w-4" />
                          Submit Task
                        </Button>
                        {task.resources && task.resources.length > 0 && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                            Resources
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600">No pending tasks</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Completed Tasks ({completedTasks.length})
          </h2>
          <div className="space-y-4">
            {completedTasks.map((app) => {
              const task = app.task!;

              return (
                <Card key={app.id} className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          {getTaskStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-gray-600">For: {app.jobTitle}</p>
                        {task.submittedAt && (
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted: {new Date(task.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {task.submissionFileName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          {task.submissionFileName}
                        </div>
                      )}
                    </div>
                    {task.feedback && (
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <p className="text-sm font-medium text-gray-700">Feedback:</p>
                        <p className="text-sm text-gray-600 mt-1">{task.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Task Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setSubmissionFile(null);
          setSubmissionNotes('');
        }}
        title="Submit Task"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">{selectedTask.task.title}</h3>
              <p className="text-gray-600">For: {selectedTask.app.jobTitle}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{selectedTask.task.description}</p>
              {selectedTask.task.requirements.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {selectedTask.task.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <FileUpload
              label="Upload Your Submission"
              accept=".zip,.rar,.pdf,.fig,.sketch,.xd,.psd"
              value={submissionFile}
              onChange={setSubmissionFile}
              helperText="ZIP, RAR, PDF, Figma, Sketch, XD, or PSD files"
            />

            <Textarea
              label="Submission Notes (Optional)"
              placeholder="Add any notes about your submission, explain your approach, or mention any challenges you faced..."
              rows={4}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTask(null);
                  setSubmissionFile(null);
                  setSubmissionNotes('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitTask} loading={submitting} disabled={!submissionFile}>
                Submit Task
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
