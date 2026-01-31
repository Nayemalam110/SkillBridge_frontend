# Job Portal Backend Specification (Updated)

## Django Backend Architecture

### Tech Stack Recommendations
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL (recommended for production) / MySQL
- **Authentication**: JWT (djangorestframework-simplejwt) + Google OAuth2
- **File Storage**: Django Storages with S3 or local FileSystem
- **Email**: Django Email with SMTP (SendGrid/Mailgun recommended)
- **Task Queue**: Celery with Redis (for async email sending)
- **Export**: openpyxl for Excel export

---

## Key Changes Summary

1. **Gmail-Only Authentication** - Job seekers can only register/login using Google OAuth2
2. **Single Application Restriction** - Job seekers can only have one active application at a time
3. **Job Expiry System** - Jobs have expiry dates; seekers can apply again after job expires
4. **Blocked Users** - Admins can block job seekers
5. **Stack Admin Permissions** - Granular permissions for stack admins
6. **Dual Status System** - Internal statuses (for admins) and Public statuses (for seekers)
7. **Submission Fields Configuration** - Configurable submission fields per job (GitHub, Figma, Video, etc.)
8. **Data Export** - Export filtered applications to Excel/CSV
9. **Job-wise Applications View** - View applications grouped by job post

---

## Database Design

### Entity Relationship Diagram (Conceptual)

```
User (1) ──────── (1) UserProfile
  │
  ├── (1) ──────── (M) Application
  │                      │
  │                      └── (1) ──── (1) Task
  │                                      │
  │                                      └── (1) ──── (1) TaskSubmission
  │
  └── (M) ──────── (M) TechStack (for Stack Admins via StackAdmin)
                            │
                            └── StackAdminPermissions

TechStack (1) ──── (M) Job
Job (1) ──────── (M) Application
Job (1) ──────── (1) JobSubmissionFields
```

---

## Models/Tables

### 1. User Model (extends AbstractUser)

```python
# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('seeker', 'Job Seeker'),
        ('stack_admin', 'Stack Admin'),
        ('super_admin', 'Super Admin'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='seeker')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)  # NEW: Block user
    blocked_at = models.DateTimeField(null=True, blank=True)  # NEW
    blocked_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='blocked_users'
    )  # NEW
    blocked_reason = models.TextField(blank=True)  # NEW
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)  # NEW: Google OAuth
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
```

**Table: users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| username | VARCHAR(150) | UNIQUE, NOT NULL |
| password | VARCHAR(128) | NOT NULL |
| first_name | VARCHAR(150) | NOT NULL |
| last_name | VARCHAR(150) | NOT NULL |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'seeker' |
| avatar | VARCHAR(255) | NULL |
| is_email_verified | BOOLEAN | DEFAULT FALSE |
| is_blocked | BOOLEAN | DEFAULT FALSE |
| blocked_at | DATETIME | NULL |
| blocked_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| blocked_reason | TEXT | NULL |
| google_id | VARCHAR(255) | UNIQUE, NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| is_staff | BOOLEAN | DEFAULT FALSE |
| is_superuser | BOOLEAN | DEFAULT FALSE |
| date_joined | DATETIME | NOT NULL |
| last_login | DATETIME | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

---

### 2. UserProfile Model

```python
# accounts/models.py

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    skills = models.JSONField(default=list)  # ["React", "Python", "Django"]
    experience_years = models.PositiveIntegerField(default=0)
    cv_file = models.FileField(upload_to='cvs/', null=True, blank=True)
    cv_filename = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
```

**Table: user_profiles**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users(id), UNIQUE |
| headline | VARCHAR(255) | NULL |
| bio | TEXT | NULL |
| phone | VARCHAR(20) | NULL |
| location | VARCHAR(255) | NULL |
| website | VARCHAR(255) | NULL |
| linkedin | VARCHAR(255) | NULL |
| github | VARCHAR(255) | NULL |
| portfolio | VARCHAR(255) | NULL |
| skills | JSON | DEFAULT '[]' |
| experience_years | INT | DEFAULT 0 |
| cv_file | VARCHAR(255) | NULL |
| cv_filename | VARCHAR(255) | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

---

### 3. TechStack Model

```python
# stacks/models.py

from django.db import models

class TechStack(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50)  # Lucide icon name
    description = models.TextField()
    color = models.CharField(max_length=7)  # Hex color code
    is_active = models.BooleanField(default=True)
    job_count = models.PositiveIntegerField(default=0)  # Denormalized for performance
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tech_stacks'
```

**Table: tech_stacks**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| icon | VARCHAR(50) | NOT NULL |
| description | TEXT | NOT NULL |
| color | VARCHAR(7) | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| job_count | INT | DEFAULT 0 |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

---

### 4. StackAdmin Model with Permissions (UPDATED)

```python
# stacks/models.py

class StackAdmin(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='stack_admin_assignments')
    stack = models.ForeignKey(TechStack, on_delete=models.CASCADE, related_name='admin_assignments')
    assigned_by = models.ForeignKey(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='stack_assignments_made'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    # NEW: Granular Permissions
    can_post_jobs = models.BooleanField(default=True)
    can_edit_jobs = models.BooleanField(default=True)
    can_delete_jobs = models.BooleanField(default=False)
    can_change_status = models.BooleanField(default=True)
    can_send_tasks = models.BooleanField(default=True)
    can_review_tasks = models.BooleanField(default=True)
    can_view_applicant_details = models.BooleanField(default=True)
    can_download_data = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'stack_admins'
        unique_together = ['user', 'stack']
```

**Table: stack_admins**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users(id) |
| stack_id | BIGINT | FOREIGN KEY → tech_stacks(id) |
| assigned_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| assigned_at | DATETIME | NOT NULL |
| can_post_jobs | BOOLEAN | DEFAULT TRUE |
| can_edit_jobs | BOOLEAN | DEFAULT TRUE |
| can_delete_jobs | BOOLEAN | DEFAULT FALSE |
| can_change_status | BOOLEAN | DEFAULT TRUE |
| can_send_tasks | BOOLEAN | DEFAULT TRUE |
| can_review_tasks | BOOLEAN | DEFAULT TRUE |
| can_view_applicant_details | BOOLEAN | DEFAULT TRUE |
| can_download_data | BOOLEAN | DEFAULT FALSE |
| | | UNIQUE(user_id, stack_id) |

---

### 5. AdminInvite Model (UPDATED)

```python
# accounts/models.py

import uuid

class AdminInvite(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invites_sent')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'admin_invites'


class AdminInviteStack(models.Model):
    """Through model for invite-stack relationship with permissions"""
    invite = models.ForeignKey(AdminInvite, on_delete=models.CASCADE, related_name='stack_permissions')
    stack = models.ForeignKey('stacks.TechStack', on_delete=models.CASCADE)
    
    # Permissions to be applied when invite is accepted
    can_post_jobs = models.BooleanField(default=True)
    can_edit_jobs = models.BooleanField(default=True)
    can_delete_jobs = models.BooleanField(default=False)
    can_change_status = models.BooleanField(default=True)
    can_send_tasks = models.BooleanField(default=True)
    can_review_tasks = models.BooleanField(default=True)
    can_view_applicant_details = models.BooleanField(default=True)
    can_download_data = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'admin_invite_stacks'
        unique_together = ['invite', 'stack']
```

**Table: admin_invites**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| email | VARCHAR(255) | NOT NULL |
| token | UUID | UNIQUE, NOT NULL |
| invited_by_id | BIGINT | FOREIGN KEY → users(id) |
| status | VARCHAR(20) | DEFAULT 'pending' |
| expires_at | DATETIME | NOT NULL |
| accepted_at | DATETIME | NULL |
| created_at | DATETIME | NOT NULL |

**Table: admin_invite_stacks**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| invite_id | BIGINT | FOREIGN KEY → admin_invites(id) |
| stack_id | BIGINT | FOREIGN KEY → tech_stacks(id) |
| can_post_jobs | BOOLEAN | DEFAULT TRUE |
| can_edit_jobs | BOOLEAN | DEFAULT TRUE |
| can_delete_jobs | BOOLEAN | DEFAULT FALSE |
| can_change_status | BOOLEAN | DEFAULT TRUE |
| can_send_tasks | BOOLEAN | DEFAULT TRUE |
| can_review_tasks | BOOLEAN | DEFAULT TRUE |
| can_view_applicant_details | BOOLEAN | DEFAULT TRUE |
| can_download_data | BOOLEAN | DEFAULT FALSE |
| | | UNIQUE(invite_id, stack_id) |

---

### 6. Job Model (UPDATED)

```python
# jobs/models.py

from django.db import models

class Job(models.Model):
    TYPE_CHOICES = [
        ('developer', 'Developer'),
        ('designer', 'Designer'),
    ]
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
        ('expired', 'Expired'),  # NEW
    ]
    
    EXPERIENCE_CHOICES = [
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead/Principal'),
    ]
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    stack = models.ForeignKey('stacks.TechStack', on_delete=models.CASCADE, related_name='jobs')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    requirements = models.JSONField(default=list)
    responsibilities = models.JSONField(default=list)
    benefits = models.JSONField(default=list)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES)
    location = models.CharField(max_length=255)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default='USD')
    is_salary_visible = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    application_count = models.PositiveIntegerField(default=0)
    task_auto_assign = models.BooleanField(default=False)
    task_deadline_days = models.PositiveIntegerField(default=7)
    default_task_id = models.ForeignKey(
        'TaskTemplate', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # NEW: Job expiry
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']


class JobSubmissionFields(models.Model):
    """NEW: Configurable submission fields per job"""
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='submission_fields')
    
    # Available submission field options
    project_video_enabled = models.BooleanField(default=False)
    project_video_required = models.BooleanField(default=False)
    project_video_label = models.CharField(max_length=100, default='Project Video URL')
    
    github_link_enabled = models.BooleanField(default=True)
    github_link_required = models.BooleanField(default=False)
    github_link_label = models.CharField(max_length=100, default='GitHub Repository URL')
    
    figma_link_enabled = models.BooleanField(default=False)
    figma_link_required = models.BooleanField(default=False)
    figma_link_label = models.CharField(max_length=100, default='Figma Design URL')
    
    live_demo_enabled = models.BooleanField(default=True)
    live_demo_required = models.BooleanField(default=False)
    live_demo_label = models.CharField(max_length=100, default='Live Demo URL')
    
    documentation_enabled = models.BooleanField(default=False)
    documentation_required = models.BooleanField(default=False)
    documentation_label = models.CharField(max_length=100, default='Documentation File')
    
    class Meta:
        db_table = 'job_submission_fields'
```

**Table: jobs**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | UNIQUE, NOT NULL |
| stack_id | BIGINT | FOREIGN KEY → tech_stacks(id) |
| type | VARCHAR(20) | NOT NULL |
| description | TEXT | NOT NULL |
| requirements | JSON | DEFAULT '[]' |
| responsibilities | JSON | DEFAULT '[]' |
| benefits | JSON | DEFAULT '[]' |
| employment_type | VARCHAR(20) | NOT NULL |
| experience_level | VARCHAR(20) | NOT NULL |
| location | VARCHAR(255) | NOT NULL |
| salary_min | INT | NULL |
| salary_max | INT | NULL |
| salary_currency | VARCHAR(3) | DEFAULT 'USD' |
| is_salary_visible | BOOLEAN | DEFAULT TRUE |
| status | VARCHAR(20) | DEFAULT 'active' |
| application_count | INT | DEFAULT 0 |
| task_auto_assign | BOOLEAN | DEFAULT FALSE |
| task_deadline_days | INT | DEFAULT 7 |
| default_task_id | BIGINT | FOREIGN KEY → task_templates(id), NULL |
| expires_at | DATETIME | NULL |
| created_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Table: job_submission_fields**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| job_id | BIGINT | FOREIGN KEY → jobs(id), UNIQUE |
| project_video_enabled | BOOLEAN | DEFAULT FALSE |
| project_video_required | BOOLEAN | DEFAULT FALSE |
| project_video_label | VARCHAR(100) | DEFAULT 'Project Video URL' |
| github_link_enabled | BOOLEAN | DEFAULT TRUE |
| github_link_required | BOOLEAN | DEFAULT FALSE |
| github_link_label | VARCHAR(100) | DEFAULT 'GitHub Repository URL' |
| figma_link_enabled | BOOLEAN | DEFAULT FALSE |
| figma_link_required | BOOLEAN | DEFAULT FALSE |
| figma_link_label | VARCHAR(100) | DEFAULT 'Figma Design URL' |
| live_demo_enabled | BOOLEAN | DEFAULT TRUE |
| live_demo_required | BOOLEAN | DEFAULT FALSE |
| live_demo_label | VARCHAR(100) | DEFAULT 'Live Demo URL' |
| documentation_enabled | BOOLEAN | DEFAULT FALSE |
| documentation_required | BOOLEAN | DEFAULT FALSE |
| documentation_label | VARCHAR(100) | DEFAULT 'Documentation File' |

---

### 7. TaskTemplate Model

```python
# jobs/models.py

class TaskTemplate(models.Model):
    TYPE_CHOICES = [
        ('coding', 'Coding Task'),
        ('design', 'Design Task'),
    ]
    
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    requirements = models.JSONField(default=list)
    resources = models.JSONField(default=list)  # [{"name": "Figma File", "url": "..."}]
    stack = models.ForeignKey('stacks.TechStack', on_delete=models.CASCADE, null=True)
    default_deadline_days = models.PositiveIntegerField(default=7)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_templates'
```

**Table: task_templates**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL |
| type | VARCHAR(20) | NOT NULL |
| description | TEXT | NOT NULL |
| requirements | JSON | DEFAULT '[]' |
| resources | JSON | DEFAULT '[]' |
| stack_id | BIGINT | FOREIGN KEY → tech_stacks(id), NULL |
| default_deadline_days | INT | DEFAULT 7 |
| created_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

---

### 8. Application Model (UPDATED - Dual Status System)

```python
# applications/models.py

from django.db import models

class Application(models.Model):
    # INTERNAL STATUS - What admins see
    INTERNAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('task_sent', 'Task Sent'),
        ('task_submitted', 'Task Submitted'),
        ('task_review', 'Task Under Review'),
        ('potential', 'Potential Candidate'),
        ('waiting', 'Waiting'),
        ('potentially_rejected', 'Potentially Rejected'),
        ('forwarded_to_hr', 'Forwarded to HR'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
        ('blocked', 'Blocked'),
    ]
    
    # PUBLIC STATUS - What job seekers see (derived from internal status)
    # pending, reviewing, task_sent, task_submitted → Maps to specific public status
    # potential, waiting, potentially_rejected, forwarded_to_hr, task_review → "Waiting/Under Review"
    # hired → "Hired"
    # rejected, blocked → "Rejected"
    
    applicant = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True)
    cv_file = models.FileField(upload_to='application_cvs/')
    cv_filename = models.CharField(max_length=255)
    
    internal_status = models.CharField(max_length=30, choices=INTERNAL_STATUS_CHOICES, default='pending')
    
    status_updated_at = models.DateTimeField(auto_now=True)
    status_updated_by = models.ForeignKey(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='status_updates_made'
    )
    notes = models.TextField(blank=True)  # Internal notes by admin
    rating = models.PositiveSmallIntegerField(null=True, blank=True)  # 1-5 rating
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applications'
        ordering = ['-created_at']
    
    @property
    def public_status(self):
        """Returns the status visible to job seekers"""
        status_mapping = {
            'pending': 'pending',
            'reviewing': 'in_review',
            'task_sent': 'task_pending',
            'task_submitted': 'task_submitted',
            'task_review': 'waiting',
            'potential': 'waiting',
            'waiting': 'waiting',
            'potentially_rejected': 'waiting',
            'forwarded_to_hr': 'waiting',
            'hired': 'hired',
            'rejected': 'rejected',
            'blocked': 'rejected',
        }
        return status_mapping.get(self.internal_status, 'pending')
    
    @classmethod
    def can_user_apply(cls, user, job):
        """Check if user can apply for a job (single application restriction)"""
        # Check if user has any active application
        active_statuses = ['pending', 'reviewing', 'task_sent', 'task_submitted', 
                          'task_review', 'potential', 'waiting', 'potentially_rejected', 
                          'forwarded_to_hr']
        
        has_active = cls.objects.filter(
            applicant=user,
            internal_status__in=active_statuses,
            job__status__in=['active', 'paused']  # Only count applications to non-expired jobs
        ).exists()
        
        return not has_active
```

**Table: applications**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| applicant_id | BIGINT | FOREIGN KEY → users(id) |
| job_id | BIGINT | FOREIGN KEY → jobs(id) |
| cover_letter | TEXT | NULL |
| cv_file | VARCHAR(255) | NOT NULL |
| cv_filename | VARCHAR(255) | NOT NULL |
| internal_status | VARCHAR(30) | DEFAULT 'pending' |
| status_updated_at | DATETIME | NOT NULL |
| status_updated_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| notes | TEXT | NULL |
| rating | SMALLINT | NULL, CHECK(1-5) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

---

### 9. Task Model

```python
# applications/models.py

class Task(models.Model):
    TYPE_CHOICES = [
        ('coding', 'Coding Task'),
        ('design', 'Design Task'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='task')
    template = models.ForeignKey(TaskTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    requirements = models.JSONField(default=list)
    resources = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    deadline = models.DateTimeField()
    assigned_by = models.ForeignKey(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='tasks_assigned'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    # Review fields
    reviewed_by = models.ForeignKey(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='tasks_reviewed'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_feedback = models.TextField(blank=True)
    review_score = models.PositiveSmallIntegerField(null=True, blank=True)  # 1-10
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tasks'


class TaskSubmission(models.Model):
    """NEW: Separate model for task submissions with configurable fields"""
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name='submission')
    
    # File submission
    submission_file = models.FileField(upload_to='task_submissions/', null=True, blank=True)
    submission_filename = models.CharField(max_length=255, blank=True)
    
    # Configurable link fields
    project_video_url = models.URLField(blank=True)
    github_link = models.URLField(blank=True)
    figma_link = models.URLField(blank=True)
    live_demo_url = models.URLField(blank=True)
    documentation_file = models.FileField(upload_to='task_docs/', null=True, blank=True)
    documentation_filename = models.CharField(max_length=255, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_submissions'
```

**Table: tasks**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| application_id | BIGINT | FOREIGN KEY → applications(id), UNIQUE |
| template_id | BIGINT | FOREIGN KEY → task_templates(id), NULL |
| title | VARCHAR(255) | NOT NULL |
| type | VARCHAR(20) | NOT NULL |
| description | TEXT | NOT NULL |
| requirements | JSON | DEFAULT '[]' |
| resources | JSON | DEFAULT '[]' |
| status | VARCHAR(20) | DEFAULT 'pending' |
| deadline | DATETIME | NOT NULL |
| assigned_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| assigned_at | DATETIME | NOT NULL |
| reviewed_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| reviewed_at | DATETIME | NULL |
| review_feedback | TEXT | NULL |
| review_score | SMALLINT | NULL, CHECK(1-10) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Table: task_submissions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| task_id | BIGINT | FOREIGN KEY → tasks(id), UNIQUE |
| submission_file | VARCHAR(255) | NULL |
| submission_filename | VARCHAR(255) | NULL |
| project_video_url | VARCHAR(500) | NULL |
| github_link | VARCHAR(500) | NULL |
| figma_link | VARCHAR(500) | NULL |
| live_demo_url | VARCHAR(500) | NULL |
| documentation_file | VARCHAR(255) | NULL |
| documentation_filename | VARCHAR(255) | NULL |
| notes | TEXT | NULL |
| submitted_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

---

### 10. ApplicationStatusHistory Model

```python
# applications/models.py

class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'application_status_history'
        ordering = ['-created_at']
```

**Table: application_status_history**
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| application_id | BIGINT | FOREIGN KEY → applications(id) |
| from_status | VARCHAR(30) | NULL |
| to_status | VARCHAR(30) | NOT NULL |
| changed_by_id | BIGINT | FOREIGN KEY → users(id), NULL |
| notes | TEXT | NULL |
| created_at | DATETIME | NOT NULL |

---

### 11. SiteSettings Model

```python
# settings/models.py

from django.db import models

class SiteSettings(models.Model):
    # Only one row should exist (singleton pattern)
    site_name = models.CharField(max_length=100, default='TechJobs')
    site_logo = models.ImageField(upload_to='site/', null=True, blank=True)
    favicon = models.ImageField(upload_to='site/', null=True, blank=True)
    
    # Hero Section
    hero_title = models.CharField(max_length=255)
    hero_subtitle = models.TextField()
    hero_cta_text = models.CharField(max_length=50, default='Browse Jobs')
    hero_cta_link = models.CharField(max_length=255, default='/jobs')
    hero_image = models.ImageField(upload_to='site/', null=True, blank=True)
    
    # About Section
    about_title = models.CharField(max_length=255)
    about_description = models.TextField()
    about_features = models.JSONField(default=list)
    
    # Contact Info
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_address = models.TextField(blank=True)
    
    # Social Links
    social_linkedin = models.URLField(blank=True)
    social_twitter = models.URLField(blank=True)
    social_github = models.URLField(blank=True)
    social_facebook = models.URLField(blank=True)
    social_instagram = models.URLField(blank=True)
    
    # Footer
    footer_text = models.TextField()
    footer_links = models.JSONField(default=list)
    
    # SEO
    meta_description = models.TextField(blank=True)
    meta_keywords = models.CharField(max_length=500, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'
    
    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
```

---

### 12. EmailLog Model

```python
# notifications/models.py

class EmailLog(models.Model):
    TYPE_CHOICES = [
        ('welcome', 'Welcome Email'),
        ('verify_email', 'Email Verification'),
        ('password_reset', 'Password Reset'),
        ('application_received', 'Application Received'),
        ('status_update', 'Status Update'),
        ('task_assigned', 'Task Assigned'),
        ('task_reminder', 'Task Reminder'),
        ('task_submitted', 'Task Submitted'),
        ('admin_invite', 'Admin Invite'),
        ('user_blocked', 'User Blocked'),
    ]
    
    recipient = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True)
    recipient_email = models.EmailField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'email_logs'
```

---

## API Endpoints

### Base URL: `/api/v1/`

### Authentication Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 1. Authentication Endpoints (UPDATED - Gmail Only for Seekers)

### POST `/api/v1/auth/google/`
Login/Register with Google OAuth2 (Job Seekers Only).

**Request Body:**
```json
{
    "credential": "google-id-token-from-frontend"
}
```

**Success Response (200 OK) - Existing User:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "email": "john@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "full_name": "John Doe",
            "role": "seeker",
            "avatar": "https://lh3.googleusercontent.com/...",
            "is_email_verified": true,
            "is_blocked": false,
            "created_at": "2024-01-15T10:30:00Z",
            "profile": {
                "headline": "Full Stack Developer",
                "location": "San Francisco, CA",
                "skills": ["React", "Python", "Django"],
                "experience_years": 5
            },
            "can_apply": true,
            "active_application": null
        },
        "tokens": {
            "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
            "access_expires_in": 3600,
            "refresh_expires_in": 604800
        },
        "is_new_user": false
    }
}
```

**Success Response (201 Created) - New User:**
```json
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "user": {
            "id": 10,
            "email": "newuser@gmail.com",
            "first_name": "New",
            "last_name": "User",
            "full_name": "New User",
            "role": "seeker",
            "avatar": "https://lh3.googleusercontent.com/...",
            "is_email_verified": true,
            "is_blocked": false,
            "created_at": "2024-01-25T10:30:00Z",
            "profile": {
                "headline": "",
                "location": "",
                "skills": [],
                "experience_years": 0
            },
            "can_apply": true,
            "active_application": null
        },
        "tokens": {
            "access": "...",
            "refresh": "...",
            "access_expires_in": 3600,
            "refresh_expires_in": 604800
        },
        "is_new_user": true
    }
}
```

**Error Response (403 Forbidden) - Blocked User:**
```json
{
    "success": false,
    "message": "Your account has been blocked. Please contact support.",
    "code": "USER_BLOCKED"
}
```

---

### POST `/api/v1/auth/admin/login/`
Login for Admins (Stack Admin & Super Admin) - Email/Password.

**Request Body:**
```json
{
    "email": "admin@example.com",
    "password": "SecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 2,
            "email": "admin@example.com",
            "first_name": "Jane",
            "last_name": "Admin",
            "full_name": "Jane Admin",
            "role": "stack_admin",
            "avatar": null,
            "is_email_verified": true,
            "created_at": "2024-01-05T09:00:00Z",
            "assigned_stacks": [
                {
                    "id": 1,
                    "name": "React",
                    "slug": "react",
                    "color": "#61DAFB",
                    "permissions": {
                        "can_post_jobs": true,
                        "can_edit_jobs": true,
                        "can_delete_jobs": false,
                        "can_change_status": true,
                        "can_send_tasks": true,
                        "can_review_tasks": true,
                        "can_view_applicant_details": true,
                        "can_download_data": false
                    }
                },
                {
                    "id": 2,
                    "name": "Python",
                    "slug": "python",
                    "color": "#3776AB",
                    "permissions": {
                        "can_post_jobs": true,
                        "can_edit_jobs": true,
                        "can_delete_jobs": false,
                        "can_change_status": true,
                        "can_send_tasks": true,
                        "can_review_tasks": true,
                        "can_view_applicant_details": true,
                        "can_download_data": false
                    }
                }
            ]
        },
        "tokens": {
            "access": "...",
            "refresh": "...",
            "access_expires_in": 3600,
            "refresh_expires_in": 604800
        }
    }
}
```

---

### POST `/api/v1/auth/logout/`
Logout and blacklist refresh token.

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

### POST `/api/v1/auth/token/refresh/`
Refresh access token.

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "access_expires_in": 3600
    }
}
```

---

### GET `/api/v1/auth/me/`
Get current authenticated user.

**Success Response (200 OK) - For Seeker:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "john@gmail.com",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "role": "seeker",
        "avatar": "https://lh3.googleusercontent.com/...",
        "is_email_verified": true,
        "is_blocked": false,
        "created_at": "2024-01-15T10:30:00Z",
        "profile": {
            "id": 1,
            "headline": "Full Stack Developer",
            "bio": "Passionate developer...",
            "phone": "+1 234 567 8900",
            "location": "San Francisco, CA",
            "website": "https://johndoe.dev",
            "linkedin": "https://linkedin.com/in/johndoe",
            "github": "https://github.com/johndoe",
            "portfolio": "https://johndoe.dev",
            "skills": ["React", "TypeScript", "Python"],
            "experience_years": 5,
            "cv_file": "https://storage.example.com/cvs/john.pdf",
            "cv_filename": "John_Doe_Resume.pdf"
        },
        "can_apply": true,
        "active_application": null
    }
}
```

**Success Response (200 OK) - For Seeker with Active Application:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "john@gmail.com",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "role": "seeker",
        "avatar": "https://lh3.googleusercontent.com/...",
        "is_email_verified": true,
        "is_blocked": false,
        "created_at": "2024-01-15T10:30:00Z",
        "profile": { ... },
        "can_apply": false,
        "active_application": {
            "id": 5,
            "job": {
                "id": 3,
                "title": "Senior React Developer",
                "stack": {"name": "React"}
            },
            "public_status": "in_review",
            "created_at": "2024-01-20T10:00:00Z"
        }
    }
}
```

---

## 2. User Management Endpoints

### POST `/api/v1/users/{id}/block/` [Admin Only]
Block a job seeker.

**Request Body:**
```json
{
    "reason": "Submitted plagiarized code in task submission"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "User has been blocked successfully",
    "data": {
        "id": 5,
        "email": "blocked@gmail.com",
        "full_name": "Blocked User",
        "is_blocked": true,
        "blocked_at": "2024-01-25T10:00:00Z",
        "blocked_reason": "Submitted plagiarized code in task submission"
    }
}
```

---

### POST `/api/v1/users/{id}/unblock/` [Super Admin Only]
Unblock a job seeker.

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "User has been unblocked successfully",
    "data": {
        "id": 5,
        "email": "unblocked@gmail.com",
        "full_name": "Unblocked User",
        "is_blocked": false
    }
}
```

---

### GET `/api/v1/users/blocked/` [Admin Only]
List all blocked users.

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 5,
            "email": "blocked@gmail.com",
            "full_name": "Blocked User",
            "blocked_at": "2024-01-25T10:00:00Z",
            "blocked_by": {
                "id": 2,
                "full_name": "Admin User"
            },
            "blocked_reason": "Submitted plagiarized code"
        }
    ],
    "meta": {
        "total": 1
    }
}
```

---

## 3. User Profile Endpoints

### GET `/api/v1/users/profile/`
Get current user's profile.

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "user": {
            "id": 1,
            "email": "john@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "full_name": "John Doe",
            "avatar": "https://lh3.googleusercontent.com/..."
        },
        "headline": "Full Stack Developer",
        "bio": "Passionate developer with 5 years of experience...",
        "phone": "+1 234 567 8900",
        "location": "San Francisco, CA",
        "website": "https://johndoe.dev",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe",
        "portfolio": "https://johndoe.dev",
        "skills": ["React", "TypeScript", "Python", "Django"],
        "experience_years": 5,
        "cv_file": "https://storage.example.com/cvs/john.pdf",
        "cv_filename": "John_Doe_Resume.pdf",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T14:45:00Z"
    }
}
```

---

### PUT `/api/v1/users/profile/`
Update user profile.

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "headline": "Senior Full Stack Developer",
    "bio": "Updated bio here...",
    "phone": "+1 234 567 8900",
    "location": "New York, NY",
    "website": "https://johndoe.dev",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.dev",
    "skills": ["React", "TypeScript", "Python", "Django", "AWS"],
    "experience_years": 6
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": { ... }
}
```

---

### POST `/api/v1/users/profile/cv/`
Upload CV/Resume.

**Request:** `multipart/form-data`
```
cv: [File]
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "CV uploaded successfully",
    "data": {
        "cv_file": "https://storage.example.com/cvs/john_v2.pdf",
        "cv_filename": "John_Doe_Resume_2024.pdf"
    }
}
```

---

## 4. Tech Stack Endpoints

### GET `/api/v1/stacks/`
List all active tech stacks.

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "React",
            "slug": "react",
            "icon": "Component",
            "description": "Build modern web applications with React.",
            "color": "#61DAFB",
            "is_active": true,
            "job_count": 15,
            "active_job_count": 12,
            "created_at": "2024-01-01T00:00:00Z"
        }
    ],
    "meta": {
        "total": 6
    }
}
```

---

### POST `/api/v1/stacks/` [Super Admin Only]
Create new tech stack.

**Request Body:**
```json
{
    "name": "Vue.js",
    "icon": "Component",
    "description": "Build progressive web applications with Vue.js.",
    "color": "#4FC08D"
}
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "Tech stack created successfully",
    "data": {
        "id": 7,
        "name": "Vue.js",
        "slug": "vuejs",
        "icon": "Component",
        "description": "Build progressive web applications with Vue.js.",
        "color": "#4FC08D",
        "is_active": true,
        "job_count": 0,
        "created_at": "2024-01-25T10:00:00Z"
    }
}
```

---

## 5. Job Endpoints (UPDATED)

### GET `/api/v1/jobs/`
List all jobs with filtering.

**Query Parameters:**
- `stack` (string): Filter by stack slug
- `type` (string): developer/designer
- `employment_type` (string): full-time, part-time, etc.
- `experience_level` (string): entry, mid, senior, lead
- `location` (string): Search by location
- `status` (string): active, paused, closed, expired (admin only)
- `search` (string): Search in title
- `include_expired` (boolean): Include expired jobs (admin only)
- `page` (integer): Page number
- `page_size` (integer): Items per page

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "Senior React Developer",
            "slug": "senior-react-developer",
            "stack": {
                "id": 1,
                "name": "React",
                "slug": "react",
                "icon": "Component",
                "color": "#61DAFB"
            },
            "type": "developer",
            "description": "We are looking for an experienced React developer...",
            "employment_type": "full-time",
            "experience_level": "senior",
            "location": "San Francisco, CA",
            "salary_min": 120000,
            "salary_max": 180000,
            "salary_currency": "USD",
            "is_salary_visible": true,
            "status": "active",
            "application_count": 45,
            "expires_at": "2024-03-01T23:59:59Z",
            "is_expired": false,
            "created_at": "2024-01-10T09:00:00Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "total_pages": 5,
        "total_count": 47,
        "page_size": 10
    }
}
```

---

### GET `/api/v1/jobs/{slug}/`
Get single job details.

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Senior React Developer",
        "slug": "senior-react-developer",
        "stack": {
            "id": 1,
            "name": "React",
            "slug": "react",
            "icon": "Component",
            "color": "#61DAFB"
        },
        "type": "developer",
        "description": "We are looking for an experienced React developer...",
        "requirements": ["5+ years React", "TypeScript", "Redux"],
        "responsibilities": ["Build features", "Code reviews", "Mentor juniors"],
        "benefits": ["Health insurance", "401k", "Remote work"],
        "employment_type": "full-time",
        "experience_level": "senior",
        "location": "San Francisco, CA",
        "salary_min": 120000,
        "salary_max": 180000,
        "salary_currency": "USD",
        "is_salary_visible": true,
        "status": "active",
        "application_count": 45,
        "task_deadline_days": 7,
        "expires_at": "2024-03-01T23:59:59Z",
        "is_expired": false,
        "submission_fields": {
            "project_video": {"enabled": false, "required": false, "label": "Project Video URL"},
            "github_link": {"enabled": true, "required": true, "label": "GitHub Repository URL"},
            "figma_link": {"enabled": false, "required": false, "label": "Figma Design URL"},
            "live_demo": {"enabled": true, "required": false, "label": "Live Demo URL"},
            "documentation": {"enabled": false, "required": false, "label": "Documentation File"}
        },
        "has_applied": false,
        "can_apply": true,
        "application_id": null,
        "created_by": {
            "id": 3,
            "full_name": "Admin User"
        },
        "created_at": "2024-01-10T09:00:00Z"
    }
}
```

---

### GET `/api/v1/jobs/{id}/applications/` [Admin Only]
Get applications for a specific job (job-wise view).

**Query Parameters:**
- `status` (string): Filter by internal status
- `search` (string): Search by applicant name/email
- `page` (integer): Page number

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "job": {
            "id": 1,
            "title": "Senior React Developer",
            "stack": {"name": "React", "color": "#61DAFB"},
            "status": "active",
            "application_count": 45
        },
        "applications": [
            {
                "id": 1,
                "applicant": {
                    "id": 5,
                    "email": "john@gmail.com",
                    "full_name": "John Doe",
                    "avatar": "...",
                    "is_blocked": false,
                    "profile": {
                        "headline": "Full Stack Developer",
                        "phone": "+1 234 567 8900",
                        "location": "San Francisco, CA",
                        "skills": ["React", "TypeScript"],
                        "experience_years": 5,
                        "linkedin": "https://linkedin.com/in/johndoe",
                        "github": "https://github.com/johndoe"
                    }
                },
                "internal_status": "task_submitted",
                "public_status": "task_submitted",
                "cv_file": "https://storage.example.com/cvs/app_1.pdf",
                "cv_filename": "Resume.pdf",
                "has_task": true,
                "task": {
                    "id": 1,
                    "title": "Build a Todo App",
                    "status": "submitted",
                    "deadline": "2024-02-01T23:59:59Z",
                    "submission": {
                        "github_link": "https://github.com/johndoe/todo",
                        "live_demo_url": "https://todo.vercel.app",
                        "submitted_at": "2024-01-30T15:00:00Z"
                    }
                },
                "rating": 4,
                "notes": "Strong candidate",
                "created_at": "2024-01-15T09:00:00Z"
            }
        ],
        "stats": {
            "total": 45,
            "pending": 10,
            "reviewing": 8,
            "task_sent": 12,
            "task_submitted": 5,
            "potential": 3,
            "hired": 1,
            "rejected": 6
        }
    },
    "meta": {
        "current_page": 1,
        "total_pages": 5,
        "total_count": 45,
        "page_size": 10
    }
}
```

---

### POST `/api/v1/jobs/` [Admin Only - With Permission Check]
Create new job.

**Permission Check for Stack Admin:**
- Must have `can_post_jobs` permission for the stack

**Request Body:**
```json
{
    "title": "Full Stack Developer",
    "stack_id": 1,
    "type": "developer",
    "description": "We are looking for a full stack developer...",
    "requirements": ["3+ years React", "Node.js or Python"],
    "responsibilities": ["Build features", "Write tests"],
    "benefits": ["Health insurance", "Remote work"],
    "employment_type": "full-time",
    "experience_level": "mid",
    "location": "Remote",
    "salary_min": 90000,
    "salary_max": 140000,
    "salary_currency": "USD",
    "is_salary_visible": true,
    "status": "active",
    "task_auto_assign": false,
    "task_deadline_days": 7,
    "expires_at": "2024-03-01T23:59:59Z",
    "submission_fields": {
        "project_video": {"enabled": true, "required": false, "label": "Project Demo Video"},
        "github_link": {"enabled": true, "required": true, "label": "GitHub Repository"},
        "figma_link": {"enabled": false, "required": false, "label": "Figma Design"},
        "live_demo": {"enabled": true, "required": true, "label": "Deployed Application URL"},
        "documentation": {"enabled": true, "required": false, "label": "README/Documentation"}
    }
}
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "Job created successfully",
    "data": { ... }
}
```

**Error Response (403 Forbidden) - No Permission:**
```json
{
    "success": false,
    "message": "You don't have permission to post jobs for this stack",
    "code": "PERMISSION_DENIED"
}
```

---

### PUT `/api/v1/jobs/{id}/` [Admin Only - With Permission Check]
Update job.

**Permission Check for Stack Admin:**
- Must have `can_edit_jobs` permission for the job's stack

---

### DELETE `/api/v1/jobs/{id}/` [Admin Only - With Permission Check]
Delete job.

**Permission Check for Stack Admin:**
- Must have `can_delete_jobs` permission for the job's stack

---

## 6. Application Endpoints (UPDATED)

### GET `/api/v1/applications/` [Authenticated]
List applications.

**For Job Seekers:** Returns only their applications with PUBLIC status
**For Admins:** Returns applications based on access with INTERNAL status

**Query Parameters (Admin only):**
- `internal_status` (string): Filter by internal status
- `job_id` (integer): Filter by job
- `stack_id` (integer): Filter by stack
- `search` (string): Search by applicant name/email
- `rating` (integer): Filter by rating
- `has_task` (boolean): Filter by task assignment
- `page` (integer): Page number

**Success Response (200 OK) - For Seekers (Public Status):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "job": {
                "id": 1,
                "title": "Senior React Developer",
                "slug": "senior-react-developer",
                "stack": {"id": 1, "name": "React", "color": "#61DAFB"},
                "type": "developer",
                "location": "San Francisco, CA",
                "employment_type": "full-time",
                "status": "active",
                "is_expired": false
            },
            "status": "in_review",
            "cover_letter": "I am excited to apply...",
            "cv_file": "https://storage.example.com/cvs/app_1.pdf",
            "cv_filename": "Resume.pdf",
            "has_task": true,
            "task": {
                "id": 1,
                "title": "Build a Todo App",
                "type": "coding",
                "status": "pending",
                "deadline": "2024-02-01T23:59:59Z",
                "days_remaining": 5,
                "submission_fields": {
                    "github_link": {"enabled": true, "required": true, "label": "GitHub Repository"},
                    "live_demo": {"enabled": true, "required": false, "label": "Live Demo URL"}
                }
            },
            "created_at": "2024-01-15T09:00:00Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "total_count": 1
    }
}
```

**Success Response (200 OK) - For Admins (Internal Status):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "applicant": {
                "id": 5,
                "email": "john@gmail.com",
                "first_name": "John",
                "last_name": "Doe",
                "full_name": "John Doe",
                "avatar": "https://lh3.googleusercontent.com/...",
                "is_blocked": false,
                "profile": {
                    "headline": "Full Stack Developer",
                    "phone": "+1 234 567 8900",
                    "location": "San Francisco, CA",
                    "skills": ["React", "TypeScript", "Python"],
                    "experience_years": 5,
                    "linkedin": "https://linkedin.com/in/johndoe",
                    "github": "https://github.com/johndoe",
                    "portfolio": "https://johndoe.dev"
                }
            },
            "job": {
                "id": 1,
                "title": "Senior React Developer",
                "slug": "senior-react-developer",
                "stack": {"id": 1, "name": "React", "color": "#61DAFB"},
                "type": "developer",
                "location": "San Francisco, CA"
            },
            "internal_status": "potential",
            "public_status": "waiting",
            "cover_letter": "I am excited to apply...",
            "cv_file": "https://storage.example.com/cvs/app_1.pdf",
            "cv_filename": "Resume.pdf",
            "notes": "Strong candidate, good portfolio",
            "rating": 4,
            "has_task": true,
            "task": {
                "id": 1,
                "title": "Build a Todo App",
                "type": "coding",
                "status": "submitted",
                "deadline": "2024-02-01T23:59:59Z",
                "submission": {
                    "project_video_url": "",
                    "github_link": "https://github.com/johndoe/todo",
                    "figma_link": "",
                    "live_demo_url": "https://todo.vercel.app",
                    "documentation_file": null,
                    "notes": "Completed all requirements...",
                    "submitted_at": "2024-01-30T15:00:00Z"
                }
            },
            "created_at": "2024-01-15T09:00:00Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "total_pages": 5,
        "total_count": 45,
        "page_size": 10,
        "stats": {
            "total": 45,
            "pending": 10,
            "reviewing": 8,
            "task_sent": 12,
            "task_submitted": 5,
            "task_review": 2,
            "potential": 3,
            "waiting": 1,
            "potentially_rejected": 1,
            "forwarded_to_hr": 1,
            "hired": 1,
            "rejected": 1
        }
    }
}
```

---

### POST `/api/v1/applications/` [Job Seeker Only]
Submit new application.

**Validation:**
- User must not be blocked
- User must not have an active application
- Job must be active and not expired

**Request:** `multipart/form-data`
```
job_id: 1
cover_letter: "I am excited to apply for this position..."
cv: [File]
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "Application submitted successfully",
    "data": {
        "id": 10,
        "job": {
            "id": 1,
            "title": "Senior React Developer",
            "stack": {"name": "React", "color": "#61DAFB"}
        },
        "status": "pending",
        "cover_letter": "I am excited to apply...",
        "cv_file": "https://storage.example.com/cvs/app_10.pdf",
        "cv_filename": "Resume.pdf",
        "created_at": "2024-01-25T10:00:00Z"
    }
}
```

**Error Response (400 Bad Request) - Already Has Active Application:**
```json
{
    "success": false,
    "message": "You already have an active application. You can only apply for one job at a time.",
    "code": "ACTIVE_APPLICATION_EXISTS",
    "data": {
        "active_application": {
            "id": 5,
            "job": {
                "id": 3,
                "title": "React Developer"
            },
            "status": "in_review"
        }
    }
}
```

**Error Response (400 Bad Request) - Job Expired:**
```json
{
    "success": false,
    "message": "This job posting has expired and is no longer accepting applications.",
    "code": "JOB_EXPIRED"
}
```

**Error Response (403 Forbidden) - User Blocked:**
```json
{
    "success": false,
    "message": "Your account has been blocked. You cannot submit applications.",
    "code": "USER_BLOCKED"
}
```

---

### PATCH `/api/v1/applications/{id}/status/` [Admin Only - With Permission Check]
Update application internal status.

**Permission Check for Stack Admin:**
- Must have `can_change_status` permission for the job's stack

**Request Body:**
```json
{
    "internal_status": "potential",
    "notes": "Strong technical skills, moving to potential pool"
}
```

**Available Internal Statuses:**
- `pending` - Just applied
- `reviewing` - Under initial review
- `task_sent` - Task has been sent
- `task_submitted` - Candidate submitted task
- `task_review` - Task under review
- `potential` - Potential candidate
- `waiting` - In waiting pool
- `potentially_rejected` - Might be rejected
- `forwarded_to_hr` - Sent to HR for final decision
- `hired` - Hired!
- `rejected` - Rejected
- `blocked` - User is blocked

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Application status updated successfully",
    "data": {
        "id": 1,
        "internal_status": "potential",
        "public_status": "waiting",
        "status_updated_at": "2024-01-25T11:00:00Z"
    }
}
```

---

### GET `/api/v1/applications/export/` [Admin Only - With Permission Check]
Export filtered applications to Excel/CSV.

**Permission Check for Stack Admin:**
- Must have `can_download_data` permission

**Query Parameters:**
- `format` (string): 'excel' or 'csv' (default: 'excel')
- `internal_status` (string): Filter by status (comma-separated for multiple)
- `job_id` (integer): Filter by job
- `stack_id` (integer): Filter by stack
- `fields` (string): Comma-separated field names to include

**Available Fields:**
- `name` - Full name
- `email` - Email address
- `phone` - Phone number
- `location` - Location
- `skills` - Skills (comma-separated)
- `experience_years` - Years of experience
- `linkedin` - LinkedIn URL
- `github` - GitHub URL
- `portfolio` - Portfolio URL
- `job_title` - Applied job title
- `stack` - Tech stack
- `status` - Current status
- `rating` - Admin rating
- `applied_date` - Application date
- `cv_link` - CV download link

**Example Request:**
```
GET /api/v1/applications/export/?format=excel&internal_status=potential,forwarded_to_hr&fields=name,email,phone,skills,job_title,status,rating
```

**Success Response:** Binary file download (Excel/CSV)

**Response Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="applications_export_2024-01-25.xlsx"
```

---

## 7. Task Endpoints (UPDATED)

### POST `/api/v1/applications/{id}/task/` [Admin Only - With Permission Check]
Assign task to application.

**Permission Check for Stack Admin:**
- Must have `can_send_tasks` permission for the job's stack

**Request Body:**
```json
{
    "title": "Build a Todo App with React",
    "type": "coding",
    "description": "Create a fully functional todo application...",
    "requirements": [
        "Use React with TypeScript",
        "Implement CRUD operations",
        "Add filtering and sorting",
        "Include unit tests",
        "Deploy to Vercel or Netlify"
    ],
    "resources": [
        {"name": "Design Mockup", "url": "https://figma.com/file/xxx"}
    ],
    "deadline_days": 7,
    "send_email": true
}
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "Task assigned successfully. Email notification sent.",
    "data": {
        "id": 5,
        "application_id": 1,
        "title": "Build a Todo App with React",
        "type": "coding",
        "status": "pending",
        "deadline": "2024-02-01T23:59:59Z",
        "submission_fields": {
            "project_video": {"enabled": true, "required": false},
            "github_link": {"enabled": true, "required": true},
            "figma_link": {"enabled": false, "required": false},
            "live_demo": {"enabled": true, "required": true},
            "documentation": {"enabled": false, "required": false}
        },
        "assigned_at": "2024-01-25T10:00:00Z"
    }
}
```

---

### POST `/api/v1/tasks/{id}/submit/` [Seeker Only]
Submit task with configurable fields.

**Request:** `multipart/form-data`
```
file: [File] (optional)
project_video_url: "https://youtube.com/watch?v=xxx" (if enabled)
github_link: "https://github.com/johndoe/todo-app" (if enabled)
figma_link: "https://figma.com/file/xxx" (if enabled)
live_demo_url: "https://todo-app.vercel.app" (if enabled)
documentation: [File] (if enabled)
notes: "Completed all requirements. Added extra features..."
```

**Validation:**
- Required fields (based on job configuration) must be provided
- Task must not be expired
- Task must not be already submitted

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Task submitted successfully",
    "data": {
        "id": 1,
        "status": "submitted",
        "submission": {
            "submission_file": "https://storage.example.com/submissions/task_1.zip",
            "submission_filename": "todo-app.zip",
            "project_video_url": "https://youtube.com/watch?v=xxx",
            "github_link": "https://github.com/johndoe/todo-app",
            "figma_link": "",
            "live_demo_url": "https://todo-app.vercel.app",
            "documentation_file": null,
            "notes": "Completed all requirements...",
            "submitted_at": "2024-01-30T15:30:00Z"
        }
    }
}
```

**Error Response (400 Bad Request) - Missing Required Field:**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "github_link": ["This field is required"],
        "live_demo_url": ["This field is required"]
    }
}
```

---

### PATCH `/api/v1/tasks/{id}/review/` [Admin Only - With Permission Check]
Review submitted task.

**Permission Check for Stack Admin:**
- Must have `can_review_tasks` permission for the job's stack

**Request Body:**
```json
{
    "status": "approved",
    "feedback": "Excellent work! Clean code, good test coverage.",
    "score": 9,
    "update_application_status": "potential"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Task reviewed successfully",
    "data": {
        "id": 1,
        "status": "approved",
        "reviewed_by": {
            "id": 2,
            "full_name": "Jane Admin"
        },
        "reviewed_at": "2024-02-02T10:00:00Z",
        "review_feedback": "Excellent work!...",
        "review_score": 9,
        "application": {
            "internal_status": "potential",
            "public_status": "waiting"
        }
    }
}
```

---

## 8. Admin Management Endpoints (UPDATED)

### GET `/api/v1/admins/`
List all stack admins with their permissions.

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 2,
            "email": "jane@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "full_name": "Jane Smith",
            "avatar": null,
            "is_active": true,
            "created_at": "2024-01-05T09:00:00Z",
            "last_login": "2024-01-25T08:30:00Z",
            "assigned_stacks": [
                {
                    "id": 1,
                    "name": "React",
                    "slug": "react",
                    "color": "#61DAFB",
                    "assigned_at": "2024-01-10T10:00:00Z",
                    "permissions": {
                        "can_post_jobs": true,
                        "can_edit_jobs": true,
                        "can_delete_jobs": false,
                        "can_change_status": true,
                        "can_send_tasks": true,
                        "can_review_tasks": true,
                        "can_view_applicant_details": true,
                        "can_download_data": false
                    }
                }
            ]
        }
    ],
    "meta": {
        "total": 3
    }
}
```

---

### POST `/api/v1/admins/invite/`
Invite new stack admin with permissions.

**Request Body:**
```json
{
    "email": "newadmin@example.com",
    "stacks": [
        {
            "stack_id": 1,
            "permissions": {
                "can_post_jobs": true,
                "can_edit_jobs": true,
                "can_delete_jobs": false,
                "can_change_status": true,
                "can_send_tasks": true,
                "can_review_tasks": true,
                "can_view_applicant_details": true,
                "can_download_data": false
            }
        },
        {
            "stack_id": 3,
            "permissions": {
                "can_post_jobs": true,
                "can_edit_jobs": false,
                "can_delete_jobs": false,
                "can_change_status": true,
                "can_send_tasks": true,
                "can_review_tasks": true,
                "can_view_applicant_details": true,
                "can_download_data": true
            }
        }
    ]
}
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "Invitation sent successfully",
    "data": {
        "id": 2,
        "email": "newadmin@example.com",
        "status": "pending",
        "expires_at": "2024-02-01T00:00:00Z",
        "stacks": [
            {
                "id": 1,
                "name": "React",
                "permissions": { ... }
            },
            {
                "id": 3,
                "name": "UI/UX Design",
                "permissions": { ... }
            }
        ],
        "created_at": "2024-01-25T10:00:00Z"
    }
}
```

---

### PUT `/api/v1/admins/{id}/permissions/`
Update stack admin's permissions.

**Request Body:**
```json
{
    "stacks": [
        {
            "stack_id": 1,
            "permissions": {
                "can_post_jobs": true,
                "can_edit_jobs": true,
                "can_delete_jobs": true,
                "can_change_status": true,
                "can_send_tasks": true,
                "can_review_tasks": true,
                "can_view_applicant_details": true,
                "can_download_data": true
            }
        }
    ]
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Admin permissions updated successfully",
    "data": {
        "id": 2,
        "full_name": "Jane Smith",
        "assigned_stacks": [
            {
                "id": 1,
                "name": "React",
                "permissions": { ... }
            }
        ]
    }
}
```

---

## 9. Site Settings Endpoints

Same as before - no changes needed.

---

## 10. Dashboard Statistics Endpoints

### GET `/api/v1/dashboard/seeker/` [Seeker Only]
Get seeker dashboard stats.

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "can_apply": true,
        "active_application": null,
        "stats": {
            "total_applications": 5,
            "pending_tasks": 1,
            "completed_tasks": 3,
            "hired": 0,
            "rejected": 1
        },
        "current_application": null,
        "pending_task": {
            "id": 1,
            "title": "Build a Todo App",
            "type": "coding",
            "deadline": "2024-02-01T23:59:59Z",
            "days_remaining": 5,
            "job": {
                "id": 1,
                "title": "Senior React Developer"
            }
        },
        "recent_applications": [ ... ],
        "application_history": [
            {"status": "hired", "count": 0},
            {"status": "rejected", "count": 1},
            {"status": "completed", "count": 3}
        ]
    }
}
```

---

### GET `/api/v1/dashboard/admin/` [Admin Only]
Get admin dashboard stats.

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "stats": {
            "total_jobs": 25,
            "active_jobs": 20,
            "total_applications": 150,
            "pending_reviews": 12,
            "tasks_pending_review": 8,
            "total_stacks": 6,
            "total_admins": 4,
            "blocked_users": 2
        },
        "applications_by_internal_status": {
            "pending": 25,
            "reviewing": 20,
            "task_sent": 30,
            "task_submitted": 15,
            "task_review": 5,
            "potential": 20,
            "waiting": 10,
            "potentially_rejected": 5,
            "forwarded_to_hr": 10,
            "hired": 5,
            "rejected": 5
        },
        "applications_by_stack": [
            {"stack": "React", "color": "#61DAFB", "count": 45},
            {"stack": "Python", "color": "#3776AB", "count": 38}
        ],
        "jobs_by_applications": [
            {
                "job_id": 1,
                "job_title": "Senior React Developer",
                "stack": "React",
                "application_count": 45,
                "pending_review": 5
            }
        ],
        "recent_applications": [ ... ],
        "recent_task_submissions": [ ... ]
    }
}
```

---

## Status Mapping Reference

### Internal Status → Public Status Mapping

| Internal Status | Public Status | Description |
|----------------|---------------|-------------|
| `pending` | `pending` | Just applied |
| `reviewing` | `in_review` | Under initial review |
| `task_sent` | `task_pending` | Task assigned, waiting for submission |
| `task_submitted` | `task_submitted` | Task submitted |
| `task_review` | `waiting` | Task under review (hidden from seeker) |
| `potential` | `waiting` | Potential candidate (hidden from seeker) |
| `waiting` | `waiting` | In waiting pool (hidden from seeker) |
| `potentially_rejected` | `waiting` | Might be rejected (hidden from seeker) |
| `forwarded_to_hr` | `waiting` | Sent to HR (hidden from seeker) |
| `hired` | `hired` | Hired! ✅ |
| `rejected` | `rejected` | Rejected ❌ |
| `blocked` | `rejected` | User blocked (shows as rejected) |

---

## Permission Checks Summary

### Stack Admin Permissions

| Permission | Allows |
|------------|--------|
| `can_post_jobs` | Create new jobs in assigned stack |
| `can_edit_jobs` | Edit existing jobs in assigned stack |
| `can_delete_jobs` | Delete jobs in assigned stack |
| `can_change_status` | Change application internal status |
| `can_send_tasks` | Assign tasks to applicants |
| `can_review_tasks` | Review submitted tasks |
| `can_view_applicant_details` | View full applicant profile (phone, etc.) |
| `can_download_data` | Export applications to Excel/CSV |

---

## Error Response Format

```json
{
    "success": false,
    "message": "Human-readable error message",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    },
    "code": "ERROR_CODE"
}
```

### Common Error Codes:
- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_REQUIRED` - No valid token provided
- `PERMISSION_DENIED` - User lacks permission
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Resource already exists
- `USER_BLOCKED` - User account is blocked
- `ACTIVE_APPLICATION_EXISTS` - User already has active application
- `JOB_EXPIRED` - Job posting has expired
- `TASK_EXPIRED` - Task deadline has passed
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

---

## Required Python Packages

```txt
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
django-filter>=23.5
django-storages>=1.14
boto3>=1.34
Pillow>=10.2
python-magic>=0.4
celery>=5.3
redis>=5.0
gunicorn>=21.2
psycopg2-binary>=2.9
python-dotenv>=1.0
google-auth>=2.27
google-auth-oauthlib>=1.2
openpyxl>=3.1
```

---

## Email Triggers

1. **Google Registration** → Welcome email
2. **Application Submitted** → Confirmation to applicant
3. **Status Changed to Hired/Rejected** → Final notification to applicant
4. **Task Assigned** → Task details + deadline to applicant
5. **Task Deadline Reminder** → 24 hours before deadline
6. **Task Reviewed** → Result notification (if approved/rejected)
7. **Admin Invite** → Invite link to new admin
8. **User Blocked** → Notification email

---

This updated specification includes all the new features:
- ✅ Gmail-only authentication for job seekers
- ✅ Single application restriction
- ✅ Job expiry system
- ✅ User blocking functionality
- ✅ Granular stack admin permissions
- ✅ Dual status system (internal/public)
- ✅ Configurable submission fields per job
- ✅ Data export to Excel/CSV
- ✅ Job-wise applications view
