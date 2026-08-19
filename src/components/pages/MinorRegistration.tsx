import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { submitMinorRegistration } from '../../lib/registrationApi';
import { Upload, FileText, User, Download, Baby, Loader2 } from 'lucide-react';

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

export function MinorRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    childFirstName: '',
    childMiddleName: '',
    childLastName: '',
    dateOfBirth: '',
    religion: '',

    guardianName: '',
    guardianShgNo: '',
    guardianIdNo: '',
    guardianPhone: '',
    currentAddress: '',

    guardianSignatureName: '',
    witnessName: '',
    witnessSignatureName: '',
  });

  const [agreeDeclaration, setAgreeDeclaration] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<{
    minorPhoto?: File;
    guardianPhoto?: File;
    guardianIdCopy?: File;
    birthCertificate?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (
    field: 'minorPhoto' | 'guardianPhoto' | 'guardianIdCopy' | 'birthCertificate',
    file: File | undefined
  ) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const isPhoto = field === 'minorPhoto' || field === 'guardianPhoto';
      const validTypes = isPhoto
        ? ['image/jpeg', 'image/png', 'image/jpg']
        : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

      if (!validTypes.includes(file.type)) {
        const allowedFormats = isPhoto ? 'JPG and PNG' : 'JPG, PNG, and PDF';
        toast.error(`Only ${allowedFormats} files are allowed`);
        return;
      }
      setUploadedFiles({ ...uploadedFiles, [field]: file });
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.childFirstName.trim()) newErrors.childFirstName = "Child's first name is required";
    if (!formData.childLastName.trim()) newErrors.childLastName = "Child's last name is required";
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (calculateAge(formData.dateOfBirth) >= 18) {
      newErrors.dateOfBirth = 'A Minor Savings Account is only for children under 18 years old';
    }
    if (!formData.religion.trim()) newErrors.religion = 'Religion is required';

    if (!formData.guardianName.trim()) newErrors.guardianName = "Guardian's name is required";
    if (!formData.guardianShgNo.trim()) newErrors.guardianShgNo = "Guardian's SHG number is required";
    if (!formData.guardianIdNo.match(/^[0-9]{7,8}$/)) newErrors.guardianIdNo = "Valid guardian ID (7-8 digits) is required";
    if (!formData.guardianPhone.match(/^(07|01)[0-9]{8}$/)) newErrors.guardianPhone = 'Valid Kenyan phone number (07XX or 01XX) is required';
    if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required';

    if (!formData.guardianSignatureName.trim()) newErrors.guardianSignatureName = "Guardian's signature (typed full name) is required";
    if (!formData.witnessName.trim()) newErrors.witnessName = 'Witness name is required';
    if (!formData.witnessSignatureName.trim()) newErrors.witnessSignatureName = "Witness's signature (typed full name) is required";

    if (!uploadedFiles.minorPhoto) newErrors.minorPhoto = "Minor's passport photo is required";
    if (!uploadedFiles.guardianPhoto) newErrors.guardianPhoto = "Guardian's passport photo is required";
    if (!uploadedFiles.guardianIdCopy) newErrors.guardianIdCopy = "Copy of guardian's National ID/Passport is required";
    if (!uploadedFiles.birthCertificate) newErrors.birthCertificate = "Birth certificate / notification of birth / baptism card is required";

    if (!agreeDeclaration) newErrors.declaration = 'You must agree to the declaration to proceed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMinorRegistration({ formData, files: uploadedFiles });

      toast.success('Minor account application submitted! It is now pending guardian verification and approval.');

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

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans py-12 md:py-20">
      <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-3">
            <Baby className="text-[#237A17]" size={32} strokeWidth={1.5} />
          </div>
          <p className="text-base lg:text-lg tracking-[0.2em] uppercase text-[#237A17] mb-3">Minor Savings Account</p>
          <h1 className="text-3xl md:text-4xl mb-2 text-[#16210E]">Minor Savings Account Application</h1>
          <p className="text-gray-600">St Gabriel Catholic Church SHG</p>
          <p className="text-base lg:text-lg text-gray-400 mt-1">Opened on behalf of a minor, operated by a parent/guardian aged 18+</p>
          <div className="mt-4">
            <a
              href="/Minor_Savings_Account_Application_Form.pdf"
              download="Minor-Savings-Account-Application-Form.pdf"
              className="inline-flex items-center gap-1.5 text-base lg:text-lg text-[#16210E] hover:text-[#237A17] underline underline-offset-4"
            >
              <Download size={13} />
              Download Form (Fill Manually)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-14">
          <Notice>
            Documents you'll need: copy of guardian's National ID/Passport, copy of Birth Certificate /
            Notification of Birth / Baptism Card of the minor, and passport-size photographs of the minor and
            the guardian.
          </Notice>

          {/* Passport Photos */}
          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Required" title="Passport Photographs" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="border border-dashed border-[#6B9E4D] p-6 hover:bg-[#F3F0E8] transition-colors">
                  <Label htmlFor="minorPhoto" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-3">
                      {uploadedFiles.minorPhoto ? (
                        <>
                          <img
                            src={URL.createObjectURL(uploadedFiles.minorPhoto)}
                            alt="Minor"
                            className="w-28 h-28 object-cover"
                          />
                          <p className="text-base lg:text-lg text-[#237A17]">&#10003; {uploadedFiles.minorPhoto.name}</p>
                        </>
                      ) : (
                        <>
                          <Baby className="text-[#237A17]" size={32} strokeWidth={1.5} />
                          <div className="text-center">
                            <p className="text-[#16210E]">Minor's Photo</p>
                            <p className="text-base lg:text-lg text-gray-500">JPG, PNG - Max 5MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="minorPhoto"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileUpload('minorPhoto', e.target.files?.[0])}
                    className="hidden"
                  />
                </div>
                {errors.minorPhoto && <p className="text-base lg:text-lg text-red-500 mt-2">{errors.minorPhoto}</p>}
              </div>

              <div>
                <div className="border border-dashed border-[#6B9E4D] p-6 hover:bg-[#F3F0E8] transition-colors">
                  <Label htmlFor="guardianPhoto" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-3">
                      {uploadedFiles.guardianPhoto ? (
                        <>
                          <img
                            src={URL.createObjectURL(uploadedFiles.guardianPhoto)}
                            alt="Guardian"
                            className="w-28 h-28 object-cover"
                          />
                          <p className="text-base lg:text-lg text-[#237A17]">&#10003; {uploadedFiles.guardianPhoto.name}</p>
                        </>
                      ) : (
                        <>
                          <User className="text-[#237A17]" size={32} strokeWidth={1.5} />
                          <div className="text-center">
                            <p className="text-[#16210E]">Guardian's Photo</p>
                            <p className="text-base lg:text-lg text-gray-500">JPG, PNG - Max 5MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="guardianPhoto"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileUpload('guardianPhoto', e.target.files?.[0])}
                    className="hidden"
                  />
                </div>
                {errors.guardianPhoto && <p className="text-base lg:text-lg text-red-500 mt-2">{errors.guardianPhoto}</p>}
              </div>
            </div>
          </div>

          {/* Minor Details */}
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 1" title="Applicant's Details (Name of the Child)" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="childFirstName">First Name *</Label>
                  <Input
                    id="childFirstName"
                    value={formData.childFirstName}
                    onChange={(e) => handleChange('childFirstName', e.target.value)}
                    className={errors.childFirstName ? 'border-red-500' : ''}
                  />
                  {errors.childFirstName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.childFirstName}</p>}
                </div>
                <div>
                  <Label htmlFor="childMiddleName">Middle Name</Label>
                  <Input
                    id="childMiddleName"
                    value={formData.childMiddleName}
                    onChange={(e) => handleChange('childMiddleName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="childLastName">Last Name *</Label>
                  <Input
                    id="childLastName"
                    value={formData.childLastName}
                    onChange={(e) => handleChange('childLastName', e.target.value)}
                    className={errors.childLastName ? 'border-red-500' : ''}
                  />
                  {errors.childLastName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.childLastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="religion">Religion *</Label>
                  <Input
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => handleChange('religion', e.target.value)}
                    className={errors.religion ? 'border-red-500' : ''}
                  />
                  {errors.religion && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.religion}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Guardian Details */}
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 2" title="Guardian's Details" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guardianName">Guardian's Name *</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardianName}
                    onChange={(e) => handleChange('guardianName', e.target.value)}
                    className={errors.guardianName ? 'border-red-500' : ''}
                  />
                  {errors.guardianName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.guardianName}</p>}
                </div>
                <div>
                  <Label htmlFor="guardianShgNo">Guardian's SHG No *</Label>
                  <Input
                    id="guardianShgNo"
                    value={formData.guardianShgNo}
                    onChange={(e) => handleChange('guardianShgNo', e.target.value)}
                    className={errors.guardianShgNo ? 'border-red-500' : ''}
                  />
                  {errors.guardianShgNo && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.guardianShgNo}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guardianIdNo">Guardian's ID No *</Label>
                  <Input
                    id="guardianIdNo"
                    value={formData.guardianIdNo}
                    onChange={(e) => handleChange('guardianIdNo', e.target.value)}
                    placeholder="12345678"
                    className={errors.guardianIdNo ? 'border-red-500' : ''}
                  />
                  {errors.guardianIdNo && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.guardianIdNo}</p>}
                </div>
                <div>
                  <Label htmlFor="guardianPhone">Phone No *</Label>
                  <Input
                    id="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={(e) => handleChange('guardianPhone', e.target.value)}
                    placeholder="0712345678"
                    className={errors.guardianPhone ? 'border-red-500' : ''}
                  />
                  {errors.guardianPhone && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.guardianPhone}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="currentAddress">Current Address *</Label>
                <Textarea
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => handleChange('currentAddress', e.target.value)}
                  rows={3}
                  className={errors.currentAddress ? 'border-red-500' : ''}
                />
                {errors.currentAddress && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.currentAddress}</p>}
              </div>

              <Dropzone
                id="guardianIdCopy"
                label="Copy of Guardian's National ID/Passport *"
                hint="JPG, PNG, or PDF - Max 5MB"
                error={errors.guardianIdCopy}
                fileName={uploadedFiles.guardianIdCopy?.name}
                onChange={(file) => handleFileUpload('guardianIdCopy', file)}
                accept="image/jpeg,image/png,image/jpg,application/pdf"
              />
            </div>
          </div>

          {/* Birth Certificate */}
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 3" title="Proof of Identity for the Minor" />
            <Dropzone
              id="birthCertificate"
              label="Birth Certificate / Notification of Birth / Baptism Card *"
              hint="JPG, PNG, or PDF - Max 5MB"
              error={errors.birthCertificate}
              fileName={uploadedFiles.birthCertificate?.name}
              onChange={(file) => handleFileUpload('birthCertificate', file)}
              accept="image/jpeg,image/png,image/jpg,application/pdf"
            />
          </div>

          {/* Account terms */}
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Good to know" title="Minor Account Terms" />
            <ul className="text-base lg:text-lg text-gray-700 list-disc pl-6 space-y-1 leading-relaxed">
              <li>Opened on behalf of the minor, operated by the guardian (18+ years).</li>
              <li>Reverts to the minor at 18 years of age, after consultation with the guardian.</li>
              <li>Savings-only account, entitled to surplus.</li>
              <li>Can guarantee a guardian's loan for the minor's school fees or hospital bills only.</li>
              <li>The account holder cannot take a loan on their own.</li>
              <li>No voting rights, either directly or by proxy.</li>
              <li>Exempted from all charges.</li>
            </ul>
          </div>

          {/* Declaration & Signatures */}
          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Final Step" title="Declaration" />
            <div className="space-y-5">
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                I hereby apply for membership and agree to conform and abide by the self-help group's by-laws,
                regulations, guidelines and amendments thereof. I declare all the information given herein is true
                and I shall abide by all the terms and conditions laid down by the self-help group.
                (Note: Giving false information is an offence under the laws of Kenya.)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guardianSignatureName">Guardian's Signature (type full name) *</Label>
                  <Input
                    id="guardianSignatureName"
                    value={formData.guardianSignatureName}
                    onChange={(e) => handleChange('guardianSignatureName', e.target.value)}
                    className={errors.guardianSignatureName ? 'border-red-500' : ''}
                  />
                  {errors.guardianSignatureName && (
                    <p className="text-base lg:text-lg text-red-500 mt-1">{errors.guardianSignatureName}</p>
                  )}
                </div>
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
                  I confirm the above declaration is true and I agree to the terms of this minor savings account. *
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
                'Submit Minor Account Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}