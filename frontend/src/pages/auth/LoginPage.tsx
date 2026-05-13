import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('demo@finguard.ai');
  const [password, setPassword] = useState('Demo@123456');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <main className="min-h-[calc(100vh-105px)] bg-[#f6f8fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-170px)] w-full max-w-6xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">FinGuard AI</p>
                <p className="text-sm text-gray-500">Portfolio intelligence platform</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Secure workspace
              </p>
              <h1 className="text-3xl font-bold tracking-normal text-gray-950 sm:text-4xl">Welcome back</h1>
              <p className="mt-3 text-base leading-7 text-gray-600">
                Sign in to review portfolio exposure, compliance insights, and AI-assisted risk analysis.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {typeof error === 'string' ? error : (error as any)?.message || 'Authentication failed'}
              </div>
            )}

            <button
              type="button"
              className="mb-5 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="mb-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">or sign in with email</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email address"
                placeholder="demo@finguard.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
                className="h-11 rounded-lg bg-white"
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
                className="h-11 rounded-lg bg-white"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  Remember me
                </label>
                <Link to="#" className="font-semibold text-blue-700 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="mt-2 h-12 w-full rounded-lg bg-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-700"
                icon={!isLoading ? <ArrowRight size={18} /> : undefined}
              >
                Sign in
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-600">
              New to FinGuard?{' '}
              <Link to="/auth/signup" className="font-semibold text-blue-700 hover:text-blue-800">
                Create an account
              </Link>
            </p>

            <p className="mt-5 rounded-lg bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">
              Demo access: <span className="font-semibold text-gray-700">demo@finguard.ai</span> /{' '}
              <span className="font-semibold text-gray-700">Demo@123456</span>
            </p>
          </div>
        </section>

        <aside className="hidden border-l border-gray-200 bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-blue-100">
              <TrendingUp size={16} />
              Live portfolio oversight
            </div>
            <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-normal">
              Make faster investment decisions with clearer risk context.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
              FinGuard brings holdings, risk scoring, regulatory guidance, and AI review into one focused workspace.
            </p>
          </div>

          <div className="space-y-3">
            {['Portfolio ingestion and analytics', 'Compliance-aware AI assistance', 'Secure local demo workspace'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-100">
                <CheckCircle2 size={18} className="text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
