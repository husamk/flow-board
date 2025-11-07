import { useAuthStore } from '@/store/auth'
import { Navigate, Outlet } from '@tanstack/react-router'

export const ProtectedRoute = () => {
  const user = useAuthStore((s) => s.user)
  return user ? <Outlet /> : <Navigate to="/login" />
}
