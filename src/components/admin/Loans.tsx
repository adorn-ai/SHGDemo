import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { getLoans, saveLoan } from '../../lib/store';
import { getSession } from '../../lib/auth';
import { toast } from 'sonner@2.0.3';
import { Eye, Check, X, MessageSquare, FileText, Calendar, User, IndianRupee } from 'lucide-react';

export function Loans() {
  const session = getSession();
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const loans = getLoans();

  const allLoans = loans;
  const treasurerLoans = loans.filter(l => l.status === 'treasurer_review');
  const secretaryLoans = loans.filter(l => l.status === 'secretary_review');
  const chairmanLoans = loans.filter(l => l.status === 'chairman_review');
  const approvedLoans = loans.filter(l => l.status === 'approved');
  const rejectedLoans = loans.filter(l => l.status === 'rejected');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      treasurer_review: { label: 'Treasurer Review', className: 'bg-blue-600' },
      secretary_review: { label: 'Secretary Review', className: 'bg-purple-600' },
      chairman_review: { label: 'Chairman Review', className: 'bg-orange-600' },
      approved: { label: 'Approved', className: 'bg-green-600' },
      rejected: { label: 'Rejected', className: 'bg-red-600' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-600' };
    return <Badge className={`${config.className} text-xs`}>{config.label}</Badge>;
  };

  const canReview = (loan: any) => {
    if (session?.role === 'treasurer' && loan.status === 'treasurer_review') return true;
    if (session?.role === 'secretary' && loan.status === 'secretary_review') return true;
    if (session?.role === 'chairman' && loan.status === 'chairman_review') return true;
    return false;
  };

  const handleApprove = () => {
    if (!selectedLoan || !comment.trim()) {
      toast.error('Please add a comment');
      return;
    }

    const loan = { ...selectedLoan };
    const newComment = {
      id: `c-${Date.now()}`,
      userId: session?.userId || '',
      userName: session?.name || '',
      userRole: session?.role || 'treasurer' as any,
      text: comment,
      timestamp: new Date().toISOString(),
    };

    loan.comments.push(newComment);

    if (session?.role === 'treasurer') {
      loan.treasurerStatus = 'approved';
      loan.treasurerComment = comment;
      loan.status = 'secretary_review';
    } else if (session?.role === 'secretary') {
      loan.secretaryStatus = 'approved';
      loan.secretaryComment = comment;
      loan.status = 'chairman_review';
    } else if (session?.role === 'chairman') {
      loan.chairmanStatus = 'approved';
      loan.chairmanComment = comment;
      loan.status = 'approved';
      loan.approvedDate = new Date().toISOString().split('T')[0];
    }

    saveLoan(loan);
    toast.success('Loan approved and forwarded to next stage!');
    setDialogOpen(false);
    setComment('');
  };

  const handleReject = () => {
    if (!selectedLoan || !comment.trim()) {
      toast.error('Please add a reason for rejection');
      return;
    }

    const loan = { ...selectedLoan };
    const newComment = {
      id: `c-${Date.now()}`,
      userId: session?.userId || '',
      userName: session?.name || '',
      userRole: session?.role || 'treasurer' as any,
      text: comment,
      timestamp: new Date().toISOString(),
    };

    loan.comments.push(newComment);

    if (session?.role === 'treasurer') {
      loan.treasurerStatus = 'rejected';
      loan.treasurerComment = comment;
    } else if (session?.role === 'secretary') {
      loan.secretaryStatus = 'rejected';
      loan.secretaryComment = comment;
    } else if (session?.role === 'chairman') {
      loan.chairmanStatus = 'rejected';
      loan.chairmanComment = comment;
    }

    loan.status = 'rejected';
    loan.rejectedDate = new Date().toISOString().split('T')[0];
    loan.rejectedBy = session?.role;

    saveLoan(loan);
    toast.success('Loan application rejected');
    setDialogOpen(false);
    setComment('');
  };

  const LoanTable = ({ loans: loanList }: { loans: any[] }) => (
    <div className="px-4 md:px-0">
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <table className="border-collapse bg-white" style={{ minWidth: '900px', width: '100%' }}>
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Loan ID</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Member</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Amount</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Purpose</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Term</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Applied</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loanList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No loans in this category
                </td>
              </tr>
            ) : (
              loanList.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-xs md:text-sm whitespace-nowrap">{loan.loanId}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-xs md:text-sm whitespace-nowrap">{loan.memberName}</p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">{loan.memberId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-xs md:text-sm whitespace-nowrap">KES {loan.amount.toLocaleString('en-KE')}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-[150px] text-xs md:text-sm truncate">{loan.purpose}</div>
                  </td>
                  <td className="px-4 py-3 text-xs md:text-sm whitespace-nowrap">{loan.term} mo</td>
                  <td className="px-4 py-3 text-xs md:text-sm whitespace-nowrap">{new Date(loan.applicationDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(loan.status)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLoan(loan);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl text-[#2D5016]">Loan Applications</h1>
        <p className="text-sm md:text-base text-gray-600">Review and manage loan applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
        {/* Mobile: Dropdown */}
        <div className="px-4 md:hidden">
          <select 
            className="w-full p-2 border rounded-lg text-sm bg-white"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="all">All ({allLoans.length})</option>
            <option value="treasurer">
              Treasurer ({treasurerLoans.length})
              {treasurerLoans.length > 0 && session?.role === 'treasurer' ? ' 🔴' : ''}
            </option>
            <option value="secretary">
              Secretary ({secretaryLoans.length})
              {secretaryLoans.length > 0 && session?.role === 'secretary' ? ' 🔴' : ''}
            </option>
            <option value="chairman">
              Chairman ({chairmanLoans.length})
              {chairmanLoans.length > 0 && session?.role === 'chairman' ? ' 🔴' : ''}
            </option>
            <option value="approved">Approved ({approvedLoans.length})</option>
            <option value="rejected">Rejected ({rejectedLoans.length})</option>
          </select>
        </div>

        {/* Desktop: Tabs */}
        <div className="hidden md:block overflow-x-auto px-4 md:px-0">
          <TabsList className="inline-flex">
            <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap">All ({allLoans.length})</TabsTrigger>
            <TabsTrigger value="treasurer" className="relative text-xs md:text-sm whitespace-nowrap">
              Treasurer ({treasurerLoans.length})
              {treasurerLoans.length > 0 && session?.role === 'treasurer' && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="secretary" className="relative text-xs md:text-sm whitespace-nowrap">
              Secretary ({secretaryLoans.length})
              {secretaryLoans.length > 0 && session?.role === 'secretary' && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="chairman" className="relative text-xs md:text-sm whitespace-nowrap">
              Chairman ({chairmanLoans.length})
              {chairmanLoans.length > 0 && session?.role === 'chairman' && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs md:text-sm whitespace-nowrap">Approved ({approvedLoans.length})</TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs md:text-sm whitespace-nowrap">Rejected ({rejectedLoans.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          <LoanTable loans={allLoans} />
        </TabsContent>

        <TabsContent value="treasurer">
          <LoanTable loans={treasurerLoans} />
        </TabsContent>

        <TabsContent value="secretary">
          <LoanTable loans={secretaryLoans} />
        </TabsContent>

        <TabsContent value="chairman">
          <LoanTable loans={chairmanLoans} />
        </TabsContent>

        <TabsContent value="approved">
          <LoanTable loans={approvedLoans} />
        </TabsContent>

        <TabsContent value="rejected">
          <LoanTable loans={rejectedLoans} />
        </TabsContent>
      </Tabs>

      {/* Loan Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2D5016] text-base md:text-lg">Loan Application Details</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4 md:space-y-6">
              {/* Applicant Card */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm md:text-lg text-[#2D5016]">
                    <User className="inline mr-2" size={18} />
                    Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Member ID</p>
                      <p className="font-semibold">{selectedLoan.memberId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-semibold break-words">{selectedLoan.memberName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Income</p>
                      <p className="font-semibold">KES {selectedLoan.income.toLocaleString('en-KE')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loan Summary */}
              <Card className="border-t-4 border-[#2D5016]">
                <CardHeader>
                  <CardTitle className="text-sm md:text-lg text-[#2D5016]">
                    Loan Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Loan ID</p>
                      <p className="font-semibold">{selectedLoan.loanId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Application Date</p>
                      <p className="font-semibold">{new Date(selectedLoan.applicationDate).toLocaleDateString('en-KE')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Loan Amount</p>
                      <p className="font-semibold text-base md:text-lg">KES {selectedLoan.amount.toLocaleString('en-KE')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Term</p>
                      <p className="font-semibold">{selectedLoan.term} months</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Interest Rate</p>
                      <p className="font-semibold">{selectedLoan.interestRate}% per annum</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly EMI</p>
                      <p className="font-semibold">KES {selectedLoan.monthlyEmi.toLocaleString('en-KE')}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-gray-600 mb-1">Purpose</p>
                      <p className="font-medium break-words">{selectedLoan.purpose}</p>
                    </div>
                  </div>

                  {(selectedLoan.guarantorName || selectedLoan.collateral) && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2 text-[#2D5016] text-sm md:text-base">Guarantor & Collateral</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {selectedLoan.guarantorName && (
                          <>
                            <div>
                              <p className="text-gray-600">Guarantor Name</p>
                              <p className="font-medium break-words">{selectedLoan.guarantorName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Guarantor Phone</p>
                              <p className="font-medium">{selectedLoan.guarantorPhone}</p>
                            </div>
                          </>
                        )}
                        {selectedLoan.collateral && (
                          <div className="sm:col-span-2">
                            <p className="text-gray-600">Collateral</p>
                            <p className="font-medium break-words">{selectedLoan.collateral}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approval Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm md:text-lg text-[#2D5016]">
                    <FileText className="inline mr-2" size={18} />
                    Approval Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Treasurer */}
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedLoan.treasurerStatus === 'approved' ? 'bg-green-600' :
                        selectedLoan.treasurerStatus === 'rejected' ? 'bg-red-600' :
                        'bg-blue-600'
                      }`}>
                        {selectedLoan.treasurerStatus === 'approved' ? <Check className="text-white" size={16} /> :
                         selectedLoan.treasurerStatus === 'rejected' ? <X className="text-white" size={16} /> :
                         <span className="text-white font-semibold text-sm">T</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm md:text-base">Treasurer Review</p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {selectedLoan.treasurerStatus === 'approved' ? 'Approved' :
                           selectedLoan.treasurerStatus === 'rejected' ? 'Rejected' :
                           'Pending'}
                        </p>
                        {selectedLoan.treasurerComment && (
                          <p className="text-xs md:text-sm mt-1 bg-gray-50 p-2 rounded break-words">{selectedLoan.treasurerComment}</p>
                        )}
                      </div>
                    </div>

                    {/* Secretary */}
                    {selectedLoan.treasurerStatus === 'approved' && (
                      <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedLoan.secretaryStatus === 'approved' ? 'bg-green-600' :
                          selectedLoan.secretaryStatus === 'rejected' ? 'bg-red-600' :
                          'bg-purple-600'
                        }`}>
                          {selectedLoan.secretaryStatus === 'approved' ? <Check className="text-white" size={16} /> :
                           selectedLoan.secretaryStatus === 'rejected' ? <X className="text-white" size={16} /> :
                           <span className="text-white font-semibold text-sm">S</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm md:text-base">Secretary Review</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {selectedLoan.secretaryStatus === 'approved' ? 'Approved' :
                             selectedLoan.secretaryStatus === 'rejected' ? 'Rejected' :
                             'Pending'}
                          </p>
                          {selectedLoan.secretaryComment && (
                            <p className="text-xs md:text-sm mt-1 bg-gray-50 p-2 rounded break-words">{selectedLoan.secretaryComment}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Chairman */}
                    {selectedLoan.secretaryStatus === 'approved' && (
                      <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedLoan.chairmanStatus === 'approved' ? 'bg-green-600' :
                          selectedLoan.chairmanStatus === 'rejected' ? 'bg-red-600' :
                          'bg-orange-600'
                        }`}>
                          {selectedLoan.chairmanStatus === 'approved' ? <Check className="text-white" size={16} /> :
                           selectedLoan.chairmanStatus === 'rejected' ? <X className="text-white" size={16} /> :
                           <span className="text-white font-semibold text-sm">C</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm md:text-base">Chairman Review</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {selectedLoan.chairmanStatus === 'approved' ? 'Approved' :
                             selectedLoan.chairmanStatus === 'rejected' ? 'Rejected' :
                             'Pending'}
                          </p>
                          {selectedLoan.chairmanComment && (
                            <p className="text-xs md:text-sm mt-1 bg-gray-50 p-2 rounded break-words">{selectedLoan.chairmanComment}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              {selectedLoan.comments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm md:text-lg text-[#2D5016]">
                      <MessageSquare className="inline mr-2" size={18} />
                      Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedLoan.comments.map((c: any) => (
                        <div key={c.id} className="border-l-4 border-[#4A7C2C] pl-4">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-xs md:text-sm">{c.userName}</p>
                            <Badge className="text-xs capitalize">{c.userRole}</Badge>
                            <p className="text-xs text-gray-500">
                              {new Date(c.timestamp).toLocaleString('en-KE')}
                            </p>
                          </div>
                          <p className="text-xs md:text-sm text-gray-700 break-words">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Section */}
              {canReview(selectedLoan) && (
                <Card className="border-t-4 border-orange-400">
                  <CardHeader>
                    <CardTitle className="text-sm md:text-lg text-[#2D5016]">Your Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="comment" className="text-xs md:text-sm">Add your comment/review *</Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Provide your assessment and decision rationale..."
                        rows={4}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        onClick={handleApprove}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-sm md:text-base"
                      >
                        <Check className="mr-2" size={18} />
                        Approve & Forward
                      </Button>
                      <Button
                        onClick={handleReject}
                        variant="outline"
                        className="flex-1 border-red-600 text-red-600 hover:bg-red-50 text-sm md:text-base"
                      >
                        <X className="mr-2" size={18} />
                        Reject Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}