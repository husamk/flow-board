import { useAuthStore } from '@/store/auth';
import { Navigate } from '@tanstack/react-router';
import React from 'react';
import { Spinner } from '@/components/ui/spinner.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <Spinner className="size-8" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};
