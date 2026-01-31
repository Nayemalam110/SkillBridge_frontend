import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ApplicationPipeline } from '@/components/ApplicationPipeline';
import { jobSeekers } from '@/data/dummyData';
import type { Application, InternalApplicationStatus, Task, SubmissionField } from '@/types';
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
  FileSpreadsheet,
  Ban,
  Star,
} from 'lucide-react';

// Helper to export data to CSV
const exportToCSV = (data: Application[]) => {
  const headers = ['Name', 'Email', 'Phone', 'Position', 'Stack', 'Status', 'Applied Date', 'Rating'];
  const csvContent = [
    headers.join(','),
    ...data.map(app => {
      const profile = jobSeekers.find(js => js.id === app.userId);
      return [
        `"${app.userName}"`,
        `"${app.userEmail}"`,
        `"${app.userPhone || profile?.phone || ''}"`,
        `"${app.jobTitle}"`,
        `"${app.stackName}"`,
        `"${app.status}"`,
        `"${new Date(app.appliedAt).toLocaleDateString()}"`,
        `"${app.rating || ''}"`,
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export function AdminApplications() {
  const { applications, jobs, stacks, updateApplication } = useSite();
  const [filter, setFilter] = useState({ status: '', stack: '', job: '' });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    requirements: '',
    deadlineDays: 5,
    requiredFields: [] as SubmissionField[],
  });

  const filteredApps = applications.filter((app) => {
    if (filter.status && app.status !== filter.status) return false;
    if (filter.stack && app.stackName !== filter.stack) return false;
    if (filter.job && app.jobId !== filter.job) return false;
    return true;
  });

  // Get applicant profile info
  const getApplicantProfile = (userId: string) => {
    return jobSeekers.find((js) => js.id === userId);
  };

  const handleStatusChange = (appId: string, status: InternalApplicationStatus) => {
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
      requiredFields: taskForm.requiredFields.length > 0 
        ? taskForm.requiredFields 
        : job?.submissionFields || [],
      deadline: deadline.toISOString(),
      deadlineDays: taskForm.deadlineDays,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    updateApplication(selectedApp.id, { task, status: 'task_sent' });
    setShowTaskModal(false);
    setSelectedApp(null);
    setTaskForm({ title: '', description: '', requirements: '', deadlineDays: 5, requiredFields: [] });
  };

  const handleBlockUser = () => {
    // This would trigger an API call to block the user
    alert('User blocked! This would trigger an API call in production.');
  };

  const handleExportSelected = () => {
    const toExport = selectedApps.length > 0 
      ? applications.filter(a => selectedApps.includes(a.id))
      : filteredApps;
    exportToCSV(toExport);
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const getStatusBadge = (status: InternalApplicationStatus) => {
    const variants: Record<InternalApplicationStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
      applied: 'warning',
      screening: 'info',
      potential: 'purple',
      waiting: 'warning',
      potentially_rejected: 'danger',
      task_sent: 'info',
      task_submitted: 'purple',
      task_reviewing: 'info',
      forwarded_to_hr: 'purple',
      interview: 'info',
      offered: 'success',
      rejected: 'danger',
      hired: 'success',
    };
    return <Badge variant={variants[status]}>{status.replace(/_/g, ' ')}</Badge>;
  };

  // Get unique jobs for filter
  const uniqueJobs = [...new Map(jobs.map(j => [j.id, { id: j.id, title: j.title }])).values()];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-600">Review and manage all job applications</p>
        </div>
        <Button onClick={handleExportSelected} variant="outline">
          <FileSpreadsheet className="h-4 w-4" />
          Export {selectedApps.length > 0 ? `(${selectedApps.length})` : 'All'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'applied', label: 'Applied' },
                { value: 'screening', label: 'Screening' },
                { value: 'potential', label: 'Potential' },
                { value: 'waiting', label: 'Waiting' },
                { value: 'potentially_rejected', label: 'Potentially Rejected' },
                { value: 'task_sent', label: 'Task Sent' },
                { value: 'task_submitted', label: 'Task Submitted' },
                { value: 'task_reviewing', label: 'Task Reviewing' },
                { value: 'forwarded_to_hr', label: 'Forwarded to HR' },
                { value: 'interview', label: 'Interview' },
                { value: 'offered', label: 'Offered' },
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
            <Select
              options={[
                { value: '', label: 'All Jobs' },
                ...uniqueJobs.map((j) => ({ value: j.id, label: j.title })),
              ]}
              value={filter.job}
              onChange={(e) => setFilter({ ...filter, job: e.target.value })}
            />
            <Button
              variant="outline"
              onClick={() => {
                setFilter({ status: '', stack: '', job: '' });
                setSelectedApps([]);
              }}
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
          const isSelected = selectedApps.includes(app.id);
          
          return (
            <Card key={app.id} hover className={isSelected ? 'ring-2 ring-sky-500' : ''}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Selection & Applicant Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAppSelection(app.id)}
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {app.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-slate-900">{app.userName}</h3>
                          {getStatusBadge(app.status)}
                          {app.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-medium">{app.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium">{app.jobTitle}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            {app.userEmail}
                          </span>
                          {app.userPhone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-4 w-4" />
                              {app.userPhone}
                            </span>
                          )}
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
                          {profile.github && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Github className="h-4 w-4 text-slate-400" />
                              <a href={profile.github} className="text-sky-600 hover:underline">GitHub</a>
                            </div>
                          )}
                          {profile.linkedin && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Linkedin className="h-4 w-4 text-slate-400" />
                              <a href={profile.linkedin} className="text-sky-600 hover:underline">LinkedIn</a>
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

                    {/* Admin Notes */}
                    {app.adminNotes && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-sm text-amber-800">
                          <strong>Notes:</strong> {app.adminNotes}
                        </p>
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
                        {app.task.submission?.fileName && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700">{app.task.submission.fileName}</span>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        )}
                        {app.task.submission?.githubLink && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Github className="h-4 w-4 text-slate-400" />
                            <a href={app.task.submission.githubLink} className="text-sky-600 hover:underline">
                              {app.task.submission.githubLink}
                            </a>
                          </div>
                        )}
                        {app.task.submission?.figmaLink && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Palette className="h-4 w-4 text-slate-400" />
                            <a href={app.task.submission.figmaLink} className="text-sky-600 hover:underline">
                              Figma Design
                            </a>
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
                  <div className="flex flex-col gap-2 lg:w-44">
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
                          onClick={() => handleStatusChange(app.id, 'screening')}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBlockUser()}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Ban className="h-4 w-4" />
                      Block User
                    </Button>
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
                {/* Rating */}
                <div className="flex flex-col items-center">
                  <span className="text-sm text-slate-500 mb-1">Rating</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateApplication(selectedApp.id, { rating: star })}
                        className={`p-1 ${
                          (selectedApp.rating || 0) >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Application Progress (Internal View)</h4>
                <ApplicationPipeline status={selectedApp.status} isAdmin={true} />
              </div>

              {/* Status Update */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-3">Update Status</h4>
                <Select
                  options={[
                    { value: 'applied', label: 'Applied' },
                    { value: 'screening', label: 'Screening' },
                    { value: 'potential', label: 'Potential' },
                    { value: 'waiting', label: 'Waiting' },
                    { value: 'potentially_rejected', label: 'Potentially Rejected' },
                    { value: 'task_sent', label: 'Task Sent' },
                    { value: 'task_submitted', label: 'Task Submitted' },
                    { value: 'task_reviewing', label: 'Task Reviewing' },
                    { value: 'forwarded_to_hr', label: 'Forwarded to HR' },
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
                <p className="text-sm text-slate-500 mt-2">
                  Note: Only "Hired" and "Rejected" statuses are visible to the applicant. All other statuses appear as "In Progress".
                </p>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Internal Notes</h4>
                <Textarea
                  placeholder="Add notes about this applicant (only visible to admins)..."
                  value={selectedApp.adminNotes || ''}
                  onChange={(e) => {
                    updateApplication(selectedApp.id, { adminNotes: e.target.value });
                    setSelectedApp({ ...selectedApp, adminNotes: e.target.value });
                  }}
                  rows={3}
                />
              </div>

              {/* Close */}
              <div className="flex justify-end">
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
          setTaskForm({ title: '', description: '', requirements: '', deadlineDays: 5, requiredFields: [] });
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

          {/* Submission Fields Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Required Submission Fields
            </label>
            <div className="space-y-2">
              {[
                { type: 'github_link' as const, label: 'GitHub Repository Link' },
                { type: 'live_demo_link' as const, label: 'Live Demo URL' },
                { type: 'figma_link' as const, label: 'Figma Design Link' },
                { type: 'project_video' as const, label: 'Project Video URL' },
                { type: 'file_upload' as const, label: 'File Upload' },
              ].map((field) => (
                <label key={field.type} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={taskForm.requiredFields.some(f => f.type === field.type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTaskForm({
                          ...taskForm,
                          requiredFields: [...taskForm.requiredFields, { type: field.type, label: field.label, required: true }]
                        });
                      } else {
                        setTaskForm({
                          ...taskForm,
                          requiredFields: taskForm.requiredFields.filter(f => f.type !== field.type)
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

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
