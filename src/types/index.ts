// User Types
export type UserRole = 'job_seeker' | 'super_admin' | 'stack_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  assignedStacks?: string[]; // For stack admins
  permissions?: StackAdminPermissions; // For stack admins
  isBlocked?: boolean;
  createdAt: string;
}

// Stack Admin Permissions - Super Admin can control what stack admin can do
export interface StackAdminPermissions {
  canPostJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  canChangeApplicationStatus: boolean;
  canSendTasks: boolean;
  canReviewTasks: boolean;
  canViewApplicantDetails: boolean;
}

export interface JobSeekerProfile extends User {
  role: 'job_seeker';
  headline?: string;
  bio?: string;
  skills: string[];
  experience: string;
  cvUrl?: string;
  cvFileName?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  googleId?: string; // For Google OAuth
  hasActiveApplication?: boolean; // One application at a time
  activeApplicationId?: string;
}

// Tech Stack
export interface TechStack {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  jobCount: number;
  createdAt: string;
}

// Job Types
export type JobType = 'developer' | 'designer';
export type JobStatus = 'active' | 'paused' | 'closed' | 'expired';

// Submission field types that admin can choose from
export type SubmissionFieldType = 
  | 'project_video' 
  | 'github_link' 
  | 'figma_link' 
  | 'live_demo_link' 
  | 'file_upload';

export interface SubmissionField {
  type: SubmissionFieldType;
  label: string;
  required: boolean;
  description?: string;
}

// Default submission field options
export const SUBMISSION_FIELD_OPTIONS: { type: SubmissionFieldType; label: string; description: string }[] = [
  { type: 'project_video', label: 'Project Video', description: 'URL to a video walkthrough of the project' },
  { type: 'github_link', label: 'GitHub Link', description: 'Link to the GitHub repository' },
  { type: 'figma_link', label: 'Figma Link', description: 'Link to Figma design file' },
  { type: 'live_demo_link', label: 'Live Demo Link', description: 'URL to the deployed/live project' },
  { type: 'file_upload', label: 'File Upload', description: 'Upload project files (ZIP, PDF, etc.)' },
];

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  stackId: string;
  stackName: string;
  type: JobType;
  location: string;
  salaryRange: string;
  experience: string;
  status: JobStatus;
  taskDeadlineDays: number;
  autoAssignTask: boolean;
  submissionFields: SubmissionField[]; // Admin configures which fields are required
  expiresAt?: string; // Job expiry date
  createdAt: string;
  createdBy: string;
  applicantCount: number;
}

// Internal Application Status (Admin sees all)
export type InternalApplicationStatus = 
  | 'applied' 
  | 'screening' 
  | 'potential'
  | 'waiting'
  | 'potentially_rejected'
  | 'task_sent' 
  | 'task_submitted' 
  | 'task_reviewing'
  | 'forwarded_to_hr'
  | 'interview' 
  | 'offered' 
  | 'rejected' 
  | 'hired';

// External Application Status (Job seeker sees limited)
export type ExternalApplicationStatus = 
  | 'pending' 
  | 'in_review' 
  | 'task_assigned'
  | 'task_submitted'
  | 'waiting'
  | 'hired' 
  | 'rejected';

// Status mapping from internal to external
export const STATUS_DISPLAY_MAP: Record<InternalApplicationStatus, { external: ExternalApplicationStatus; label: string; color: string }> = {
  applied: { external: 'pending', label: 'Application Received', color: 'sky' },
  screening: { external: 'in_review', label: 'Under Review', color: 'sky' },
  potential: { external: 'in_review', label: 'Under Review', color: 'sky' },
  waiting: { external: 'waiting', label: 'In Progress', color: 'amber' },
  potentially_rejected: { external: 'in_review', label: 'Under Review', color: 'sky' },
  task_sent: { external: 'task_assigned', label: 'Task Assigned', color: 'indigo' },
  task_submitted: { external: 'task_submitted', label: 'Task Submitted', color: 'purple' },
  task_reviewing: { external: 'waiting', label: 'In Progress', color: 'amber' },
  forwarded_to_hr: { external: 'waiting', label: 'In Progress', color: 'amber' },
  interview: { external: 'waiting', label: 'In Progress', color: 'amber' },
  offered: { external: 'waiting', label: 'In Progress', color: 'amber' },
  rejected: { external: 'rejected', label: 'Not Selected', color: 'red' },
  hired: { external: 'hired', label: 'Congratulations! You\'re Hired', color: 'emerald' },
};

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  stackName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  cvUrl: string;
  cvFileName: string;
  coverLetter?: string;
  status: InternalApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  task?: Task;
  adminNotes?: string; // Internal notes visible only to admins
  rating?: number; // 1-5 star rating by admin
}

// Task Types
export type TaskType = 'coding' | 'design';
export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'reviewing' | 'approved' | 'rejected';

export interface TaskSubmission {
  projectVideoUrl?: string;
  githubLink?: string;
  figmaLink?: string;
  liveDemoLink?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Task {
  id: string;
  applicationId: string;
  type: TaskType;
  title: string;
  description: string;
  requirements: string[];
  resources?: string[];
  deadline: string;
  deadlineDays: number;
  requiredFields: SubmissionField[]; // Which fields are required for this task
  sentAt: string;
  submittedAt?: string;
  submission?: TaskSubmission;
  submissionNotes?: string;
  status: TaskStatus;
  feedback?: string;
}

// Site Settings
export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutContent: string;
  footerText: string;
  contactEmail: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// Admin Invite
export interface AdminInvite {
  id: string;
  email: string;
  assignedStacks: string[];
  permissions: StackAdminPermissions;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
}

// Export Data Types
export interface ExportableApplicant {
  name: string;
  email: string;
  phone: string;
  position: string;
  stack: string;
  status: string;
  appliedDate: string;
  experience?: string;
  skills?: string;
  cvUrl?: string;
  rating?: number;
}

// API Endpoints Documentation
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  response: string;
}
