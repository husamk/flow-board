import { RootRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

export const rootRoute = new RootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Outlet />
    </div>
  ),
})
