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

// Same non-blocking pattern, for loan applications: notifies the SHG office,
// the loanee, and every guarantor with a valid email once the application
// has already been saved successfully. Carries full loanee + loan details
// so the admin email gives staff everything needed to review, not just a
// name and a total.
async function notifyLoanApplicationSubmitted(payload: {
  loanRegistrationId: string | number;
  loanee: { name: string; nationalId: string; phone: string; email: string };
  loan: {
    products: string[];
    amountRequested: string | number;
    amountInWords: string;
    termMonths: string | number;
    purpose: string;
  };
  guarantors: Array<{ name: string; email: string; idNumber: string; amountOffered: string }>;
}) {
  try {
    await fetch('/api/notify-loan-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send loan application notification emails (application was still saved):', error);
  }
}

// =====================================================================
// Adult Member Registration
// =====================================================================

interface Beneficiary {
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  gender: string;
  percentage: number;
}

interface MemberRegistrationInput {
  formData: Record<string, string>;
  beneficiaries: Beneficiary[];
  files: {
    passportPhoto?: File;
    nationalIdCopy?: File;
    kraCertificate?: File;
    nextOfKinIdCopy?: File;
  };
}

export async function submitMemberRegistration({ formData, beneficiaries, files }: MemberRegistrationInput) {
  // Upload in a fixed, predictable order so doc_1/doc_2/... always mean the same thing.
  const orderedFiles = [files.passportPhoto, files.nationalIdCopy, files.kraCertificate, files.nextOfKinIdCopy].filter(
    (f): f is File => Boolean(f)
  );

  const paths = await uploadDocuments('Registration', formData.fullName, formData.nationalId, orderedFiles);

  // Map paths back by position (mirrors the filter order above)
  let i = 0;
  const passportPhotoPath = files.passportPhoto ? paths[i++] : null;
  const nationalIdCopyPath = files.nationalIdCopy ? paths[i++] : null;
  const kraCertificatePath = files.kraCertificate ? paths[i++] : null;
  const nextOfKinIdCopyPath = files.nextOfKinIdCopy ? paths[i++] : null;

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

      // Next of kin - required document on the paper form (Appendix II, item 3)
      // and its own dedicated section, but previously had no home in this table
      // or the web form at all.
      next_of_kin_name: formData.nextOfKinName,
      next_of_kin_relationship: formData.nextOfKinRelationship,
      next_of_kin_phone: formData.nextOfKinPhone,
      next_of_kin_id_no: formData.nextOfKinIdNo,
      next_of_kin_id_copy_path: nextOfKinIdCopyPath,

      // Beneficiary nomination table from the paper form - stored as JSONB,
      // same pattern as `signatories` below in corporate registration and
      // `guarantors`/`witness` in loan_registration. Percentages are the
      // applicant's responsibility to sum to 100 (validated client-side);
      // not enforced at the DB level here.
      beneficiaries,

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
    await deleteDocuments([passportPhotoPath, nationalIdCopyPath, kraCertificatePath, nextOfKinIdCopyPath]);
    throw new Error(`Registration failed: ${error.message}`);
  }

  await notifyAdminOfRegistration(formData.fullName, 'member');

  return data;
}

// =====================================================================
// Minor Savings Account Registration
// =====================================================================
//
// UPDATED for the Appendix V (Data Protection Act 2019) policy change: the
// paper form now carries an explicit, separate Guardian's Membership No
// field (guardianShgNo - already existed here) and, more importantly, two
// distinct consent declarations rather than one generic "I agree to the
// by-laws" checkbox:
//   1. Truthfulness of the information + consent to the collection,
//      processing and storage of personal data (of the guardian and the
//      minor) for account management and legal compliance - required to
//      open the account.
//   2. Consent to receive communications about the account via e-mail or
//      phone - kept separate and optional, since marketing/communications
//      consent is a distinct, revocable consent from the consent needed to
//      actually operate the account.
// Both are now persisted on the row (data_consent, communications_consent)
// rather than only checked client-side and discarded, since they're now a
// compliance record the Group needs to be able to show, not just a form
// gate. See the note at the bottom of this function for the required
// database migration this depends on.

interface MinorRegistrationInput {
  formData: Record<string, string>;
  consent: {
    dataConsent: boolean;
    communicationsConsent: boolean;
  };
  files: {
    minorPhoto?: File;
    guardianPhoto?: File;
    guardianIdCopy?: File;
    birthCertificate?: File;
  };
}

export async function submitMinorRegistration({ formData, consent, files }: MinorRegistrationInput) {
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

      // NEW - Data Protection Act 2019 consent record (see comment above).
      // Requires the `data_consent` and `communications_consent` boolean
      // columns to exist on `minor_registration` - see migration note below.
      data_consent: consent.dataConsent,
      communications_consent: consent.communicationsConsent,

      is_kyc_submitted: true,
    });

  if (error) {
    await deleteDocuments([minorPhotoPath, guardianPhotoPath, guardianIdCopyPath, birthCertificatePath]);
    throw new Error(`Registration failed: ${error.message}`);
  }

  await notifyAdminOfRegistration(`${formData.childFirstName} ${formData.childLastName}`, 'minor');

  return data;
}

// -----------------------------------------------------------------------
// REQUIRED MIGRATION (not yet run - no DB access from here):
//
//   alter table minor_registration
//     add column data_consent boolean not null default false,
//     add column communications_consent boolean not null default false;
//
// The `anon` INSERT-only policy on minor_registration already covers new
// columns on the same table (Postgres RLS policies apply at the row level,
// not per-column), so no RLS change is needed - only the ALTER TABLE above.
// -----------------------------------------------------------------------

// =====================================================================
// Corporate Membership Registration
// =====================================================================
//
// UPDATED for the Appendix III (Data Protection Act 2019) policy change,
// same shape as the Minor Registration update above: two distinct consents
// (data processing - required; communications - optional) are now captured
// and persisted, rather than a single generic "I agree" checkbox that was
// never saved. See the migration note at the bottom of this function.

interface Signatory {
  role: string;
  name: string;
  contact: string;
}

interface CorporateRegistrationInput {
  formData: Record<string, string>;
  isChurchGroup: boolean;
  signatories: Signatory[];
  consent: {
    dataConsent: boolean;
    communicationsConsent: boolean;
  };
  files: {
    memberList?: File;
    signatoryIdCopies: File[];
    signatoryPhotos: File[];
    registrationCertificate?: File;
    byLaws?: File;
    patronEndorsement?: File;
  };
}

export async function submitCorporateRegistration({ formData, isChurchGroup, signatories, consent, files }: CorporateRegistrationInput) {
  // No natural unique ID for a group at submission time - fall back to a timestamp.
  const uniqueId = Date.now().toString();
  const displayName = formData.registeredGroupName;

  const singleFiles = [files.memberList, files.registrationCertificate, files.byLaws, files.patronEndorsement].filter(
    (f): f is File => Boolean(f)
  );
  const singlePaths = await uploadDocuments('Registration', displayName, uniqueId, singleFiles);

  let i = 0;
  const memberListPath = files.memberList ? singlePaths[i++] : null;
  const registrationCertificatePath = files.registrationCertificate ? singlePaths[i++] : null;
  const byLawsPath = files.byLaws ? singlePaths[i++] : null;
  const patronEndorsementPath = files.patronEndorsement ? singlePaths[i++] : null;

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
      patron_endorsement_path: patronEndorsementPath,

      // NEW - Data Protection Act 2019 consent record, same pattern as
      // Minor Registration above. Requires the `data_consent` and
      // `communications_consent` boolean columns to exist on
      // `corporate_registration` - see migration note below.
      data_consent: consent.dataConsent,
      communications_consent: consent.communicationsConsent,

      is_kyc_submitted: true,
    });

  if (error) {
    await deleteDocuments([
      memberListPath,
      registrationCertificatePath,
      byLawsPath,
      patronEndorsementPath,
      ...signatoryIdPaths,
      ...signatoryPhotoPaths,
    ]);
    throw new Error(`Registration failed: ${error.message}`);
  }

  await notifyAdminOfRegistration(formData.registeredGroupName, 'corporate');

  return data;
}

// -----------------------------------------------------------------------
// REQUIRED MIGRATION (not yet run - no DB access from here):
//
//   alter table corporate_registration
//     add column data_consent boolean not null default false,
//     add column communications_consent boolean not null default false;
//
// Same reasoning as the minor_registration migration above - the existing
// `anon` INSERT-only policy already covers new columns on the same table,
// so no RLS change is needed, only the ALTER TABLE above.
// -----------------------------------------------------------------------

// =====================================================================
// Loan Application (no document uploads in this form - typed signatures only)
// =====================================================================

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

interface LoanApplicationInput {
  memberId: string;
  formData: Record<string, string>;
  loanProducts: string[];
  guarantors: Guarantor[];
  // Conditional supporting documents per the Terms and Conditions on the
  // official Loan Application and Agreement Form: a bank statement is
  // required for loans of KES 1,000,000+, and a fee structure is required
  // when Education Loan is one of the selected products. Both optional at
  // the type level since neither applies to every application - the
  // component enforces "required when applicable" before calling this.
  files?: {
    bankStatement?: File;
    feeStructure?: File;
  };
}

export async function submitLoanApplication({ memberId, formData, loanProducts, guarantors, files = {} }: LoanApplicationInput) {
  const orderedFiles = [files.bankStatement, files.feeStructure].filter((f): f is File => Boolean(f));
  const uploadedPaths = orderedFiles.length
    ? await uploadDocuments('Loan Applications', formData.fullName, formData.nationalId, orderedFiles)
    : [];

  let i = 0;
  const bankStatementPath = files.bankStatement ? uploadedPaths[i++] : null;
  const feeStructurePath = files.feeStructure ? uploadedPaths[i++] : null;

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

      // NEW - conditional supporting documents (see LoanApplicationInput
      // comment above). Requires bank_statement_path and fee_structure_path
      // columns on loan_registration - see migration note below.
      bank_statement_path: bankStatementPath,
      fee_structure_path: feeStructurePath,

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
    })
    .select('id')
    .single();

  if (error) {
    if (bankStatementPath || feeStructurePath) {
      await deleteDocuments([bankStatementPath, feeStructurePath]);
    }
    throw new Error(`Loan application failed: ${error.message}`);
  }

  await notifyLoanApplicationSubmitted({
    loanRegistrationId: data.id,
    loanee: {
      name: formData.fullName,
      nationalId: formData.nationalId,
      phone: formData.phoneNumber,
      email: formData.emailAddress,
    },
    loan: {
      products: loanProducts,
      amountRequested: formData.amountRequested,
      amountInWords: formData.amountInWords,
      termMonths: formData.repayableMonths,
      purpose: [formData.loanPurpose1, formData.loanPurpose2, formData.loanPurpose3].filter(Boolean).join('; '),
    },
    // idNumber is required here (not just name/email/amountOffered as
    // before) - the guarantor response flow uses it as the second
    // verification factor when someone opens their emailed link.
    guarantors: guarantors.map((g) => ({ name: g.name, email: g.email, idNumber: g.idNumber, amountOffered: g.amountOffered })),
  });

  return data;
}

// -----------------------------------------------------------------------
// REQUIRED MIGRATION (not yet run - no DB access from here):
//
//   alter table loan_registration
//     add column bank_statement_path text,
//     add column fee_structure_path text;
//
// Same reasoning as the consent-field migrations above - the existing
// anon INSERT-only policy already covers new columns on the same table,
// so no RLS change is needed, only the ALTER TABLE above. Until this runs,
// submissions that include either file will fail with a "column does not
// exist" error.
// -----------------------------------------------------------------------

// =====================================================================
// Member verification (loan application Step 1) - checks the real
// `members` table (post-registration roster), not `member_registration`
// (which only holds pending/newly-submitted applications).
// =====================================================================

export async function verifyMemberByNationalId(nationalId: string) {
  const { data, error } = await supabase.rpc('verify_member_by_national_id', { p_national_id: nationalId });

  if (error) throw new Error(`Verification failed: ${error.message}`);
  const match = data?.[0];
  // No is_verified flag here - presence in the members table IS the proof
  // of verified membership, so a match at all means "found and verified".
  if (!match) return null;
  return match as { member_number: string; name: string };
}