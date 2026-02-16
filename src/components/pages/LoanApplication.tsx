import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { getMember, saveLoan } from '../../lib/store';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function LoanApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [memberId, setMemberId] = useState('');
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    term: '',
    income: '',
    guarantorName: '',
    guarantorPhone: '',
    collateral: '',
    declaration1: false,
    declaration2: false,
    declaration3: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const verifyMember = () => {
    const member = getMember(memberId);
    if (member && member.status === 'active') {
      setMemberData(member);
      setMemberVerified(true);
      setStep(2);
      toast.success('Member verified successfully!');
    } else {
      toast.error('Invalid member ID or member not active. Please register first.');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount < 10000 || amount > 5000000) {
      newErrors.amount = 'Loan amount must be between Kshs. 10,000 and Kshs. 5,000,000';
    }
    
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    if (!formData.term) newErrors.term = 'Loan term is required';
    
    const income = parseFloat(formData.income);
    if (!income || income < 0) newErrors.income = 'Valid income is required';
    
    if (amount > 100000) {
      if (!formData.guarantorName.trim()) newErrors.guarantorName = 'Guarantor required for loans above ₹1,00,000';
      if (!formData.guarantorPhone.match(/^[0-9]{10}$/)) newErrors.guarantorPhone = 'Valid 10-digit phone required';
    }
    
    if (!formData.declaration1 || !formData.declaration2 || !formData.declaration3) {
      newErrors.declarations = 'All declarations must be accepted';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateEMI = () => {
    const principal = parseFloat(formData.amount);
    const months = parseInt(formData.term);
    const rate = 12 / 12 / 100; // 12% annual, monthly rate
    
    if (principal && months) {
      const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      return Math.round(emi);
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    const loan = {
      id: `loan-${Date.now()}`,
      loanId: `LN${new Date().getFullYear()}${String(Date.now()).slice(-3)}`,
      memberId: memberData.memberId,
      memberName: `${memberData.firstName} ${memberData.lastName}`,
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      term: parseInt(formData.term),
      interestRate: 12,
      monthlyEmi: calculateEMI(),
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'treasurer_review' as const,
      treasurerStatus: 'pending' as const,
      income: parseFloat(formData.income),
      guarantorName: formData.guarantorName || undefined,
      guarantorPhone: formData.guarantorPhone || undefined,
      collateral: formData.collateral || undefined,
      comments: [],
    };

    saveLoan(loan);
    toast.success('Loan application submitted successfully!');
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4 text-[#2D5016]">Apply for Loan</h1>
            <p className="text-lg text-gray-600">Enter your member ID to begin</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016]">Member Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="memberId">Member ID</Label>
                <Input
                  id="memberId"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g., STG0001"
                  className="text-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Your member ID can be found in your registration confirmation or membership card
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="inline mr-2" size={16} />
                  Only active members can apply for loans. If you're not registered yet, please{' '}
                  <a href="/register" className="underline font-semibold">register here</a>
                </p>
              </div>

              <Button 
                onClick={verifyMember} 
                className="w-full bg-[#2D5016] hover:bg-[#4A7C2C]"
                disabled={!memberId.trim()}
              >
                Verify & Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-[#2D5016]">Loan Application</h1>
          <p className="text-lg text-gray-600">Complete your loan application</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Details (Auto-filled) */}
          <Card className="border-t-4 border-[#2D5016]">
            <CardHeader>
              <CardTitle className="text-[#2D5016] flex items-center">
                <CheckCircle className="mr-2 text-green-600" size={24} />
                Member Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Member ID</p>
                  <p className="font-semibold">{memberData.memberId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{memberData.firstName} {memberData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{memberData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{memberData.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016]">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Loan Amount (Kshs.) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="10,000 - 5,000,000"
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <Label htmlFor="term">Loan Term *</Label>
                  <Select value={formData.term} onValueChange={(value) => handleChange('term', value)}>
                    <SelectTrigger className={errors.term ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="18">18 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="48">48 months</SelectItem>
                      <SelectItem value="60">60 months</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.term && <p className="text-sm text-red-500 mt-1">{errors.term}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="purpose">Purpose of Loan *</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleChange('purpose', e.target.value)}
                  placeholder="Describe the purpose of this loan (e.g., Business expansion, Education, Medical emergency)"
                  rows={3}
                  className={errors.purpose ? 'border-red-500' : ''}
                />
                {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
              </div>

              {formData.amount && formData.term && (
                <div className="p-4 bg-[#6B9E4D]/10 border border-[#6B9E4D] rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Interest Rate</p>
                      <p className="text-xl font-semibold text-[#2D5016]">12% per annum</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Monthly EMI</p>
                      <p className="text-xl font-semibold text-[#2D5016]">Kshs. {calculateEMI().toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016]">Income Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="income">Monthly Income (₹) *</Label>
                <Input
                  id="income"
                  type="number"
                  value={formData.income}
                  onChange={(e) => handleChange('income', e.target.value)}
                  placeholder="Your monthly income"
                  className={errors.income ? 'border-red-500' : ''}
                />
                {errors.income && <p className="text-sm text-red-500 mt-1">{errors.income}</p>}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="inline mr-2" size={16} />
                  Income proof documents will be requested during verification
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Guarantor (Conditional) */}
          {parseFloat(formData.amount) > 100000 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#2D5016]">Guarantor Details</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Required for loans above ₹1,00,000</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guarantorName">Guarantor Name *</Label>
                    <Input
                      id="guarantorName"
                      value={formData.guarantorName}
                      onChange={(e) => handleChange('guarantorName', e.target.value)}
                      className={errors.guarantorName ? 'border-red-500' : ''}
                    />
                    {errors.guarantorName && <p className="text-sm text-red-500 mt-1">{errors.guarantorName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="guarantorPhone">Guarantor Phone *</Label>
                    <Input
                      id="guarantorPhone"
                      value={formData.guarantorPhone}
                      onChange={(e) => handleChange('guarantorPhone', e.target.value)}
                      placeholder="10-digit number"
                      className={errors.guarantorPhone ? 'border-red-500' : ''}
                    />
                    {errors.guarantorPhone && <p className="text-sm text-red-500 mt-1">{errors.guarantorPhone}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="collateral">Collateral (if any)</Label>
                  <Textarea
                    id="collateral"
                    value={formData.collateral}
                    onChange={(e) => handleChange('collateral', e.target.value)}
                    placeholder="Describe any collateral being offered"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Declarations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016]">Declarations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="declaration1"
                  checked={formData.declaration1}
                  onCheckedChange={(checked) => handleChange('declaration1', !!checked)}
                />
                <Label htmlFor="declaration1" className="cursor-pointer font-normal">
                  I declare that all information provided is true and accurate to the best of my knowledge
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="declaration2"
                  checked={formData.declaration2}
                  onCheckedChange={(checked) => handleChange('declaration2', !!checked)}
                />
                <Label htmlFor="declaration2" className="cursor-pointer font-normal">
                  I understand and agree to the loan terms including the 12% annual interest rate
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="declaration3"
                  checked={formData.declaration3}
                  onCheckedChange={(checked) => handleChange('declaration3', !!checked)}
                />
                <Label htmlFor="declaration3" className="cursor-pointer font-normal">
                  I commit to repaying the loan as per the agreed schedule and understand the consequences of default
                </Label>
              </div>
              {errors.declarations && <p className="text-sm text-red-500">{errors.declarations}</p>}
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2D5016] hover:bg-[#4A7C2C]">
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
