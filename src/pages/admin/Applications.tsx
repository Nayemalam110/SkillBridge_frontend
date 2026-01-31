import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ApplicationPipeline } from '@/components/ApplicationPipeline';
import type { Application, ApplicationStatus, Task } from '@/types';
import {
  FileText,
  Mail,
  Download,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export function AdminApplications() {
  const { applications, jobs, stacks, updateApplication } = useSite();
  const [filter, setFilter] = useState({ status: '', stack: '' });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    requirements: '',
    deadlineDays: 5,
  });

  const filteredApps = applications.filter((app) => {
    if (filter.status && app.status !== filter.status) return false;
    if (filter.stack && app.stackName !== filter.stack) return false;
    return true;
  });

  const handleStatusChange = (appId: string, status: ApplicationStatus) => {
    updateApplication(appId, { status });
  };

  const handleSendTask = () => {
    if (!selectedApp) return;

    const job = jobs.find((j) => j.id === selectedApp.jobId);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + taskForm.deadlineDays);

    const task: Task = {
      id: `task-${Date.now()}`,
      applicationId: selectedApp.id,
      type: job?.type === 'designer' ? 'design' : 'coding',
      title: taskForm.title,
      description: taskForm.description,
      requirements: taskForm.requirements.split('\n').filter(Boolean),
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

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants: Record<ApplicationStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      applied: 'warning',
      reviewing: 'info',
      task_sent: 'info',
      task_submitted: 'info',
      task_reviewing: 'info',
      interview: 'info',
      offered: 'success',
      rejected: 'danger',
      hired: 'success',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Review and manage all job applications</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'applied', label: 'Applied' },
                { value: 'reviewing', label: 'Reviewing' },
                { value: 'task_sent', label: 'Task Sent' },
                { value: 'task_submitted', label: 'Task Submitted' },
                { value: 'interview', label: 'Interview' },
                { value: 'hired', label: 'Hired' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            />
            <Select
              options={[
                { value: '', label: 'All Stacks' },
                ...stacks.map((s) => ({ value: s.name, label: s.name })),
              ]}
              value={filter.stack}
              onChange={(e) => setFilter({ ...filter, stack: e.target.value })}
            />
            <Button
              variant="outline"
              onClick={() => setFilter({ status: '', stack: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApps.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{app.userName}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-gray-600">{app.jobTitle}</p>
                  <p className="text-sm text-gray-500">{app.stackName}</p>
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
                      <p className="text-sm font-medium text-gray-700">Task: {app.task.title}</p>
                      <p className="text-sm text-gray-500">
                        Status: {app.task.status} | Deadline: {new Date(app.task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download CV
                  </Button>
                  {!app.task && app.status !== 'rejected' && app.status !== 'hired' && (
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
                  {app.status === 'applied' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(app.id, 'reviewing')}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Start Review
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(app.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                        Reject
                      </Button>
                    </>
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
              <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
              <p className="text-gray-600 mt-2">Applications will appear here when candidates apply</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
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
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedApp.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{selectedApp.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stack</p>
                <p className="font-medium">{selectedApp.stackName}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Application Status</p>
              <ApplicationPipeline status={selectedApp.status} />
            </div>

            {selectedApp.coverLetter && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Cover Letter</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedApp.coverLetter}</p>
              </div>
            )}

            {selectedApp.task && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Task Details</h4>
                <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium text-indigo-900">{selectedApp.task.title}</p>
                  <p className="text-sm text-indigo-700">{selectedApp.task.description}</p>
                  <p className="text-sm text-indigo-600">
                    Status: {selectedApp.task.status} | Deadline: {new Date(selectedApp.task.deadline).toLocaleDateString()}
                  </p>
                  {selectedApp.task.submissionNotes && (
                    <div className="mt-2 p-2 bg-white rounded">
                      <p className="text-sm font-medium">Submission Notes:</p>
                      <p className="text-sm text-gray-600">{selectedApp.task.submissionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between border-t pt-4">
              <div className="flex gap-2">
                <Select
                  options={[
                    { value: 'applied', label: 'Applied' },
                    { value: 'reviewing', label: 'Reviewing' },
                    { value: 'task_sent', label: 'Task Sent' },
                    { value: 'task_submitted', label: 'Task Submitted' },
                    { value: 'task_reviewing', label: 'Task Reviewing' },
                    { value: 'interview', label: 'Interview' },
                    { value: 'offered', label: 'Offered' },
                    { value: 'hired', label: 'Hired' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                  value={selectedApp.status}
                  onChange={(e) => {
                    handleStatusChange(selectedApp.id, e.target.value as ApplicationStatus);
                    setSelectedApp({ ...selectedApp, status: e.target.value as ApplicationStatus });
                  }}
                />
              </div>
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Send Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setTaskForm({ title: '', description: '', requirements: '', deadlineDays: 5 });
        }}
        title="Send Task to Applicant"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sending task to <strong>{selectedApp?.userName}</strong> for{' '}
            <strong>{selectedApp?.jobTitle}</strong>
          </p>

          <Input
            label="Task Title"
            placeholder="e.g., Build a Todo Application"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />

          <Textarea
            label="Task Description"
            placeholder="Describe what the candidate needs to build or design..."
            rows={4}
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />

          <Textarea
            label="Requirements (one per line)"
            placeholder="Use React with TypeScript&#10;Include unit tests&#10;Deploy to a hosting platform"
            rows={4}
            value={taskForm.requirements}
            onChange={(e) => setTaskForm({ ...taskForm, requirements: e.target.value })}
          />

          <Input
            label="Deadline (days from now)"
            type="number"
            min={1}
            max={30}
            value={taskForm.deadlineDays}
            onChange={(e) => setTaskForm({ ...taskForm, deadlineDays: parseInt(e.target.value) })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTask} disabled={!taskForm.title || !taskForm.description}>
              <Send className="h-4 w-4" />
              Send Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
