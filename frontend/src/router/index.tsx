/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation (Router)
 *
 * Responsibility:
 * Global routing configuration mapping paths to Layouts and Pages.
 *
 * Architectural Rules:
 * - Must lazy load business features.
 * - No business logic allowed here.
 */
import { AppLayout } from '@layouts/AppLayout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <div>404 - Not Found (Placeholder)</div>,
    children: [
      {
        index: true,
        element: <div>Dashboard Placeholder</div>,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
