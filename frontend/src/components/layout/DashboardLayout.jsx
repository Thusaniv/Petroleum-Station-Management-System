import { SidebarProvider, SidebarTrigger, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

import StationBackground from '../3d/StationBackground';

export function DashboardLayout({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <StationBackground />
      <div className="flex min-h-screen w-full bg-transparent">
        <AppSidebar className="bg-background/30 backdrop-blur-md border-r-white/10" />
        <SidebarInset className="flex flex-col bg-transparent">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/40 bg-background/20 backdrop-blur-xl px-6 supports-[backdrop-filter]:bg-background/10">
            <SidebarTrigger className="-ml-2 bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/5" />

            <div className="flex-1 flex items-center gap-4">
              <div className="relative max-w-md flex-1">

              </div>
            </div>

            <div className="flex items-center gap-3">


              <div className="h-8 w-px bg-border/40" />

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/80 text-sm font-medium text-primary-foreground backdrop-blur-sm shadow-lg shadow-primary/20">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.name || 'User'}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container py-6 animate-fade-in relative z-0">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
