import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { saveMember } from '../../lib/store';
import { CheckCircle, Upload, FileText, User, Download } from 'lucide-react';

export function MemberRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    nationalId: '',
    gender: '',
    maritalStatus: '',
    phone: '',
    email: '',
    
    // Address
    postalAddress: '',
    physicalAddress: '',
    
    // Employment
    occupation: '',
    placeOfWork: '',
    monthlyIncome: '',
    
    // Next of Kin
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinId: '',
    nextOfKinPhone: '',
    
    // Bank Details
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    
    // Shares
    numberOfShares: '5',
    
    // Nominee
    nomineeName: '',
    nomineeRelationship: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    passportPhoto?: File;
    nationalIdCopy?: File;
    kraCertificate?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (field: 'passportPhoto' | 'nationalIdCopy' | 'kraCertificate', file: File | undefined) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Validate file type based on field
      let validTypes: string[];
      if (field === 'passportPhoto') {
        validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      } else {
        // For ID and KRA certificate, allow images and PDFs
        validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      }
      
      if (!validTypes.includes(file.type)) {
        const allowedFormats = field === 'passportPhoto' ? 'JPG and PNG' : 'JPG, PNG, and PDF';
        toast.error(`Only ${allowedFormats} files are allowed`);
        return;
      }
      setUploadedFiles({ ...uploadedFiles, [field]: file });
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Personal Information
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationalId.match(/^[0-9]{7,8}$/)) newErrors.nationalId = 'Valid National ID (7-8 digits) is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.phone.match(/^(07|01)[0-9]{8}$/)) newErrors.phone = 'Valid Kenyan phone number (07XX or 01XX) is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    
    // Address
    if (!formData.postalAddress.trim()) newErrors.postalAddress = 'Postal address is required';
    if (!formData.physicalAddress.trim()) newErrors.physicalAddress = 'Physical address is required';
    
    // Employment
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.placeOfWork.trim()) newErrors.placeOfWork = 'Place of work/business is required';
    if (!formData.monthlyIncome || Number(formData.monthlyIncome) <= 0) newErrors.monthlyIncome = 'Valid monthly income is required';
    
    // Next of Kin
    if (!formData.nextOfKinName.trim()) newErrors.nextOfKinName = 'Next of kin name is required';
    if (!formData.nextOfKinRelationship.trim()) newErrors.nextOfKinRelationship = 'Relationship is required';
    if (!formData.nextOfKinId.match(/^[0-9]{7,8}$/)) newErrors.nextOfKinId = 'Valid ID number is required';
    if (!formData.nextOfKinPhone.match(/^(07|01)[0-9]{8}$/)) newErrors.nextOfKinPhone = 'Valid phone number is required';
    
    // Bank Details
    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.bankBranch.trim()) newErrors.bankBranch = 'Bank branch is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    
    // Shares
    const shares = Number(formData.numberOfShares);
    if (!shares || shares < 5) newErrors.numberOfShares = 'Minimum 5 shares required';
    
    // Nominee
    if (!formData.nomineeName.trim()) newErrors.nomineeName = 'Nominee name is required';
    if (!formData.nomineeRelationship.trim()) newErrors.nomineeRelationship = 'Relationship is required';
    
    // File uploads
    if (!uploadedFiles.passportPhoto) newErrors.passportPhoto = 'Passport photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    // Convert files to Base64
    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    try {
      // Convert uploaded files to Base64
      const passportPhotoBase64 = uploadedFiles.passportPhoto 
        ? await convertToBase64(uploadedFiles.passportPhoto)
        : undefined;
      const nationalIdCopyBase64 = uploadedFiles.nationalIdCopy
        ? await convertToBase64(uploadedFiles.nationalIdCopy)
        : undefined;
      const kraCertificateBase64 = uploadedFiles.kraCertificate
        ? await convertToBase64(uploadedFiles.kraCertificate)
        : undefined;

      const member = {
        id: `member-${Date.now()}`,
        memberId: `PENDING${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.physicalAddress,
        city: 'Nairobi',
        state: 'Nairobi County',
        pincode: formData.postalAddress.split('-')[0] || '00100',
        aadharNumber: formData.nationalId,
        panNumber: `KRA${formData.nationalId}`,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.bankBranch,
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelationship,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        // Document fields
        documents: {
          passportPhoto: passportPhotoBase64,
          passportPhotoName: uploadedFiles.passportPhoto?.name,
          nationalIdCopy: nationalIdCopyBase64,
          nationalIdCopyName: uploadedFiles.nationalIdCopy?.name,
          kraCertificate: kraCertificateBase64,
          kraCertificateName: uploadedFiles.kraCertificate?.name,
        }
      };

      saveMember(member);
      toast.success('Registration submitted successfully! Your application is under review.');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error converting files:', error);
      toast.error('Error uploading documents. Please try again.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const shareValue = 1000;
  const totalShareValue = Number(formData.numberOfShares) * shareValue;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl mb-2 md:mb-4 text-[#2D5016]">Membership Application Form</h1>
          <p className="text-base md:text-lg text-gray-600">St Gabriel Self Help Group</p>
          <p className="text-sm text-gray-500 mt-2">Complete all fields marked with *</p>
          {/* Download Manual Form Button */}
          <div className="mt-3">
            <a
              href="/MEMBERSHIP APPLICATION FORM (2).pdf"
              download="Membership-Application-Form.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5016] hover:bg-[#4A7C2C] text-white text-xs font-medium rounded-md transition-colors"
            >
              <Download size={13} />
              Download Form (Fill Manually)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Passport Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Passport Photo *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-[#6B9E4D] rounded-lg p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <Label htmlFor="passportPhoto" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-3">
                    {uploadedFiles.passportPhoto ? (
                      <>
                        <img 
                          src={URL.createObjectURL(uploadedFiles.passportPhoto)} 
                          alt="Passport" 
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <FileText className="text-green-600" size={24} />
                        <p className="text-sm text-green-600">✓ {uploadedFiles.passportPhoto.name}</p>
                      </>
                    ) : (
                      <>
                        <User className="text-[#2D5016]" size={48} />
                        <div className="text-center">
                          <p className="font-medium text-[#2D5016]">Upload Passport Photo</p>
                          <p className="text-sm text-gray-600">Click to upload (JPG, PNG - Max 5MB)</p>
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
              {errors.passportPhoto && <p className="text-sm text-red-500 mt-2">{errors.passportPhoto}</p>}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleChange('middleName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
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
                <div>
                  <Label htmlFor="nationalId">National ID Number *</Label>
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
                  {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maritalStatus">Marital Status *</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => handleChange('maritalStatus', value)}>
                    <SelectTrigger className={errors.maritalStatus ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maritalStatus && <p className="text-sm text-red-500 mt-1">{errors.maritalStatus}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0712345678"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="postalAddress">Postal Address *</Label>
                <Input
                  id="postalAddress"
                  value={formData.postalAddress}
                  onChange={(e) => handleChange('postalAddress', e.target.value)}
                  placeholder="P.O. Box 12345-00100, Nairobi"
                  className={errors.postalAddress ? 'border-red-500' : ''}
                />
                {errors.postalAddress && <p className="text-sm text-red-500 mt-1">{errors.postalAddress}</p>}
              </div>

              <div>
                <Label htmlFor="physicalAddress">Physical/Residential Address *</Label>
                <Textarea
                  id="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={(e) => handleChange('physicalAddress', e.target.value)}
                  placeholder="Enter your physical address"
                  rows={3}
                  className={errors.physicalAddress ? 'border-red-500' : ''}
                />
                {errors.physicalAddress && <p className="text-sm text-red-500 mt-1">{errors.physicalAddress}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Employment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    placeholder="e.g., Teacher, Trader, Farmer"
                    className={errors.occupation ? 'border-red-500' : ''}
                  />
                  {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
                </div>
                <div>
                  <Label htmlFor="placeOfWork">Place of Work/Business *</Label>
                  <Input
                    id="placeOfWork"
                    value={formData.placeOfWork}
                    onChange={(e) => handleChange('placeOfWork', e.target.value)}
                    placeholder="Company or business location"
                    className={errors.placeOfWork ? 'border-red-500' : ''}
                  />
                  {errors.placeOfWork && <p className="text-sm text-red-500 mt-1">{errors.placeOfWork}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="monthlyIncome">Monthly Income (KES) *</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                  placeholder="50000"
                  className={errors.monthlyIncome ? 'border-red-500' : ''}
                />
                {errors.monthlyIncome && <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Next of Kin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Next of Kin Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nextOfKinName">Full Name *</Label>
                  <Input
                    id="nextOfKinName"
                    value={formData.nextOfKinName}
                    onChange={(e) => handleChange('nextOfKinName', e.target.value)}
                    className={errors.nextOfKinName ? 'border-red-500' : ''}
                  />
                  {errors.nextOfKinName && <p className="text-sm text-red-500 mt-1">{errors.nextOfKinName}</p>}
                </div>
                <div>
                  <Label htmlFor="nextOfKinRelationship">Relationship *</Label>
                  <Input
                    id="nextOfKinRelationship"
                    value={formData.nextOfKinRelationship}
                    onChange={(e) => handleChange('nextOfKinRelationship', e.target.value)}
                    placeholder="e.g., Spouse, Sibling, Parent"
                    className={errors.nextOfKinRelationship ? 'border-red-500' : ''}
                  />
                  {errors.nextOfKinRelationship && <p className="text-sm text-red-500 mt-1">{errors.nextOfKinRelationship}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nextOfKinId">ID Number *</Label>
                  <Input
                    id="nextOfKinId"
                    value={formData.nextOfKinId}
                    onChange={(e) => handleChange('nextOfKinId', e.target.value)}
                    placeholder="12345678"
                    className={errors.nextOfKinId ? 'border-red-500' : ''}
                  />
                  {errors.nextOfKinId && <p className="text-sm text-red-500 mt-1">{errors.nextOfKinId}</p>}
                </div>
                <div>
                  <Label htmlFor="nextOfKinPhone">Phone Number *</Label>
                  <Input
                    id="nextOfKinPhone"
                    value={formData.nextOfKinPhone}
                    onChange={(e) => handleChange('nextOfKinPhone', e.target.value)}
                    placeholder="0712345678"
                    className={errors.nextOfKinPhone ? 'border-red-500' : ''}
                  />
                  {errors.nextOfKinPhone && <p className="text-sm text-red-500 mt-1">{errors.nextOfKinPhone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Bank Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="e.g., Equity Bank"
                    className={errors.bankName ? 'border-red-500' : ''}
                  />
                  {errors.bankName && <p className="text-sm text-red-500 mt-1">{errors.bankName}</p>}
                </div>
                <div>
                  <Label htmlFor="bankBranch">Branch *</Label>
                  <Input
                    id="bankBranch"
                    value={formData.bankBranch}
                    onChange={(e) => handleChange('bankBranch', e.target.value)}
                    placeholder="e.g., Nairobi West"
                    className={errors.bankBranch ? 'border-red-500' : ''}
                  />
                  {errors.bankBranch && <p className="text-sm text-red-500 mt-1">{errors.bankBranch}</p>}
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange('accountNumber', e.target.value)}
                    className={errors.accountNumber ? 'border-red-500' : ''}
                  />
                  {errors.accountNumber && <p className="text-sm text-red-500 mt-1">{errors.accountNumber}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shares to Buy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Shares Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <CheckCircle className="inline mr-2" size={16} />
                  Each share costs KES 1,000. Minimum purchase: 5 shares (KES 5,000)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfShares">Number of Shares *</Label>
                  <Input
                    id="numberOfShares"
                    type="number"
                    min="5"
                    value={formData.numberOfShares}
                    onChange={(e) => handleChange('numberOfShares', e.target.value)}
                    className={errors.numberOfShares ? 'border-red-500' : ''}
                  />
                  {errors.numberOfShares && <p className="text-sm text-red-500 mt-1">{errors.numberOfShares}</p>}
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <p className="text-xl md:text-2xl font-bold text-[#2D5016]">
                      KES {totalShareValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nominee Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Nominee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                In case of your demise, who should receive your shares and benefits?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomineeName">Nominee Full Name *</Label>
                  <Input
                    id="nomineeName"
                    value={formData.nomineeName}
                    onChange={(e) => handleChange('nomineeName', e.target.value)}
                    className={errors.nomineeName ? 'border-red-500' : ''}
                  />
                  {errors.nomineeName && <p className="text-sm text-red-500 mt-1">{errors.nomineeName}</p>}
                </div>
                <div>
                  <Label htmlFor="nomineeRelationship">Relationship *</Label>
                  <Input
                    id="nomineeRelationship"
                    value={formData.nomineeRelationship}
                    onChange={(e) => handleChange('nomineeRelationship', e.target.value)}
                    placeholder="e.g., Spouse, Child, Parent"
                    className={errors.nomineeRelationship ? 'border-red-500' : ''}
                  />
                  {errors.nomineeRelationship && <p className="text-sm text-red-500 mt-1">{errors.nomineeRelationship}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">KYC Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Please upload clear copies of your identification and tax documents
              </p>

              {/* National ID Copy */}
              <div className="border-2 border-dashed border-[#6B9E4D] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <Label htmlFor="nationalIdCopy" className="cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Upload className="text-[#2D5016]" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-[#2D5016]">National ID Copy (Optional)</p>
                      <p className="text-sm text-gray-600">Upload a scanned copy (JPG, PNG, PDF - Max 5MB)</p>
                    </div>
                    {uploadedFiles.nationalIdCopy && (
                      <FileText className="text-green-600" size={24} />
                    )}
                  </div>
                </Label>
                <Input
                  id="nationalIdCopy"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => handleFileUpload('nationalIdCopy', e.target.files?.[0])}
                  className="hidden"
                />
                {uploadedFiles.nationalIdCopy && (
                  <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.nationalIdCopy.name}</p>
                )}
              </div>

              {/* KRA Tax Pin Certificate */}
              <div className="border-2 border-dashed border-[#6B9E4D] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <Label htmlFor="kraCertificate" className="cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Upload className="text-[#2D5016]" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-[#2D5016]">KRA Tax Pin Certificate (Optional)</p>
                      <p className="text-sm text-gray-600">Upload KRA certificate (JPG, PNG, PDF - Max 5MB)</p>
                    </div>
                    {uploadedFiles.kraCertificate && (
                      <FileText className="text-green-600" size={24} />
                    )}
                  </div>
                </Label>
                <Input
                  id="kraCertificate"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => handleFileUpload('kraCertificate', e.target.files?.[0])}
                  className="hidden"
                />
                {uploadedFiles.kraCertificate && (
                  <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.kraCertificate.name}</p>
                )}
              </div>

              <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs md:text-sm text-blue-800">
                  <CheckCircle className="inline mr-2" size={16} />
                  <strong>Note:</strong> While these documents are optional for initial registration, providing them speeds up your membership approval process.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Declaration */}
          <Card className="border-2 border-[#2D5016]">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-[#2D5016] text-base md:text-lg">Declaration</h3>
                <p className="text-sm text-gray-700">
                  I hereby declare that the information provided above is true and correct to the best of my knowledge. 
                  I understand and agree to abide by the constitution and by-laws of St Gabriel Self Help Group.
                </p>
                <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="inline mr-2" size={16} />
                    By submitting this form, you agree to the terms and conditions of membership
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              className="bg-[#2D5016] hover:bg-[#4A7C2C] w-full sm:w-auto"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}