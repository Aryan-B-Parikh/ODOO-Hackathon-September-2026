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
import { AssetCreate } from '@features/assets/pages/AssetCreate';
import { AssetDetails } from '@features/assets/pages/AssetDetails';
import { AssetEdit } from '@features/assets/pages/AssetEdit';
import { AssetList } from '@features/assets/pages/AssetList';
import { CategoryCreate } from '@features/assets/pages/CategoryCreate';
import { CategoryEdit } from '@features/assets/pages/CategoryEdit';
import { CategoryList } from '@features/assets/pages/CategoryList';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { DepartmentList } from '@features/organization/pages/DepartmentList';
import { EmployeeList } from '@features/organization/pages/EmployeeList';
import { AppLayout } from '@layouts/AppLayout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <div>404 - Not Found (Placeholder)</div>,
    children: [
      {
        path: 'dashboard',
        element: <div>Dashboard Placeholder</div>,
      },
      {
        path: 'departments',
        element: <DepartmentList />,
      },
      {
        path: 'employees',
        element: <EmployeeList />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <div>Dashboard Placeholder</div>,
      },
      {
        path: 'categories',
        element: <CategoryList />,
      },
      {
        path: 'categories/new',
        element: <CategoryCreate />,
      },
      {
        path: 'categories/:id/edit',
        element: <CategoryEdit />,
      },
      {
        path: 'assets',
        element: <AssetList />,
      },
      {
        path: 'assets/new',
        element: <AssetCreate />,
      },
      {
        path: 'assets/:id',
        element: <AssetDetails />,
      },
      {
        path: 'assets/:id/edit',
        element: <AssetEdit />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
