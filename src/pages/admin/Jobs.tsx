import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Job, JobType, JobStatus } from '@/types';
import { Plus, Edit2, Trash2, Briefcase, MapPin, Users, Eye, EyeOff } from 'lucide-react';

export function AdminJobs() {
  const { jobs, stacks, addJob, updateJob, deleteJob } = useSite();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
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
  });

  const filteredJobs = jobs.filter((job) => {
    if (filter.stack && job.stackId !== filter.stack) return false;
    if (filter.status && job.status !== filter.status) return false;
    if (filter.type && job.type !== filter.type) return false;
    return true;
  });

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
                        <Badge variant={job.type === 'developer' ? 'info' : 'warning'}>
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
    </div>
  );
}
