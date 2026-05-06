import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from './protected';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';

// Main Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PortfolioPage } from '@/pages/portfolio/PortfolioPage';
import { FraudCenterPage } from '@/pages/fraud/FraudCenterPage';
import { RegulatoryAssistantPage } from '@/pages/regulatory/RegulatoryAssistantPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { CSVUploadPage } from '@/pages/upload/CSVUploadPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'fraud', element: <FraudCenterPage /> },
      { path: 'regulatory', element: <RegulatoryAssistantPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'upload', element: <CSVUploadPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
