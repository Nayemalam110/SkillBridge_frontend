import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Briefcase, Sparkles } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, switchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      if (email.includes('superadmin')) {
        navigate('/admin');
      } else if (email.includes('admin')) {
        navigate('/stack-admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid credentials');
    }
  };

  const handleDemoLogin = (role: 'job_seeker' | 'super_admin' | 'stack_admin') => {
    switchUser(role);
    if (role === 'super_admin') {
      navigate('/admin');
    } else if (role === 'stack_admin') {
      navigate('/stack-admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-6">Welcome Back</h1>
          <p className="text-slate-600 mt-2">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 font-medium">{error}</div>
              )}
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Sign In
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Quick Demo Access
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => handleDemoLogin('job_seeker')}
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center mr-2">
                    <span className="text-emerald-600 text-xs font-bold">JS</span>
                  </div>
                  Login as Job Seeker
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => handleDemoLogin('super_admin')}
                >
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center mr-2">
                    <span className="text-violet-600 text-xs font-bold">SA</span>
                  </div>
                  Login as Super Admin
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => handleDemoLogin('stack_admin')}
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center mr-2">
                    <span className="text-sky-600 text-xs font-bold">AD</span>
                  </div>
                  Login as Stack Admin
                </Button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
