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
import { AlertCircle, CheckCircle, Users, Download } from 'lucide-react';

export function LoanApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [memberId, setMemberId] = useState('');
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Applicant Information
    fullName: '',
    nationalId: '',
    maritalStatus: '',
    dateOfBirth: '',
    phoneNumber: '',
    currentAddress: '',
    areaOfResidence: '',
    town: '',
    estateVillage: '',
    residenceType: '',
    monthlyRent: '',
    
    // Employment Information
    currentEmployer: '',
    employerAddress: '',
    phone: '',
    position: '',
    periodInEmployment: '',
    cityTown: '',
    county: '',
    monthlyIncome: '',
    email: '',
    
    // Other Sources of Income
    otherIncome1: '',
    otherIncomeAmount1: '',
    otherIncome2: '',
    otherIncomeAmount2: '',
    otherIncome3: '',
    otherIncomeAmount3: '',
    
    // Loan Application
    amountRequested: '',
    amountInWords: '',
    repayableMonths: '',
    loanPurpose1: '',
    loanPurpose2: '',
    loanPurpose3: '',
    
    // Other Loans/Debts
    otherDebt1: '',
    otherDebtAmount1: '',
    otherDebt2: '',
    otherDebtAmount2: '',
    
    // Guarantors (array of up to 5)
    guarantors: [
      { name: '', phone: '', idNumber: '', groupName: '', amountOffered: '' },
      { name: '', phone: '', idNumber: '', groupName: '', amountOffered: '' },
      { name: '', phone: '', idNumber: '', groupName: '', amountOffered: '' },
    ],
    
    // Declarations
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const verifyMember = () => {
    const member = getMember(memberId);
    if (member && member.status === 'active') {
      setMemberData(member);
      setMemberVerified(true);
      setFormData({
        ...formData,
        fullName: `${member.firstName} ${member.lastName}`,
        phoneNumber: member.phone,
        email: member.email,
      });
      setStep(2);
      toast.success('Member verified successfully!');
    } else {
      toast.error('Invalid member ID or member not active. Please register first.');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Applicant Information
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.nationalId.match(/^[0-9]{7,8}$/)) newErrors.nationalId = 'Valid National ID (7-8 digits) is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phoneNumber.match(/^(07|01)[0-9]{8}$/)) newErrors.phoneNumber = 'Valid phone number is required';
    if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Address is required';
    
    // Employment
    if (!formData.monthlyIncome || Number(formData.monthlyIncome) <= 0) newErrors.monthlyIncome = 'Monthly income is required';
    
    // Loan Application
    const amount = Number(formData.amountRequested);
    if (!amount || amount <= 0) newErrors.amountRequested = 'Loan amount is required';
    if (!formData.amountInWords.trim()) newErrors.amountInWords = 'Amount in words is required';
    if (!formData.repayableMonths) newErrors.repayableMonths = 'Repayment period is required';
    if (!formData.loanPurpose1.trim()) newErrors.loanPurpose1 = 'At least one loan purpose is required';
    
    // Guarantors - at least one required
    const validGuarantors = formData.guarantors.filter(g => g.name.trim() && g.phone.trim() && g.idNumber.trim());
    if (validGuarantors.length === 0) {
      newErrors.guarantors = 'At least one guarantor is required';
    }
    
    // Check guarantor amounts cover loan
    const totalGuaranteed = validGuarantors.reduce((sum, g) => sum + (Number(g.amountOffered) || 0), 0);
    if (totalGuaranteed < amount) {
      newErrors.guarantorAmount = `Guarantors must cover at least KES ${amount.toLocaleString()}. Currently guaranteed: KES ${totalGuaranteed.toLocaleString()}`;
    }
    
    if (!formData.termsAccepted) newErrors.terms = 'You must accept the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix all validation errors');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const loan = {
      id: `loan-${Date.now()}`,
      loanId: `LN${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      memberId: memberData.memberId,
      memberName: formData.fullName,
      amount: Number(formData.amountRequested),
      purpose: [formData.loanPurpose1, formData.loanPurpose2, formData.loanPurpose3].filter(Boolean).join('; '),
      term: Number(formData.repayableMonths),
      interestRate: 12,
      monthlyEmi: Math.round(Number(formData.amountRequested) / Number(formData.repayableMonths)),
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'treasurer_review' as const,
      treasurerStatus: 'pending' as const,
      income: Number(formData.monthlyIncome),
      guarantorName: formData.guarantors[0]?.name || '',
      guarantorPhone: formData.guarantors[0]?.phone || '',
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

  const handleGuarantorChange = (index: number, field: string, value: string) => {
    const newGuarantors = [...formData.guarantors];
    newGuarantors[index] = { ...newGuarantors[index], [field]: value };
    setFormData({ ...formData, guarantors: newGuarantors });
    if (errors.guarantors || errors.guarantorAmount) {
      setErrors({ ...errors, guarantors: '', guarantorAmount: '' });
    }
  };

  const addGuarantor = () => {
    if (formData.guarantors.length < 5) {
      setFormData({
        ...formData,
        guarantors: [...formData.guarantors, { name: '', phone: '', idNumber: '', groupName: '', amountOffered: '' }]
      });
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl mb-2 md:mb-4 text-[#2D5016]">Loan Application</h1>
            <p className="text-base md:text-lg text-gray-600">Caritas Nairobi - St Gabriel SHG</p>
            {/* Download Manual Form Button */}
            <div className="mt-3">
              <a
                href="/LOAN-APPLICATION-FORM.pdf"
                download="Loan-Application-Form.pdf"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5016] hover:bg-[#4A7C2C] text-white text-xs font-medium rounded-md transition-colors"
              >
                <Download size={13} />
                Download Form (Fill Manually)
              </a>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Member Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="memberId">Membership Number</Label>
                <Input
                  id="memberId"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="Enter your membership number"
                  className="text-base md:text-lg"
                />
                <p className="text-xs md:text-sm text-gray-600 mt-2">
                  Your membership number can be found in your registration confirmation
                </p>
              </div>

              <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs md:text-sm text-blue-800">
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

  const totalGuaranteedAmount = formData.guarantors.reduce((sum, g) => sum + (Number(g.amountOffered) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl mb-2 text-[#2D5016]">Loan Application Form</h1>
          <p className="text-sm md:text-base text-gray-600">Caritas Nairobi - Social Promotion Registered Trustees</p>
          {/* Download Manual Form Button */}
          <div className="mt-3">
            <a
              href="/LOAN-APPLICATION-FORM.pdf"
              download="Loan-Application-Form.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5016] hover:bg-[#4A7C2C] text-white text-xs font-medium rounded-md transition-colors"
            >
              <Download size={13} />
              Download Form (Fill Manually)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="fullName">Name of Applicant *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nationalId">National ID/Passport No *</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                    placeholder="12345678"
                    className={errors.nationalId ? 'border-red-500' : ''}
                  />
                  {errors.nationalId && <p className="text-sm text-red-500 mt-1">{errors.nationalId}</p>}
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone No *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    placeholder="0712345678"
                    className={errors.phoneNumber ? 'border-red-500' : ''}
                  />
                  {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Marital Status *</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value="Married"
                        checked={formData.maritalStatus === 'Married'}
                        onChange={(e) => handleChange('maritalStatus', e.target.value)}
                      />
                      <span className="text-sm">Married</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value="Single"
                        checked={formData.maritalStatus === 'Single'}
                        onChange={(e) => handleChange('maritalStatus', e.target.value)}
                      />
                      <span className="text-sm">Single</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value="Widow"
                        checked={formData.maritalStatus === 'Widow'}
                        onChange={(e) => handleChange('maritalStatus', e.target.value)}
                      />
                      <span className="text-sm">Widow</span>
                    </label>
                  </div>
                  {errors.maritalStatus && <p className="text-sm text-red-500 mt-1">{errors.maritalStatus}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="currentAddress">Current Address *</Label>
                <Input
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => handleChange('currentAddress', e.target.value)}
                  className={errors.currentAddress ? 'border-red-500' : ''}
                />
                {errors.currentAddress && <p className="text-sm text-red-500 mt-1">{errors.currentAddress}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="areaOfResidence">Area of Residence</Label>
                  <Input
                    id="areaOfResidence"
                    value={formData.areaOfResidence}
                    onChange={(e) => handleChange('areaOfResidence', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="town">Town</Label>
                  <Input
                    id="town"
                    value={formData.town}
                    onChange={(e) => handleChange('town', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="estateVillage">Estate/Village</Label>
                  <Input
                    id="estateVillage"
                    value={formData.estateVillage}
                    onChange={(e) => handleChange('estateVillage', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Residence</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="residenceType"
                        value="Owned"
                        checked={formData.residenceType === 'Owned'}
                        onChange={(e) => handleChange('residenceType', e.target.value)}
                      />
                      <span className="text-sm">Owned</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="residenceType"
                        value="Rented"
                        checked={formData.residenceType === 'Rented'}
                        onChange={(e) => handleChange('residenceType', e.target.value)}
                      />
                      <span className="text-sm">Rented</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="monthlyRent">Monthly Payment or Rent</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleChange('monthlyRent', e.target.value)}
                    placeholder="KES"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Employment Information (Where Applicable)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentEmployer">Current Employer</Label>
                  <Input
                    id="currentEmployer"
                    value={formData.currentEmployer}
                    onChange={(e) => handleChange('currentEmployer', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employerAddress">Employer Address</Label>
                  <Input
                    id="employerAddress"
                    value={formData.employerAddress}
                    onChange={(e) => handleChange('employerAddress', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="periodInEmployment">Period in Current Employment</Label>
                  <Input
                    id="periodInEmployment"
                    value={formData.periodInEmployment}
                    onChange={(e) => handleChange('periodInEmployment', e.target.value)}
                    placeholder="e.g., 2 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cityTown">City/Town</Label>
                  <Input
                    id="cityTown"
                    value={formData.cityTown}
                    onChange={(e) => handleChange('cityTown', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => handleChange('county', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income (KES) *</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                    className={errors.monthlyIncome ? 'border-red-500' : ''}
                  />
                  {errors.monthlyIncome && <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Other Sources of Income */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Other Sources of Income</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`otherIncome${num}`}>Description {num}</Label>
                    <Input
                      id={`otherIncome${num}`}
                      value={formData[`otherIncome${num}` as keyof typeof formData] as string}
                      onChange={(e) => handleChange(`otherIncome${num}`, e.target.value)}
                      placeholder="e.g., Rental income, Business"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`otherIncomeAmount${num}`}>Monthly Income (KES)</Label>
                    <Input
                      id={`otherIncomeAmount${num}`}
                      type="number"
                      value={formData[`otherIncomeAmount${num}` as keyof typeof formData] as string}
                      onChange={(e) => handleChange(`otherIncomeAmount${num}`, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Loan Application */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Loan Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amountRequested">Amount Requested in Figures (KES) *</Label>
                  <Input
                    id="amountRequested"
                    type="number"
                    value={formData.amountRequested}
                    onChange={(e) => handleChange('amountRequested', e.target.value)}
                    placeholder="e.g., 100000"
                    className={errors.amountRequested ? 'border-red-500' : ''}
                  />
                  {errors.amountRequested && <p className="text-sm text-red-500 mt-1">{errors.amountRequested}</p>}
                </div>
                <div>
                  <Label htmlFor="amountInWords">Amount in Words *</Label>
                  <Input
                    id="amountInWords"
                    value={formData.amountInWords}
                    onChange={(e) => handleChange('amountInWords', e.target.value)}
                    placeholder="e.g., One hundred thousand"
                    className={errors.amountInWords ? 'border-red-500' : ''}
                  />
                  {errors.amountInWords && <p className="text-sm text-red-500 mt-1">{errors.amountInWords}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="repayableMonths">Repayable in _____ monthly instalments *</Label>
                <Select value={formData.repayableMonths} onValueChange={(value) => handleChange('repayableMonths', value)}>
                  <SelectTrigger className={errors.repayableMonths ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select repayment period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
                {errors.repayableMonths && <p className="text-sm text-red-500 mt-1">{errors.repayableMonths}</p>}
              </div>

              <div className="space-y-2">
                <Label>Purpose of the Loan *</Label>
                {[1, 2, 3].map((num) => (
                  <Input
                    key={num}
                    id={`loanPurpose${num}`}
                    value={formData[`loanPurpose${num}` as keyof typeof formData] as string}
                    onChange={(e) => handleChange(`loanPurpose${num}`, e.target.value)}
                    placeholder={`Purpose ${num}${num === 1 ? ' (Required)' : ' (Optional)'}`}
                    className={num === 1 && errors.loanPurpose1 ? 'border-red-500' : ''}
                  />
                ))}
                {errors.loanPurpose1 && <p className="text-sm text-red-500 mt-1">{errors.loanPurpose1}</p>}
              </div>

              <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs md:text-sm text-blue-800">
                  <AlertCircle className="inline mr-2" size={16} />
                  <strong>Important:</strong> Member must have paid savings consecutively for a minimum of 6 months. 
                  Loans above KES 1,000,000 require 6 months bank statement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Other Loans/Debts */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Other Loans/Debts/Obligations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {[1, 2].map((num) => (
                <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`otherDebt${num}`}>Description</Label>
                    <Input
                      id={`otherDebt${num}`}
                      value={formData[`otherDebt${num}` as keyof typeof formData] as string}
                      onChange={(e) => handleChange(`otherDebt${num}`, e.target.value)}
                      placeholder="e.g., Bank loan, SACCO loan"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`otherDebtAmount${num}`}>Amount (KES)</Label>
                    <Input
                      id={`otherDebtAmount${num}`}
                      type="number"
                      value={formData[`otherDebtAmount${num}` as keyof typeof formData] as string}
                      onChange={(e) => handleChange(`otherDebtAmount${num}`, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Guarantors */}
          <Card className="border-2 border-[#2D5016]">
            <CardHeader className="bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg flex items-center">
                  <Users className="mr-2" size={20} />
                  Guarantors (To be completed by the Guarantors)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="p-3 md:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs md:text-sm text-orange-800 font-semibold">
                  <AlertCircle className="inline mr-2" size={16} />
                  Note: Amount guaranteed must be equal to or more than the amount applied for
                </p>
                <p className="text-xs md:text-sm text-orange-700 mt-2">
                  Borrower's savings must cover a third of the guarantorship. 
                  The guarantors accept jointly and severally liability for repayment in the event of borrower's default.
                </p>
              </div>

              {formData.guarantors.map((guarantor, index) => (
                <Card key={index} className="border-[#6B9E4D]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm md:text-base text-[#2D5016]">Guarantor {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Name in Full</Label>
                        <Input
                          value={guarantor.name}
                          onChange={(e) => handleGuarantorChange(index, 'name', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label>Cell Phone No</Label>
                        <Input
                          value={guarantor.phone}
                          onChange={(e) => handleGuarantorChange(index, 'phone', e.target.value)}
                          placeholder="0712345678"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>ID No</Label>
                        <Input
                          value={guarantor.idNumber}
                          onChange={(e) => handleGuarantorChange(index, 'idNumber', e.target.value)}
                          placeholder="12345678"
                        />
                      </div>
                      <div>
                        <Label>Self-help Group Name</Label>
                        <Input
                          value={guarantor.groupName}
                          onChange={(e) => handleGuarantorChange(index, 'groupName', e.target.value)}
                          placeholder="Group name"
                        />
                      </div>
                      <div>
                        <Label>Amount Offered (KES)</Label>
                        <Input
                          type="number"
                          value={guarantor.amountOffered}
                          onChange={(e) => handleGuarantorChange(index, 'amountOffered', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formData.guarantors.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addGuarantor}
                  className="w-full border-[#2D5016] text-[#2D5016]"
                >
                  + Add Another Guarantor (Optional)
                </Button>
              )}

              <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#2D5016]">Total Amount Guaranteed:</span>
                  <span className="text-lg md:text-xl font-bold text-[#2D5016]">
                    KES {totalGuaranteedAmount.toLocaleString()}
                  </span>
                </div>
                {formData.amountRequested && (
                  <p className="text-xs md:text-sm text-gray-600 mt-2">
                    Required: KES {Number(formData.amountRequested).toLocaleString()}
                    {totalGuaranteedAmount >= Number(formData.amountRequested) ? (
                      <CheckCircle className="inline ml-2 text-green-600" size={16} />
                    ) : (
                      <span className="text-red-600 ml-2">
                        (Shortfall: KES {(Number(formData.amountRequested) - totalGuaranteedAmount).toLocaleString()})
                      </span>
                    )}
                  </p>
                )}
              </div>

              {errors.guarantors && <p className="text-sm text-red-500">{errors.guarantors}</p>}
              {errors.guarantorAmount && <p className="text-sm text-red-500">{errors.guarantorAmount}</p>}
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card className="border-2 border-[#2D5016]">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Applicant Commitment</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs md:text-sm text-red-800 font-semibold mb-2">
                    Key Terms:
                  </p>
                  <ul className="text-xs md:text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>6 months savings history required</li>
                    <li>Guarantors' savings must cover loan amount</li>
                    <li>Loans &gt; KES 1M need bank statement</li>
                    <li>Emergency loans ≤ KES 100K, max 12 months</li>
                  </ul>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleChange('termsAccepted', !!checked)}
                    className={errors.terms ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="termsAccepted" className="cursor-pointer font-normal text-xs md:text-sm leading-relaxed">
                    I declare that I have <strong>read, understood and shall comply</strong> with all terms and conditions, 
                    and the information provided is true to the best of my knowledge.
                  </Label>
                </div>
                {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              className="bg-[#2D5016] hover:bg-[#4A7C2C] w-full sm:w-auto"
            >
              Submit Loan Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}