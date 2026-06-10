import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/admin/Sidebar';

export default function DashboardLayout() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-md"></div>
          <p className="text-body-md text-on-surface-variant">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-md sm:p-lg md:p-xl">
        <Outlet />
      </main>
    </div>
  );
}
