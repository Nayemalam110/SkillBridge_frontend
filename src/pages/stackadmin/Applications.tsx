import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ApplicationPipeline } from '@/components/ApplicationPipeline';
import type { Application, InternalApplicationStatus, Task, SubmissionField } from '@/types';
import { FileText, Mail, Download, Send, Eye, Clock } from 'lucide-react';

export function StackAdminApplications() {
  const { user } = useAuth();
  const { applications, jobs, updateApplication } = useSite();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    requirements: '',
    deadlineDays: 5,
  });

  // Check permissions
  const canChangeStatus = user?.permissions?.canChangeApplicationStatus ?? true;
  const canSendTasks = user?.permissions?.canSendTasks ?? true;

  // Filter to only show applications for assigned stacks
  const assignedStackIds = user?.assignedStacks || ['stack-1', 'stack-2'];
  const myApplications = applications.filter((a) => {
    const job = jobs.find((j) => j.id === a.jobId);
    return job && assignedStackIds.includes(job.stackId);
  });

  const filteredApps = filter
    ? myApplications.filter((a) => a.status === filter)
    : myApplications;

  const handleStatusChange = (appId: string, status: InternalApplicationStatus) => {
    if (!canChangeStatus) {
      alert('You do not have permission to change application status');
      return;
    }
    updateApplication(appId, { status });
  };

  const handleSendTask = () => {
    if (!selectedApp || !canSendTasks) return;

    const job = jobs.find((j) => j.id === selectedApp.jobId);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + taskForm.deadlineDays);

    // Get submission fields from job or use defaults
    const requiredFields: SubmissionField[] = job?.submissionFields || [
      { type: 'github_link', label: 'GitHub Repository', required: true },
      { type: 'file_upload', label: 'Project Files', required: false },
    ];

    const task: Task = {
      id: `task-${Date.now()}`,
      applicationId: selectedApp.id,
      type: job?.type === 'designer' ? 'design' : 'coding',
      title: taskForm.title,
      description: taskForm.description,
      requirements: taskForm.requirements.split('\n').filter(Boolean),
      requiredFields,
      deadline: deadline.toISOString(),
      deadlineDays: taskForm.deadlineDays,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    updateApplication(selectedApp.id, { task, status: 'task_sent' });
    setShowTaskModal(false);
    setSelectedApp(null);
    setTaskForm({ title: '', description: '', requirements: '', deadlineDays: 5 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Review applications for your stacks</p>
      </div>

      {/* Permission notice */}
      {(!canChangeStatus || !canSendTasks) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <strong>Limited permissions:</strong>
            {!canChangeStatus && ' You cannot change application statuses.'}
            {!canSendTasks && ' You cannot send tasks.'}
          </p>
        </div>
      )}

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'applied', label: 'Applied' },
                { value: 'screening', label: 'Screening' },
                { value: 'potential', label: 'Potential' },
                { value: 'task_sent', label: 'Task Sent' },
                { value: 'task_submitted', label: 'Task Submitted' },
                { value: 'interview', label: 'Interview' },
                { value: 'hired', label: 'Hired' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Applications */}
      <div className="space-y-4">
        {filteredApps.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{app.userName}</h3>
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
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-gray-600">{app.jobTitle}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {app.userEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {app.task && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Task: {app.task.title}</p>
                      <p className="text-sm text-gray-500">
                        Status: {app.task.status} | Deadline:{' '}
                        {new Date(app.task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    CV
                  </Button>
                  {!app.task && app.status !== 'rejected' && app.status !== 'hired' && canSendTasks && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setShowTaskModal(true);
                      }}
                    >
                      <Send className="h-4 w-4" />
                      Send Task
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredApps.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No applications</h3>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Modal */}
      <Modal
        isOpen={!!selectedApp && !showTaskModal}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="font-medium">{selectedApp.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{selectedApp.jobTitle}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <ApplicationPipeline status={selectedApp.status} isAdmin={true} />
            </div>

            {selectedApp.coverLetter && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Cover Letter</p>
                <p className="bg-gray-50 p-4 rounded-lg">{selectedApp.coverLetter}</p>
              </div>
            )}

            <div className="flex justify-between border-t pt-4">
              {canChangeStatus ? (
                <Select
                  options={[
                    { value: 'applied', label: 'Applied' },
                    { value: 'screening', label: 'Screening' },
                    { value: 'potential', label: 'Potential' },
                    { value: 'task_sent', label: 'Task Sent' },
                    { value: 'task_submitted', label: 'Task Submitted' },
                    { value: 'interview', label: 'Interview' },
                    { value: 'offered', label: 'Offered' },
                    { value: 'hired', label: 'Hired' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                  value={selectedApp.status}
                  onChange={(e) => {
                    handleStatusChange(selectedApp.id, e.target.value as InternalApplicationStatus);
                    setSelectedApp({ ...selectedApp, status: e.target.value as InternalApplicationStatus });
                  }}
                />
              ) : (
                <p className="text-sm text-amber-600">You don't have permission to change status</p>
              )}
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setTaskForm({ title: '', description: '', requirements: '', deadlineDays: 5 });
        }}
        title="Send Task"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sending task to <strong>{selectedApp?.userName}</strong>
          </p>

          <input
            className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            placeholder="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />

          <Textarea
            label="Description"
            rows={4}
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />

          <Textarea
            label="Requirements (one per line)"
            rows={4}
            value={taskForm.requirements}
            onChange={(e) => setTaskForm({ ...taskForm, requirements: e.target.value })}
          />

          <input
            type="number"
            className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            placeholder="Deadline (days)"
            min={1}
            max={30}
            value={taskForm.deadlineDays}
            onChange={(e) => setTaskForm({ ...taskForm, deadlineDays: parseInt(e.target.value) })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTask} disabled={!taskForm.title}>
              <Send className="h-4 w-4" />
              Send Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
