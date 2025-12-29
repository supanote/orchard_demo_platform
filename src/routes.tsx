import { ReactElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router'
import RootLayout from './layouts/RootLayout'
import AboutPage from './pages/About'
import HomePage from './pages/Home'
import NotFoundPage from './pages/NotFound'

type PathRoute = { path: string; element: ReactElement }
type IndexRoute = { index: true; element: ReactElement }

export type AppRoute = PathRoute | IndexRoute

export const appRoutes: AppRoute[] = [
  { index: true, element: <HomePage /> },
  { path: 'about', element: <AboutPage /> },
]

const toRouteObjects = (defs: AppRoute[]): RouteObject[] =>
  defs.map((route) =>
    route.index
      ? { index: true, element: route.element }
      : { path: route.path, element: route.element },
  )

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [...toRouteObjects(appRoutes), { path: '*', element: <NotFoundPage /> }],
  },
])

