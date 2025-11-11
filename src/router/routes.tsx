import { Route } from '@tanstack/react-router';
import { rootRoute } from './rootRoute';
import { Home } from '@/components/home/Home.tsx';
import { Board } from '@/components/board/Board.tsx';
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
        <Home />
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
        <Board />
      </ProtectedRoute>
    </AppLayout>
  ),
});
