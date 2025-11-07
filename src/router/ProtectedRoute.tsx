import { useAuthStore } from '@/store/auth'
import { Navigate } from '@tanstack/react-router'
import React from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  return user ? <>{children}</> : <Navigate to="/login" />
}
