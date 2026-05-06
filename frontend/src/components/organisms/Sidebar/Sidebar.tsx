import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  AlertTriangle,
  Scale,
  BarChart3,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity
} from 'lucide-react';

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Fraud Center', href: '/fraud', icon: AlertTriangle },
  { label: 'Regulatory AI', href: '/regulatory', icon: Scale },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-100 transition-all flex flex-col h-screen sticky top-0 z-20 shrink-0',
        sidebarOpen ? 'w-[260px]' : 'w-[80px]'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between px-6 py-6 h-20">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Activity className="text-blue-600" size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">FinGuard <span className="text-blue-600 font-semibold">AI</span></h1>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href || (location.pathname === '/' && item.href === '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={cn("flex-shrink-0 transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} 
              />
              {sidebarOpen && (
                <span className="text-[15px] tracking-tight">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mx-4 mb-6 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <span className="text-sm font-semibold">DA</span>
          </div>
          {sidebarOpen && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-bold text-gray-900 truncate">Demo Admin</span>
              <span className="text-[12px] font-medium text-gray-500 truncate">Pro Plan</span>
            </div>
          )}
          {sidebarOpen && (
            <ChevronRight size={16} className="text-gray-400 rotate-90" />
          )}
        </div>
      </div>
    </aside>
  );
}
