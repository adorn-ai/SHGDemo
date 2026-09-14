import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Building2, HandCoins, AlertTriangle, GraduationCap, Sprout, Church, ArrowRight, UserPlus, Baby, CheckCircle2, Rocket, HeartHandshake, Accessibility, ShieldCheck } from 'lucide-react';

const LOAN_PRODUCTS = [
  {
    icon: Building2,
    title: 'Development Loan',
    terms: 'Max 60 months \u00b7 Individuals & corporates',
    desc: 'An all-purpose loan to finance development projects, available to individual and corporate members alike. Must be fully guaranteed.',
  },
  {
    icon: HandCoins,
    title: 'Business Loan',
    terms: 'Max 60 months \u00b7 Ongoing businesses only',
    desc: 'Financing for trading activities. Only advanced to a business that is already operating, not a start-up. Must be fully guaranteed.',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Loan',
    terms: 'Up to KES 100,000 \u00b7 12 months',
    desc: 'For unforeseen circumstances such as sickness, natural disasters, or accidents. Not available to corporate members.',
  },
  {
    icon: GraduationCap,
    title: 'Education Loan',
    terms: '12 months (primary/secondary) or 24 months (higher education)',
    desc: 'Covers school fees only, disbursed directly to the institution once a valid fee structure is presented. Not available to corporate members.',
  },
  {
    icon: Sprout,
    title: 'AgriBusiness Loan',
    terms: 'Max 24 months',
    desc: 'Supports agricultural ventures aimed at food security, improved livelihoods, and economic growth.',
  },
  {
    icon: Church,
    title: 'Church Loan',
    terms: 'Repaid per agreed schedule',
    desc: 'Available to Catholic Churches only, through the Parish Pastoral Council. Must be fully guaranteed.',
  },
];

// Special Loan Products - a separate category under the Self-Help Programme
// aimed at vulnerable/strategic demographics (youth, elderly, PLWD), each
// carrying a subsidized 0.8%/month rate versus the standard 1%/month, plus
// a mandatory Caritas Nairobi approval step. Titles/terms/descriptions match
// the wording used on the printed/shared product flyer rather than the
// longer form used elsewhere on the site.
const SPECIAL_LOAN_PRODUCTS = [
  {
    icon: Rocket,
    title: 'Youth Loan',
    terms: 'Members aged 18 \u2013 35',
    desc: 'Designed to support entrepreneurship, innovation and economic empowerment.',
  },
  {
    icon: HeartHandshake,
    title: 'Senior Citizens Loan',
    terms: 'Members aged 65 and above',
    desc: 'Designed to support eligible financial needs and promote dignity and security.',
  },
  {
    icon: Accessibility,
    title: 'PLWD Loan',
    terms: 'Verified Persons Living with Disabilities',
    desc: 'Designed to support eligible needs including assistive technology and income-generating activities.',
  },
];

// Membership account types - benefits sourced from Register.tsx / the
// updated By-laws, restated here so this page also covers what each type of
// account actually gets you, not just the loan products.
interface AccountType {
  icon: typeof UserPlus;
  eyebrow: string;
  title: string;
  description: string;
  requirements: string[];
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
  },
];

// Loan repayment periods scale with the amount borrowed - longer terms for
// larger loans. Source: Loan Products manual, repayment schedule section.
const REPAYMENT_PERIODS = [
  { amount: 'Below KES 50,000', period: '2 years' },
  { amount: 'KES 50,000 \u2013 299,999', period: '3 years' },
  { amount: 'KES 300,000 \u2013 499,999', period: '4 years' },
  { amount: 'KES 500,000 \u2013 999,999', period: '5 years' },
  { amount: 'KES 1,000,000 \u2013 2,999,999', period: '7 years' },
  { amount: 'Above KES 3,000,000', period: '8 years' },
];

// Refinancing eligibility checklist for members wanting to restructure an
// existing loan rather than take a fresh one.
const REFINANCING_REQUIREMENTS = [
  'At least 50% of the existing loan repaid',
  'Good repayment discipline',
  'Supporting documentation for the ongoing project or business',
  'A relevant budget',
  'Payment of the Loan Security Fund on the gross/new loan amount',
  'Fresh 100% guarantee for the new loan',
];

// Stylish card treatment: full Caritas-red border (subtle at rest, fully
// saturated on hover) with a slight lift + shadow - a deliberate step up
// from the thin-rule minimalism used elsewhere on the site, since this
// page is specifically meant to feel like a browsable product catalogue.
const CARD_CLASSES =
  'rounded-lg border-2 border-[#C41230]/30 hover:border-[#C41230] bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1';

export function Products() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans">
      {/* Header */}
      <section className="pt-10 pb-8 md:pt-12 md:pb-10">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-5 font-bold uppercase text-[#16210E] lg:whitespace-nowrap">Savings & Credit Products</h1>
          <div className="w-14 h-1 bg-[#237A17] mx-auto mb-5" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything St Gabriel Catholic Church SHG offers members, from regular savings to affordable credit
            for life's needs. Interest on all loans is 1% per month on a reducing balance.
          </p>
        </div>
      </section>

      {/* Membership Accounts - what each account type actually gets you */}
      <section className="py-12 md:py-14 xl:py-16">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-3 text-[#16210E] font-semibold uppercase">
            Three ways to save with us.
          </h2>
          <p className="text-gray-600 text-lg mb-12 xl:mb-16 lg:whitespace-nowrap">
            Every membership type builds savings and earns dividends - pick the one that fits you, your child, or
            your organization.
          </p>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
            {ACCOUNT_TYPES.map((account) => (
              <div key={account.title} className={`${CARD_CLASSES} p-6 lg:p-8 flex flex-col h-full`}>
                <account.icon className="text-[#237A17] mb-3" size={36} strokeWidth={1.5} />
                <p className="text-base tracking-[0.15em] uppercase text-[#237A17] mb-1">{account.eyebrow}</p>
                <h3 className="text-xl lg:text-2xl mb-2 text-[#16210E] font-bold">{account.title}</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-4">{account.description}</p>
                <p className="text-sm tracking-[0.1em] uppercase text-[#16210E] font-bold mb-2">What You'll Need</p>
                <ul className="space-y-2.5 lg:space-y-3 mb-2 flex-1">
                  {account.requirements.map((requirement) => (
                    <li key={requirement} className="flex items-start gap-2.5">
                      <CheckCircle2 className="text-[#237A17] shrink-0 mt-0.5" size={16} strokeWidth={1.5} />
                      <span className="text-sm lg:text-base text-gray-700 leading-relaxed">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 xl:mt-16">
            <Link to="/register">
              <Button size="lg" className="bg-[#16210E] hover:bg-[#237A17] rounded-none">
                Become a Member <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="py-16 md:py-20 xl:py-24 bg-[#F3F0E8] border-t border-gray-100">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-12 xl:mb-16 text-[#16210E] font-semibold uppercase lg:whitespace-nowrap">
            Six loan products designed for different needs.
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8 lg:gap-10">
            {LOAN_PRODUCTS.map((product) => (
              <div key={product.title} className={`${CARD_CLASSES} p-6 lg:p-8`}>
                <product.icon className="text-[#237A17] mb-3" size={32} strokeWidth={1.5} />
                <h3 className="text-xl lg:text-2xl mb-1 text-[#16210E] font-bold">{product.title}</h3>
                <p className="text-base lg:text-lg text-[#237A17] mb-3">{product.terms}</p>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">{product.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/apply-loan">
              <Button size="lg" className="bg-[#16210E] hover:bg-[#237A17] rounded-none">
                Apply for a Loan <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Loan Products - subsidized-rate products for youth, elderly, and PLWD members */}
      <section className="py-10 md:py-12 xl:py-14 border-t border-gray-100">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-3 text-[#16210E] font-semibold uppercase">
            Special Loan Products (0.8% per month)
          </h2>
          <p className="text-gray-600 text-lg mb-6 xl:mb-8 lg:whitespace-nowrap">
            Special loan terms and approval requirements apply. Loan tenure depends on the amount borrowed and
            the applicable repayment period.
          </p>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {SPECIAL_LOAN_PRODUCTS.map((product) => (
              <div key={product.title} className={`${CARD_CLASSES} p-6 lg:p-8`}>
                <product.icon className="text-[#237A17] mb-3" size={32} strokeWidth={1.5} />
                <h3 className="text-xl lg:text-2xl mb-1 text-[#16210E] font-bold">{product.title}</h3>
                <p className="text-base lg:text-lg text-[#237A17] mb-3">{product.terms}</p>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">{product.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Repayment Periods & Loan Refinancing - replaces the old full
          product-comparison table with the two pieces of practical
          information a member weighing a loan actually needs at this point:
          how long they'll have to repay based on amount, and what it takes
          to refinance an existing one. Side-by-side on a 6/6 split of the
          12-column grid. */}
      <section className="py-14 md:py-16 xl:py-20 border-t border-gray-100">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="grid md:grid-cols-12 gap-12 md:gap-16">
            {/* Loan Repayment Periods */}
            <div className="md:col-span-6">
              <h2 className="text-3xl md:text-4xl mb-2 text-[#16210E] font-semibold uppercase">Loan Repayment Periods</h2>
              <p className="text-gray-600 text-lg mb-6">Repayment period based on loan amount</p>

              <div className="border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F3F0E8]">
                      <th className="p-3 text-xs tracking-[0.1em] uppercase font-semibold text-[#16210E]">Loan Amount</th>
                      <th className="p-3 text-xs tracking-[0.1em] uppercase font-semibold text-[#16210E]">Repayment Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REPAYMENT_PERIODS.map((row, index) => (
                      <tr
                        key={row.amount}
                        className={`border-t border-gray-200 ${index % 2 === 1 ? 'bg-[#F3F0E8]/50' : 'bg-white'}`}
                      >
                        <td className="p-3 text-gray-700">{row.amount}</td>
                        <td className="p-3 text-gray-700">{row.period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-start gap-3 mt-6 p-4 bg-[#F3F0E8]">
                <ShieldCheck className="text-[#237A17] shrink-0 mt-0.5" size={20} strokeWidth={1.5} />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-bold text-[#16210E]">All loans require a 100% guarantee.</span> The amount
                  approved is subject to credit scoring, affordability assessment, applicable product requirements
                  and the Group's approval process.
                </p>
              </div>
            </div>

            {/* Loan Refinancing */}
            <div className="md:col-span-6">
              <h2 className="text-3xl md:text-4xl mb-2 text-[#16210E] font-semibold uppercase">Loan Refinancing</h2>
              <p className="text-gray-600 text-lg mb-6">Need to refinance an existing loan?</p>
              <p className="text-gray-700 font-semibold mb-4">
                Members seeking loan refinancing must meet the applicable requirements:
              </p>
              <ul className="space-y-3 mb-8">
                {REFINANCING_REQUIREMENTS.map((requirement) => (
                  <li key={requirement} className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-[#237A17] shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
                    <span className="text-gray-700 leading-relaxed">{requirement}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact">
                <Button size="lg" className="bg-[#16210E] hover:bg-[#237A17] rounded-none">
                  Enquire About Refinancing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA - full-bleed band, deliberately its own brand color (#008000)
          rather than the site's usual dark green, per request; spans edge to
          edge like every other section on this page rather than being boxed
          into a centered card. */}
      <section className="bg-[#008000] py-10 md:py-12">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl text-white font-bold uppercase mb-1 lg:whitespace-nowrap">
                Find the right product for your goal.
              </h2>
              <p className="text-white/90 text-base lg:text-lg">
                Join us today and take the next step towards financial growth and stability.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/register">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-none">
                  Join Us Today
                </Button>
              </Link>
              <Link to="/apply-loan">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-none">
                  Apply for a Loan
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-none">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}