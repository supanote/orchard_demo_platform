import type { ReactElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router'
import RootLayout from './layouts/RootLayout'
import AboutPage from './pages/About'
import NotFoundPage from './pages/NotFound'
import ClaimsModule from './pages/demo-screen-claims'
import IntakeModule from './intake'
import ControlTowerDashboard from './control-tower'

type PathRoute = { path: string; element: ReactElement }
type IndexRoute = { index: true; element: ReactElement }

export type AppRoute = PathRoute | IndexRoute

export const appRoutes: AppRoute[] = [
  { index: true, element: <ControlTowerDashboard /> },
  { path: 'control-tower', element: <ControlTowerDashboard /> },
  { path: 'about', element: <AboutPage /> },
  { path: 'charge-review', element: <ClaimsModule /> },
  { path: 'intake', element: <IntakeModule /> },
]

const toRouteObjects = (defs: AppRoute[]): RouteObject[] =>
  defs.map((route) =>
    'index' in route
      ? { index: true, element: route.element }
      : { path: route.path, element: route.element },
  )

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [...toRouteObjects(appRoutes), { path: '*', element: <NotFoundPage /> }],
  },
])

