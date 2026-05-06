import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <p className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
