import { cn } from '@/utils/cn';
import type { ApplicationStatus } from '@/types';
import { Check, Clock, FileText, MessageSquare, ThumbsUp, X, Award, Send, Sparkles } from 'lucide-react';

interface PipelineProps {
  status: ApplicationStatus;
  compact?: boolean;
}

const stages: { key: ApplicationStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'applied', label: 'Applied', icon: Send },
  { key: 'reviewing', label: 'Reviewing', icon: Clock },
  { key: 'task_sent', label: 'Task Sent', icon: FileText },
  { key: 'task_submitted', label: 'Submitted', icon: Check },
  { key: 'task_reviewing', label: 'Task Review', icon: MessageSquare },
  { key: 'interview', label: 'Interview', icon: MessageSquare },
  { key: 'offered', label: 'Offered', icon: ThumbsUp },
  { key: 'hired', label: 'Hired', icon: Award },
];

const rejectedStage = { key: 'rejected' as ApplicationStatus, label: 'Rejected', icon: X };

export function ApplicationPipeline({ status, compact = false }: PipelineProps) {
  const isRejected = status === 'rejected';
  const currentIndex = stages.findIndex((s) => s.key === status);

  if (compact) {
    const currentStage = isRejected ? rejectedStage : stages.find((s) => s.key === status) || stages[0];
    const Icon = currentStage.icon;
    
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold',
          isRejected 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : status === 'hired' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-sky-50 text-sky-700 border border-sky-200'
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {currentStage.label}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-slate-100 rounded-full" />
        
        {/* Progress bar fill */}
        {!isRejected && (
          <div
            className="absolute top-5 left-0 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
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
                      ? 'bg-gradient-to-br from-sky-500 to-indigo-600 border-transparent text-white shadow-lg shadow-sky-500/30'
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
            <span className="font-semibold">Application Rejected</span>
          </div>
        </div>
      )}
    </div>
  );
}
