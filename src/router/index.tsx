import { Router, RouterProvider } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { boardListRoute, boardViewRoute, loginRoute } from './routes'

const routeTree = rootRoute.addChildren([loginRoute, boardListRoute, boardViewRoute])
const router = new Router({ routeTree })

export const AppRouter = () => <RouterProvider router={router} />
