import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getMembers, getLoans, getActivities } from '../../lib/store';
import { getSession } from '../../lib/auth';
import { Users, FileText, TrendingUp, Clock, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router';

export function Dashboard() {
  const session = getSession();
  const members = getMembers();
  const loans = getLoans();
  const activities = getActivities();

  const activeMembers = members.filter(m => m.status === 'active');
  const pendingMembers = members.filter(m => m.status === 'pending');
  const pendingLoans = loans.filter(l => l.status !== 'approved' && l.status !== 'rejected');
  const approvedLoans = loans.filter(l => l.status === 'approved');
  
  const totalDisbursed = approvedLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPending = pendingLoans.reduce((sum, loan) => sum + loan.amount, 0);

  const myPendingLoans = loans.filter(l => {
    if (session?.role === 'treasurer') return l.status === 'treasurer_review';
    if (session?.role === 'secretary') return l.status === 'secretary_review';
    if (session?.role === 'chairman') return l.status === 'chairman_review';
    return false;
  });

  const stats = [
    {
      title: 'Total Members',
      value: activeMembers.length,
      subtitle: `${pendingMembers.length} pending approval`,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/members',
    },
    {
      title: 'Active Loans',
      value: approvedLoans.length,
      subtitle: `${pendingLoans.length} under review`,
      icon: FileText,
      color: 'bg-green-500',
      link: '/admin/loans',
    },
    {
      title: 'Total Disbursed',
      value: `KES ${(totalDisbursed / 100000).toFixed(1)}M`,
      subtitle: `KES ${(totalPending / 100000).toFixed(1)}M pending`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/admin/reports',
    },
    {
      title: 'Pending Actions',
      value: myPendingLoans.length,
      subtitle: 'Require your approval',
      icon: Clock,
      color: 'bg-orange-500',
      link: '/admin/loans',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl md:text-3xl text-[#2D5016] mb-2">Welcome back, {session?.name}!</h1>
        <p className="text-sm md:text-base text-gray-600">Here's what's happening with St Gabriel SHG today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <Link to={stat.link}>
                    <Button variant="ghost" size="sm" className="text-[#4A7C2C]">
                      <ArrowUpRight size={16} />
                    </Button>
                  </Link>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-semibold text-[#2D5016] mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2D5016] text-lg md:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {session?.role === 'chairman' || session?.role === 'secretary' ? (
              <Link to="/admin/members">
                <Button className="w-full justify-start bg-[#2D5016] hover:bg-[#4A7C2C] text-sm md:text-base">
                  <Users className="mr-2 flex-shrink-0" size={18} />
                  <span className="truncate">Review Pending Members ({pendingMembers.length})</span>
                </Button>
              </Link>
            ) : null}
            
            <Link to="/admin/loans">
              <Button className="w-full justify-start bg-[#4A7C2C] hover:bg-[#2D5016] text-sm md:text-base">
                <FileText className="mr-2 flex-shrink-0" size={18} />
                <span className="truncate">Review Loan Applications ({myPendingLoans.length})</span>
              </Button>
            </Link>

            {(session?.role === 'treasurer' || session?.role === 'chairman') && (
              <Link to="/admin/reports">
                <Button className="w-full justify-start bg-[#6B9E4D] hover:bg-[#4A7C2C] text-sm md:text-base">
                  <TrendingUp className="mr-2 flex-shrink-0" size={18} />
                  <span className="truncate">View Financial Reports</span>
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2D5016] text-lg md:text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-[#4A7C2C] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 break-words">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attention Required */}
      {myPendingLoans.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center text-base md:text-lg">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <span>Attention Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-orange-700 mb-4">
              You have {myPendingLoans.length} loan application(s) waiting for your review and approval.
            </p>
            <Link to="/admin/loans">
              <Button className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                Review Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}