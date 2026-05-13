import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, TrendingUp, User } from 'lucide-react';
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

export function SignUpPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the terms');
      return;
    }
    try {
      await signup(email, password, name);
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
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">FinGuard AI</p>
                <p className="text-sm text-gray-500">Portfolio intelligence platform</p>
              </div>
            </div>

            <div className="mb-7">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                New workspace
              </p>
              <h1 className="text-3xl font-bold tracking-normal text-gray-950 sm:text-4xl">Create your account</h1>
              <p className="mt-3 text-base leading-7 text-gray-600">
                Set up access for portfolio uploads, risk analytics, and regulatory assistance.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {typeof error === 'string' ? error : (error as any)?.message || 'Registration failed'}
              </div>
            )}

            <button
              type="button"
              className="mb-5 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            <div className="mb-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">or create manually</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Full name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User size={18} />}
                required
                className="h-11 rounded-lg bg-white"
              />

              <Input
                type="email"
                label="Email address"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
                className="h-11 rounded-lg bg-white"
              />

              <div>
                <Input
                  type="password"
                  label="Password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  required
                  className="h-11 rounded-lg bg-white"
                />
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength === 'strong'
                          ? 'w-full bg-emerald-500'
                          : passwordStrength === 'medium'
                          ? 'w-2/3 bg-amber-500'
                          : password
                          ? 'w-1/3 bg-rose-500'
                          : 'w-0'
                      }`}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-semibold capitalize text-gray-500">
                    {password ? passwordStrength : ''}
                  </span>
                </div>
              </div>

              <Input
                type="password"
                label="Confirm password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
                className="h-11 rounded-lg bg-white"
              />

              <label className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I agree to the{' '}
                  <Link to="#" className="font-semibold text-blue-700 hover:text-blue-800">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="font-semibold text-blue-700 hover:text-blue-800">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="h-12 w-full rounded-lg bg-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-700"
                icon={!isLoading ? <ArrowRight size={18} /> : undefined}
              >
                Create account
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-semibold text-blue-700 hover:text-blue-800">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <aside className="hidden border-l border-gray-200 bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-blue-100">
              <TrendingUp size={16} />
              Built for investor review
            </div>
            <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-normal">
              Turn holdings data into an organized decision workspace.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
              Upload statements, inspect portfolio quality, and use AI support for risk and compliance workflows.
            </p>
          </div>

          <div className="space-y-3">
            {['Fast CSV and XLSX onboarding', 'Risk scoring and exposure summaries', 'Regulatory guidance with citations'].map((item) => (
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
