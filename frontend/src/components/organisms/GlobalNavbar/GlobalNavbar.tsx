import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  LayoutDashboard,
  Briefcase,
  Scale,
  BarChart3,
  Upload,
  Settings,
  Bell,
  Search,
  Zap,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Regulatory AI', href: '/regulatory', icon: Scale },
  { label: 'AI Hub', href: '/aihub', icon: BarChart3 },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const GlobalNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navBg = isLanding && !isScrolled
    ? 'bg-transparent'
    : 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm';

  return (
    <nav className={`sticky top-[41px] z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between h-16">

        {/* ── Logo ──────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Activity className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            FinGuard <span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* ── Center Nav Links (desktop) ────────── */}
        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-50 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right Tools ───────────────────────── */}
        <div className="flex items-center gap-3">
          {/* AI Status badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI Active</span>
          </div>

          {/* Search */}
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <Search size={18} />
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
          </button>

          {/* Auth area */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
                  {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{user?.email ?? 'User'}</p>
                      <p className="text-[11px] text-gray-500 font-medium">Pro Plan</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User size={15} />
                        Profile & Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white text-[13px] font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="max-w-[1600px] mx-auto px-6 py-4 grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
