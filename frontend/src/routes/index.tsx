import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { GlobalLayout } from '@/layouts/GlobalLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from './protected';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';

// Main Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PortfolioPage } from '@/pages/portfolio/PortfolioPage';
import { RegulatoryAssistantPage } from '@/pages/regulatory/RegulatoryAssistantPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { CSVUploadPage } from '@/pages/upload/CSVUploadPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { LandingPage } from '@/pages/home/LandingPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';

export const router = createBrowserRouter([
  // ── Global Layout shell (wraps ALL app routes) ───
  {
    element: <GlobalLayout />,
    children: [
      // Public
      { path: '/', element: <LandingPage /> },
      
      // Auth Pages
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignUpPage /> },
        ],
      },

      // Protected — authentication guard renders Outlet when authenticated
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'portfolio', element: <PortfolioPage /> },
          { path: 'regulatory', element: <RegulatoryAssistantPage /> },
          { path: 'aihub', element: <ReportsPage /> },
          { path: 'upload', element: <CSVUploadPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
