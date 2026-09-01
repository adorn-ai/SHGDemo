import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CheckCircle2, XCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import shgLogo from '../../assets/shg-logo.png';

interface LoanSummary {
  loaneeName: string;
  products: string[];
  amountRequested: number | string;
  amountInWords?: string;
  termMonths?: number | string;
  purpose?: string;
}

interface ResponseDetails {
  guarantorName: string;
  amountOffered: number | null;
  loan: LoanSummary;
  expiresAt: string;
}

// This page lives outside the normal site layout (no navbar/footer - see
// Routes.tsx), since guarantors arrive here cold from an email link
// rather than by browsing the site. Without that layout's usual
// branding, a bare page asking someone to accept a financial obligation
// can look uncomfortably close to a phishing page, especially to a
// less tech-familiar guarantor. This small header is the one piece of
// visual anchoring to the real organization that carries across every
// state below (loading, error, the form, and success).
function PageHeader() {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <img src={shgLogo} alt="St Gabriel Catholic Church SHG" className="h-12 w-auto object-contain" />
      <div className="text-left">
        <p className="text-[#16210E] font-bold leading-tight">St Gabriel Catholic Church SHG</p>
        <p className="text-sm text-gray-500 leading-tight">Save &middot; Borrow &middot; Grow</p>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <PageHeader />
        {children}
      </div>
    </div>
  );
}

export function GuarantorResponse() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [details, setDetails] = useState<ResponseDetails | null>(null);

  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);
  const [nationalId, setNationalId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadError('This link is missing required information. Please use the link from your email.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/guarantor-response-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Failed to load this request');
        setDetails(body);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load this request');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    if (!decision) return;
    setSubmitError('');

    if (!nationalId.trim()) {
      setSubmitError('Please enter your National ID number to confirm your response.');
      return;
    }
    if (decision === 'rejected' && !reason.trim()) {
      setSubmitError('Please tell us why you\u2019re declining this guarantorship.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/guarantor-response-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nationalId, decision, reason: decision === 'rejected' ? reason : undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to submit your response');
      setSubmitted(decision);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit your response');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Loading ---
  if (loading) {
    return (
      <Centered>
        <div className="text-center text-gray-500">
          <Loader2 className="mx-auto mb-3 animate-spin" size={28} />
          Loading your request...
        </div>
      </Centered>
    );
  }

  // --- Link invalid / expired / already used ---
  if (loadError) {
    return (
      <Centered>
        <div className="border-2 border-[#B00117]/40 bg-white p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-[#B00117]" size={36} strokeWidth={1.5} />
          <h1 className="text-xl text-[#16210E] font-bold mb-2">Unable to Load This Request</h1>
          <p className="text-gray-600 leading-relaxed">{loadError}</p>
          <p className="text-gray-600 mt-4">
            If you believe this is a mistake, please contact the SHG office directly, or{' '}
            <Link to="/contact" className="underline font-semibold text-[#16210E]">get in touch here</Link>.
          </p>
        </div>
      </Centered>
    );
  }

  // --- Submitted successfully ---
  if (submitted) {
    const isAccept = submitted === 'accepted';
    return (
      <Centered>
        <div className={`border-2 ${isAccept ? 'border-[#237A17]/40' : 'border-[#B00117]/40'} bg-white p-8 text-center`}>
          {isAccept ? (
            <CheckCircle2 className="mx-auto mb-4 text-[#237A17]" size={36} strokeWidth={1.5} />
          ) : (
            <XCircle className="mx-auto mb-4 text-[#B00117]" size={36} strokeWidth={1.5} />
          )}
          <h1 className="text-xl text-[#16210E] font-bold mb-2">
            {isAccept ? 'Guarantorship Accepted' : 'Guarantorship Declined'}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Thank you - your response has been recorded and sent to {details?.loan.loaneeName || 'the applicant'} and
            the SHG office.
          </p>
        </div>
      </Centered>
    );
  }

  // --- Main form ---
  const loan = details?.loan;
  const productsList = Array.isArray(loan?.products) ? loan.products.join(', ') : '';

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader />
        <div className="text-center mb-8">
          <p className="text-base tracking-[0.2em] uppercase text-[#237A17] mb-2">Guarantorship Request</p>
          <h1 className="text-3xl md:text-4xl text-[#16210E] font-bold uppercase">Review & Respond</h1>
        </div>

        <div className="bg-white border-2 border-gray-200 p-6 sm:p-8 mb-6">
          <p className="text-gray-700 mb-4">
            <strong className="text-[#16210E]">{loan?.loaneeName}</strong> has listed you as a guarantor on their loan
            application to St Gabriel Catholic Church SHG.
          </p>
          <dl className="space-y-3 text-base">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Loan Product(s)</dt>
              <dd className="text-[#16210E] font-medium text-right">{productsList}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Total Amount Requested</dt>
              <dd className="text-[#16210E] font-medium">
                {loan?.amountRequested ? `KES ${Number(loan.amountRequested).toLocaleString()}` : '\u2014'}
              </dd>
            </div>
            {loan?.termMonths && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Repayment Term</dt>
                <dd className="text-[#16210E] font-medium">{loan.termMonths} months</dd>
              </div>
            )}
            {loan?.purpose && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Purpose</dt>
                <dd className="text-[#16210E] font-medium text-right">{loan.purpose}</dd>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <dt className="text-gray-700 font-semibold">Amount You're Being Asked to Guarantee</dt>
              <dd className="text-[#B00117] font-bold text-lg">
                {details?.amountOffered ? `KES ${Number(details.amountOffered).toLocaleString()}` : '\u2014'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border-2 border-gray-200 p-6 sm:p-8">
          <div className="flex items-start gap-2.5 mb-6 text-gray-600 text-sm">
            <ShieldCheck className="text-[#237A17] shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
            <p>To confirm it's really you, please enter the National ID number on file with your membership.</p>
          </div>

          <div className="mb-6">
            <Label htmlFor="nationalId">Your National ID Number</Label>
            <Input
              id="nationalId"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="Enter your National ID number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setDecision('accepted')}
              className={`flex flex-col items-center gap-2 border-2 p-4 transition-colors ${
                decision === 'accepted' ? 'border-[#237A17] bg-[#237A17]/5' : 'border-gray-200 hover:border-[#237A17]/50'
              }`}
            >
              <CheckCircle2 className="text-[#237A17]" size={28} strokeWidth={1.5} />
              <span className="font-semibold text-[#16210E]">Accept</span>
            </button>
            <button
              type="button"
              onClick={() => setDecision('rejected')}
              className={`flex flex-col items-center gap-2 border-2 p-4 transition-colors ${
                decision === 'rejected' ? 'border-[#B00117] bg-[#B00117]/5' : 'border-gray-200 hover:border-[#B00117]/50'
              }`}
            >
              <XCircle className="text-[#B00117]" size={28} strokeWidth={1.5} />
              <span className="font-semibold text-[#16210E]">Decline</span>
            </button>
          </div>

          {decision === 'rejected' && (
            <div className="mb-6">
              <Label htmlFor="reason">Reason for Declining</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why you're unable to guarantee this loan"
                rows={3}
              />
            </div>
          )}

          {submitError && (
            <p className="text-base text-[#B00117] mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {submitError}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!decision || submitting}
            className="w-full bg-[#16210E] hover:bg-[#237A17] rounded-none py-6"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} /> Submitting...
              </>
            ) : (
              'Submit My Response'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}