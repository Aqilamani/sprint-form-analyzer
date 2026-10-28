import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Link, RouterProvider } from 'react-router'
import { RunViewerPage } from './features/run-viewer/RunViewerPage'
import { RunListPage } from './features/runs/RunListPage'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: '/', element: <RunListPage /> },
  { path: '/runs/:runId', element: <RunViewerPage /> },
  {
    path: '*',
    element: (
      <main className="p-6">
        <p>Page not found.</p>
        <Link className="text-sky-400 underline" to="/">
          Back to runs
        </Link>
      </main>
    ),
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
