import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { saveMember } from '../../lib/store';
import { CheckCircle, Upload, FileText } from 'lucide-react';

export function MemberRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    aadharNumber: '',
    panNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    nationalId?: File;
    passport?: File;
    proofOfResidence?: File;
    kraPin?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (field: 'nationalId' | 'passport' | 'proofOfResidence' | 'kraPin', file: File | undefined) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      setUploadedFiles({ ...uploadedFiles, [field]: file });
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.match(/^[0-9]{6}$/)) newErrors.pincode = 'Valid 6-digit pincode is required';
    if (!formData.aadharNumber.match(/^[0-9]{4}\s[0-9]{4}\s[0-9]{4}$/)) 
      newErrors.aadharNumber = 'Valid Aadhar number (XXXX XXXX XXXX) is required';
    if (!formData.panNumber.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) 
      newErrors.panNumber = 'Valid PAN number is required';
    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    if (!formData.ifscCode.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) 
      newErrors.ifscCode = 'Valid IFSC code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    const member = {
      id: `member-${Date.now()}`,
      memberId: `PENDING${Date.now()}`,
      ...formData,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
    };

    saveMember(member);
    toast.success('Registration submitted successfully! Your application is under review.');
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-[#2D5016]">Member Registration</h1>
          <p className="text-lg text-gray-600">Join St Gabriel SHG and start your financial journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016]">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="10-digit number"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016]">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="6-digit code"
                    className={errors.pincode ? 'border-red-500' : ''}
                  />
                  {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016]">KYC Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aadharNumber">National ID Number *</Label>
                  <Input
                    id="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={(e) => handleChange('aadharNumber', e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className={errors.aadharNumber ? 'border-red-500' : ''}
                  />
                  {errors.aadharNumber && <p className="text-sm text-red-500 mt-1">{errors.aadharNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="panNumber">Passport/Tax ID Number *</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className={errors.panNumber ? 'border-red-500' : ''}
                  />
                  {errors.panNumber && <p className="text-sm text-red-500 mt-1">{errors.panNumber}</p>}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-[#2D5016] mb-3">Upload KYC Documents</h4>
                
                {/* National ID Upload */}
                <div className="border-2 border-dashed border-[#6B9E4D] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <Label htmlFor="nationalId" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#2D5016]" size={24} />
                      <div className="flex-1">
                        <p className="font-medium text-[#2D5016]">National ID / Huduma Card</p>
                        <p className="text-sm text-gray-600">Upload scanned copy or photo (JPG, PNG, PDF - Max 5MB)</p>
                      </div>
                      {uploadedFiles.nationalId && (
                        <FileText className="text-green-600" size={24} />
                      )}
                    </div>
                  </Label>
                  <Input
                    id="nationalId"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleFileUpload('nationalId', e.target.files?.[0])}
                    className="hidden"
                  />
                  {uploadedFiles.nationalId && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.nationalId.name}</p>
                  )}
                </div>

                {/* Passport Upload */}
                <div className="border-2 border-dashed border-[#6B9E4D] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <Label htmlFor="passport" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#2D5016]" size={24} />
                      <div className="flex-1">
                        <p className="font-medium text-[#2D5016]">Passport (Optional)</p>
                        <p className="text-sm text-gray-600">Upload if available (JPG, PNG, PDF - Max 5MB)</p>
                      </div>
                      {uploadedFiles.passport && (
                        <FileText className="text-green-600" size={24} />
                      )}
                    </div>
                  </Label>
                  <Input
                    id="passport"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleFileUpload('passport', e.target.files?.[0])}
                    className="hidden"
                  />
                  {uploadedFiles.passport && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.passport.name}</p>
                  )}
                </div>

                {/* KRA Pin Upload */}
                <div className="border-2 border-dashed border-[#6B9E4D] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <Label htmlFor="kraPin" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#2D5016]" size={24} />
                      <div className="flex-1">
                        <p className="font-medium text-[#2D5016]">KRA Pin (Optional)</p>
                        <p className="text-sm text-gray-600">Upload if available (JPG, PNG, PDF - Max 5MB)</p>
                      </div>
                      {uploadedFiles.kraPin && (
                        <FileText className="text-green-600" size={24} />
                      )}
                    </div>
                  </Label>
                  <Input
                    id="kraPin"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleFileUpload('kraPin', e.target.files?.[0])}
                    className="hidden"
                  />
                  {uploadedFiles.kraPin && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.kraPin.name}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <p className="text-sm text-blue-800">
                  <CheckCircle className="inline mr-2" size={16} />
                  All documents will be securely stored and used only for verification purposes
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2D5016] hover:bg-[#4A7C2C]">
              Submit Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}