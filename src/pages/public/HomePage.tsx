import { Link } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowRight, Briefcase, Users, Code, Palette, CheckCircle, Sparkles, Zap, Shield, Star } from 'lucide-react';

export function HomePage() {
  const { settings, stacks, jobs } = useSite();

  const features = [
    {
      icon: Code,
      title: 'Skill-Based Hiring',
      description: 'Complete real coding tasks to showcase your abilities, not just your resume.',
      color: 'from-sky-500 to-blue-600',
    },
    {
      icon: Briefcase,
      title: 'Tech-Specific Jobs',
      description: 'Find jobs that match your exact tech stack and expertise level.',
      color: 'from-indigo-500 to-violet-600',
    },
    {
      icon: Users,
      title: 'Direct Communication',
      description: 'Work directly with hiring managers and receive timely feedback.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Palette,
      title: 'Designers Welcome',
      description: 'UI/UX designers can showcase their skills through design challenges.',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  const activeJobs = jobs.filter((j) => j.status === 'active').slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sky-300 text-sm font-medium mb-6 border border-white/10">
              <Sparkles className="h-4 w-4" />
              The future of tech hiring is here
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
              {settings.heroTitle}
            </h1>
            <p className="mt-6 text-xl text-sky-100/90 leading-relaxed">
              {settings.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/jobs">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-sky-50 shadow-2xl shadow-sky-500/20">
                  Browse Jobs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border border-slate-100">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">{jobs.length}+</div>
              <div className="text-slate-600 mt-1 font-medium">Open Positions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{stacks.length}</div>
              <div className="text-slate-600 mt-1 font-medium">Tech Stacks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">500+</div>
              <div className="text-slate-600 mt-1 font-medium">Hired Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">50+</div>
              <div className="text-slate-600 mt-1 font-medium">Partner Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stacks */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 rounded-full text-sky-600 text-sm font-semibold mb-4">
              <Zap className="h-4 w-4" />
              POPULAR STACKS
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Browse by Tech Stack</h2>
            <p className="mt-4 text-lg text-slate-600">Find jobs that match your skills and expertise</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stacks.map((stack) => (
              <Link key={stack.id} to={`/jobs?stack=${stack.id}`}>
                <Card hover className="h-full cursor-pointer group">
                  <CardContent className="text-center py-8">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{stack.icon}</div>
                    <h3 className="font-bold text-slate-900">{stack.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{stack.jobCount} jobs</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-sm font-semibold mb-4">
              <Shield className="h-4 w-4" />
              HOW IT WORKS
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Our Unique Approach</h2>
            <p className="mt-4 text-lg text-slate-600">A modern way to connect talent with opportunity</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover className="h-full">
                <CardContent className="text-center py-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full text-emerald-600 text-sm font-semibold mb-4">
                <Star className="h-4 w-4" />
                FEATURED
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Latest Opportunities</h2>
              <p className="mt-2 text-lg text-slate-600">Explore our newest job openings</p>
            </div>
            <Link to="/jobs" className="hidden md:block">
              <Button variant="outline">
                View All Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {activeJobs.map((job) => {
              const stack = stacks.find((s) => s.id === job.stackId);
              return (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                          style={{ backgroundColor: `${stack?.color}15` }}
                        >
                          {stack?.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                              <p className="text-slate-600">{job.stackName}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                              job.type === 'developer' 
                                ? 'bg-sky-50 text-sky-700' 
                                : 'bg-pink-50 text-pink-700'
                            }`}>
                              {job.type === 'developer' ? 'Developer' : 'Designer'}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg">{job.location}</span>
                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg">{job.experience}</span>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">{job.salaryRange}</span>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Task-based assessment included</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/jobs">
              <Button variant="outline">
                View All Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Start Your Journey?</h2>
              <p className="mt-4 text-sky-100 text-lg max-w-2xl mx-auto">
                Join thousands of developers and designers who found their dream jobs through {settings.siteName}.
              </p>
              <div className="mt-8">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-sky-50 shadow-2xl">
                    Get Started Today
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
