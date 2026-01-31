import { Link } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowRight, Briefcase, Users, Code, Palette, CheckCircle } from 'lucide-react';

export function HomePage() {
  const { settings, stacks, jobs } = useSite();

  const features = [
    {
      icon: Code,
      title: 'Skill-Based Hiring',
      description: 'Complete real coding tasks to showcase your abilities, not just your resume.',
    },
    {
      icon: Briefcase,
      title: 'Tech-Specific Jobs',
      description: 'Find jobs that match your exact tech stack and expertise level.',
    },
    {
      icon: Users,
      title: 'Direct Communication',
      description: 'Work directly with hiring managers and receive timely feedback.',
    },
    {
      icon: Palette,
      title: 'Designers Welcome',
      description: 'UI/UX designers can showcase their skills through design challenges.',
    },
  ];

  const activeJobs = jobs.filter((j) => j.status === 'active').slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {settings.heroTitle}
            </h1>
            <p className="mt-6 text-xl text-indigo-100">
              {settings.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/jobs">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50">
                  Browse Jobs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{jobs.length}+</div>
              <div className="text-gray-600 mt-1">Open Positions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{stacks.length}</div>
              <div className="text-gray-600 mt-1">Tech Stacks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">500+</div>
              <div className="text-gray-600 mt-1">Hired Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">50+</div>
              <div className="text-gray-600 mt-1">Partner Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stacks */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Tech Stack</h2>
            <p className="mt-4 text-gray-600">Find jobs that match your skills and expertise</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stacks.map((stack) => (
              <Link key={stack.id} to={`/jobs?stack=${stack.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="text-center py-6">
                    <div className="text-4xl mb-3">{stack.icon}</div>
                    <h3 className="font-semibold text-gray-900">{stack.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{stack.jobCount} jobs</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-600">Our unique approach to tech hiring</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardContent className="text-center py-8">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Opportunities</h2>
              <p className="mt-2 text-gray-600">Explore our newest job openings</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline">
                View All Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {activeJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-2xl">{stacks.find((s) => s.id === job.stackId)?.icon}</span>
                        <h3 className="font-semibold text-lg text-gray-900 mt-2">{job.title}</h3>
                        <p className="text-gray-600 mt-1">{job.stackName}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        {job.type === 'developer' ? 'Developer' : 'Designer'}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span>{job.experience}</span>
                      <span>{job.salaryRange}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Task-based assessment included</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Your Journey?</h2>
          <p className="mt-4 text-indigo-100 text-lg">
            Join thousands of developers and designers who found their dream jobs through {settings.siteName}.
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
