import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Mail, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-lg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-3xl">
          <h1 className="text-display font-bold text-gray-900">FinGuard</h1>
          <p className="text-body text-gray-600 mt-md">Enterprise Fintech Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2xl">
          <h2 className="text-h2 font-bold text-gray-900 mb-lg">Sign In</h2>

          {error && (
            <div className="mb-lg p-lg bg-red-50 border border-red-200 rounded-lg">
              <p className="text-body text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                  defaultChecked
                />
                <span className="text-body text-gray-700">Remember me</span>
              </label>
              <Link to="#" className="text-body text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-xl flex items-center gap-lg">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-caption text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-body text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-2xl p-lg bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-caption font-medium text-blue-900 mb-md">Demo Credentials</p>
          <p className="text-caption text-blue-800">Email: demo@finguard.ai</p>
          <p className="text-caption text-blue-800">Password: Demo@123456</p>
        </div>
      </div>
    </div>
  );
}
