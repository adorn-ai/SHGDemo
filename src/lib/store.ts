import { Member, Loan, Activity } from './types';

const STORAGE_KEYS = {
  MEMBERS: 'stgabriel_members',
  LOANS: 'stgabriel_loans',
  ACTIVITIES: 'stgabriel_activities',
};

// Initialize with sample data
function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    const sampleMembers: Member[] = [
      // Active members with Kenyan names
      ...Array.from({ length: 18 }, (_, i) => ({
        id: `member-${i + 1}`,
        memberId: `STG${String(i + 1).padStart(4, '0')}`,
        firstName: ['Grace', 'Joseph', 'Mary', 'Peter', 'Faith', 'David', 'Ruth', 'Samuel', 'Esther', 'James', 'Lucy', 'Daniel', 'Mercy', 'John', 'Alice', 'Moses', 'Jane', 'Paul'][i],
        lastName: ['Wanjiru', 'Kimani', 'Akinyi', 'Mwangi', 'Nyambura', 'Ochieng', 'Njeri', 'Kamau', 'Atieno', 'Kariuki', 'Wambui', 'Onyango', 'Chebet', 'Omondi', 'Muthoni', 'Kiplagat', 'Wangari', 'Okello'][i],
        email: `member${i + 1}@example.com`,
        phone: `07${String(10000000 + i * 111111).slice(0, 8)}`,
        dateOfBirth: `19${70 + (i % 30)}-0${(i % 9) + 1}-${10 + (i % 20)}`,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        address: `House ${i + 1}, Estate ${i % 5 + 1}`,
        city: 'Nairobi',
        state: 'Nairobi County',
        pincode: `0010${i % 10}`,
        aadharNumber: `${1000 + i} ${2000 + i} ${3000 + i}`,
        panNumber: `KRA${i}${1000 + i}K`,
        bankName: ['Equity Bank', 'KCB', 'Cooperative Bank', 'Barclays', 'Standard Chartered'][i % 5],
        accountNumber: `${10000000000 + i * 1000000}`,
        ifscCode: `EQUI000${100 + i}`,
        nomineeName: `Nominee ${i + 1}`,
        nomineeRelation: ['Spouse', 'Son', 'Daughter', 'Parent'][i % 4],
        joinDate: `202${i % 4}-0${(i % 9) + 1}-15`,
        status: 'active' as const,
      })),
      // Pending registrations with Kenyan names
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `pending-${i + 1}`,
        memberId: `PENDING${i + 1}`,
        firstName: ['Sarah', 'Evans', 'Lilian', 'Brian', 'Christine', 'Victor'][i],
        lastName: ['Wairimu', 'Mutua', 'Auma', 'Kiprono', 'Wafula', 'Makori'][i],
        email: `pending${i + 1}@example.com`,
        phone: `07${String(20000000 + i * 222222).slice(0, 8)}`,
        dateOfBirth: `19${85 + i}-06-${10 + i}`,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        address: `New House ${i + 1}, Pending Estate`,
        city: 'Nairobi',
        state: 'Nairobi County',
        pincode: `0020${i}`,
        aadharNumber: `${5000 + i} ${6000 + i} ${7000 + i}`,
        panNumber: `PEND${i}${5000 + i}P`,
        bankName: ['Equity Bank', 'KCB', 'Cooperative Bank'][i % 3],
        accountNumber: `${20000000000 + i * 1000000}`,
        ifscCode: `PEND000${200 + i}`,
        nomineeName: `Nominee Pending ${i + 1}`,
        nomineeRelation: ['Spouse', 'Parent'][i % 2],
        joinDate: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
      })),
    ];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(sampleMembers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
    const sampleLoans: Loan[] = [
      // Treasurer review (3 loans)
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `loan-treasurer-${i + 1}`,
        loanId: `LN${new Date().getFullYear()}${String(1000 + i).slice(-3)}`,
        memberId: `STG${String(i + 1).padStart(4, '0')}`,
        memberName: ['Grace Wanjiru', 'Joseph Kimani', 'Mary Akinyi'][i],
        amount: [50000, 100000, 75000][i],
        purpose: ['Business Expansion', 'Home Renovation', 'Education'][i],
        term: [12, 24, 18][i],
        interestRate: 12,
        monthlyEmi: 0,
        applicationDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        status: 'treasurer_review' as const,
        treasurerStatus: 'pending' as const,
        income: [30000, 45000, 35000][i],
        comments: [],
      })),
      // Secretary review (2 loans)
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `loan-secretary-${i + 1}`,
        loanId: `LN${new Date().getFullYear()}${String(1003 + i).slice(-3)}`,
        memberId: `STG${String(i + 4).padStart(4, '0')}`,
        memberName: ['Peter Mwangi', 'Faith Nyambura'][i],
        amount: [80000, 120000][i],
        purpose: ['Medical Emergency', 'Business Start'][i],
        term: [12, 36][i],
        interestRate: 12,
        monthlyEmi: 0,
        applicationDate: new Date(Date.now() - (i + 4) * 86400000).toISOString().split('T')[0],
        status: 'secretary_review' as const,
        treasurerStatus: 'approved' as const,
        secretaryStatus: 'pending' as const,
        treasurerComment: 'Financials verified. Income is sufficient.',
        income: [40000, 50000][i],
        comments: [{
          id: 'c1',
          userId: '3',
          userName: 'Michael Ochieng',
          userRole: 'treasurer',
          text: 'Financials verified. Income is sufficient.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        }],
      })),
      // Chairman review (2 loans)
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `loan-chairman-${i + 1}`,
        loanId: `LN${new Date().getFullYear()}${String(1005 + i).slice(-3)}`,
        memberId: `STG${String(i + 6).padStart(4, '0')}`,
        memberName: ['David Ochieng', 'Ruth Njeri'][i],
        amount: [90000, 150000][i],
        purpose: ['Wedding', 'House Purchase'][i],
        term: [24, 60][i],
        interestRate: 12,
        monthlyEmi: 0,
        applicationDate: new Date(Date.now() - (i + 8) * 86400000).toISOString().split('T')[0],
        status: 'chairman_review' as const,
        treasurerStatus: 'approved' as const,
        secretaryStatus: 'approved' as const,
        chairmanStatus: 'pending' as const,
        treasurerComment: 'Financial documents in order.',
        secretaryComment: 'Member has good track record.',
        income: [45000, 60000][i],
        comments: [
          {
            id: 'c2',
            userId: '3',
            userName: 'Michael Ochieng',
            userRole: 'treasurer',
            text: 'Financial documents in order.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'c3',
            userId: '2',
            userName: 'Sarah Njeri',
            userRole: 'secretary',
            text: 'Member has good track record.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      })),
      // Approved (12 loans)
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `loan-approved-${i + 1}`,
        loanId: `LN${new Date().getFullYear() - 1}${String(100 + i).slice(-3)}`,
        memberId: `STG${String(i + 8).padStart(4, '0')}`,
        memberName: `Member ${i + 8}`,
        amount: 50000 + i * 10000,
        purpose: ['Business', 'Education', 'Medical', 'Agriculture', 'House'][i % 5],
        term: [12, 24, 36][i % 3],
        interestRate: 12,
        monthlyEmi: 0,
        applicationDate: new Date(Date.now() - (i + 30) * 86400000).toISOString().split('T')[0],
        status: 'approved' as const,
        treasurerStatus: 'approved' as const,
        secretaryStatus: 'approved' as const,
        chairmanStatus: 'approved' as const,
        approvedDate: new Date(Date.now() - (i + 20) * 86400000).toISOString().split('T')[0],
        income: 30000 + i * 5000,
        comments: [],
      })),
      // Rejected (5 loans)
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `loan-rejected-${i + 1}`,
        loanId: `LN${new Date().getFullYear() - 1}${String(200 + i).slice(-3)}`,
        memberId: `STG${String(i + 10).padStart(4, '0')}`,
        memberName: `Member ${i + 10}`,
        amount: 100000 + i * 20000,
        purpose: ['Luxury Purchase', 'Speculation', 'Non-essential'][i % 3],
        term: 12,
        interestRate: 12,
        monthlyEmi: 0,
        applicationDate: new Date(Date.now() - (i + 60) * 86400000).toISOString().split('T')[0],
        status: 'rejected' as const,
        treasurerStatus: i % 2 === 0 ? 'rejected' as const : 'approved' as const,
        secretaryStatus: i % 2 === 1 ? 'rejected' as const : undefined,
        treasurerComment: i % 2 === 0 ? 'Income insufficient for requested amount.' : undefined,
        secretaryComment: i % 2 === 1 ? 'Purpose not aligned with SHG objectives.' : undefined,
        rejectedDate: new Date(Date.now() - (i + 55) * 86400000).toISOString().split('T')[0],
        rejectedBy: i % 2 === 0 ? 'treasurer' : 'secretary',
        income: 20000 + i * 3000,
        comments: [],
      })),
    ];
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(sampleLoans));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    const sampleActivities: Activity[] = [
      {
        id: 'act-1',
        type: 'member_joined',
        description: 'Mary Akinyi joined as a new member',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'act-2',
        type: 'loan_approved',
        description: 'Loan of Ksh 50,000 approved for Aisha Juma',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'act-3',
        type: 'loan_applied',
        description: 'Micheal Ochieng applied for a loan of Kshs. 750,000',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(sampleActivities));
  }
}

export function getMembers(): Member[] {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
}

export function getMember(id: string): Member | undefined {
  return getMembers().find(m => m.id === id || m.memberId === id);
}

export function saveMember(member: Member): void {
  const members = getMembers();
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
}

export function approveMember(id: string): void {
  const members = getMembers();
  const member = members.find(m => m.id === id);
  if (member) {
    member.status = 'active';
    member.memberId = `STG${String(members.filter(m => m.status === 'active').length).padStart(4, '0')}`;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }
}

export function rejectMember(id: string): void {
  const members = getMembers().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
}

export function getLoans(): Loan[] {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOANS) || '[]');
}

export function getLoan(id: string): Loan | undefined {
  return getLoans().find(l => l.id === id || l.loanId === id);
}

export function saveLoan(loan: Loan): void {
  const loans = getLoans();
  const index = loans.findIndex(l => l.id === loan.id);
  if (index >= 0) {
    loans[index] = loan;
  } else {
    loans.push(loan);
  }
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
}

export function getActivities(): Activity[] {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
}

export function addActivity(activity: Omit<Activity, 'id'>): void {
  const activities = getActivities();
  activities.unshift({
    ...activity,
    id: `act-${Date.now()}`,
  });
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities.slice(0, 50)));
}