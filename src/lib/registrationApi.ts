import { supabase } from './supabaseClient';
import { uploadDocuments, deleteDocuments } from './supabaseStorage';

// Fires an admin-notification email after a successful registration insert.
// Deliberately non-blocking and swallowed on failure - the registration
// itself already succeeded (the row is safely in Supabase), so a flaky
// email send should never surface as an error to the applicant.
async function notifyAdminOfRegistration(applicantName: string, registrationType: 'member' | 'minor' | 'corporate') {
  try {
    await fetch('/api/notify-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantName, registrationType }),
    });
  } catch (error) {
    console.error('Failed to send admin notification email (registration was still saved):', error);
  }
}

// =====================================================================
// Adult Member Registration
// =====================================================================

interface MemberRegistrationInput {
  formData: Record<string, string>;
  files: {
    passportPhoto?: File;
    nationalIdCopy?: File;
    kraCertificate?: File;
  };
}

export async function submitMemberRegistration({ formData, files }: MemberRegistrationInput) {
  // Upload in a fixed, predictable order so doc_1/doc_2/... always mean the same thing.
  const orderedFiles = [files.passportPhoto, files.nationalIdCopy, files.kraCertificate].filter(
    (f): f is File => Boolean(f)
  );

  const paths = await uploadDocuments('Registration', formData.fullName, formData.nationalId, orderedFiles);

  // Map paths back by position (mirrors the filter order above)
  let i = 0;
  const passportPhotoPath = files.passportPhoto ? paths[i++] : null;
  const nationalIdCopyPath = files.nationalIdCopy ? paths[i++] : null;
  const kraCertificatePath = files.kraCertificate ? paths[i++] : null;

  const { data, error } = await supabase
    .from('member_registration')
    .insert({
      honorific: formData.honorific,
      full_name: formData.fullName,
      national_id: formData.nationalId,
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      date_of_birth: formData.dateOfBirth || null,
      phone: formData.phone,
      current_address: formData.currentAddress,
      area_of_residence: formData.areaOfResidence,
      town: formData.town,
      county: formData.county,
      nationality: formData.nationality,
      estate_village: formData.estateVillage,
      religion: formData.religion,

      employer_or_business: formData.employerOrBusiness,
      employer_address: formData.employerAddress,
      period_in_employment: formData.periodInEmployment,
      monthly_income_band: formData.monthlyIncomeBand,
      income_city_town: formData.incomeCityTown,
      income_county: formData.incomeCounty,
      income_phone: formData.incomePhone,
      income_email: formData.incomeEmail,

      group_name: formData.groupName,

      applicant_signature_name: formData.applicantSignatureName,
      witness_name: formData.witnessName,
      witness_membership_no: formData.witnessMembershipNo,
      witness_signature_name: formData.witnessSignatureName,

      passport_photo_path: passportPhotoPath,
      national_id_copy_path: nationalIdCopyPath,
      kra_certificate_path: kraCertificatePath,

      is_kyc_submitted: true,
    });

  if (error) {
    // Registration failed after files were already uploaded - clean up
    // rather than leaving them orphaned, so a corrected retry starts fresh.
    await deleteDocuments([passportPhotoPath, nationalIdCopyPath, kraCertificatePath]);
    throw new Error(`Registration failed: ${error.message}`);
  }

  await notifyAdminOfRegistration(formData.fullName, 'member');

  return data;
}

// =====================================================================
// Minor Savings Account Registration
// =====================================================================

interface MinorRegistrationInput {
  formData: Record<string, string>;
  files: {
    minorPhoto?: File;
    guardianPhoto?: File;
    guardianIdCopy?: File;
    birthCertificate?: File;
  };
}

export async function submitMinorRegistration({ formData, files }: MinorRegistrationInput) {
  const orderedFiles = [files.minorPhoto, files.guardianPhoto, files.guardianIdCopy, files.birthCertificate].filter(
    (f): f is File => Boolean(f)
  );

  const childName = `${formData.childFirstName}-${formData.childLastName}`;
  const paths = await uploadDocuments('Registration', childName, formData.guardianIdNo, orderedFiles);

  let i = 0;
  const minorPhotoPath = files.minorPhoto ? paths[i++] : null;
  const guardianPhotoPath = files.guardianPhoto ? paths[i++] : null;
  const guardianIdCopyPath = files.guardianIdCopy ? paths[i++] : null;
  const birthCertificatePath = files.birthCertificate ? paths[i++] : null;

  const { data, error } = await supabase
    .from('minor_registration')
    .insert({
      child_first_name: formData.childFirstName,
      child_middle_name: formData.childMiddleName,
      child_last_name: formData.childLastName,
      date_of_birth: formData.dateOfBirth || null,
      religion: formData.religion,

      guardian_name: formData.guardianName,
      guardian_shg_no: formData.guardianShgNo,
      guardian_id_no: formData.guardianIdNo,
      guardian_phone: formData.guardianPhone,
      current_address: formData.currentAddress,

      guardian_signature_name: formData.guardianSignatureName,
      witness_name: formData.witnessName,
      witness_signature_name: formData.witnessSignatureName,

      minor_photo_path: minorPhotoPath,
      guardian_photo_path: guardianPhotoPath,
      guardian_id_copy_path: guardianIdCopyPath,
      birth_certificate_path: birthCertificatePath,

      is_kyc_submitted: true,
    });

  if (error) {
    await deleteDocuments([minorPhotoPath, guardianPhotoPath, guardianIdCopyPath, birthCertificatePath]);
    throw new Error(`Registration failed: ${error.message}`);
  }

  await notifyAdminOfRegistration(`${formData.childFirstName} ${formData.childLastName}`, 'minor');

  return data;
}

// =====================================================================
// Corporate Membership Registration
// =====================================================================

interface Signatory {
  role: string;
  name: string;
  contact: string;
}

interface CorporateRegistrationInput {
  formData: Record<string, string>;
  isChurchGroup: boolean;
  signatories: Signatory[];
  files: {
    memberList?: File;
    signatoryIdCopies: File[];
    signatoryPhotos: File[];
    registrationCertificate?: File;
    byLaws?: File;
  };
}

export async function submitCorporateRegistration({ formData, isChurchGroup, signatories, files }: CorporateRegistrationInput) {
  // No natural unique ID for a group at submission time - fall back to a timestamp.
  const uniqueId = Date.now().toString();
  const displayName = formData.registeredGroupName;

  const singleFiles = [files.memberList, files.registrationCertificate, files.byLaws].filter((f): f is File => Boolean(f));
  const singlePaths = await uploadDocuments('Registration', displayName, uniqueId, singleFiles);

  let i = 0;
  const memberListPath = files.memberList ? singlePaths[i++] : null;
  const registrationCertificatePath = files.registrationCertificate ? singlePaths[i++] : null;
  const byLawsPath = files.byLaws ? singlePaths[i++] : null;

  // Signatory ID copies and photos are uploaded in their own sub-batches so
  // their doc_N numbering doesn't collide with the single files above.
  const signatoryIdPaths = await uploadDocuments('Registration', `${displayName}-signatory-ids`, uniqueId, files.signatoryIdCopies);
  const signatoryPhotoPaths = await uploadDocuments('Registration', `${displayName}-signatory-photos`, uniqueId, files.signatoryPhotos);

  const signatoryIdCopies = files.signatoryIdCopies.map((file, idx) => ({ name: file.name, path: signatoryIdPaths[idx] }));
  const signatoryPhotos = files.signatoryPhotos.map((file, idx) => ({ name: file.name, path: signatoryPhotoPaths[idx] }));

  const { data, error } = await supabase
    .from('corporate_registration')
    .insert({
      registered_group_name: formData.registeredGroupName,
      date_of_registration: formData.dateOfRegistration || null,
      total_members: Number(formData.totalMembers) || null,
      men_count: Number(formData.menCount) || null,
      women_count: Number(formData.womenCount) || null,
      shg_members: Number(formData.shgMembers) || null,
      non_shg_members: Number(formData.nonShgMembers) || null,
      is_church_group: isChurchGroup,

      signatories,
      representative_name: formData.representativeName,

      member_list_path: memberListPath,
      signatory_id_copies: signatoryIdCopies,
      signatory_photos: signatoryPhotos,
      registration_certificate_path: registrationCertificatePath,
      by_laws_path: byLawsPath,

      is_kyc_submitted: true,
    });

  if (error) {
    await deleteDocuments([
      memberListPath,
      registrationCertificatePath,
      byLawsPath,
      ...signatoryIdPaths,
      ...signatoryPhotoPaths,
    ]);
    throw new Error(`Registration failed: ${error.message}`);
  }

  await notifyAdminOfRegistration(formData.registeredGroupName, 'corporate');

  return data;
}

// =====================================================================
// Loan Application (no document uploads in this form - typed signatures only)
// =====================================================================

interface Guarantor {
  membershipNo: string;
  name: string;
  phone: string;
  idNumber: string;
  groupName: string;
  amountOffered: string;
  amountOfferedWords: string;
  signatureName: string;
}

interface LoanApplicationInput {
  memberId: string;
  formData: Record<string, string>;
  loanProducts: string[];
  guarantors: Guarantor[];
}

export async function submitLoanApplication({ memberId, formData, loanProducts, guarantors }: LoanApplicationInput) {
  const { data, error } = await supabase
    .from('loan_registration')
    .insert({
      member_id: memberId,
      full_name: formData.fullName,
      national_id: formData.nationalId,
      marital_status: formData.maritalStatus,
      date_of_birth: formData.dateOfBirth || null,
      phone_number: formData.phoneNumber,
      email_address: formData.emailAddress,
      physical_address: formData.physicalAddress,
      area_of_residence: formData.areaOfResidence,
      town: formData.town,
      estate_village: formData.estateVillage,
      residence_type: formData.residenceType,
      monthly_rent: Number(formData.monthlyRent) || null,

      employment_or_business: formData.employmentOrBusiness,
      employer_address: formData.employerAddress,
      employer_phone: formData.employerPhone,
      position: formData.position,
      period_in_employment: formData.periodInEmployment,
      city_town: formData.cityTown,
      county: formData.county,
      employer_email: formData.employerEmail,

      income: {
        description1: formData.incomeDescription1,
        amount1: Number(formData.incomeAmount1) || 0,
        description2: formData.incomeDescription2,
        amount2: Number(formData.incomeAmount2) || 0,
        description3: formData.incomeDescription3,
        amount3: Number(formData.incomeAmount3) || 0,
      },

      loan_products: loanProducts,
      amount_requested: Number(formData.amountRequested),
      amount_in_words: formData.amountInWords,
      repayable_months: Number(formData.repayableMonths),
      loan_purpose: [formData.loanPurpose1, formData.loanPurpose2, formData.loanPurpose3].filter(Boolean).join('; '),
      other_debts: [
        { description: formData.otherDebt1, amount: Number(formData.otherDebtAmount1) || 0 },
        { description: formData.otherDebt2, amount: Number(formData.otherDebtAmount2) || 0 },
      ],

      applicant_signature_name: formData.applicantSignatureName,

      self_guaranteed_amount: Number(formData.selfGuaranteedAmount) || 0,
      self_guaranteed_amount_words: formData.selfGuaranteedAmountWords,
      total_guarantor_amount_words: formData.totalGuarantorAmountWords,
      guarantors,

      witness: {
        name: formData.witnessName,
        memberNo: formData.witnessMemberNo,
        phone: formData.witnessPhone,
        relationship: formData.witnessRelationship,
        signatureName: formData.witnessSignatureName,
      },
    });

  if (error) throw new Error(`Loan application failed: ${error.message}`);
  return data;
}

// =====================================================================
// Member verification (loan application Step 1) - replaces the old
// localStorage getMemberByNationalId()
// =====================================================================

export async function verifyMemberByNationalId(nationalId: string) {
  const { data, error } = await supabase.rpc('verify_member_by_national_id', { p_national_id: nationalId });

  if (error) throw new Error(`Verification failed: ${error.message}`);
  const match = data?.[0];
  if (!match || !match.is_verified) return null;
  return match as { id: string; full_name: string; is_verified: boolean };
}