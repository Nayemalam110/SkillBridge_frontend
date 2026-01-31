import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, MapPin, DollarSign, Clock, Briefcase, ArrowRight, Users, Sparkles } from 'lucide-react';

export function JobsPage() {
  const [searchParams] = useSearchParams();
  const { jobs, stacks } = useSite();
  
  const [search, setSearch] = useState('');
  const [stackFilter, setStackFilter] = useState(searchParams.get('stack') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (job.status !== 'active') return false;
      
      if (search && !job.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      if (stackFilter && job.stackId !== stackFilter) {
        return false;
      }
      
      if (typeFilter && job.type !== typeFilter) {
        return false;
      }
      
      if (locationFilter) {
        const isRemote = job.location.toLowerCase().includes('remote');
        if (locationFilter === 'remote' && !isRemote) return false;
        if (locationFilter === 'onsite' && isRemote) return false;
      }
      
      return true;
    });
  }, [jobs, search, stackFilter, typeFilter, locationFilter]);

  const stackOptions = [
    { value: '', label: 'All Stacks' },
    ...stacks.map((s) => ({ value: s.id, label: s.name })),
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site / Hybrid' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 rounded-full text-sky-600 text-sm font-semibold mb-4">
          <Sparkles className="h-4 w-4" />
          {filteredJobs.length} OPPORTUNITIES
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Browse Jobs</h1>
        <p className="mt-2 text-lg text-slate-600">Find your next opportunity in tech</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={stackOptions}
              value={stackFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStackFilter(e.target.value)}
            />
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
            />
            <Select
              options={locationOptions}
              value={locationFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLocationFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs list */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const stack = stacks.find((s) => s.id === job.stackId);
            
            return (
              <Card key={job.id} hover>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
                        style={{ backgroundColor: `${stack?.color}15` }}
                      >
                        {stack?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                          <Badge variant={job.type === 'developer' ? 'info' : 'purple'}>
                            {job.type === 'developer' ? 'Developer' : 'Designer'}
                          </Badge>
                        </div>
                        <p className="text-slate-600 font-medium">{job.stackName}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                            <DollarSign className="h-4 w-4" />
                            {job.salaryRange}
                          </span>
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                            <Briefcase className="h-4 w-4" />
                            {job.experience}
                          </span>
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg">
                            <Clock className="h-4 w-4" />
                            Task: {job.taskDeadlineDays} days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{job.applicantCount}</span>
                          <span className="text-slate-400">applied</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/jobs/${job.id}`}>
                        <Button>
                          View Job
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
            <p className="text-slate-600 mt-2">Try adjusting your filters to see more results</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearch('');
                setStackFilter('');
                setTypeFilter('');
                setLocationFilter('');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
