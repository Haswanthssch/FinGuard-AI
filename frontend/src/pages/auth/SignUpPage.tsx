import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Mail, Lock, User } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-lg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-3xl">
          <h1 className="text-display font-bold text-gray-900">FinGuard</h1>
          <p className="text-body text-gray-600 mt-md">Enterprise Fintech Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2xl">
          <h2 className="text-h2 font-bold text-gray-900 mb-lg">Create Account</h2>

          {error && (
            <div className="mb-lg p-lg bg-red-50 border border-red-200 rounded-lg">
              <p className="text-body text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={18} />}
              required
            />

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
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
              />
              <div className="mt-md flex items-center gap-sm">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === 'strong'
                        ? 'w-full bg-green-500'
                        : passwordStrength === 'medium'
                        ? 'w-2/3 bg-amber-500'
                        : 'w-1/3 bg-red-500'
                    }`}
                  ></div>
                </div>
                <span className="text-caption text-gray-600">
                  {passwordStrength === 'strong'
                    ? 'Strong'
                    : passwordStrength === 'medium'
                    ? 'Medium'
                    : 'Weak'}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            {/* Terms */}
            <label className="flex items-start gap-md">
              <input
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded cursor-pointer mt-sm"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="text-body text-gray-700">
                I agree to the{' '}
                <Link to="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-body text-gray-600 mt-lg">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
