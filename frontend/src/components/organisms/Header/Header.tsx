import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Search, Zap, ChevronDown, Shield } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAFA] border-b border-gray-100">
      <div className="px-8 flex items-center justify-between h-20">
        {/* Left Section - Breadcrumb */}
        <div className="flex items-center gap-3">
          <Shield className="text-blue-500" size={20} strokeWidth={2.5} />
          <span className="text-[13px] font-mono tracking-widest text-gray-500 uppercase">Nexus Interface</span>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-[15px] font-semibold text-gray-800">Command Center</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-72 pl-10 pr-12 py-2.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-full text-sm outline-none transition-all placeholder-gray-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center px-2 py-1 rounded-md bg-gray-100 text-[11px] font-bold text-gray-500">
              ⌘K
            </div>
          </div>

          {/* AI Assistant */}
          <button
            className="w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50 rounded-full transition-colors text-blue-500"
            aria-label="AI Assistant"
          >
            <Zap size={18} strokeWidth={2} />
          </button>

          {/* Notifications */}
          <button
            className="w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-full transition-colors text-gray-500 relative"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* User Menu */}
          <div className="relative pl-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-full pr-3 py-1 transition-colors"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500 text-white shadow-sm">
                <span className="text-[13px] font-bold">DA</span>
              </div>
              <span className="text-[14px] font-bold text-gray-800 hidden md:block">
                Demo Admin
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
