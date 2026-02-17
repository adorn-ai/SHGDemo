import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getSession } from '../../lib/auth';
import { Download, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Audit() {
  const session = getSession();

  const audits = [
    {
      id: '1',
      date: '2026-01-15',
      auditor: 'John Kamau',
      type: 'Financial Audit',
      status: 'Completed',
      findings: 'All financial records are accurate and up-to-date',
      recommendation: 'Continue current practices',
    },
    {
      id: '2',
      date: '2025-12-01',
      auditor: 'Sarah Njeri',
      type: 'Membership Audit',
      status: 'Completed',
      findings: 'All member records verified and updated',
      recommendation: 'Implement digital record keeping',
    },
    {
      id: '3',
      date: '2025-11-15',
      auditor: 'Michael Ochieng',
      type: 'Loan Portfolio Audit',
      status: 'In Progress',
      findings: '95% repayment rate, 3 defaulters identified',
      recommendation: 'Implement stricter loan approval criteria',
    },
  ];

  const exportReport = () => {
    const rows: string[][] = [
      ['St Gabriel SHG – Internal Audit Report'],
      [`Generated: ${new Date().toLocaleDateString('en-KE')}`],
      [],
      ['AUDIT RECORDS'],
      ['ID', 'Type', 'Auditor', 'Date', 'Status', 'Findings', 'Recommendations'],
      ...audits.map(a => [
        a.id, a.type, a.auditor,
        new Date(a.date).toLocaleDateString('en-KE'),
        a.status, a.findings, a.recommendation,
      ]),
      [],
      ['UPCOMING AUDIT SCHEDULE'],
      ['Type', 'Scheduled Date', 'Auditor', 'Status'],
      ['Quarterly Financial Review', '2026-03-01', 'John Kamau', 'Scheduled'],
      ['Loan Portfolio Assessment', '2026-02-15', 'Michael Ochieng', 'Scheduled'],
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StGabriel_AuditReport_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit report downloaded successfully');
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-hidden">
      <div className="px-4 md:px-0 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-[#2D5016]">Internal Audit</h1>
          <p className="text-sm md:text-base text-gray-600">Review and track all internal audits</p>
        </div>
        <Button onClick={exportReport} size="sm" className="bg-[#2D5016] hover:bg-[#4A7C2C] shrink-0">
          <Download className="mr-2" size={16} />
          Export Report
        </Button>
      </div>

      {/* Audit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <p className="text-sm text-gray-600">Total Audits</p>
            <p className="text-2xl font-semibold text-[#2D5016]">15</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-semibold text-[#2D5016]">1</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="text-orange-600" size={24} />
            </div>
            <p className="text-sm text-gray-600">Issues Found</p>
            <p className="text-2xl font-semibold text-[#2D5016]">3</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit List */}
      <div className="grid gap-4 md:gap-6 px-4 md:px-0">
        {audits.map((audit) => (
          <Card key={audit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-[#2D5016] text-base md:text-lg">{audit.type}</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                    Audited by: {audit.auditor} | Date: {new Date(audit.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={
                    audit.status === 'Completed'
                      ? 'bg-green-600 flex-shrink-0'
                      : audit.status === 'In Progress'
                      ? 'bg-blue-600 flex-shrink-0'
                      : 'bg-orange-600 flex-shrink-0'
                  }
                >
                  {audit.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#2D5016] mb-2 text-sm md:text-base">Findings</h4>
                  <p className="text-sm md:text-base text-gray-700">{audit.findings}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D5016] mb-2 text-sm md:text-base">Recommendations</h4>
                  <p className="text-sm md:text-base text-gray-700">{audit.recommendation}</p>
                </div>
                <div className="flex flex-row gap-2 pt-2">
                  <Button size="sm" variant="outline" className="border-[#2D5016] text-[#2D5016]">
                    <Eye className="mr-2" size={16} />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="border-[#2D5016] text-[#2D5016]">
                    <Download className="mr-2" size={16} />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Schedule */}
      <Card className="mx-4 md:mx-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-[#2D5016] text-base md:text-lg">Upcoming Audit Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="whitespace-nowrap">Scheduled Date</TableHead>
                  <TableHead className="whitespace-nowrap">Auditor</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="whitespace-nowrap">Quarterly Financial Review</TableCell>
                  <TableCell className="whitespace-nowrap">2026-03-01</TableCell>
                  <TableCell className="whitespace-nowrap">John Kamau</TableCell>
                  <TableCell><Badge className="bg-yellow-600 text-xs whitespace-nowrap">Scheduled</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="whitespace-nowrap">Loan Portfolio Assessment</TableCell>
                  <TableCell className="whitespace-nowrap">2026-02-15</TableCell>
                  <TableCell className="whitespace-nowrap">Michael Ochieng</TableCell>
                  <TableCell><Badge className="bg-yellow-600 text-xs whitespace-nowrap">Scheduled</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}