import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { submitMemberRegistration } from '../../lib/registrationApi';
import { Upload, FileText, User, Download, Plus, Trash2, Loader2 } from 'lucide-react';

// Calculates age in whole years as of today from a YYYY-MM-DD date string.
function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

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

function Dropzone({
  id,
  label,
  hint,
  error,
  fileName,
  onChange,
  accept,
}: {
  id: string;
  label: string;
  hint: string;
  error?: string;
  fileName?: string;
  onChange: (file: File | undefined) => void;
  accept: string;
}) {
  return (
    <div>
      <div className="border border-dashed border-[#6B9E4D] p-4 hover:bg-[#F3F0E8] transition-colors">
        <Label htmlFor={id} className="cursor-pointer">
          <div className="flex items-center space-x-3">
            <Upload className="text-[#237A17]" size={20} strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-[#16210E]">{label}</p>
              <p className="text-base lg:text-lg text-gray-500">{hint}</p>
            </div>
            {fileName && <FileText className="text-[#237A17]" size={20} />}
          </div>
        </Label>
        <Input id={id} type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0])} className="hidden" />
        {fileName && <p className="text-base lg:text-lg text-[#237A17] mt-2">&#10003; {fileName}</p>}
      </div>
      {error && <p className="text-base lg:text-lg text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function MemberRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    honorific: '',
    fullName: '',
    nationalId: '',
    gender: '',
    maritalStatus: '',
    dateOfBirth: '',
    phone: '',
    currentAddress: '',
    areaOfResidence: '',
    town: '',
    county: '',
    nationality: '',
    estateVillage: '',
    religion: '',

    employerOrBusiness: '',
    employerAddress: '',
    periodInEmployment: '',
    monthlyIncomeBand: '',
    incomeCityTown: '',
    incomeCounty: '',
    incomePhone: '',
    incomeEmail: '',

    groupName: 'St Gabriel Catholic Church SHG',

    applicantSignatureName: '',
    witnessName: '',
    witnessMembershipNo: '',
    witnessSignatureName: '',
  });

  const [agreeDeclaration, setAgreeDeclaration] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<{
    passportPhoto?: File;
    nationalIdCopy?: File;
    kraCertificate?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleFileUpload = (
    field: 'passportPhoto' | 'nationalIdCopy' | 'kraCertificate',
    file: File | undefined
  ) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const isPhoto = field === 'passportPhoto';
    const validTypes = isPhoto
      ? ['image/jpeg', 'image/png', 'image/jpg']
      : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error(`Only ${isPhoto ? 'JPG and PNG' : 'JPG, PNG, and PDF'} files are allowed`);
      return;
    }
    setUploadedFiles({ ...uploadedFiles, [field]: file });
    toast.success(`${file.name} uploaded successfully`);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.honorific) newErrors.honorific = 'Please select a title';
    if (!formData.fullName.trim()) newErrors.fullName = 'Name of applicant is required';
    if (!formData.nationalId.trim().match(/^[0-9]{7,8}$/)) newErrors.nationalId = 'Valid National ID/Passport (7-8 digits) is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (calculateAge(formData.dateOfBirth) < 18) {
      newErrors.dateOfBirth = 'You must be at least 18 years old to register as an adult member';
    }
    if (!formData.phone.trim().match(/^(07|01)[0-9]{8}$/)) newErrors.phone = 'Valid Kenyan phone number (07XX or 01XX) is required';
    if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required';
    if (!formData.areaOfResidence.trim()) newErrors.areaOfResidence = 'Area of residence is required';
    if (!formData.town.trim()) newErrors.town = 'Town is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.religion) newErrors.religion = 'Religion is required';

    if (!formData.applicantSignatureName.trim()) newErrors.applicantSignatureName = "Applicant's signature (typed full name) is required";
    if (!formData.witnessName.trim()) newErrors.witnessName = 'Witness name is required';
    if (!formData.witnessSignatureName.trim()) newErrors.witnessSignatureName = "Witness's signature (typed full name) is required";
    if (!agreeDeclaration) newErrors.declaration = 'You must agree to the declaration to proceed';

    if (!uploadedFiles.passportPhoto) newErrors.passportPhoto = 'Passport photo is required';
    if (!uploadedFiles.nationalIdCopy) newErrors.nationalIdCopy = 'Copy of National ID/Passport is required';
    if (!uploadedFiles.kraCertificate) newErrors.kraCertificate = 'Copy of KRA PIN certificate is required';

    setErrors(newErrors);
    return newErrors;
  };

  const FIELD_LABELS: Record<string, string> = {
    honorific: 'Title',
    fullName: 'Name of Applicant',
    nationalId: 'National ID/Passport No',
    gender: 'Gender',
    maritalStatus: 'Marital Status',
    dateOfBirth: 'Date of Birth',
    phone: 'Phone No',
    currentAddress: 'Current Address',
    areaOfResidence: 'Area of Residence',
    town: 'Town',
    county: 'County',
    nationality: 'Nationality',
    religion: 'Religion',
    applicantSignatureName: "Applicant's Signature",
    witnessName: 'Witness Name',
    witnessSignatureName: "Witness's Signature",
    declaration: 'Declaration checkbox',
    passportPhoto: 'Passport Photo upload',
    nationalIdCopy: 'National ID/Passport copy upload',
    kraCertificate: 'KRA PIN Certificate upload',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    const failedFields = Object.keys(validationErrors);

    if (failedFields.length > 0) {
      const labels = failedFields.map((key) => FIELD_LABELS[key] || key);
      toast.error(`Please fix: ${labels.join(', ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMemberRegistration({ formData, files: uploadedFiles });

      toast.success('Registration submitted successfully! Your application is under review.');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error(error instanceof Error ? error.message : 'Error submitting registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans py-12 md:py-20">
      <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-base lg:text-lg tracking-[0.2em] uppercase text-[#237A17] mb-3">Adult Membership</p>
          <h1 className="text-3xl md:text-4xl mb-2 text-[#16210E]">Membership Application Form</h1>
          <p className="text-gray-600">St Gabriel Catholic Church SHG</p>
          <p className="text-base lg:text-lg text-gray-400 mt-1">Complete all fields marked with *</p>
          <div className="mt-4">
            <a
              href="/Membership_Application_Form.pdf"
              download="Membership-Application-Form.pdf"
              className="inline-flex items-center gap-1.5 text-base lg:text-lg text-[#16210E] hover:text-[#237A17] underline underline-offset-4"
            >
              <Download size={13} />
              Download Form (Fill Manually)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-14">
          <Notice>
            Documents you'll need: copy of National ID/Passport, copy of KRA PIN certificate, and a
            passport-size photograph.
          </Notice>

          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Required" title="Passport Photo" />
            <div className="border border-dashed border-[#6B9E4D] p-6 hover:bg-[#F3F0E8] transition-colors">
              <Label htmlFor="passportPhoto" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-3">
                  {uploadedFiles.passportPhoto ? (
                    <>
                      <img
                        src={URL.createObjectURL(uploadedFiles.passportPhoto)}
                        alt="Passport"
                        className="w-32 h-32 object-cover"
                      />
                      <p className="text-base lg:text-lg text-[#237A17]">&#10003; {uploadedFiles.passportPhoto.name}</p>
                    </>
                  ) : (
                    <>
                      <User className="text-[#237A17]" size={40} strokeWidth={1.5} />
                      <div className="text-center">
                        <p className="text-[#16210E]">Upload Passport Photo</p>
                        <p className="text-base lg:text-lg text-gray-500">Click to upload (JPG, PNG - Max 5MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </Label>
              <Input
                id="passportPhoto"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => handleFileUpload('passportPhoto', e.target.files?.[0])}
                className="hidden"
              />
            </div>
            {errors.passportPhoto && <p className="text-base lg:text-lg text-red-500 mt-2">{errors.passportPhoto}</p>}
          </div>

          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 1" title="Applicant Information" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="honorific">Title *</Label>
                  <Select value={formData.honorific} onValueChange={(value) => handleChange('honorific', value)}>
                    <SelectTrigger className={errors.honorific ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Rev', 'Sr'].map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.honorific && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.honorific}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Name of Applicant *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.fullName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.gender}</p>}
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
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone No *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0712345678"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    placeholder="Kenyan"
                    className={errors.nationality ? 'border-red-500' : ''}
                  />
                  {errors.nationality && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.nationality}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="currentAddress">Current Address *</Label>
                <Textarea
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => handleChange('currentAddress', e.target.value)}
                  rows={2}
                  className={errors.currentAddress ? 'border-red-500' : ''}
                />
                {errors.currentAddress && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.currentAddress}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="areaOfResidence">Area of Residence *</Label>
                  <Input
                    id="areaOfResidence"
                    value={formData.areaOfResidence}
                    onChange={(e) => handleChange('areaOfResidence', e.target.value)}
                    className={errors.areaOfResidence ? 'border-red-500' : ''}
                  />
                  {errors.areaOfResidence && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.areaOfResidence}</p>}
                </div>
                <div>
                  <Label htmlFor="town">Town *</Label>
                  <Input
                    id="town"
                    value={formData.town}
                    onChange={(e) => handleChange('town', e.target.value)}
                    className={errors.town ? 'border-red-500' : ''}
                  />
                  {errors.town && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.town}</p>}
                </div>
                <div>
                  <Label htmlFor="county">County *</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => handleChange('county', e.target.value)}
                    className={errors.county ? 'border-red-500' : ''}
                  />
                  {errors.county && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.county}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estateVillage">Estate/Village</Label>
                  <Input
                    id="estateVillage"
                    value={formData.estateVillage}
                    onChange={(e) => handleChange('estateVillage', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="religion">Religion *</Label>
                  <Select value={formData.religion} onValueChange={(value) => handleChange('religion', value)}>
                    <SelectTrigger className={errors.religion ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Catholic">Catholic</SelectItem>
                      <SelectItem value="Non-Catholic">Non-Catholic</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.religion && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.religion}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 2" title="Source of Income (Where Applicable)" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employerOrBusiness">Current Employer/Business</Label>
                  <Input
                    id="employerOrBusiness"
                    value={formData.employerOrBusiness}
                    onChange={(e) => handleChange('employerOrBusiness', e.target.value)}
                    placeholder="e.g., Teacher, Trader, Farmer"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodInEmployment">Period in Current Employment/Business</Label>
                  <Input
                    id="periodInEmployment"
                    value={formData.periodInEmployment}
                    onChange={(e) => handleChange('periodInEmployment', e.target.value)}
                    placeholder="e.g., 2 years"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyIncomeBand">Current Average Monthly Income</Label>
                  <Select
                    value={formData.monthlyIncomeBand}
                    onValueChange={(value) => handleChange('monthlyIncomeBand', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income band" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-50000">Kshs. 0 - 50,000</SelectItem>
                      <SelectItem value="50000-150000">Kshs. 50,000 - 150,000</SelectItem>
                      <SelectItem value="150000-250000">Kshs. 150,000 - 250,000</SelectItem>
                      <SelectItem value="250000+">Above Kshs. 250,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incomeCityTown">City/Town</Label>
                  <Input
                    id="incomeCityTown"
                    value={formData.incomeCityTown}
                    onChange={(e) => handleChange('incomeCityTown', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="incomeCounty">County</Label>
                  <Input
                    id="incomeCounty"
                    value={formData.incomeCounty}
                    onChange={(e) => handleChange('incomeCounty', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incomePhone">Phone</Label>
                  <Input
                    id="incomePhone"
                    value={formData.incomePhone}
                    onChange={(e) => handleChange('incomePhone', e.target.value)}
                    placeholder="0712345678"
                  />
                </div>
                <div>
                  <Label htmlFor="incomeEmail">E-mail</Label>
                  <Input
                    id="incomeEmail"
                    type="email"
                    value={formData.incomeEmail}
                    onChange={(e) => handleChange('incomeEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>


          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 3" title="KYC Documents" />
            <div className="space-y-5">
              <Dropzone
                id="nationalIdCopy"
                label="Copy of National ID/Passport *"
                hint="JPG, PNG, or PDF - Max 5MB"
                error={errors.nationalIdCopy}
                fileName={uploadedFiles.nationalIdCopy?.name}
                onChange={(file) => handleFileUpload('nationalIdCopy', file)}
                accept="image/jpeg,image/png,image/jpg,application/pdf"
              />
              <Dropzone
                id="kraCertificate"
                label="KRA PIN Certificate *"
                hint="JPG, PNG, or PDF - Max 5MB"
                error={errors.kraCertificate}
                fileName={uploadedFiles.kraCertificate?.name}
                onChange={(file) => handleFileUpload('kraCertificate', file)}
                accept="image/jpeg,image/png,image/jpg,application/pdf"
              />
            </div>
          </div>

          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Final Step" title="Declaration" />
            <div className="space-y-5">
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                I declare all the information given herein is true and I shall abide by all the terms and
                conditions laid down by the self-help group. (Note: Giving false information is an offence under
                the laws of Kenya.)
              </p>

              <div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="witnessName">Witness Name *</Label>
                  <Input
                    id="witnessName"
                    value={formData.witnessName}
                    onChange={(e) => handleChange('witnessName', e.target.value)}
                    className={errors.witnessName ? 'border-red-500' : ''}
                  />
                  {errors.witnessName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.witnessName}</p>}
                </div>
                <div>
                  <Label htmlFor="witnessMembershipNo">Witness Membership No (where applicable)</Label>
                  <Input
                    id="witnessMembershipNo"
                    value={formData.witnessMembershipNo}
                    onChange={(e) => handleChange('witnessMembershipNo', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="witnessSignatureName">Witness Signature (type full name) *</Label>
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

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agreeDeclaration"
                  checked={agreeDeclaration}
                  onCheckedChange={(checked) => {
                    setAgreeDeclaration(checked === true);
                    if (errors.declaration) setErrors({ ...errors, declaration: '' });
                  }}
                />
                <Label htmlFor="agreeDeclaration" className="text-base lg:text-lg text-gray-700 cursor-pointer">
                  I hereby apply for membership and agree to conform and abide by the self-help group's by-laws,
                  regulations, guidelines and amendments thereof. *
                </Label>
              </div>
              {errors.declaration && <p className="text-base lg:text-lg text-red-500">{errors.declaration}</p>}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-[#16210E] hover:bg-[#237A17] rounded-none w-full sm:w-auto px-10">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} /> Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}