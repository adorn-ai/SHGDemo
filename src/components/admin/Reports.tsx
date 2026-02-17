import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { getMembers, getLoans } from '../../lib/store';
import { getSession, hasPermission } from '../../lib/auth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Download, TrendingUp, Users, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../ui/badge';

export function Reports() {
  const session = getSession();
  const members = getMembers();
  const loans = getLoans();

  const canViewReports = hasPermission(session?.role || 'treasurer', 'view_reports');

  if (!canViewReports) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">You don't have permission to view reports</p>
        </CardContent>
      </Card>
    );
  }

  const activeMembers = members.filter(m => m.status === 'active');
  const approvedLoans = loans.filter(l => l.status === 'approved');
  const pendingLoans = loans.filter(l => l.status !== 'approved' && l.status !== 'rejected');
  const rejectedLoans = loans.filter(l => l.status === 'rejected');

  const totalDisbursed = approvedLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPending = pendingLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const averageLoanSize = approvedLoans.length > 0
    ? totalDisbursed / approvedLoans.length
    : 0;

  const loanByPurpose = approvedLoans.reduce((acc, loan) => {
    const purpose = loan.purpose.split(' ')[0];
    acc[purpose] = (acc[purpose] || 0) + loan.amount;
    return acc;
  }, {} as Record<string, number>);

  const purposeData = Object.entries(loanByPurpose).map(([name, value]) => ({
    name,
    value,
  }));

  const monthlyData = [
    { month: 'Jan', disbursed: 250000 },
    { month: 'Feb', disbursed: 320000 },
    { month: 'Mar', disbursed: 280000 },
    { month: 'Apr', disbursed: 410000 },
    { month: 'May', disbursed: 380000 },
    { month: 'Jun', disbursed: 450000 },
  ];

  const statusData = [
    { name: 'Approved', value: approvedLoans.length },
    { name: 'Pending', value: pendingLoans.length },
    { name: 'Rejected', value: rejectedLoans.length },
  ];

  const COLORS = ['#2D5016', '#4A7C2C', '#6B9E4D'];

  const downloadAGM = (year: number, members: number, savings: string, loansValue: string, date: string) => {
    const csv = [
      [`St Gabriel SHG – ${year} AGM Report`],
      [`Date: ${date} | Venue: St Gabriel Community Center`],
      [],
      ['Metric', 'Value'],
      ['Total Members', String(members)],
      ['Total Savings', savings],
      ['Loans Disbursed', loansValue],
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StGabriel_AGM_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 w-full overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-[#2D5016]">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive overview of SHG performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Users className="text-blue-600 mb-2" size={24} />
            <p className="text-gray-600 text-sm">Active Members</p>
            <p className="text-2xl font-semibold text-[#2D5016]">{activeMembers.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FileText className="text-green-600 mb-2" size={24} />
            <p className="text-gray-600 text-sm">Approved Loans</p>
            <p className="text-2xl font-semibold text-[#2D5016]">{approvedLoans.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="text-purple-600 mb-2" size={24} />
            <p className="text-gray-600 text-sm">Total Disbursed</p>
            <p className="text-2xl font-semibold text-[#2D5016]">
              KES {(totalDisbursed / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="text-orange-600 mb-2" size={24} />
            <p className="text-gray-600 text-sm">Avg Loan Size</p>
            <p className="text-2xl font-semibold text-[#2D5016]">
              KES {(averageLoanSize / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Disbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="disbursed" stroke="#2D5016" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" outerRadius={100}>
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AGM Section */}
      <Card className="border-2 border-[#2D5016]">
        <CardHeader className="bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white">
          <CardTitle>Annual General Meeting (AGM) Reports</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">

          {[ 
            { year: 2025, members: 250, savings: 'KES 12.5M', loans: 'KES 8.2M', date: 'January 15, 2026' },
            { year: 2024, members: 218, savings: 'KES 9.8M', loans: 'KES 6.5M', date: 'January 20, 2025' },
            { year: 2023, members: 185, savings: 'KES 7.2M', loans: 'KES 4.8M', date: 'January 28, 2024' }
          ].map((agm) => (
            <div key={agm.year} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-[#2D5016]">{agm.year} AGM Report</h3>
                <p className="text-sm text-gray-600">
                  Date: {agm.date} | Venue: St Gabriel Community Center
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadAGM(agm.year, agm.members, agm.savings, agm.loans, agm.date)}
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          ))}

        </CardContent>
      </Card>
    </div>
  );
}
