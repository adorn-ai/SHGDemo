import { User, UserRole } from './types';

const USERS: User[] = [
  {
    id: '1',
    email: 'chairman@stgabriel',
    password: 'Chair@2024!',
    role: 'chairman',
    name: 'John Kamau',
  },
  {
    id: '2',
    email: 'secretary@stgabriel',
    password: 'Secr@2024!',
    role: 'secretary',
    name: 'Sarah Njeri',
  },
  {
    id: '3',
    email: 'treasurer@stgabriel',
    password: 'Treas@2024!',
    role: 'treasurer',
    name: 'Michael Ochieng',
  },
];

export function login(email: string, password: string): User | null {
  const user = USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const session = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      loginTime: Date.now(),
    };
    localStorage.setItem('session', JSON.stringify(session));
    return user;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem('session');
}

export function getSession(): { userId: string; email: string; role: UserRole; name: string; loginTime: number } | null {
  const session = localStorage.getItem('session');
  if (session) {
    const parsed = JSON.parse(session);
    // Check if session is expired (30 minutes)
    if (Date.now() - parsed.loginTime > 30 * 60 * 1000) {
      logout();
      return null;
    }
    return parsed;
  }
  return null;
}

export function hasPermission(role: UserRole, action: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    chairman: ['approve_member', 'reject_member', 'approve_loan', 'reject_loan', 'view_reports', 'manage_settings'],
    secretary: ['approve_member', 'reject_member', 'review_loan', 'view_reports'],
    treasurer: ['review_loan', 'view_reports', 'manage_settings'],
  };
  
  return permissions[role]?.includes(action) || false;
}