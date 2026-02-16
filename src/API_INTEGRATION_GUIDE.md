# API Integration Guide for St Gabriel SHG

This document outlines all the points where you need to integrate with your backend API. Currently, the application uses localStorage for data persistence. Replace these with actual API calls.

## 🔗 API Endpoints Needed

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create new member (registration)
- `PUT /api/members/:id` - Update member
- `POST /api/members/:id/approve` - Approve pending member
- `DELETE /api/members/:id` - Reject/delete member

### Loans
- `GET /api/loans` - Get all loans
- `GET /api/loans/:id` - Get single loan
- `POST /api/loans` - Create new loan application
- `PUT /api/loans/:id` - Update loan
- `POST /api/loans/:id/review` - Add review/comment to loan
- `POST /api/loans/:id/approve` - Approve loan (by role)
- `POST /api/loans/:id/reject` - Reject loan

### File Uploads
- `POST /api/uploads/kyc` - Upload KYC documents
- `GET /api/uploads/:fileId` - Download uploaded file

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/financial` - Financial reports
- `GET /api/reports/agm` - AGM reports
- `GET /api/reports/export?type=pdf|excel` - Export reports

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

---

## 📍 File-by-File Integration Points

### `/lib/auth.ts`
**Location**: Lines 27-41
**Current**: Validates against hardcoded USERS array
**Replace with**:
\`\`\`typescript
export async function login(email: string, password: string): Promise<User | null> {
  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    localStorage.setItem('session', JSON.stringify(data.session));
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}
\`\`\`

### `/lib/store.ts`
**Location**: Lines 219-222
**Current**: Returns data from localStorage
**Replace with**:
\`\`\`typescript
export async function getMembers(): Promise<Member[]> {
  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/members');
    const data = await response.json();
    return data.members;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}
\`\`\`

**Location**: Lines 228-237
**Current**: Saves to localStorage
**Replace with**:
\`\`\`typescript
export async function saveMember(member: Member): Promise<void> {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/members/${member.id || ''}`, {
      method: member.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    
    if (!response.ok) throw new Error('Failed to save member');
  } catch (error) {
    console.error('Error saving member:', error);
    throw error;
  }
}
\`\`\`

**Location**: Lines 254-257
**Current**: Returns loans from localStorage
**Replace with**:
\`\`\`typescript
export async function getLoans(): Promise<Loan[]> {
  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/loans');
    const data = await response.json();
    return data.loans;
  } catch (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
}
\`\`\`

### `/components/pages/MemberRegistration.tsx`
**Location**: Lines 64-86 (handleSubmit function)
**Current**: Saves to localStorage
**Replace with**:
\`\`\`typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) {
    toast.error('Please fix all validation errors');
    return;
  }

  try {
    // TODO: Upload files first
    const fileUrls: Record<string, string> = {};
    for (const [key, file] of Object.entries(uploadedFiles)) {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', key);
        
        const response = await fetch('/api/uploads/kyc', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        fileUrls[key] = data.fileUrl;
      }
    }

    // TODO: Then create member
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        kycDocuments: fileUrls,
      }),
    });

    if (!response.ok) throw new Error('Registration failed');

    toast.success('Registration submitted successfully!');
    setTimeout(() => navigate('/'), 2000);
  } catch (error) {
    toast.error('Registration failed. Please try again.');
    console.error(error);
  }
};
\`\`\`

### `/components/pages/LoanApplication.tsx`
**Location**: Similar to MemberRegistration
**Replace saveLoan** call with POST to `/api/loans`

### `/components/admin/AdminLayout.tsx`
**Location**: Lines 61-64 (Notification Bell)
**Current**: Shows dummy notification dot
**Replace with**:
\`\`\`typescript
const [notifications, setNotifications] = useState<Notification[]>([]);
const [showNotifications, setShowNotifications] = useState(false);

useEffect(() => {
  // TODO: Replace with actual API call
  fetch('/api/notifications')
    .then(res => res.json())
    .then(data => setNotifications(data.notifications))
    .catch(console.error);
}, []);

// Then update the bell button to show actual count
<button 
  className="relative hover:bg-[#4A7C2C] p-2 rounded"
  onClick={() => setShowNotifications(!showNotifications)}
>
  <Bell size={20} />
  {notifications.filter(n => !n.read).length > 0 && (
    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
      {notifications.filter(n => !n.read).length}
    </span>
  )}
</button>
\`\`\`

### `/components/admin/Members.tsx`
**Location**: Throughout component
**Current**: Uses getMembers(), approveMember(), rejectMember()
**Replace**: All function calls with API endpoints as shown in store.ts section

### `/components/admin/Loans.tsx`
**Location**: Throughout component
**Current**: Uses getLoans(), saveLoan()
**Replace**: All function calls with API endpoints

### `/components/admin/Reports.tsx`
**Location**: Lines 67-73 (Export functions)
**Current**: Shows mock toast
**Replace with**:
\`\`\`typescript
const exportPDF = async () => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/reports/export?type=pdf');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shg-report-${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    toast.success('Report exported successfully');
  } catch (error) {
    toast.error('Export failed');
    console.error(error);
  }
};
\`\`\`

---

## 🔐 Authentication Headers

For all authenticated API calls, include the session token:

\`\`\`typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getSessionToken()}`,
};

function getSessionToken(): string {
  const session = localStorage.getItem('session');
  if (session) {
    const parsed = JSON.parse(session);
    return parsed.token; // Add token to session object
  }
  return '';
}
\`\`\`

---

## 📦 File Upload Format

For KYC documents and other file uploads:

\`\`\`typescript
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'nationalId'); // or 'passport', 'kraPin', etc.
formData.append('memberId', memberId);

const response = await fetch('/api/uploads/kyc', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${getSessionToken()}`,
  },
  body: formData,
});
\`\`\`

---

## 🔔 Notification System

Create a notifications store/context for real-time updates:

\`\`\`typescript
// Example notification structure
interface Notification {
  id: string;
  userId: string;
  type: 'loan_approved' | 'loan_rejected' | 'member_approved' | 'new_comment';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
\`\`\`

Consider using WebSockets or Server-Sent Events for real-time notifications:

\`\`\`typescript
// In AdminLayout or App component
useEffect(() => {
  const eventSource = new EventSource('/api/notifications/stream');
  
  eventSource.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    // Update notifications state
    setNotifications(prev => [notification, ...prev]);
  };

  return () => eventSource.close();
}, []);
\`\`\`

---

## 🎯 Priority Order for Integration

1. **Authentication** (`/lib/auth.ts`) - Do this first
2. **Members** (`/lib/store.ts` - getMembers, saveMember) - Core functionality
3. **Loans** (`/lib/store.ts` - getLoans, saveLoan) - Core functionality  
4. **File Uploads** (MemberRegistration, LoanApplication) - Important for KYC
5. **Reports** (Dashboard, Reports page) - Analytics
6. **Notifications** (AdminLayout) - Real-time updates

---

## ⚠️ Important Notes

1. **Error Handling**: All API calls should have try-catch blocks and show user-friendly error messages
2. **Loading States**: Add loading spinners during API calls
3. **Validation**: Backend should validate all data; don't rely only on frontend validation
4. **File Size Limits**: Enforce 5MB limit on backend as well
5. **Rate Limiting**: Implement rate limiting on sensitive endpoints
6. **CORS**: Configure CORS properly if frontend and backend are on different domains
7. **Security**: Never store sensitive data in localStorage; use httpOnly cookies for tokens when possible

---

## 📝 Example API Response Formats

### Successful Response
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format",
      "phone": "Phone number must be 10 digits"
    }
  }
}
\`\`\`

---

## 🚀 Getting Started

1. Set up your backend API with the endpoints listed above
2. Update the API base URL in a config file
3. Replace localStorage calls one module at a time
4. Test thoroughly with mock data first
5. Deploy backend before deploying frontend changes
6. Monitor error logs and user feedback

For questions or issues, consult your backend development team.
