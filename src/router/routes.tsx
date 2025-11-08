import { Route } from '@tanstack/react-router';
import { rootRoute } from './rootRoute';
import { BoardList } from '@/components/borads/BoardList';
import { BoardView } from '@/components/borads/BoardView';
import { ProtectedRoute } from '@/router/ProtectedRoute.tsx';
import { SignIn } from '@/components/auth/SignIn';
import { AppLayout } from '@/components/layout/AppLayout';

export const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: SignIn,
});

export const boardListRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AppLayout>
      <ProtectedRoute>
        <BoardList />
      </ProtectedRoute>
    </AppLayout>
  ),
});

export const boardViewRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/boards/$boardId',
  component: () => (
    <AppLayout>
      <ProtectedRoute>
        <BoardView />
      </ProtectedRoute>
    </AppLayout>
  ),
});
