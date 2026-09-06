import { useRef, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { UserPlus, Baby, Building2, CheckCircle2, FileEdit, Download, MousePointerClick, FolderInput, Search, PartyPopper, ArrowRight } from 'lucide-react';

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
  requirements: string[];
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
    requirements: [
      'Copy of your National ID or Passport',
      'Copy of your KRA PIN certificate',
      "Copy of your next of kin's National ID or Passport",
      'One passport-size photograph',
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
    requirements: [
      "Copy of the guardian's National ID or Passport, and of the next of kin's",
      "Copy of the minor's Birth Certificate, Notification of Birth, or Baptism Card",
      'Passport-size photograph of both the minor and the guardian',
      'Signatures from the guardian and a witness on the application',
    ],
    applyHref: '/register-minor',
    downloadHref: '/New Minor Savings Application Form (1).pdf',
    downloadName: 'Minor-Savings-Account-Application-Form.pdf',
  },
  {
    icon: Building2,
    eyebrow: 'For groups & organizations',
    title: 'Corporate Membership',
    description: 'Register a registered group, church body, or organization as a single corporate member.',
    requirements: [
      'A list of all group members',
      'Copies of National ID/Passport and passport-size photographs for all signatories',
      'Copy of your Registration Certificate, where applicable',
      "Copy of your group's By-laws or Constitution",
      'Church-affiliated groups must include the Parish Priest as a signatory',
    ],
    applyHref: '/register-corporate',
    downloadHref: '/New Corporate Application Form (1).pdf',
    downloadName: 'Corporate-Membership-Application-Form.pdf',
  },
];

const HOW_TO_JOIN_STEPS = [
  {
    icon: MousePointerClick,
    title: 'Choose Your Membership',
    description: 'Select the membership option that suits you.',
  },
  {
    icon: FileEdit,
    title: 'Complete Your Application',
    description: 'Apply online or download and complete the membership form.',
  },
  {
    icon: FolderInput,
    title: 'Submit Your Documents',
    description: 'Provide the required identification and supporting documents.',
  },
  {
    icon: Search,
    title: 'Verification',
    description: 'Our team reviews your application and supporting information.',
  },
  {
    icon: PartyPopper,
    title: 'Start Your Journey',
    description: 'Once approved, start saving and enjoy the benefits of membership.',
  },
];

function AccountCard({ account, delayMs }: { account: AccountType; delayMs: number }) {
  return (
    <Reveal delayMs={delayMs} className="flex flex-col h-full">
      <div className="flex flex-col h-full rounded-lg border-2 border-[#C41230]/30 hover:border-[#C41230] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#16210E] flex items-center justify-center mb-6">
          <account.icon className="text-[#FAF9F5]" size={32} strokeWidth={1.5} />
        </div>

        <p className="text-base lg:text-lg tracking-[0.15em] uppercase text-[#237A17] mb-2">{account.eyebrow}</p>
        <h3 className="text-2xl lg:text-3xl mb-4 text-[#16210E] font-bold">{account.title}</h3>
        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-6">{account.description}</p>

        <p className="text-base tracking-[0.1em] uppercase text-[#16210E] font-bold mb-3">What You'll Need</p>
        <ul className="space-y-4 mb-10 flex-1">
          {account.requirements.map((requirement) => (
            <li key={requirement} className="flex items-start gap-3">
              <CheckCircle2 className="text-[#237A17] shrink-0 mt-0.5" size={22} strokeWidth={1.5} />
              <span className="text-base lg:text-lg text-gray-700 leading-relaxed">{requirement}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 mt-auto">
          <Link to={account.applyHref}>
            <Button size="lg" className="w-full bg-[#16210E] hover:bg-[#237A17] rounded-none text-base lg:text-lg py-6">
              <FileEdit className="mr-2" size={18} />
              Apply Online
            </Button>
          </Link>
          <a href={account.downloadHref} download={account.downloadName}>
            <Button size="lg" variant="outline" className="w-full border-[#16210E] text-[#16210E] rounded-none text-base lg:text-lg py-6">
              <Download className="mr-2" size={18} />
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
      {/* Header */}
      <section className="pt-10 pb-8 md:pt-12 md:pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-5 font-bold uppercase leading-tight text-[#16210E] lg:whitespace-nowrap">
              Choose How You'd Like to Join
            </h1>
            <div className="w-14 h-1 bg-[#237A17] mx-auto mb-5" />
            <p className="text-gray-600 text-base lg:text-lg">
              St Gabriel Catholic Church SHG offers three types of membership. Pick the one that fits you, apply
              online in minutes, or download the form to fill by hand.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Larger, more generous card layout on big screens: wider max-width
          container, bigger gaps, and a cap so cards don't stretch absurdly
          wide on ultrawide monitors while still using the freed-up space. */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 lg:gap-14 xl:gap-16">
            {ACCOUNT_TYPES.map((account, index) => (
              <AccountCard key={account.title} account={account} delayMs={index * 120} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl mb-10 text-center text-[#16210E] font-semibold uppercase">How to Join</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-4">
            {HOW_TO_JOIN_STEPS.map((step, index) => (
              <Reveal key={step.title} delayMs={index * 100} className="relative text-center">
                {index < HOW_TO_JOIN_STEPS.length - 1 && (
                  <ArrowRight
                    className="hidden md:block absolute top-6 -right-2 text-gray-300"
                    size={18}
                    strokeWidth={1.5}
                  />
                )}
                <div className="relative w-14 h-14 mx-auto mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#F3F0E8] flex items-center justify-center">
                    <step.icon className="text-[#237A17]" size={22} strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#B00117] text-white text-sm flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                </div>
                <p className="text-base lg:text-lg font-bold text-[#16210E] mb-1">{step.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </Reveal>
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