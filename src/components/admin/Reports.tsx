import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { getMembers, getLoans } from "../../lib/store";
import { getSession, hasPermission } from "../../lib/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Badge } from "../ui/badge";

export function Reports() {
  const session = getSession();
  const members = getMembers();
  const loans = getLoans();

  const canViewReports = hasPermission(
    session?.role || "treasurer",
    "view_reports"
  );

  if (!canViewReports) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">
            You don't have permission to view reports
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeMembers = members.filter((m) => m.status === "active");
  const approvedLoans = loans.filter((l) => l.status === "approved");
  const pendingLoans = loans.filter(
    (l) => l.status !== "approved" && l.status !== "rejected"
  );
  const rejectedLoans = loans.filter((l) => l.status === "rejected");

  const totalDisbursed = approvedLoans.reduce(
    (sum, loan) => sum + loan.amount,
    0
  );
  const totalPending = pendingLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const averageLoanSize =
    approvedLoans.length > 0 ? totalDisbursed / approvedLoans.length : 0;

  // Loan by purpose
  const loanByPurpose = approvedLoans.reduce((acc, loan) => {
    const purpose = loan.purpose.split(" ")[0]; // Take first word
    acc[purpose] = (acc[purpose] || 0) + loan.amount;
    return acc;
  }, {} as Record<string, number>);

  const purposeData = Object.entries(loanByPurpose).map(([name, value]) => ({
    name,
    value,
  }));

  // Monthly disbursements (mock data for chart)
  const monthlyData = [
    { month: "Jan", disbursed: 250000, members: 15 },
    { month: "Feb", disbursed: 320000, members: 18 },
    { month: "Mar", disbursed: 280000, members: 17 },
    { month: "Apr", disbursed: 410000, members: 22 },
    { month: "May", disbursed: 380000, members: 20 },
    { month: "Jun", disbursed: 450000, members: 24 },
  ];

  // Loan status distribution
  const statusData = [
    { name: "Approved", value: approvedLoans.length },
    { name: "Pending", value: pendingLoans.length },
    { name: "Rejected", value: rejectedLoans.length },
  ];

  const COLORS = ["#2D5016", "#4A7C2C", "#6B9E4D", "#8ABF6A", "#A9D387"];

  const exportPDF = () => {
    toast.success("Report exported to PDF (mock)");
  };

  const exportExcel = () => {
    toast.success("Report exported to Excel (mock)");
  };

  return (
    <div className="space-y-6 w-full">
      <div className="px-4 md:px-0 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-[#2D5016]">
            Financial Reports
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Comprehensive overview of SHG performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button
            onClick={exportPDF}
            variant="outline"
            className="border-[#2D5016] text-[#2D5016]"
          >
            <Download className="mr-2" size={16} />
            PDF
          </Button>
          <Button
            onClick={exportExcel}
            className="bg-[#2D5016] hover:bg-[#4A7C2C]"
          >
            <Download className="mr-2" size={16} />
            Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
        <Card>
          <CardContent className="w-full pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-600" size={24} />
              <TrendingUp className="text-green-600" size={16} />
            </div>
            <p className="text-xs md:text-sm text-gray-600">Active Members</p>
            <p className="text-2xl font-semibold text-[#2D5016]">
              {activeMembers.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="w-full pt-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-green-600" size={24} />
              <TrendingUp className="text-green-600" size={16} />
            </div>
            <p className="text-xs md:text-sm text-gray-600">Total Loans</p>
            <p className="text-2xl font-semibold text-[#2D5016]">
              {approvedLoans.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="w-full pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-600" size={24} />
              <TrendingUp className="text-green-600" size={16} />
            </div>
            <p className="text-xs md:text-sm text-gray-600">Total Disbursed</p>
            <p className="text-lg md:text-2xl font-semibold text-[#2D5016]">
              KES {(totalDisbursed / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="w-full pt-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-orange-600" size={24} />
            </div>
            <p className="text-xs md:text-sm text-gray-600">Avg Loan Size</p>
            <p className="text-lg md:text-2xl font-semibold text-[#2D5016]">
              KES {(averageLoanSize / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-[#2D5016] text-base md:text-lg">
              Monthly Disbursements
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `KES ${Number(value).toLocaleString("en-IN")}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="disbursed"
                  stroke="#2D5016"
                  strokeWidth={2}
                  name="Disbursed (KES)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-[#2D5016] text-base md:text-lg">
              Loan Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-[#2D5016] text-base md:text-lg">
              Loans by Purpose
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purposeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `KES ${Number(value).toLocaleString("en-IN")}`
                  }
                />
                <Bar dataKey="value" fill="#4A7C2C" name="Amount (KES)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#2D5016] text-base md:text-lg">
              Outstanding Loans
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 md:p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">
                    Total Outstanding
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    KES {(totalDisbursed / 100000).toFixed(1)}M
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm text-gray-600">Loans</p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    {approvedLoans.length}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 md:p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">
                    Pending Approval
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-orange-700">
                    KES {(totalPending / 100000).toFixed(1)}M
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm text-gray-600">
                    Applications
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-orange-700">
                    {pendingLoans.length}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 md:p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">
                    Collection Rate
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-blue-700">
                    98.5%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm text-gray-600">Defaulters</p>
                  <p className="text-lg md:text-xl font-semibold text-blue-700">
                    3
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defaulters Table */}
      <Card className="mx-4 md:mx-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-[#2D5016] text-base md:text-lg">
            Recent Defaulters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      Member ID
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Loan Amount
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Outstanding
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Days Overdue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="whitespace-nowrap">STG0145</TableCell>
                    <TableCell className="whitespace-nowrap">
                      James Kariuki
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      KES 75,000
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      KES 12,000
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-600 text-xs whitespace-nowrap">
                        15 days
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="whitespace-nowrap">STG0089</TableCell>
                    <TableCell className="whitespace-nowrap">
                      Lucy Wambui
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      KES 50,000
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      KES 8,500
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-600 text-xs whitespace-nowrap">
                        8 days
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="whitespace-nowrap">STG0234</TableCell>
                    <TableCell className="whitespace-nowrap">
                      Daniel Onyango
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      KES 100,000
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      KES 25,000
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-600 text-xs whitespace-nowrap">
                        22 days
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AGM Reports Section */}
      <Card className="border-2 border-[#2D5016] mx-4 md:mx-0">
        <CardHeader className="bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white">
          <CardTitle className="text-base md:text-lg">
            Annual General Meeting (AGM) Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* AGM 2025 */}
            <div className="p-3 md:p-4 border-2 border-[#6B9E4D] rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-[#2D5016]">
                    2025 AGM Report
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 break-words">
                    Date: January 15, 2026 | Venue: St Gabriel Community Center
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#2D5016] text-[#2D5016] w-full md:w-auto flex-shrink-0"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Total Members
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    250
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Total Savings
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    KES 12.5M
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Loans Disbursed
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    KES 8.2M
                  </p>
                </div>
              </div>
            </div>

            {/* AGM 2024 */}
            <div className="p-3 md:p-4 border-2 border-gray-300 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-[#2D5016]">
                    2024 AGM Report
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 break-words">
                    Date: January 20, 2025 | Venue: St Gabriel Community Center
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#2D5016] text-[#2D5016] w-full md:w-auto flex-shrink-0"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Total Members
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    218
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Total Savings
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    KES 9.8M
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Loans Disbursed
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    KES 6.5M
                  </p>
                </div>
              </div>
            </div>

            {/* AGM 2023 */}
            <div className="p-3 md:p-4 border-2 border-gray-300 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-[#2D5016]">
                    2023 AGM Report
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 break-words">
                    Date: January 28, 2024 | Venue: St Gabriel Community Center
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#2D5016] text-[#2D5016] w-full md:w-auto flex-shrink-0"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Total Members
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    185
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Total Savings
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    KES 7.2M
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs md:text-sm text-gray-600">
                    Loans Disbursed
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-[#2D5016]">
                    KES 4.8M
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
