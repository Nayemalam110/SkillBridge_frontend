import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Job, JobType, JobStatus, SubmissionField, SubmissionFieldType } from '@/types';
import { Plus, Edit2, Trash2, Briefcase, MapPin, Users, Eye, EyeOff, FileText, ChevronRight } from 'lucide-react';

export function AdminJobs() {
  const { jobs, stacks, applications, addJob, updateJob, deleteJob } = useSite();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filter, setFilter] = useState({ stack: '', status: '', type: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    stackId: '',
    type: 'developer' as JobType,
    location: '',
    salaryRange: '',
    experience: '',
    status: 'active' as JobStatus,
    taskDeadlineDays: 5,
    autoAssignTask: false,
    submissionFields: [] as SubmissionField[],
  });

  const filteredJobs = jobs.filter((job) => {
    if (filter.stack && job.stackId !== filter.stack) return false;
    if (filter.status && job.status !== filter.status) return false;
    if (filter.type && job.type !== filter.type) return false;
    return true;
  });

  const submissionFieldOptions: { type: SubmissionFieldType; label: string; description: string }[] = [
    { type: 'github_link', label: 'GitHub Repository', description: 'Link to source code' },
    { type: 'live_demo_link', label: 'Live Demo URL', description: 'Deployed project link' },
    { type: 'figma_link', label: 'Figma Design', description: 'Design file link' },
    { type: 'project_video', label: 'Project Video', description: 'Video walkthrough' },
    { type: 'file_upload', label: 'File Upload', description: 'Upload project files' },
  ];

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements.join('\n'),
        responsibilities: job.responsibilities.join('\n'),
        stackId: job.stackId,
        type: job.type,
        location: job.location,
        salaryRange: job.salaryRange,
        experience: job.experience,
        status: job.status,
        taskDeadlineDays: job.taskDeadlineDays,
        autoAssignTask: job.autoAssignTask,
        submissionFields: job.submissionFields || [],
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        stackId: stacks[0]?.id || '',
        type: 'developer',
        location: '',
        salaryRange: '',
        experience: '',
        status: 'active',
        taskDeadlineDays: 5,
        autoAssignTask: false,
        submissionFields: [],
      });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    const stack = stacks.find((s) => s.id === formData.stackId);
    const jobData = {
      ...formData,
      stackName: stack?.name || '',
      requirements: formData.requirements.split('\n').filter(Boolean),
      responsibilities: formData.responsibilities.split('\n').filter(Boolean),
      createdBy: user?.id || '',
    };

    if (editingJob) {
      updateJob(editingJob.id, jobData);
    } else {
      addJob(jobData);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob(id);
    }
  };

  const toggleJobStatus = (job: Job) => {
    updateJob(job.id, { status: job.status === 'active' ? 'paused' : 'active' });
  };

  const toggleSubmissionField = (fieldType: SubmissionFieldType, label: string) => {
    const exists = formData.submissionFields.find(f => f.type === fieldType);
    if (exists) {
      setFormData({
        ...formData,
        submissionFields: formData.submissionFields.filter(f => f.type !== fieldType),
      });
    } else {
      setFormData({
        ...formData,
        submissionFields: [...formData.submissionFields, { type: fieldType, label, required: true }],
      });
    }
  };

  // Get applications for a specific job
  const getJobApplications = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Manage all job postings</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Post New Job
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              options={[
                { value: '', label: 'All Stacks' },
                ...stacks.map((s) => ({ value: s.id, label: s.name })),
              ]}
              value={filter.stack}
              onChange={(e) => setFilter({ ...filter, stack: e.target.value })}
            />
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'closed', label: 'Closed' },
              ]}
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            />
            <Select
              options={[
                { value: '', label: 'All Types' },
                { value: 'developer', label: 'Developer' },
                { value: 'designer', label: 'Designer' },
              ]}
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            />
            <Button
              variant="outline"
              onClick={() => setFilter({ stack: '', status: '', type: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const stack = stacks.find((s) => s.id === job.stackId);
          const jobApps = getJobApplications(job.id);
          
          return (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${stack?.color}20` }}
                    >
                      {stack?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant={job.status === 'active' ? 'success' : job.status === 'paused' ? 'warning' : 'default'}>
                          {job.status}
                        </Badge>
                        <Badge variant={job.type === 'developer' ? 'info' : 'purple'}>
                          {job.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{job.stackName}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applicantCount} applicants
                        </span>
                        <span>Task deadline: {job.taskDeadlineDays} days</span>
                      </div>
                      {/* Submission Fields */}
                      {job.submissionFields && job.submissionFields.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-xs text-slate-500">Required:</span>
                          {job.submissionFields.map((field, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                              {field.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Applicants Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApplicantsModal(job)}
                      className="relative"
                    >
                      <FileText className="h-4 w-4" />
                      Applicants
                      {jobApps.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-sky-600 text-white text-xs rounded-full flex items-center justify-center">
                          {jobApps.length}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleJobStatus(job)}
                      title={job.status === 'active' ? 'Pause job' : 'Activate job'}
                    >
                      {job.status === 'active' ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(job)}>
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="text-gray-600 mt-2">Create your first job posting</p>
              <Button onClick={() => handleOpenModal()} className="mt-4">
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingJob ? 'Edit Job' : 'Post New Job'}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              placeholder="e.g., Senior React Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Select
              label="Tech Stack"
              options={stacks.map((s) => ({ value: s.id, label: s.name }))}
              value={formData.stackId}
              onChange={(e) => setFormData({ ...formData, stackId: e.target.value })}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the role and what the candidate will be doing..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Requirements (one per line)"
              placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;..."
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
            <Textarea
              label="Responsibilities (one per line)"
              placeholder="Develop frontend applications&#10;Collaborate with designers&#10;..."
              rows={4}
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Job Type"
              options={[
                { value: 'developer', label: 'Developer' },
                { value: 'designer', label: 'Designer' },
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as JobType })}
            />
            <Input
              label="Location"
              placeholder="e.g., Remote, New York, Hybrid"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label="Experience Required"
              placeholder="e.g., 3+ years"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Salary Range"
              placeholder="e.g., $100k - $150k"
              value={formData.salaryRange}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
            />
            <Input
              label="Task Deadline (days)"
              type="number"
              min={1}
              max={30}
              value={formData.taskDeadlineDays}
              onChange={(e) => setFormData({ ...formData, taskDeadlineDays: parseInt(e.target.value) })}
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'closed', label: 'Closed' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
            />
          </div>

          {/* Submission Fields Configuration */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Task Submission Requirements
            </label>
            <p className="text-sm text-slate-500 mb-4">
              Select which fields applicants must provide when submitting their task
            </p>
            <div className="grid md:grid-cols-2 gap-2">
              {submissionFieldOptions.map((field) => {
                const isSelected = formData.submissionFields.some(f => f.type === field.type);
                return (
                  <button
                    key={field.type}
                    type="button"
                    onClick={() => toggleSubmissionField(field.type, field.label)}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{field.label}</p>
                      <p className="text-xs text-slate-500">{field.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoAssign"
              checked={formData.autoAssignTask}
              onChange={(e) => setFormData({ ...formData, autoAssignTask: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="autoAssign" className="text-sm text-gray-700">
              Automatically assign task when application is reviewed
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.title || !formData.stackId}>
              {editingJob ? 'Update Job' : 'Post Job'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Applicants Modal */}
      <Modal
        isOpen={!!showApplicantsModal}
        onClose={() => setShowApplicantsModal(null)}
        title={`Applicants for ${showApplicantsModal?.title}`}
        size="lg"
      >
        {showApplicantsModal && (() => {
          const jobApps = getJobApplications(showApplicantsModal.id);
          
          return (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${stacks.find(s => s.id === showApplicantsModal.stackId)?.color}20` }}
                  >
                    {stacks.find(s => s.id === showApplicantsModal.stackId)?.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{showApplicantsModal.title}</p>
                    <p className="text-sm text-slate-600">{showApplicantsModal.stackName} • {jobApps.length} applicants</p>
                  </div>
                </div>
              </div>

              {jobApps.length > 0 ? (
                <div className="space-y-3">
                  {jobApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {app.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{app.userName}</p>
                          <p className="text-sm text-slate-500">{app.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            app.status === 'hired' ? 'success' :
                            app.status === 'rejected' ? 'danger' :
                            app.status === 'potential' ? 'purple' :
                            'info'
                          }
                        >
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No applicants yet</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowApplicantsModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
