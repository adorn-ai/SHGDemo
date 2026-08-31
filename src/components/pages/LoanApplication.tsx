import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { verifyMemberByNationalId, submitLoanApplication } from '../../lib/registrationApi';
import { AlertCircle, CheckCircle, Users, Download, Plus, Trash2, Loader2 } from 'lucide-react';

const LOAN_PRODUCTS = ['Development Loan', 'Business Loan', 'AgriBusiness Loan', 'Education Loan', 'Emergency Loan', 'Church Loan'];

interface Guarantor {
  membershipNo: string;
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  groupName: string;
  amountOffered: string;
  amountOfferedWords: string;
  signatureName: string;
}

const EMPTY_GUARANTOR: Guarantor = {
  membershipNo: '',
  name: '',
  phone: '',
  email: '',
  idNumber: '',
  groupName: '',
  amountOffered: '',
  amountOfferedWords: '',
  signatureName: '',
};

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="font-sans text-base lg:text-lg tracking-[0.15em] uppercase text-[#237A17] mb-1">{eyebrow}</p>
      <h2 className="text-2xl text-[#16210E]">{title}</h2>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[#237A17] pl-4 py-1 font-sans text-base lg:text-lg text-gray-700 leading-relaxed">
      {children}
    </div>
  );
}

export function LoanApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nationalIdInput, setNationalIdInput] = useState('');
  const [memberData, setMemberData] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    maritalStatus: '',
    dateOfBirth: '',
    phoneNumber: '',
    emailAddress: '',
    physicalAddress: '',
    areaOfResidence: '',
    town: '',
    estateVillage: '',
    residenceType: '',
    monthlyRent: '',

    employmentOrBusiness: '',
    employerAddress: '',
    employerPhone: '',
    position: '',
    periodInEmployment: '',
    cityTown: '',
    county: '',
    employerEmail: '',

    incomeDescription1: '',
    incomeAmount1: '',
    incomeDescription2: '',
    incomeAmount2: '',
    incomeDescription3: '',
    incomeAmount3: '',

    amountRequested: '',
    amountInWords: '',
    repayableMonths: '',
    loanPurpose1: '',
    loanPurpose2: '',
    loanPurpose3: '',

    otherDebt1: '',
    otherDebtAmount1: '',
    otherDebt2: '',
    otherDebtAmount2: '',

    applicantSignatureName: '',

    selfGuaranteedAmount: '',
    selfGuaranteedAmountWords: '',
    totalGuarantorAmountWords: '',

    witnessName: '',
    witnessMemberNo: '',
    witnessPhone: '',
    witnessRelationship: '',
    witnessSignatureName: '',

    termsAccepted: false,
    pledgeFutureSavings: false,
  });

  const [loanProducts, setLoanProducts] = useState<string[]>([]);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([{ ...EMPTY_GUARANTOR }, { ...EMPTY_GUARANTOR }]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyMember = async () => {
    setIsVerifying(true);
    try {
      const member = await verifyMemberByNationalId(nationalIdInput);
      if (member) {
        setMemberData(member);
        // The verification lookup deliberately returns only {member_number,
        // name} - not phone/email - to keep member records private rather
        // than exposing them through a public-facing lookup. The applicant
        // re-enters their own contact details in Step 2.
        setFormData({
          ...formData,
          fullName: member.name,
          nationalId: nationalIdInput,
        });
        setStep(2);
        toast.success('Member verified successfully!');
      } else {
        toast.error("We couldn't find a member with that National ID. If you're a new applicant, please register first.");
      }
    } catch (error) {
      console.error('Member verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const toggleLoanProduct = (product: string) => {
    setLoanProducts((prev) => (prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]));
    if (errors.loanProducts) setErrors({ ...errors, loanProducts: '' });
  };

  const handleGuarantorChange = (index: number, field: keyof Guarantor, value: string) => {
    const next = [...guarantors];
    next[index] = { ...next[index], [field]: value };
    setGuarantors(next);
    const key = `guarantor-${index}-${field}`;
    if (errors[key]) setErrors({ ...errors, [key]: '' });
    if (errors.guarantors || errors.guarantorAmount) setErrors({ ...errors, guarantors: '', guarantorAmount: '' });
  };

  const addGuarantor = () => {
    if (guarantors.length < 5) setGuarantors([...guarantors, { ...EMPTY_GUARANTOR }]);
  };
  const removeGuarantor = (index: number) => {
    if (guarantors.length > 1) setGuarantors(guarantors.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.nationalId.match(/^[0-9]{7,8}$/)) newErrors.nationalId = 'Valid National ID (7-8 digits) is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phoneNumber.match(/^(07|01)[0-9]{8}$/)) newErrors.phoneNumber = 'Valid phone number is required';
    if (!formData.emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.emailAddress = 'Valid email is required';
    if (!formData.physicalAddress.trim()) newErrors.physicalAddress = 'Physical address is required';

    if (loanProducts.length === 0) newErrors.loanProducts = 'Select at least one loan product';

    const amount = Number(formData.amountRequested);
    if (!amount || amount <= 0) newErrors.amountRequested = 'Loan amount is required';
    if (!formData.amountInWords.trim()) newErrors.amountInWords = 'Amount in words is required';
    if (!formData.repayableMonths) newErrors.repayableMonths = 'Repayment period is required';
    if (!formData.loanPurpose1.trim()) newErrors.loanPurpose1 = 'At least one loan purpose is required';

    if (loanProducts.includes('Emergency Loan') && amount > 100000) {
      newErrors.amountRequested = 'Emergency loans are capped at KES 100,000';
    }

    if (!formData.incomeDescription1.trim() || !formData.incomeAmount1) {
      newErrors.incomeAmount1 = 'At least one source of monthly income is required';
    }

    if (!formData.applicantSignatureName.trim()) newErrors.applicantSignatureName = "Applicant's signature (typed full name) is required";

    const validGuarantors = guarantors.filter((g) => g.name.trim() && g.phone.trim() && g.idNumber.trim());
    if (validGuarantors.length === 0) {
      newErrors.guarantors = 'At least one guarantor is required';
    } else {
      // Counts how many guarantors share each email address, so the loop
      // below can flag every entry involved in a duplicate - not just the
      // second one typed, which would otherwise leave the first, equally
      // ambiguous entry unmarked.
      const guarantorEmailCounts: Record<string, number> = {};
      guarantors.forEach((g) => {
        const email = g.email.trim().toLowerCase();
        if (email) guarantorEmailCounts[email] = (guarantorEmailCounts[email] || 0) + 1;
      });

      guarantors.forEach((g, index) => {
        const hasAny = g.name.trim() || g.phone.trim() || g.idNumber.trim();
        if (!hasAny) return;
        if (!g.name.trim()) newErrors[`guarantor-${index}-name`] = 'Required';
        if (!g.phone.match(/^(07|01)[0-9]{8}$/)) newErrors[`guarantor-${index}-phone`] = 'Valid phone required';
        const guarantorEmail = g.email.trim().toLowerCase();
        if (!g.email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          newErrors[`guarantor-${index}-email`] = 'Valid email required';
        } else if (guarantorEmail === formData.emailAddress.trim().toLowerCase()) {
          newErrors[`guarantor-${index}-email`] = 'Guarantor email cannot be the same as your own email address';
        } else if (guarantorEmailCounts[guarantorEmail] > 1) {
          newErrors[`guarantor-${index}-email`] = 'Each guarantor must have a different email address';
        }
        if (!g.idNumber.match(/^[0-9]{7,8}$/)) newErrors[`guarantor-${index}-idNumber`] = 'Valid ID required';
        if (!g.amountOffered || Number(g.amountOffered) <= 0) newErrors[`guarantor-${index}-amountOffered`] = 'Required';
        if (!g.signatureName.trim()) newErrors[`guarantor-${index}-signatureName`] = 'Signature required';
      });
    }

    const selfGuaranteed = Number(formData.selfGuaranteedAmount) || 0;
    const totalFromGuarantors = validGuarantors.reduce((sum, g) => sum + (Number(g.amountOffered) || 0), 0);
    const totalGuaranteed = selfGuaranteed + totalFromGuarantors;
    if (totalGuaranteed < amount) {
      newErrors.guarantorAmount = `Guaranteed amount must be at least KES ${amount.toLocaleString()}. Currently: KES ${totalGuaranteed.toLocaleString()}`;
    }
    if (selfGuaranteed < amount / 3) {
      newErrors.selfGuaranteedAmount = "Self-guaranteed savings must cover at least a third of the guarantorship";
    }

    if (!formData.witnessName.trim()) newErrors.witnessName = 'Witness name is required';
    if (!formData.witnessSignatureName.trim()) newErrors.witnessSignatureName = "Witness's signature (typed full name) is required";

    if (!formData.termsAccepted) newErrors.terms = 'You must accept the terms and conditions';
    if (!formData.pledgeFutureSavings) newErrors.pledge = 'You must confirm the personal commitment pledge';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix all validation errors');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitLoanApplication({
        memberId: memberData.member_number,
        formData,
        loanProducts,
        guarantors,
      });

      toast.success('Loan application submitted successfully! You and your guarantors will receive a confirmation email.');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting loan application:', error);
      toast.error(error instanceof Error ? error.message : 'Error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] font-sans pt-8 pb-16 md:pt-12 md:pb-24 flex items-center">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-base lg:text-lg xl:text-xl tracking-[0.2em] uppercase text-[#237A17] mb-3">Caritas Nairobi</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-2 text-[#16210E]">Loan Application</h1>
            <p className="text-gray-600 lg:text-lg xl:text-xl">St Gabriel Catholic Church SHG</p>
            <div className="mt-4">
              <a
                href="/LOAN_APPLICATION_FORM_.pdf"
                download="Loan-Application-Form.pdf"
                className="inline-flex items-center gap-1.5 text-base lg:text-lg xl:text-xl text-[#16210E] hover:text-[#237A17] underline underline-offset-4"
              >
                <Download size={13} />
                Download Form (Fill Manually)
              </a>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 lg:p-12 xl:p-16">
            <div className="border-t-2 border-[#16210E] pt-8">
              <h2 className="text-xl lg:text-2xl xl:text-3xl text-[#16210E] mb-6">Member Verification</h2>
              <div className="space-y-5 lg:space-y-6">
                <div>
                  <Label htmlFor="nationalId" className="lg:text-lg xl:text-xl">National ID Number</Label>
                  <Input
                    id="nationalId"
                    value={nationalIdInput}
                    onChange={(e) => setNationalIdInput(e.target.value)}
                    placeholder="Enter your National ID number"
                    className="text-lg md:text-lg lg:h-12 lg:text-xl xl:h-14 xl:text-2xl"
                  />
                  <p className="text-base lg:text-lg xl:text-xl text-gray-500 mt-2">
                    Use the same National ID number you registered with as a member
                  </p>
                </div>

                <Notice>
                  <AlertCircle className="inline mr-2 -mt-0.5" size={14} />
                  Only active members can apply for loans. If you're not registered yet, please{' '}
                  <a href="/register" className="underline font-semibold">register here</a>.
                </Notice>

                <Button
                  onClick={verifyMember}
                  className="w-full bg-[#16210E] hover:bg-[#237A17] rounded-none lg:h-12 lg:text-lg xl:h-14 xl:text-xl"
                  disabled={!nationalIdInput.trim() || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} /> Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalFromGuarantors = guarantors.reduce((sum, g) => sum + (Number(g.amountOffered) || 0), 0);
  const totalGuaranteed = totalFromGuarantors + (Number(formData.selfGuaranteedAmount) || 0);

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans py-12 md:py-20">
      <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-base lg:text-lg tracking-[0.2em] uppercase text-[#237A17] mb-3">Caritas Nairobi &middot; Caritas Registered Trustees</p>
          <h1 className="text-3xl md:text-4xl mb-2 text-[#16210E]">Loan Application and Agreement Form</h1>
          <div className="mt-4">
            <a
              href="/LOAN_APPLICATION_FORM_.pdf"
              download="Loan-Application-Form.pdf"
              className="inline-flex items-center gap-1.5 text-base lg:text-lg text-[#16210E] hover:text-[#237A17] underline underline-offset-4"
            >
              <Download size={13} />
              Download Form (Fill Manually)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-14">
          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Step 1" title="Applicant Information" />
            <div className="space-y-5">
              <div>
                <Label htmlFor="fullName">Name of Applicant *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.fullName}</p>}
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
                  {errors.nationalId && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.nationalId}</p>}
                </div>
                <div>
                  <Label>Membership Number (on file)</Label>
                  <Input value={memberData?.member_number || ''} readOnly className="bg-[#F3F0E8]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Marital Status *</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['Married', 'Single', 'Widow', 'Others'].map((status) => (
                      <label key={status} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value={status}
                          checked={formData.maritalStatus === status}
                          onChange={(e) => handleChange('maritalStatus', e.target.value)}
                        />
                        <span className="text-base lg:text-lg">{status}</span>
                      </label>
                    ))}
                  </div>
                  {errors.maritalStatus && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.maritalStatus}</p>}
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.dateOfBirth}</p>}
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
                  {errors.phoneNumber && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="emailAddress">Email Address *</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleChange('emailAddress', e.target.value)}
                  className={errors.emailAddress ? 'border-red-500' : ''}
                />
                {errors.emailAddress && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.emailAddress}</p>}
              </div>

              <div>
                <Label htmlFor="physicalAddress">Physical Address *</Label>
                <Input
                  id="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={(e) => handleChange('physicalAddress', e.target.value)}
                  className={errors.physicalAddress ? 'border-red-500' : ''}
                />
                {errors.physicalAddress && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.physicalAddress}</p>}
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
                  <Input id="town" value={formData.town} onChange={(e) => handleChange('town', e.target.value)} />
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
                      <span className="text-base lg:text-lg">Owned</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="residenceType"
                        value="Rented"
                        checked={formData.residenceType === 'Rented'}
                        onChange={(e) => handleChange('residenceType', e.target.value)}
                      />
                      <span className="text-base lg:text-lg">Rented</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="monthlyRent">Monthly Payment if Rented</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleChange('monthlyRent', e.target.value)}
                    placeholder="KES"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="xl:grid xl:grid-cols-2 xl:gap-x-12 xl:items-start">
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 2" title="Sources of Income" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentOrBusiness">Employment/Business</Label>
                  <Input
                    id="employmentOrBusiness"
                    value={formData.employmentOrBusiness}
                    onChange={(e) => handleChange('employmentOrBusiness', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employerAddress">Employer/Business Address</Label>
                  <Input
                    id="employerAddress"
                    value={formData.employerAddress}
                    onChange={(e) => handleChange('employerAddress', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="employerPhone">Employer/Business Phone</Label>
                  <Input
                    id="employerPhone"
                    value={formData.employerPhone}
                    onChange={(e) => handleChange('employerPhone', e.target.value)}
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
                  <Label htmlFor="periodInEmployment">Period in Current Employment/Business</Label>
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
                  <Label htmlFor="employerEmail">Employer/Business Email</Label>
                  <Input
                    id="employerEmail"
                    type="email"
                    value={formData.employerEmail}
                    onChange={(e) => handleChange('employerEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 3" title="Average Monthly Income" />
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`incomeDescription${num}`}>
                      Description {num} {num === 1 && '*'}
                    </Label>
                    <Input
                      id={`incomeDescription${num}`}
                      value={formData[`incomeDescription${num}` as keyof typeof formData] as string}
                      onChange={(e) => handleChange(`incomeDescription${num}`, e.target.value)}
                      placeholder={num === 1 ? 'e.g., Salary' : 'e.g., Rental income, Business'}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`incomeAmount${num}`}>
                      Amount (KES) {num === 1 && '*'}
                    </Label>
                    <Input
                      id={`incomeAmount${num}`}
                      type="number"
                      value={formData[`incomeAmount${num}` as keyof typeof formData] as string}
                      onChange={(e) => handleChange(`incomeAmount${num}`, e.target.value)}
                      className={num === 1 && errors.incomeAmount1 ? 'border-red-500' : ''}
                    />
                  </div>
                </div>
              ))}
              {errors.incomeAmount1 && <p className="text-base lg:text-lg text-red-500">{errors.incomeAmount1}</p>}
            </div>
          </div>
          </div>

          <div className="xl:grid xl:grid-cols-2 xl:gap-x-12 xl:items-start">
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 4" title="Loan Application" />
            <div className="space-y-5">
              <div>
                <Label>Loan Product Applied For *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {LOAN_PRODUCTS.map((product) => (
                    <label key={product} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={loanProducts.includes(product)}
                        onCheckedChange={() => toggleLoanProduct(product)}
                      />
                      <span className="text-base lg:text-lg">{product}</span>
                    </label>
                  ))}
                </div>
                {errors.loanProducts && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.loanProducts}</p>}
              </div>

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
                  {errors.amountRequested && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.amountRequested}</p>}
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
                  {errors.amountInWords && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.amountInWords}</p>}
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
                {errors.repayableMonths && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.repayableMonths}</p>}
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
                {errors.loanPurpose1 && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.loanPurpose1}</p>}
              </div>

              <Notice>
                <strong>Important:</strong> Member must have paid savings consecutively for a minimum of 6 months.
                Loans above KES 1,000,000 require a 6-month bank statement. Emergency loans are capped at KES
                100,000 with a maximum 12-month repayment period. School fees loans require a valid fee
                structure and are repayable within 12 months (primary/secondary) or 24 months (higher education).
              </Notice>
            </div>
          </div>

          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 5" title="Other Loans/Debts/Obligations" />
            <div className="space-y-3">
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

              <div className="pt-2">
                <Label htmlFor="applicantSignatureName">Applicant's Signature (type full name) *</Label>
                <Input
                  id="applicantSignatureName"
                  value={formData.applicantSignatureName}
                  onChange={(e) => handleChange('applicantSignatureName', e.target.value)}
                  className={errors.applicantSignatureName ? 'border-red-500' : ''}
                />
                {errors.applicantSignatureName && (
                  <p className="text-base lg:text-lg text-red-500 mt-1">{errors.applicantSignatureName}</p>
                )}
              </div>
            </div>
          </div>
          </div>

          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Step 6" title="Guarantors" />
            <p className="text-base lg:text-lg text-gray-600 -mt-4 mb-6">To be completed by the guarantors themselves</p>

            <div className="space-y-6">
              <Notice>
                <AlertCircle className="inline mr-2 -mt-0.5" size={14} />
                Amount guaranteed must be equal to or more than the amount applied for. Borrower's savings must
                cover a third of the guarantorship. Guarantors accept joint and several liability for repayment
                in the event of the borrower's default. Please do not sign a blank application form.
              </Notice>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selfGuaranteedAmount">Self-Guaranteed Amount (KES) *</Label>
                  <Input
                    id="selfGuaranteedAmount"
                    type="number"
                    value={formData.selfGuaranteedAmount}
                    onChange={(e) => handleChange('selfGuaranteedAmount', e.target.value)}
                    className={errors.selfGuaranteedAmount ? 'border-red-500' : ''}
                  />
                  {errors.selfGuaranteedAmount && (
                    <p className="text-base lg:text-lg text-red-500 mt-1">{errors.selfGuaranteedAmount}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="selfGuaranteedAmountWords">Amount in Words</Label>
                  <Input
                    id="selfGuaranteedAmountWords"
                    value={formData.selfGuaranteedAmountWords}
                    onChange={(e) => handleChange('selfGuaranteedAmountWords', e.target.value)}
                  />
                </div>
              </div>

              {guarantors.map((guarantor, index) => (
                <div key={index} className="border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#16210E] flex items-center gap-2">
                      <Users size={16} /> Guarantor {index + 1}
                    </p>
                    {guarantors.length > 1 && (
                      <button type="button" onClick={() => removeGuarantor(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>M No. (Membership Number)</Label>
                        <Input
                          value={guarantor.membershipNo}
                          onChange={(e) => handleGuarantorChange(index, 'membershipNo', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Name in Full</Label>
                        <Input
                          value={guarantor.name}
                          onChange={(e) => handleGuarantorChange(index, 'name', e.target.value)}
                          placeholder="Full name"
                          className={errors[`guarantor-${index}-name`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Cell Phone No</Label>
                        <Input
                          value={guarantor.phone}
                          onChange={(e) => handleGuarantorChange(index, 'phone', e.target.value)}
                          placeholder="0712345678"
                          className={errors[`guarantor-${index}-phone`] ? 'border-red-500' : ''}
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
                          className={errors[`guarantor-${index}-idNumber`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          value={guarantor.email}
                          onChange={(e) => handleGuarantorChange(index, 'email', e.target.value)}
                          placeholder="guarantor@example.com"
                          className={errors[`guarantor-${index}-email`] ? 'border-red-500' : ''}
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Amount Offered (KES)</Label>
                        <Input
                          type="number"
                          value={guarantor.amountOffered}
                          onChange={(e) => handleGuarantorChange(index, 'amountOffered', e.target.value)}
                          placeholder="0"
                          className={errors[`guarantor-${index}-amountOffered`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Amount Offered in Words</Label>
                        <Input
                          value={guarantor.amountOfferedWords}
                          onChange={(e) => handleGuarantorChange(index, 'amountOfferedWords', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Signature (type full name) *</Label>
                      <Input
                        value={guarantor.signatureName}
                        onChange={(e) => handleGuarantorChange(index, 'signatureName', e.target.value)}
                        className={errors[`guarantor-${index}-signatureName`] ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {guarantors.length < 5 && (
                <Button type="button" variant="outline" onClick={addGuarantor} className="w-full border-[#16210E] text-[#16210E] rounded-none">
                  <Plus size={16} className="mr-1" /> Add Another Guarantor
                </Button>
              )}

              <div>
                <Label htmlFor="totalGuarantorAmountWords">Total Amount From Other Guarantors, in Words</Label>
                <Input
                  id="totalGuarantorAmountWords"
                  value={formData.totalGuarantorAmountWords}
                  onChange={(e) => handleChange('totalGuarantorAmountWords', e.target.value)}
                />
              </div>

              <div className="border-t-2 border-[#6B9E4D] pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base lg:text-lg text-[#16210E]">Total Amount Guaranteed:</span>
                  <span className="text-xl text-[#16210E]">
                    KES {totalGuaranteed.toLocaleString()}
                  </span>
                </div>
                {formData.amountRequested && (
                  <p className="text-base lg:text-lg text-gray-600 mt-2">
                    Required: KES {Number(formData.amountRequested).toLocaleString()}
                    {totalGuaranteed >= Number(formData.amountRequested) ? (
                      <CheckCircle className="inline ml-2 text-[#237A17]" size={16} />
                    ) : (
                      <span className="text-red-600 ml-2">
                        (Shortfall: KES {(Number(formData.amountRequested) - totalGuaranteed).toLocaleString()})
                      </span>
                    )}
                  </p>
                )}
              </div>

              {errors.guarantors && <p className="text-base lg:text-lg text-red-500">{errors.guarantors}</p>}
              {errors.guarantorAmount && <p className="text-base lg:text-lg text-red-500">{errors.guarantorAmount}</p>}

              <div className="border-t border-gray-200 pt-5">
                <p className="text-[#16210E] mb-2">Personal Commitments</p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  I further pledge my future savings as additional security for the loan so approved, in addition
                  to my current savings. I agree to abide by the self-help programme guidelines, self-help group
                  by-laws, terms and conditions of the credit policy and variations by the approving committee. I
                  also consent to be referenced upon this application in a Credit Reference Bureau (CRB) and be
                  listed in the same in case of default.
                </p>
                <div className="flex items-start space-x-3 mt-4">
                  <Checkbox
                    id="pledgeFutureSavings"
                    checked={formData.pledgeFutureSavings}
                    onCheckedChange={(checked) => handleChange('pledgeFutureSavings', checked === true)}
                  />
                  <Label htmlFor="pledgeFutureSavings" className="cursor-pointer font-normal text-base lg:text-lg leading-relaxed">
                    I confirm the personal commitments above, including CRB consent. *
                  </Label>
                </div>
                {errors.pledge && <p className="text-base lg:text-lg text-red-500 mt-2">{errors.pledge}</p>}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 7" title="Witnessed By" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="witnessName">Name *</Label>
                  <Input
                    id="witnessName"
                    value={formData.witnessName}
                    onChange={(e) => handleChange('witnessName', e.target.value)}
                    className={errors.witnessName ? 'border-red-500' : ''}
                  />
                  {errors.witnessName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.witnessName}</p>}
                </div>
                <div>
                  <Label htmlFor="witnessMemberNo">Member Number (where applicable)</Label>
                  <Input
                    id="witnessMemberNo"
                    value={formData.witnessMemberNo}
                    onChange={(e) => handleChange('witnessMemberNo', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="witnessPhone">Phone Number</Label>
                  <Input
                    id="witnessPhone"
                    value={formData.witnessPhone}
                    onChange={(e) => handleChange('witnessPhone', e.target.value)}
                    placeholder="0712345678"
                  />
                </div>
                <div>
                  <Label htmlFor="witnessRelationship">Relationship</Label>
                  <Input
                    id="witnessRelationship"
                    value={formData.witnessRelationship}
                    onChange={(e) => handleChange('witnessRelationship', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="witnessSignatureName">Signature (type full name) *</Label>
                <Input
                  id="witnessSignatureName"
                  value={formData.witnessSignatureName}
                  onChange={(e) => handleChange('witnessSignatureName', e.target.value)}
                  className={errors.witnessSignatureName ? 'border-red-500' : ''}
                />
                {errors.witnessSignatureName && (
                  <p className="text-base lg:text-lg text-red-500 mt-1">{errors.witnessSignatureName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Final Step" title="Applicant Commitment" />
            <div className="space-y-4">
              <div className="border-l-2 border-red-400 pl-4 py-1">
                <p className="text-base lg:text-lg text-gray-800 mb-2">Key Terms:</p>
                <ul className="text-base lg:text-lg text-gray-700 space-y-1 list-disc list-inside">
                  <li>6 months savings history required prior to application</li>
                  <li>A top-up to savings must wait 4 months before it can secure a loan</li>
                  <li>Guarantors' and applicant's savings must fully cover the amount applied for</li>
                  <li>Loans &gt; KES 1M need a 6-month bank statement and coordinating office approval</li>
                  <li>Emergency loans ≤ KES 100K, max 12 months</li>
                  <li>School fees loans: 12 months (primary/secondary) or 24 months (higher education)</li>
                  <li>A dormant member shall not be considered for any loan</li>
                  <li>Any alteration on the loan form may cause disqualification</li>
                  <li>Cancelling a finalized loan process may attract a fee</li>
                </ul>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleChange('termsAccepted', checked === true)}
                  className={errors.terms ? 'border-red-500' : ''}
                />
                <Label htmlFor="termsAccepted" className="cursor-pointer font-normal text-base lg:text-lg leading-relaxed">
                  I declare that I have <strong>read, understood and shall comply</strong> with all terms and
                  conditions, and the information provided is true to the best of my knowledge. I authorize
                  Caritas Nairobi, through my self-help group, to receive, provide and exchange my credit
                  information with Credit Reference Bureau(s).
                </Label>
              </div>
              {errors.terms && <p className="text-base lg:text-lg text-red-500">{errors.terms}</p>}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-[#16210E] hover:bg-[#237A17] rounded-none w-full sm:w-auto px-10">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} /> Submitting...
                </>
              ) : (
                'Submit Loan Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}