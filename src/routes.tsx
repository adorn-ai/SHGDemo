import { createBrowserRouter, Navigate } from 'react-router';
import { Root } from './components/Root';
import { Landing } from './components/pages/Landing';
import { About } from './components/pages/About';
import { Gallery } from './components/pages/Gallery';
import { Products } from './components/pages/Products';
import { Contact } from './components/pages/Contact';
import { CorporateRegistration } from './components/pages/CorporateRegistration';
import { MemberRegistration } from './components/pages/MemberRegistration';
import { MinorRegistration } from './components/pages/MinorRegistration';
import { Register } from './components/pages/Register';
import { LoanApplication } from './components/pages/LoanApplication';
import { GuarantorResponse } from './components/pages/GuarantorResponse';
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
      { path: 'products', Component: Products },
      { path: 'contact', Component: Contact },
      { path: 'join', Component: Register },
      { path: 'register', Component: MemberRegistration },
      { path: 'register-minor', Component: MinorRegistration },
      { path: 'register-corporate', Component: CorporateRegistration },
      { path: 'apply-loan', Component: LoanApplication },
    ],
  },

  // Guarantor Response (standalone, no navbar/footer) - reached via the
  // accept/reject button in a guarantor's notification email (see
  // loanNotifyHandler.js). Deliberately outside the Root layout: this is
  // a single-purpose action page for someone arriving cold from an email
  // link, often not otherwise browsing the site, so it isn't wrapped in
  // site navigation the way ordinary pages are - same reasoning as
  // AdminLogin below being standalone.
  {
    path: '/guarantor-response',
    Component: GuarantorResponse,
  },

  // Admin Login (standalone, no layout)
  {
    path: '/admin',
    Component: AdminLogin,
  },

  // Protected Admin Area
  {
    path: '/admin',
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

  // Catch All
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);