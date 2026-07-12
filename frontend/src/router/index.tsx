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
import { ProtectedRoute } from '@components/ProtectedRoute';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { AppLayout } from '@layouts/AppLayout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
