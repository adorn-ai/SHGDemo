import { useRef, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { UserPlus, Baby, Building2, CheckCircle2, FileEdit, Download } from 'lucide-react';

// Scroll-triggered fade/slide-in wrapper, matching the entrance treatment used
// site-wide (Landing, About) so this page feels like part of the same product.
function Reveal({ children, className = '', delayMs = 0 }: { children: ReactNode; className?: string; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

interface AccountType {
  icon: typeof UserPlus;
  title: string;
  eyebrow: string;
  description: string;
  benefits: string[];
  applyHref: string;
  downloadHref: string;
  downloadName: string;
}

const ACCOUNT_TYPES: AccountType[] = [
  {
    icon: UserPlus,
    eyebrow: 'For individuals 18+',
    title: 'Adult Membership',
    description: 'Full membership with savings, voting rights, and access to every loan product we offer.',
    benefits: [
      'Entitled to distributable surplus (dividends) on your share contributions',
      'Eligible for a loan after 6 months of membership, up to 3 times your share contributions',
      'Vote and guarantee loans for fellow members while your account stays active',
      "Benevolent Fund support: KES 50,000 paid to your family if you pass away, after 6 months of contributions",
    ],
    applyHref: '/register',
    downloadHref: '/MEMBERSHIP APPLICATION FORM (2).pdf',
    downloadName: 'Membership-Application-Form.pdf',
  },
  {
    icon: Baby,
    eyebrow: 'Opened by a parent or guardian',
    title: 'Minor Savings Account',
    description: "A savings-only account opened on a child's behalf, operated by a member parent or guardian.",
    benefits: [
      'Pure savings account with a minimum monthly contribution of KES 300',
      'Entitled to distributable surplus (dividends), the same as adult accounts',
      "Can be used to guarantee a guardian's loan for the minor's school fees or hospital bills only",
      'The parent or guardian serves as next of kin for this account',
    ],
    applyHref: '/register-minor',
    downloadHref: '/Minor_Savings_Account_Application_Form.pdf',
    downloadName: 'Minor-Savings-Account-Application-Form.pdf',
  },
  {
    icon: Building2,
    eyebrow: 'For groups & organizations',
    title: 'Corporate Membership',
    description: 'Register a registered group, church body, or organization as a single corporate member.',
    benefits: [
      'Group savings and lending under one account',
      'Access to Development, Business & Church loans',
      'At least two signatories required per transaction',
      'Church-affiliated groups include the Parish Priest as signatory',
    ],
    applyHref: '/register-corporate',
    downloadHref: '/Corporate_Membership_Application_Form.pdf',
    downloadName: 'Corporate-Membership-Application-Form.pdf',
  },
];

function AccountCard({ account, delayMs }: { account: AccountType; delayMs: number }) {
  return (
    <Reveal delayMs={delayMs} className="flex flex-col h-full">
      <div className="flex flex-col h-full border-t-2 border-[#16210E] pt-6">
        <div className="w-14 h-14 rounded-full bg-[#16210E] flex items-center justify-center mb-5">
          <account.icon className="text-[#FAF9F5]" size={26} strokeWidth={1.5} />
        </div>

        <p className="text-base tracking-[0.15em] uppercase text-[#237A17] mb-2">{account.eyebrow}</p>
        <h3 className="text-2xl mb-3 text-[#16210E] font-bold">{account.title}</h3>
        <p className="text-base lg:text-lg text-gray-600 leading-relaxed mb-6">{account.description}</p>

        <ul className="space-y-3 mb-8 flex-1">
          {account.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <CheckCircle2 className="text-[#237A17] shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
              <span className="text-base text-gray-700 leading-relaxed">{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 mt-auto">
          <Link to={account.applyHref}>
            <Button className="w-full bg-[#16210E] hover:bg-[#237A17] rounded-none">
              <FileEdit className="mr-2" size={16} />
              Apply Online
            </Button>
          </Link>
          <a href={account.downloadHref} download={account.downloadName}>
            <Button variant="outline" className="w-full border-[#16210E] text-[#16210E] rounded-none">
              <Download className="mr-2" size={16} />
              Download Form
            </Button>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function Register() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans">
      <section className="py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-base lg:text-lg tracking-[0.2em] uppercase text-[#237A17] mb-4">Membership</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 text-[#16210E] font-bold uppercase leading-tight">
              Choose How You'd Like to Join
            </h1>
            <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">
              St Gabriel Catholic Church SHG offers three types of membership. Pick the one that fits you, apply
              online in minutes, or download the form to fill by hand.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 lg:gap-8">
            {ACCOUNT_TYPES.map((account, index) => (
              <AccountCard key={account.title} account={account} delayMs={index * 120} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#F3F0E8] border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-gray-600 text-base lg:text-lg mb-4">Not sure which type is right for you?</p>
            <Link to="/contact">
              <Button variant="outline" className="border-[#16210E] text-[#16210E] rounded-none">
                Get in Touch
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}