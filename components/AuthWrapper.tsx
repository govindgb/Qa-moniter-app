'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Loader } from '@/components/ui/loader';

const publicRoutes = ['/login', '/register'];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    // Redirect to login will be handled by the login page
    window.location.href = '/login';
    return null;
  }

  if (isAuthenticated && isPublicRoute) {
    // Redirect to dashboard will be handled by the auth pages
    window.location.href = '/dashboard';
    return null;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div className="w-64 h-screen fixed top-0 left-0">
        <Sidebar />
      </div>
  
      {/* Scrollable Main Content (with left margin for sidebar) */}
      <main className="ml-64 flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
  
}