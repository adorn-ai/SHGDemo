import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { FileEdit, Download } from 'lucide-react';

type AccountType = 'adult' | 'minor' | 'corporate';

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountType: AccountType;
}

const CONFIG: Record<
  AccountType,
  { title: string; description: string; route: string; downloadHref: string; downloadName: string }
> = {
  adult: {
    title: 'Adult Membership Application',
    description: 'Join St Gabriel Catholic Church SHG as a member.',
    route: '/register',
    downloadHref: '/MEMBERSHIP APPLICATION FORM (2).pdf',
    downloadName: 'Membership-Application-Form.pdf',
  },
  minor: {
    title: 'Minor Savings Account Application',
    description: "Open a savings account on behalf of a child, operated by a parent or guardian.",
    route: '/register-minor',
    downloadHref: '/Minor_Savings_Account_Application_Form.pdf',
    downloadName: 'Minor-Savings-Account-Application-Form.pdf',
  },
  corporate: {
    title: 'Corporate Membership Application',
    description: 'Register a group, church body, or organization as a corporate member.',
    route: '/register-corporate',
    downloadHref: '/Corporate_Membership_Application_Form.pdf',
    downloadName: 'Corporate-Membership-Application-Form.pdf',
  },
};

export function RegistrationModal({ open, onOpenChange, accountType }: RegistrationModalProps) {
  const navigate = useNavigate();
  const config = CONFIG[accountType];

  const handleApplyOnline = () => {
    onOpenChange(false);
    navigate(config.route);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none font-sans">
        <DialogHeader>
          <p className="text-base tracking-[0.15em] uppercase text-[#237A17]">Register</p>
          <DialogTitle className="text-[#16210E] font-serif">{config.title}</DialogTitle>
          <DialogDescription>{config.description} How would you like to apply?</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200 mt-2">
          <button
            onClick={handleApplyOnline}
            className="flex items-start gap-3 py-4 hover:bg-[#F3F0E8] transition-colors text-left"
          >
            <FileEdit className="text-[#237A17] shrink-0 mt-0.5" size={20} strokeWidth={1.5} />
            <div>
              <p className="text-[#16210E]">Apply Online</p>
              <p className="text-base text-gray-600">Fill the form on this website and submit instantly.</p>
            </div>
          </button>

          <a
            href={config.downloadHref}
            download={config.downloadName}
            onClick={() => onOpenChange(false)}
            className="flex items-start gap-3 py-4 hover:bg-[#F3F0E8] transition-colors text-left"
          >
            <Download className="text-[#237A17] shrink-0 mt-0.5" size={20} strokeWidth={1.5} />
            <div>
              <p className="text-[#16210E]">Download Form</p>
              <p className="text-base text-gray-600">Print it, fill it by hand, and drop it off at our office.</p>
            </div>
          </a>
        </div>

        <Button variant="ghost" className="mt-2 w-full rounded-none" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}