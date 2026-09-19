import { useRef, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { UserPlus, Baby, Building2, CheckCircle2, FileEdit, Download, MousePointerClick, FolderInput, Search, PartyPopper, ArrowRight, Coins } from 'lucide-react';

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
  // Minimum monthly contribution required to open/hold this account type,
  // as shown on the product flyer. Omitted for Corporate Membership - the
  // flyer doesn't state a flat KES minimum for that type, just group-level
  // requirements, so nothing is invented here.
  minContribution?: string;
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
    minContribution: 'KES 600/month (inclusive of KES 50 Benevolent Fund)',
    requirements: [
      'Copy of your National ID or Passport',
      'Copy of your KRA PIN certificate',
      "Copy of your next of kin's National ID or Passport",
      'One passport-size photograph',
    ],
    applyHref: '/register-member',
    downloadHref: '/New Member Application Form.pdf',
    downloadName: 'Membership-Application-Form.pdf',
  },
  {
    icon: Baby,
    eyebrow: 'Opened by a parent or guardian',
    title: 'Minor Savings Account',
    description: "A savings-only account opened on a child's behalf, operated by a member parent or guardian.",
    minContribution: 'KES 300/month',
    requirements: [
      "Copy of the guardian's National ID or Passport, and of the next of kin's",
      "Copy of the minor's Birth Certificate, Notification of Birth, or Baptism Card",
      'Passport-size photograph of both the minor and the guardian',
      'Signatures from the guardian and a witness on the application',
    ],
    applyHref: '/register-minor',
    downloadHref: '/New Minor Savings Application Form.pdf',
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
    downloadHref: '/New Corporate Application Form.pdf',
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
    <Reveal delayMs={delayMs} className="md:col-span-4 flex flex-col h-full">
      <div className="flex flex-col h-full rounded-lg border-2 border-[#C41230]/30 hover:border-[#C41230] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#16210E] flex items-center justify-center mb-6">
          <account.icon className="text-[#FAF9F5]" size={32} strokeWidth={1.5} />
        </div>

        <p className="text-base lg:text-lg tracking-[0.15em] uppercase text-[#237A17] mb-2">{account.eyebrow}</p>
        <h3 className="text-2xl lg:text-3xl mb-4 text-[#16210E] font-bold">{account.title}</h3>
        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-4">{account.description}</p>

        {account.minContribution && (
          <div className="flex items-center gap-3 bg-[#F3F0E8] rounded-lg p-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <Coins className="text-[#237A17]" size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-gray-500 font-semibold">Minimum Contribution</p>
              <p className="text-base lg:text-lg font-bold text-[#16210E] leading-snug">{account.minContribution}</p>
            </div>
          </div>
        )}

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
      {/* Header - divider line added below matching the Products page treatment.
          Heading + accent bar stay centered, but the subheading now runs
          full-width (left-aligned, no max-w/mx-auto centering) instead of
          being boxed into a narrow centered block, matching Products.tsx. */}
      <section className="pt-10 pb-8 md:pt-12 md:pb-10 border-b-2 border-gray-300">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <Reveal>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl mb-5 font-bold uppercase leading-tight text-[#16210E] lg:whitespace-nowrap">
                Choose How You'd Like to Join
              </h1>
              <div className="w-14 h-1 bg-[#237A17] mx-auto mb-5" />
            </div>
            <p className="text-gray-600 text-base lg:text-lg">
              Three ways in. One shared goal: helping you save with purpose and borrow with confidence. Find your
              fit below, then apply online in minutes or download the form to fill by hand.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Account cards laid out on a 12-column grid (4/4/4 split) rather than
          a plain 3-up grid, matching the About Us and Products pages.
          Bottom padding trimmed so there's less gap before How to Join. */}
      <section className="pt-10 md:pt-14 pb-6 md:pb-8">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-14 xl:gap-16">
            {ACCOUNT_TYPES.map((account, index) => (
              <AccountCard key={account.title} account={account} delayMs={index * 120} />
            ))}
          </div>
        </div>
      </section>

      <section className="pt-6 md:pt-8 pb-14 md:pb-16 border-t border-gray-100">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <h2 className="text-2xl md:text-3xl mb-10 text-center text-[#16210E] font-semibold uppercase lg:whitespace-nowrap">How to Join</h2>
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

      {/* Bottom CTA - full-bleed band in the same #008000 used on the
          Products page CTA, spanning edge to edge rather than being boxed
          into a centered card. */}
      <section className="bg-[#008000] py-10 md:py-12">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl text-white font-bold uppercase mb-1 lg:whitespace-nowrap">
                Not sure which membership is right for you?
              </h2>
              <p className="text-white/90 text-base lg:text-lg">
                Our team is happy to help you choose and walk you through the application.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-none">
                  Get in Touch
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-none">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}