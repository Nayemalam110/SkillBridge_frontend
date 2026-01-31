import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Job, JobType, JobStatus, SubmissionField, SubmissionFieldType } from '@/types';
import { Plus, Edit2, Trash2, Briefcase, MapPin, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function StackAdminJobs() {
  const { user } = useAuth();
  const { jobs, stacks, addJob, updateJob, deleteJob } = useSite();
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Check permissions
  const canPostJobs = user?.permissions?.canPostJobs ?? true;
  const canEditJobs = user?.permissions?.canEditJobs ?? true;
  const canDeleteJobs = user?.permissions?.canDeleteJobs ?? false;

  // Filter to only show jobs for assigned stacks
  const assignedStackIds = user?.assignedStacks || ['stack-1', 'stack-2'];
  const assignedStacks = stacks.filter((s) => assignedStackIds.includes(s.id));
  const myJobs = jobs.filter((j) => assignedStackIds.includes(j.stackId));

  const submissionFieldOptions: { type: SubmissionFieldType; label: string }[] = [
    { type: 'github_link', label: 'GitHub Repository' },
    { type: 'live_demo_link', label: 'Live Demo URL' },
    { type: 'figma_link', label: 'Figma Design' },
    { type: 'project_video', label: 'Project Video' },
    { type: 'file_upload', label: 'File Upload' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    stackId: assignedStacks[0]?.id || '',
    type: 'developer' as JobType,
    location: '',
    salaryRange: '',
    experience: '',
    status: 'active' as JobStatus,
    taskDeadlineDays: 5,
    autoAssignTask: false,
    submissionFields: [] as SubmissionField[],
  });

  const handleOpenModal = (job?: Job) => {
    if (!canPostJobs && !job) {
      alert('You do not have permission to post new jobs');
      return;
    }
    if (!canEditJobs && job) {
      alert('You do not have permission to edit jobs');
      return;
    }

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
        stackId: assignedStacks[0]?.id || '',
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
    if (!canDeleteJobs) {
      alert('You do not have permission to delete jobs');
      return;
    }
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob(id);
    }
  };

  const toggleJobStatus = (job: Job) => {
    if (!canEditJobs) {
      alert('You do not have permission to change job status');
      return;
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600">
            Managing jobs for: {assignedStacks.map((s) => s.name).join(', ')}
          </p>
        </div>
        {canPostJobs && (
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        )}
      </div>

      {/* Permission notice */}
      {(!canPostJobs || !canEditJobs || !canDeleteJobs) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Limited permissions:</strong>
            <ul className="mt-1 list-disc list-inside">
              {!canPostJobs && <li>Cannot post new jobs</li>}
              {!canEditJobs && <li>Cannot edit existing jobs</li>}
              {!canDeleteJobs && <li>Cannot delete jobs</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {myJobs.map((job) => {
          const stack = stacks.find((s) => s.id === job.stackId);
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
                        <Badge
                          variant={
                            job.status === 'active'
                              ? 'success'
                              : job.status === 'paused'
                              ? 'warning'
                              : 'default'
                          }
                        >
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEditJobs && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJobStatus(job)}
                      >
                        {job.status === 'active' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {canEditJobs && (
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(job)}>
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                    {canDeleteJobs && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {myJobs.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No jobs yet</h3>
              <p className="text-gray-600 mt-2">Create your first job posting</p>
              {canPostJobs && (
                <Button onClick={() => handleOpenModal()} className="mt-4">
                  <Plus className="h-4 w-4" />
                  Post New Job
                </Button>
              )}
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
              options={assignedStacks.map((s) => ({ value: s.id, label: s.name }))}
              value={formData.stackId}
              onChange={(e) => setFormData({ ...formData, stackId: e.target.value })}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the role..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Requirements (one per line)"
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
            <Textarea
              label="Responsibilities (one per line)"
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
              placeholder="e.g., Remote"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label="Experience"
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
              onChange={(e) =>
                setFormData({ ...formData, taskDeadlineDays: parseInt(e.target.value) })
              }
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
            />
          </div>

          {/* Submission Fields */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Required Submission Fields
            </label>
            <div className="flex flex-wrap gap-2">
              {submissionFieldOptions.map((field) => {
                const isSelected = formData.submissionFields.some(f => f.type === field.type);
                return (
                  <button
                    key={field.type}
                    type="button"
                    onClick={() => toggleSubmissionField(field.type, field.label)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {field.label}
                  </button>
                );
              })}
            </div>
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
    </div>
  );
}
