import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, MapPin, DollarSign, Clock, Briefcase, ArrowRight } from 'lucide-react';

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="mt-2 text-gray-600">Find your next opportunity in tech</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
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

      {/* Results count */}
      <p className="text-gray-600 mb-6">
        Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
      </p>

      {/* Jobs list */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const stack = stacks.find((s) => s.id === job.stackId);
            
            return (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${stack?.color}20` }}
                      >
                        {stack?.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <Badge variant={job.type === 'developer' ? 'info' : 'warning'}>
                            {job.type === 'developer' ? 'Developer' : 'Designer'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{job.stackName}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salaryRange}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.experience}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Task deadline: {job.taskDeadlineDays} days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-500">{job.applicantCount} applicants</p>
                        <p className="text-xs text-gray-400">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/jobs/${job.id}`}>
                        <Button>
                          View Details
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
          <CardContent className="py-16 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-600 mt-2">Try adjusting your filters to see more results</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
