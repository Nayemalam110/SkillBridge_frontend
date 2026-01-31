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
  createdAt: string;
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
export type JobStatus = 'active' | 'paused' | 'closed';

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
  createdAt: string;
  createdBy: string;
  applicantCount: number;
}

// Application Types
export type ApplicationStatus = 
  | 'applied' 
  | 'reviewing' 
  | 'task_sent' 
  | 'task_submitted' 
  | 'task_reviewing' 
  | 'interview' 
  | 'offered' 
  | 'rejected' 
  | 'hired';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  stackName: string;
  userId: string;
  userName: string;
  userEmail: string;
  cvUrl: string;
  cvFileName: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  task?: Task;
}

// Task Types
export type TaskType = 'coding' | 'design';
export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'reviewing' | 'approved' | 'rejected';

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
  sentAt: string;
  submittedAt?: string;
  submissionUrl?: string;
  submissionFileName?: string;
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
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
}

// API Endpoints Documentation
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  response: string;
}
