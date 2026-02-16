export type UserRole = 'chairman' | 'secretary' | 'treasurer';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadharNumber: string;
  panNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  nomineeName: string;
  nomineeRelation: string;
  joinDate: string;
  status: 'active' | 'pending' | 'inactive';
  kycDocuments?: {
    aadhar?: string;
    photo?: string;
    bankProof?: string;
    pan?: string;
  };
}

export interface Loan {
  id: string;
  loanId: string;
  memberId: string;
  memberName: string;
  amount: number;
  purpose: string;
  term: number;
  interestRate: number;
  monthlyEmi: number;
  applicationDate: string;
  status: 'pending' | 'treasurer_review' | 'secretary_review' | 'chairman_review' | 'approved' | 'rejected';
  treasurerStatus?: 'pending' | 'approved' | 'rejected';
  secretaryStatus?: 'pending' | 'approved' | 'rejected';
  chairmanStatus?: 'pending' | 'approved' | 'rejected';
  treasurerComment?: string;
  secretaryComment?: string;
  chairmanComment?: string;
  approvedDate?: string;
  rejectedDate?: string;
  rejectedBy?: string;
  income: number;
  guarantorName?: string;
  guarantorPhone?: string;
  collateral?: string;
  incomeProof?: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: 'member_joined' | 'loan_approved' | 'loan_rejected' | 'member_approved' | 'loan_applied';
  description: string;
  timestamp: string;
}
