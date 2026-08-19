import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { getSession, logout } from '../../lib/auth';
import { LayoutDashboard, Users, FileText, BarChart3, Settings, LogOut, Bell, Menu, X, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'New Member Registration',
      message: 'Sarah Wairimu has submitted a membership application',
      time: '5 minutes ago',
      read: false,
      type: 'member'
    },
    {
      id: '2',
      title: 'Loan Approval Pending',
      message: 'Grace Wanjiru\'s loan of KES 50,000 needs your review',
      time: '1 hour ago',
      read: false,
      type: 'loan'
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Joseph Kimani made a loan repayment of KES 5,000',
      time: '2 hours ago',
      read: true,
      type: 'payment'
    },
    {
      id: '4',
      title: 'New Loan Application',
      message: 'Peter Mwangi applied for a business loan of KES 100,000',
      time: '3 hours ago',
      read: false,
      type: 'loan'
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!session) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const roleColors = {
    chairman: 'bg-purple-600',
    secretary: 'bg-blue-600',
    treasurer: 'bg-green-600',
  };

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Loans', path: '/admin/loans', icon: FileText },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Internal Audit', path: '/admin/audit', icon: ClipboardCheck },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-[#2D5016] text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-[#4A7C2C] p-2 rounded"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#2D5016] font-semibold text-sm">SG</span>
              </div>
              <span className="font-semibold hidden sm:inline">St Gabriel SHG Admin</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className={`${roleColors[session.role]} text-white capitalize hidden sm:inline-flex`}>
              {session.role}
            </Badge>
            <button className="relative hover:bg-[#4A7C2C] p-2 rounded" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <div className="flex items-center space-x-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold">{session.name}</p>
                <p className="text-xs text-gray-300">{session.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-[#4A7C2C]"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#2D5016] text-white transition-transform duration-300 ease-in-out`}
        >
          <nav className="mt-4 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#4A7C2C] text-white'
                      : 'text-gray-200 hover:bg-[#4A7C2C]/50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-[#4A7C2C]/30 p-3 rounded-lg text-sm">
              <p className="text-gray-200 mb-1">Session expires in:</p>
              <p className="font-semibold">25 minutes</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowNotifications(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="mb-4">
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-semibold text-sm">
                          {notification.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}