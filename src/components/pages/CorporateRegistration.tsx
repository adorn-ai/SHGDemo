import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { submitCorporateRegistration } from '../../lib/registrationApi';
import { Upload, FileText, Download, Building2, Loader2 } from 'lucide-react';

type SignatoryRole = 'Chairperson' | 'Secretary' | 'Treasurer' | 'Parish Priest';

interface Signatory {
  role: SignatoryRole;
  name: string;
  contact: string;
}

const INITIAL_SIGNATORIES: Signatory[] = [
  { role: 'Chairperson', name: '', contact: '' },
  { role: 'Secretary', name: '', contact: '' },
  { role: 'Treasurer', name: '', contact: '' },
  { role: 'Parish Priest', name: '', contact: '' },
];

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

export function CorporateRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    registeredGroupName: '',
    dateOfRegistration: '',
    totalMembers: '',
    menCount: '',
    womenCount: '',
    shgMembers: '',
    nonShgMembers: '',
    representativeName: '',
  });

  const [isChurchGroup, setIsChurchGroup] = useState(false);
  const [signatories, setSignatories] = useState<Signatory[]>(INITIAL_SIGNATORIES);
  const [agreeDeclaration, setAgreeDeclaration] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<{
    memberList?: File;
    signatoryIdCopies: File[];
    signatoryPhotos: File[];
    registrationCertificate?: File;
    byLaws?: File;
  }>({ signatoryIdCopies: [], signatoryPhotos: [] });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSignatoryChange = (index: number, field: 'name' | 'contact', value: string) => {
    const next = [...signatories];
    next[index] = { ...next[index], [field]: value };
    setSignatories(next);
    const key = `signatory-${index}-${field}`;
    if (errors[key]) setErrors({ ...errors, [key]: '' });
  };

  const handleSingleFileUpload = (
    field: 'memberList' | 'registrationCertificate' | 'byLaws',
    file: File | undefined
  ) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    setUploadedFiles({ ...uploadedFiles, [field]: file });
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleMultiFileUpload = (field: 'signatoryIdCopies' | 'signatoryPhotos', files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validTypes =
      field === 'signatoryPhotos'
        ? ['image/jpeg', 'image/png', 'image/jpg']
        : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    const incoming = Array.from(files);
    for (const file of incoming) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is over 5MB and was skipped`);
        continue;
      }
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} has an unsupported format and was skipped`);
        continue;
      }
      setUploadedFiles((prev) => ({ ...prev, [field]: [...prev[field], file] }));
    }
  };

  const removeFileAt = (field: 'signatoryIdCopies' | 'signatoryPhotos', index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.registeredGroupName.trim()) newErrors.registeredGroupName = 'Registered group name is required';
    if (!formData.dateOfRegistration) newErrors.dateOfRegistration = 'Date of registration is required';
    if (!formData.totalMembers || Number(formData.totalMembers) <= 0) newErrors.totalMembers = 'Total number of members is required';
    if (!formData.menCount || Number(formData.menCount) < 0) newErrors.menCount = 'Required';
    if (!formData.womenCount || Number(formData.womenCount) < 0) newErrors.womenCount = 'Required';
    if (!formData.shgMembers || Number(formData.shgMembers) < 0) newErrors.shgMembers = 'Required';
    if (!formData.nonShgMembers || Number(formData.nonShgMembers) < 0) newErrors.nonShgMembers = 'Required';

    signatories.forEach((s, index) => {
      const isPriest = s.role === 'Parish Priest';
      const requiredForThisGroup = !isPriest || isChurchGroup;
      if (requiredForThisGroup) {
        if (!s.name.trim()) newErrors[`signatory-${index}-name`] = `${s.role}'s name is required`;
        if (!s.contact.match(/^(07|01)[0-9]{8}$/)) newErrors[`signatory-${index}-contact`] = `Valid ${s.role.toLowerCase()} contact is required`;
      }
    });

    if (!formData.representativeName.trim()) newErrors.representativeName = 'Representative signature (typed full name) is required';

    if (!uploadedFiles.memberList) newErrors.memberList = 'A list of all group members is required';
    if (uploadedFiles.signatoryIdCopies.length === 0) newErrors.signatoryIdCopies = 'National ID/Passport copies of all signatories are required';
    if (uploadedFiles.signatoryPhotos.length === 0) newErrors.signatoryPhotos = 'Passport photos of all signatories are required';
    if (!uploadedFiles.byLaws) newErrors.byLaws = "Group by-laws/constitution is required";

    if (!agreeDeclaration) newErrors.declaration = 'You must agree to the joint declaration to proceed';

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
      await submitCorporateRegistration({ formData, isChurchGroup, signatories, files: uploadedFiles });

      toast.success('Corporate membership application submitted! It is now pending review and approval.');

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
          <div className="flex justify-center mb-3">
            <Building2 className="text-[#237A17]" size={32} strokeWidth={1.5} />
          </div>
          <p className="text-base lg:text-lg tracking-[0.2em] uppercase text-[#237A17] mb-3">Corporate Membership</p>
          <h1 className="text-3xl md:text-4xl mb-2 text-[#16210E]">Corporate Membership Application</h1>
          <p className="text-gray-600">St Gabriel Catholic Church SHG</p>
          <p className="text-base lg:text-lg text-gray-400 mt-1">For registered groups applying for membership as a corporate body</p>
          <div className="mt-4">
            <a
              href="/Corporate_Membership_Application_Form.pdf"
              download="Corporate-Membership-Application-Form.pdf"
              className="inline-flex items-center gap-1.5 text-base lg:text-lg text-[#16210E] hover:text-[#237A17] underline underline-offset-4"
            >
              <Download size={13} />
              Download Form (Fill Manually)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-14">
          <Notice>
            Documents you'll need: list of all group members, copy of National ID/Passport of all signatories,
            passport-size photograph of all signatories, copy of Registration Certificate (where applicable),
            and your group's By-laws/Constitution.
          </Notice>

          {/* Group Details */}
          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Step 1" title="Group Details" />
            <div className="space-y-5">
              <div>
                <Label htmlFor="registeredGroupName">Registered Group Name *</Label>
                <Input
                  id="registeredGroupName"
                  value={formData.registeredGroupName}
                  onChange={(e) => handleChange('registeredGroupName', e.target.value)}
                  className={errors.registeredGroupName ? 'border-red-500' : ''}
                />
                {errors.registeredGroupName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.registeredGroupName}</p>}
              </div>

              <div>
                <Label htmlFor="dateOfRegistration">Date of Registration *</Label>
                <Input
                  id="dateOfRegistration"
                  type="date"
                  value={formData.dateOfRegistration}
                  onChange={(e) => handleChange('dateOfRegistration', e.target.value)}
                  className={errors.dateOfRegistration ? 'border-red-500' : ''}
                />
                {errors.dateOfRegistration && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.dateOfRegistration}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="totalMembers">Total Number of Members *</Label>
                  <Input
                    id="totalMembers"
                    type="number"
                    min="0"
                    value={formData.totalMembers}
                    onChange={(e) => handleChange('totalMembers', e.target.value)}
                    className={errors.totalMembers ? 'border-red-500' : ''}
                  />
                  {errors.totalMembers && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.totalMembers}</p>}
                </div>
                <div>
                  <Label htmlFor="menCount">Men *</Label>
                  <Input
                    id="menCount"
                    type="number"
                    min="0"
                    value={formData.menCount}
                    onChange={(e) => handleChange('menCount', e.target.value)}
                    className={errors.menCount ? 'border-red-500' : ''}
                  />
                  {errors.menCount && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.menCount}</p>}
                </div>
                <div>
                  <Label htmlFor="womenCount">Women *</Label>
                  <Input
                    id="womenCount"
                    type="number"
                    min="0"
                    value={formData.womenCount}
                    onChange={(e) => handleChange('womenCount', e.target.value)}
                    className={errors.womenCount ? 'border-red-500' : ''}
                  />
                  {errors.womenCount && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.womenCount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shgMembers">Self-Help Group Members *</Label>
                  <Input
                    id="shgMembers"
                    type="number"
                    min="0"
                    value={formData.shgMembers}
                    onChange={(e) => handleChange('shgMembers', e.target.value)}
                    className={errors.shgMembers ? 'border-red-500' : ''}
                  />
                  {errors.shgMembers && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.shgMembers}</p>}
                </div>
                <div>
                  <Label htmlFor="nonShgMembers">Non Self-Help Group Members *</Label>
                  <Input
                    id="nonShgMembers"
                    type="number"
                    min="0"
                    value={formData.nonShgMembers}
                    onChange={(e) => handleChange('nonShgMembers', e.target.value)}
                    className={errors.nonShgMembers ? 'border-red-500' : ''}
                  />
                  {errors.nonShgMembers && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.nonShgMembers}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="isChurchGroup"
                  checked={isChurchGroup}
                  onCheckedChange={(checked) => setIsChurchGroup(checked === true)}
                />
                <Label htmlFor="isChurchGroup" className="text-base lg:text-lg text-gray-700 cursor-pointer">
                  This is a church-affiliated group (the Parish Priest is a mandatory signatory, plus two others)
                </Label>
              </div>

              <div>
                <div className="border border-dashed border-[#6B9E4D] p-4 hover:bg-[#F3F0E8] transition-colors">
                  <Label htmlFor="memberList" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#237A17]" size={20} strokeWidth={1.5} />
                      <div className="flex-1">
                        <p className="text-[#16210E]">List of All Group Members *</p>
                        <p className="text-base lg:text-lg text-gray-500">JPG, PNG, or PDF - Max 5MB</p>
                      </div>
                      {uploadedFiles.memberList && <FileText className="text-[#237A17]" size={20} />}
                    </div>
                  </Label>
                  <Input
                    id="memberList"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleSingleFileUpload('memberList', e.target.files?.[0])}
                    className="hidden"
                  />
                  {uploadedFiles.memberList && <p className="text-base lg:text-lg text-[#237A17] mt-2">&#10003; {uploadedFiles.memberList.name}</p>}
                </div>
                {errors.memberList && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.memberList}</p>}
              </div>
            </div>
          </div>

          {/* Signatories */}
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 2" title="Signatories" />
            <div className="space-y-6">
              <p className="text-base lg:text-lg text-gray-600">
                At least two signatories must sign for each transaction.
                {isChurchGroup && ' For church groups, the priest is a mandatory signatory plus two others.'}
              </p>

              {signatories.map((s, index) => {
                const isPriest = s.role === 'Parish Priest';
                const required = !isPriest || isChurchGroup;
                return (
                  <div key={s.role} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                    <div>
                      <Label htmlFor={`signatory-name-${index}`}>
                        {s.role} Name {required && '*'}
                      </Label>
                      <Input
                        id={`signatory-name-${index}`}
                        value={s.name}
                        onChange={(e) => handleSignatoryChange(index, 'name', e.target.value)}
                        className={errors[`signatory-${index}-name`] ? 'border-red-500' : ''}
                      />
                      {errors[`signatory-${index}-name`] && (
                        <p className="text-base lg:text-lg text-red-500 mt-1">{errors[`signatory-${index}-name`]}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`signatory-contact-${index}`}>
                        {s.role} Contact {required && '*'}
                      </Label>
                      <Input
                        id={`signatory-contact-${index}`}
                        value={s.contact}
                        onChange={(e) => handleSignatoryChange(index, 'contact', e.target.value)}
                        placeholder="0712345678"
                        className={errors[`signatory-${index}-contact`] ? 'border-red-500' : ''}
                      />
                      {errors[`signatory-${index}-contact`] && (
                        <p className="text-base lg:text-lg text-red-500 mt-1">{errors[`signatory-${index}-contact`]}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div>
                <div className="border border-dashed border-[#6B9E4D] p-4 hover:bg-[#F3F0E8] transition-colors">
                  <Label htmlFor="signatoryIdCopies" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#237A17]" size={20} strokeWidth={1.5} />
                      <div className="flex-1">
                        <p className="text-[#16210E]">National ID/Passport Copies of All Signatories *</p>
                        <p className="text-base lg:text-lg text-gray-500">Select all files at once - JPG, PNG, or PDF - Max 5MB each</p>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="signatoryIdCopies"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleMultiFileUpload('signatoryIdCopies', e.target.files)}
                    className="hidden"
                  />
                  {uploadedFiles.signatoryIdCopies.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {uploadedFiles.signatoryIdCopies.map((file, i) => (
                        <li key={`${file.name}-${i}`} className="flex items-center justify-between text-base lg:text-lg text-[#237A17]">
                          <span>&#10003; {file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFileAt('signatoryIdCopies', i)}
                            className="text-red-500 hover:underline ml-2"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {errors.signatoryIdCopies && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.signatoryIdCopies}</p>}
              </div>

              <div>
                <div className="border border-dashed border-[#6B9E4D] p-4 hover:bg-[#F3F0E8] transition-colors">
                  <Label htmlFor="signatoryPhotos" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#237A17]" size={20} strokeWidth={1.5} />
                      <div className="flex-1">
                        <p className="text-[#16210E]">Passport Photos of All Signatories *</p>
                        <p className="text-base lg:text-lg text-gray-500">Select all files at once - JPG, PNG - Max 5MB each</p>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="signatoryPhotos"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleMultiFileUpload('signatoryPhotos', e.target.files)}
                    className="hidden"
                  />
                  {uploadedFiles.signatoryPhotos.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {uploadedFiles.signatoryPhotos.map((file, i) => (
                        <li key={`${file.name}-${i}`} className="flex items-center justify-between text-base lg:text-lg text-[#237A17]">
                          <span>&#10003; {file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFileAt('signatoryPhotos', i)}
                            className="text-red-500 hover:underline ml-2"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {errors.signatoryPhotos && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.signatoryPhotos}</p>}
              </div>
            </div>
          </div>

          {/* Group Documents */}
          <div className="border-t-2 border-[#6B9E4D] pt-8">
            <SectionHeading eyebrow="Step 3" title="Group Documents" />
            <div className="space-y-5">
              <div>
                <div className="border border-dashed border-[#6B9E4D] p-4 hover:bg-[#F3F0E8] transition-colors">
                  <Label htmlFor="registrationCertificate" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#237A17]" size={20} strokeWidth={1.5} />
                      <div className="flex-1">
                        <p className="text-[#16210E]">Registration Certificate (where applicable)</p>
                        <p className="text-base lg:text-lg text-gray-500">JPG, PNG, or PDF - Max 5MB</p>
                      </div>
                      {uploadedFiles.registrationCertificate && <FileText className="text-[#237A17]" size={20} />}
                    </div>
                  </Label>
                  <Input
                    id="registrationCertificate"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleSingleFileUpload('registrationCertificate', e.target.files?.[0])}
                    className="hidden"
                  />
                  {uploadedFiles.registrationCertificate && (
                    <p className="text-base lg:text-lg text-[#237A17] mt-2">&#10003; {uploadedFiles.registrationCertificate.name}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="border border-dashed border-[#6B9E4D] p-4 hover:bg-[#F3F0E8] transition-colors">
                  <Label htmlFor="byLaws" className="cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-[#237A17]" size={20} strokeWidth={1.5} />
                      <div className="flex-1">
                        <p className="text-[#16210E]">Group By-laws/Constitution *</p>
                        <p className="text-base lg:text-lg text-gray-500">JPG, PNG, or PDF - Max 5MB</p>
                      </div>
                      {uploadedFiles.byLaws && <FileText className="text-[#237A17]" size={20} />}
                    </div>
                  </Label>
                  <Input
                    id="byLaws"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleSingleFileUpload('byLaws', e.target.files?.[0])}
                    className="hidden"
                  />
                  {uploadedFiles.byLaws && <p className="text-base lg:text-lg text-[#237A17] mt-2">&#10003; {uploadedFiles.byLaws.name}</p>}
                </div>
                {errors.byLaws && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.byLaws}</p>}
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t-2 border-[#16210E] pt-8">
            <SectionHeading eyebrow="Final Step" title="Joint Declaration" />
            <div className="space-y-5">
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                We jointly declare all the information given herein is true and we shall abide by all the terms
                and conditions laid down by the self-help group. (Note: Giving false information is an offence
                under the laws of Kenya.)
              </p>

              <div>
                <Label htmlFor="representativeName">Signature of Authorized Representative (type full name) *</Label>
                <Input
                  id="representativeName"
                  value={formData.representativeName}
                  onChange={(e) => handleChange('representativeName', e.target.value)}
                  className={errors.representativeName ? 'border-red-500' : ''}
                />
                {errors.representativeName && <p className="text-base lg:text-lg text-red-500 mt-1">{errors.representativeName}</p>}
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
                  On behalf of the group's signatories, I confirm the above joint declaration is true. *
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
                'Submit Corporate Membership Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}