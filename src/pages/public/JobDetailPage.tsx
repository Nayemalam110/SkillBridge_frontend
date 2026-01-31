import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  Send,
} from 'lucide-react';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, stacks, addApplication, applications } = useSite();
  const { user, isAuthenticated } = useAuth();
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);

  const job = jobs.find((j) => j.id === id);
  const stack = stacks.find((s) => s.id === job?.stackId);

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
        <Link to="/jobs">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const hasApplied = applications.some(
    (app) => app.jobId === job.id && app.userId === user?.id
  );

  const handleApply = async () => {
    if (!user) return;
    
    setApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    addApplication({
      jobId: job.id,
      jobTitle: job.title,
      stackName: job.stackName,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      cvUrl: cvFile ? URL.createObjectURL(cvFile) : '/uploads/cv/default.pdf',
      cvFileName: cvFile?.name || 'resume.pdf',
      coverLetter,
      status: 'applied',
    });
    
    setApplying(false);
    setShowApplyModal(false);
    navigate('/dashboard/applications');
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/jobs/' + job.id);
      return;
    }
    setShowApplyModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                  style={{ backgroundColor: `${stack?.color}20` }}
                >
                  {stack?.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                    <Badge variant={job.type === 'developer' ? 'info' : 'warning'}>
                      {job.type === 'developer' ? 'Developer' : 'Designer'}
                    </Badge>
                  </div>
                  <p className="text-lg text-gray-600 mt-1">{job.stackName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span>{job.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <span>{job.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span>{job.applicantCount} applied</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">About this role</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Requirements</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Responsibilities</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0" />
                    <span className="text-gray-700">{resp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              {hasApplied ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium text-gray-900">Already Applied</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Check your dashboard for updates
                  </p>
                  <Link to="/dashboard/applications" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View Application
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Button onClick={handleApplyClick} className="w-full" size="lg">
                    <Send className="h-5 w-5" />
                    Apply Now
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    {isAuthenticated
                      ? 'Your profile will be shared with the employer'
                      : 'You need to login to apply'}
                  </p>
                </>
              )}

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium text-gray-900">Hiring Process</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Apply</p>
                      <p className="text-sm text-gray-500">Submit your CV</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Complete Task</p>
                      <p className="text-sm text-gray-500">
                        {job.type === 'developer' ? 'Coding challenge' : 'Design challenge'} •{' '}
                        {job.taskDeadlineDays} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Interview</p>
                      <p className="text-sm text-gray-500">Meet the team</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Task deadline: {job.taskDeadlineDays} days after assignment
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${job.title}`}
        size="lg"
      >
        <div className="space-y-6">
          <FileUpload
            label="Upload CV/Resume"
            accept=".pdf,.doc,.docx"
            value={cvFile}
            onChange={setCvFile}
            helperText="PDF, DOC, or DOCX up to 5MB"
          />
          
          <Textarea
            label="Cover Letter (Optional)"
            placeholder="Tell us why you're interested in this role..."
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After your application is reviewed, you may receive a{' '}
              {job.type === 'developer' ? 'coding' : 'design'} task to complete within{' '}
              {job.taskDeadlineDays} days.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} loading={applying}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
