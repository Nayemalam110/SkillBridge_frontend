import { cn } from '@/utils/cn';
import type { InternalApplicationStatus, ExternalApplicationStatus } from '@/types';
import { STATUS_DISPLAY_MAP } from '@/types';
import { Check, Clock, FileText, MessageSquare, ThumbsUp, X, Award, Send, Sparkles, Eye } from 'lucide-react';

interface PipelineProps {
  status: InternalApplicationStatus;
  compact?: boolean;
  isAdmin?: boolean; // Show internal statuses for admin
}

// Stages that job seekers see
const seekerStages: { key: ExternalApplicationStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'pending', label: 'Applied', icon: Send },
  { key: 'in_review', label: 'In Review', icon: Eye },
  { key: 'task_assigned', label: 'Task', icon: FileText },
  { key: 'task_submitted', label: 'Submitted', icon: Check },
  { key: 'waiting', label: 'In Progress', icon: Clock },
  { key: 'hired', label: 'Result', icon: Award },
];

// Stages that admins see (more detailed)
const adminStages: { key: InternalApplicationStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'applied', label: 'Applied', icon: Send },
  { key: 'screening', label: 'Screening', icon: Eye },
  { key: 'potential', label: 'Potential', icon: ThumbsUp },
  { key: 'task_sent', label: 'Task Sent', icon: FileText },
  { key: 'task_submitted', label: 'Submitted', icon: Check },
  { key: 'task_reviewing', label: 'Reviewing', icon: MessageSquare },
  { key: 'forwarded_to_hr', label: 'HR Review', icon: MessageSquare },
  { key: 'interview', label: 'Interview', icon: MessageSquare },
  { key: 'offered', label: 'Offered', icon: ThumbsUp },
  { key: 'hired', label: 'Hired', icon: Award },
];

export function ApplicationPipeline({ status, compact = false, isAdmin = false }: PipelineProps) {
  const isRejected = status === 'rejected';
  const isHired = status === 'hired';

  // Get display info for job seekers
  const displayInfo = STATUS_DISPLAY_MAP[status];

  if (compact) {
    if (isAdmin) {
      // Admin sees internal status
      return (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold',
            isRejected 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : isHired 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : status === 'potential'
              ? 'bg-violet-50 text-violet-700 border border-violet-200'
              : status === 'potentially_rejected'
              ? 'bg-orange-50 text-orange-700 border border-orange-200'
              : status === 'forwarded_to_hr'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'bg-sky-50 text-sky-700 border border-sky-200'
          )}
        >
          {status.replace(/_/g, ' ')}
        </div>
      );
    }

    // Job seeker sees simplified status
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold',
          displayInfo.color === 'red'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : displayInfo.color === 'emerald'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : displayInfo.color === 'amber'
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : displayInfo.color === 'indigo'
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            : displayInfo.color === 'purple'
            ? 'bg-purple-50 text-purple-700 border border-purple-200'
            : 'bg-sky-50 text-sky-700 border border-sky-200'
        )}
      >
        {displayInfo.label}
      </div>
    );
  }

  // Full pipeline view
  const stages = isAdmin ? adminStages : seekerStages;
  
  // For seekers, convert internal status to external
  const currentExternalStatus = displayInfo.external;
  
  const getCurrentIndex = () => {
    if (isAdmin) {
      return adminStages.findIndex((s) => s.key === status);
    }
    return seekerStages.findIndex((s) => s.key === currentExternalStatus);
  };

  const currentIndex = getCurrentIndex();

  return (
    <div className="w-full">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-slate-100 rounded-full" />
        
        {/* Progress bar fill */}
        {!isRejected && (
          <div
            className={cn(
              "absolute top-5 left-0 h-1.5 rounded-full transition-all duration-700 ease-out",
              isHired 
                ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                : "bg-gradient-to-r from-sky-500 to-indigo-600"
            )}
            style={{ width: `${Math.max(0, (currentIndex / (stages.length - 1)) * 100)}%` }}
          />
        )}

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = !isRejected && index <= currentIndex;
            const isCurrent = !isRejected && index === currentIndex;
            
            return (
              <div
                key={stage.key}
                className="flex flex-col items-center"
                style={{ width: `${100 / stages.length}%` }}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-300',
                    isCompleted
                      ? isHired && index === stages.length - 1
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-gradient-to-br from-sky-500 to-indigo-600 border-transparent text-white shadow-lg shadow-sky-500/30'
                      : 'bg-white border-slate-200 text-slate-400'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    'mt-2.5 text-xs text-center font-semibold transition-colors',
                    isCurrent ? 'text-sky-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  )}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <Sparkles className="h-3 w-3 text-sky-500 mt-1 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isRejected && (
        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <X className="h-5 w-5" />
            <span className="font-semibold">
              {isAdmin ? 'Application Rejected' : 'Thank you for applying. We have decided to move forward with other candidates.'}
            </span>
          </div>
        </div>
      )}

      {isHired && !isRejected && (
        <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-700">
            <Award className="h-5 w-5" />
            <span className="font-semibold">
              {isAdmin ? 'Candidate Hired!' : 'Congratulations! You have been selected for this position!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
