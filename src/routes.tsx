import { createBrowserRouter, Navigate } from 'react-router';
import { Root } from './components/Root';
import { Landing } from './components/pages/Landing';
import { About } from './components/pages/About';
import { Gallery } from './components/pages/Gallery';
import { MemberRegistration } from './components/pages/MemberRegistration';
import { LoanApplication } from './components/pages/LoanApplication';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { Members } from './components/admin/Members';
import { Loans } from './components/admin/Loans';
import { Reports } from './components/admin/Reports';
import { Audit } from './components/admin/Audit';
import { Settings } from './components/admin/Settings';
import { getSession } from './lib/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: 'about', Component: About },
      { path: 'gallery', Component: Gallery },
      { path: 'register', Component: MemberRegistration },
      { path: 'apply-loan', Component: LoanApplication },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    children: [
      // Login Page
      {
        index: true,
        Component: AdminLogin,
      },

      // Protected Admin Area
      {
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', Component: Dashboard },
          { path: 'members', Component: Members },
          { path: 'loans', Component: Loans },
          { path: 'reports', Component: Reports },
          { path: 'audit', Component: Audit },
          { path: 'settings', Component: Settings },
        ],
      },
    ],
  },

  // Old Secret Route → Redirect
  {
    path: '/admin-hghgj23-new',
    element: <Navigate to="/admin" replace />,
  },

  // Catch All
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
