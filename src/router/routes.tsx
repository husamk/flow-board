import { Route } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { BoardList } from '@/components/borads/BoardList'
import { BoardView } from '@/components/borads/BoardView'
import { ProtectedRoute } from '@/router/ProtectedRoute.tsx'
import { SignIn } from '@/components/auth/SignIn'

export const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: SignIn,
})

export const boardListRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <BoardList />
    </ProtectedRoute>
  ),
})

export const boardViewRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/boards/$boardId',
  component: () => (
    <ProtectedRoute>
      <BoardView />
    </ProtectedRoute>
  ),
})
