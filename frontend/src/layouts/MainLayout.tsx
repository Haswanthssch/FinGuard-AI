import { Outlet } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { Header } from '@/components/organisms/Header/Header';

export function MainLayout() {
  useAppStore((state) => state.sidebarOpen);

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
