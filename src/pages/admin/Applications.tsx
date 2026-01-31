import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ApplicationPipeline } from '@/components/ApplicationPipeline';
import { jobSeekers } from '@/data/dummyData';
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
  User,
  Phone,
  Globe,
  Github,
  Linkedin,
  Briefcase,
  Code,
  Palette,
  Calendar,
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

  // Get applicant profile info
  const getApplicantProfile = (userId: string) => {
    return jobSeekers.find((js) => js.id === userId);
  };

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
    const variants: Record<ApplicationStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
      applied: 'warning',
      reviewing: 'info',
      task_sent: 'purple',
      task_submitted: 'info',
      task_reviewing: 'info',
      interview: 'purple',
      offered: 'success',
      rejected: 'danger',
      hired: 'success',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="text-slate-600">Review and manage all job applications</p>
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
        {filteredApps.map((app) => {
          const profile = getApplicantProfile(app.userId);
          const job = jobs.find((j) => j.id === app.jobId);
          
          return (
            <Card key={app.id} hover>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Applicant Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {app.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-slate-900">{app.userName}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-slate-600 font-medium">{app.jobTitle}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            {app.userEmail}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-lg">
                            <Briefcase className="h-3.5 w-3.5" />
                            {app.stackName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Summary */}
                    {profile && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-700">Applicant Profile</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {profile.headline && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Briefcase className="h-4 w-4 text-slate-400" />
                              {profile.headline}
                            </div>
                          )}
                          {profile.phone && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="h-4 w-4 text-slate-400" />
                              {profile.phone}
                            </div>
                          )}
                          {profile.experience && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="h-4 w-4 text-slate-400" />
                              {profile.experience} experience
                            </div>
                          )}
                          {profile.portfolio && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Globe className="h-4 w-4 text-slate-400" />
                              <a href={profile.portfolio} className="text-sky-600 hover:underline truncate">Portfolio</a>
                            </div>
                          )}
                        </div>
                        {profile.skills && profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {profile.skills.slice(0, 5).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs text-slate-600">
                                {skill}
                              </span>
                            ))}
                            {profile.skills.length > 5 && (
                              <span className="px-2 py-0.5 bg-slate-200 rounded-md text-xs text-slate-500">
                                +{profile.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Task Info */}
                    {app.task && (
                      <div className={`mt-4 p-4 rounded-xl border ${
                        app.task.status === 'submitted' 
                          ? 'bg-amber-50 border-amber-200' 
                          : app.task.status === 'approved'
                          ? 'bg-emerald-50 border-emerald-200'
                          : app.task.status === 'rejected'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-sky-50 border-sky-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {job?.type === 'designer' ? (
                            <Palette className="h-4 w-4 text-pink-600" />
                          ) : (
                            <Code className="h-4 w-4 text-indigo-600" />
                          )}
                          <span className="font-semibold text-slate-800">{app.task.title}</span>
                          <Badge 
                            variant={
                              app.task.status === 'submitted' ? 'warning' :
                              app.task.status === 'approved' ? 'success' :
                              app.task.status === 'rejected' ? 'danger' : 'info'
                            }
                            size="sm"
                          >
                            {app.task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>Deadline: {new Date(app.task.deadline).toLocaleDateString()}</span>
                          {app.task.submittedAt && (
                            <span className="text-emerald-600">
                              ✓ Submitted {new Date(app.task.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {app.task.submissionFileName && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700">{app.task.submissionFileName}</span>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        )}
                        {app.task.submissionNotes && (
                          <div className="mt-2 p-2 bg-white/70 rounded-lg text-sm text-slate-600">
                            <strong>Notes:</strong> {app.task.submissionNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-40">
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
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(app.id, 'reviewing')}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Start Review
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredApps.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No applications found</h3>
              <p className="text-slate-600 mt-2">Applications will appear here when candidates apply</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedApp && !showTaskModal}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        size="xl"
      >
        {selectedApp && (() => {
          const profile = getApplicantProfile(selectedApp.userId);
          const job = jobs.find((j) => j.id === selectedApp.jobId);
          
          return (
            <div className="space-y-6">
              {/* Applicant Header */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedApp.userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{selectedApp.userName}</h3>
                  <p className="text-slate-600">{profile?.headline || 'Job Seeker'}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Mail className="h-4 w-4" />
                      {selectedApp.userEmail}
                    </span>
                    {profile?.phone && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Phone className="h-4 w-4" />
                        {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Profile Information</h4>
                    {profile.experience && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">Experience:</span> {profile.experience}
                      </div>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{profile.bio}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800">Links</h4>
                    <div className="space-y-2">
                      {profile.portfolio && (
                        <a href={profile.portfolio} className="flex items-center gap-2 text-sky-600 hover:underline">
                          <Globe className="h-4 w-4" /> Portfolio
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} className="flex items-center gap-2 text-sky-600 hover:underline">
                          <Linkedin className="h-4 w-4" /> LinkedIn
                        </a>
                      )}
                      {profile.github && (
                        <a href={profile.github} className="flex items-center gap-2 text-sky-600 hover:underline">
                          <Github className="h-4 w-4" /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {profile?.skills && profile.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium border border-sky-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Info */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-2">Applied For</h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stacks.find(s => s.id === job?.stackId)?.icon}</span>
                  <div>
                    <p className="font-medium text-slate-900">{selectedApp.jobTitle}</p>
                    <p className="text-sm text-slate-600">{selectedApp.stackName}</p>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Application Progress</h4>
                <ApplicationPipeline status={selectedApp.status} />
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Cover Letter</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-line">{selectedApp.coverLetter}</p>
                </div>
              )}

              {/* Task Details */}
              {selectedApp.task && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    {job?.type === 'designer' ? <Palette className="h-5 w-5 text-pink-600" /> : <Code className="h-5 w-5 text-indigo-600" />}
                    Task Assignment
                  </h4>
                  <div className={`p-4 rounded-xl border ${
                    selectedApp.task.status === 'submitted' ? 'bg-amber-50 border-amber-200' :
                    selectedApp.task.status === 'approved' ? 'bg-emerald-50 border-emerald-200' :
                    selectedApp.task.status === 'rejected' ? 'bg-red-50 border-red-200' :
                    'bg-sky-50 border-sky-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900">{selectedApp.task.title}</span>
                      <Badge 
                        variant={
                          selectedApp.task.status === 'submitted' ? 'warning' :
                          selectedApp.task.status === 'approved' ? 'success' :
                          selectedApp.task.status === 'rejected' ? 'danger' : 'info'
                        }
                      >
                        {selectedApp.task.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{selectedApp.task.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span>Sent: {new Date(selectedApp.task.sentAt).toLocaleDateString()}</span>
                      <span>Deadline: {new Date(selectedApp.task.deadline).toLocaleDateString()}</span>
                    </div>
                    
                    {selectedApp.task.submissionFileName && (
                      <div className="mt-4 p-3 bg-white rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-indigo-600" />
                          <span className="font-medium">{selectedApp.task.submissionFileName}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                          Download Submission
                        </Button>
                      </div>
                    )}
                    
                    {selectedApp.task.submissionNotes && (
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm font-medium text-slate-700">Submission Notes:</p>
                        <p className="text-sm text-slate-600 mt-1">{selectedApp.task.submissionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center border-t pt-4">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500">Update Status:</span>
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
          );
        })()}
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
          <div className="p-4 bg-sky-50 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {selectedApp?.userName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{selectedApp?.userName}</p>
              <p className="text-sm text-slate-600">{selectedApp?.jobTitle}</p>
            </div>
          </div>

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
