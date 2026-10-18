import { createHashRouter, type RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { City } from './pages/City'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Settings } from './pages/Settings'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/city/:lat/:lon', element: <City /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]

// Hash routing keeps deep links working on GitHub Pages (no server rewrites).
export const router = createHashRouter(routes)
