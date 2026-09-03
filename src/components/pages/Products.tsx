import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Building2, HandCoins, AlertTriangle, GraduationCap, Sprout, Church, ArrowRight, UserPlus, Baby, CheckCircle2, Rocket, HeartHandshake, Accessibility } from 'lucide-react';

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
// a mandatory Caritas Nairobi approval step. Source: Special Loan Products
// manual, section 5.7. Note: the manual states eligibility and the
// preferential rate for these three, but does NOT state a maximum
// repayment term the way it does for the six products above - so none is
// shown here rather than inventing one.
const SPECIAL_LOAN_PRODUCTS = [
  {
    icon: Rocket,
    title: 'Youth Loan Product',
    terms: 'Ages 18\u201335 \u00b7 0.8% per month (preferential rate)',
    desc: 'Supports young entrepreneurs and innovators with capital to start or expand small ventures and achieve self-reliance. Must be fully guaranteed; approval requires formal sign-off from Caritas Nairobi.',
  },
  {
    icon: HeartHandshake,
    title: 'Senior Citizens Loan Product',
    terms: 'Ages 65+ \u00b7 0.8% per month (preferential rate)',
    desc: 'Provides financial dignity and security to elderly members - managing financial needs, supporting family, and maintaining small-scale livelihood activities in retirement. Requires Caritas Nairobi approval.',
  },
  {
    icon: Accessibility,
    title: 'People Living with Disabilities (PLWD) Loan',
    terms: 'Verified PLWD members \u00b7 0.8% per month (preferential rate)',
    desc: 'Provides equitable access to finance for members with disabilities, enabling them to acquire assistive technologies or invest in income-generating activities. Eligibility verified by medical or government documentation; requires Caritas Nairobi approval.',
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
  benefits: string[];
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
      'Benevolent Fund support: KES 50,000 paid to your family if you pass away, after 6 months of contributions',
    ],
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
  },
];


// above (each of which is grounded in the Strategic Plan / By-laws per the
// project handover notes), just restructured into comparable rows/columns.
interface ProductRow {
  product: string;
  eligibility: string;
  maxTerm: string;
  interestRate: string;
  purpose: string;
  guarantorRequired: string;
}

const PRODUCT_TABLE: ProductRow[] = [
  {
    product: 'Member Savings',
    eligibility: 'All individual & corporate members',
    maxTerm: 'N/A \u2013 ongoing',
    interestRate: 'Earns dividends (not interest-bearing debt)',
    purpose: 'Builds share capital; one-time KES 1,000 registration fee, min. KES 600/month. No member may hold more than 15% of total members\u2019 savings.',
    guarantorRequired: 'N/A',
  },
  {
    product: 'Development Loan',
    eligibility: 'Individuals & corporates',
    maxTerm: '60 months',
    interestRate: '1% per month, reducing balance',
    purpose: 'All-purpose financing for development projects.',
    guarantorRequired: 'Yes \u2013 fully guaranteed',
  },
  {
    product: 'Business Loan',
    eligibility: 'Individuals & corporates with an ongoing business',
    maxTerm: '60 months',
    interestRate: '1% per month, reducing balance',
    purpose: 'Financing for trading activities of an already-operating business (not start-ups).',
    guarantorRequired: 'Yes \u2013 fully guaranteed',
  },
  {
    product: 'Emergency Loan',
    eligibility: 'Individual members only',
    maxTerm: '12 months',
    interestRate: '1% per month, reducing balance',
    purpose: 'Unforeseen circumstances - sickness, natural disasters, accidents. Capped at KES 100,000.',
    guarantorRequired: 'Yes',
  },
  {
    product: 'Education Loan',
    eligibility: 'Individual members only',
    maxTerm: '12 months (primary/secondary) or 24 months (higher education)',
    interestRate: '1% per month, reducing balance',
    purpose: 'School fees only, paid directly to the institution against a valid fee structure.',
    guarantorRequired: 'Yes',
  },
  {
    product: 'AgriBusiness Loan',
    eligibility: 'Individuals & corporates',
    maxTerm: '24 months',
    interestRate: '1% per month, reducing balance',
    purpose: 'Agricultural ventures supporting food security, livelihoods, and economic growth.',
    guarantorRequired: 'Yes',
  },
  {
    product: 'Church Loan',
    eligibility: 'Catholic Churches only, via the Parish Pastoral Council',
    maxTerm: 'Per agreed schedule',
    interestRate: '1% per month, reducing balance',
    purpose: 'Financing for parish-level projects and needs.',
    guarantorRequired: 'Yes \u2013 fully guaranteed',
  },
  {
    product: 'Youth Loan Product',
    eligibility: 'Members aged 18\u201335',
    maxTerm: 'Not specified in the product manual',
    interestRate: '0.8% per month, reducing balance (preferential rate)',
    purpose: 'Capital for young entrepreneurs and innovators to start or expand small ventures. Requires Caritas Nairobi approval.',
    guarantorRequired: 'Yes \u2013 fully guaranteed',
  },
  {
    product: 'Senior Citizens Loan Product',
    eligibility: 'Members aged 65+',
    maxTerm: 'Not specified in the product manual',
    interestRate: '0.8% per month, reducing balance (preferential rate)',
    purpose: 'Financial dignity and security for elderly members - managing needs and small-scale livelihood activities in retirement. Requires Caritas Nairobi approval.',
    guarantorRequired: 'Yes \u2013 by savings or qualified guarantors',
  },
  {
    product: 'PLWD Loan Product',
    eligibility: 'Verified persons living with disabilities',
    maxTerm: 'Not specified in the product manual',
    interestRate: '0.8% per month, reducing balance (preferential rate)',
    purpose: 'Access to finance for assistive technologies or income-generating activities. Requires Caritas Nairobi approval.',
    guarantorRequired: 'Yes \u2013 by savings or qualified guarantors',
  },
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-5 font-bold uppercase text-[#16210E]">Savings & Credit Products</h1>
          <div className="w-14 h-1 bg-[#237A17] mx-auto mb-5" />
          <p className="text-gray-600 text-lg">
            Everything St Gabriel Catholic Church SHG offers members, from regular savings to affordable credit
            for life's needs. Interest on all loans is 1% per month on a reducing balance.
          </p>
        </div>
      </section>

      {/* Membership Accounts - what each account type actually gets you */}
      <section className="py-12 md:py-14 xl:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-3 text-[#16210E] font-semibold uppercase max-w-2xl">
            Three ways to save with us.
          </h2>
          <p className="text-gray-600 text-lg mb-12 xl:mb-16 max-w-2xl">
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
                <ul className="space-y-2.5 lg:space-y-3 mb-2 flex-1">
                  {account.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5">
                      <CheckCircle2 className="text-[#237A17] shrink-0 mt-0.5" size={16} strokeWidth={1.5} />
                      <span className="text-sm lg:text-base text-gray-700 leading-relaxed">{benefit}</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-12 xl:mb-16 text-[#16210E] font-semibold uppercase max-w-2xl">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-3 text-[#16210E] font-semibold uppercase max-w-2xl">
            Special Loan Products
          </h2>
          <p className="text-gray-600 text-lg mb-6 xl:mb-8 max-w-2xl">
            In line with Caritas Nairobi's socio-economic empowerment mission, these products offer a subsidized
            0.8% per month rate to remove barriers to credit for youth, elderly, and PLWD members. Each requires
            formal approval from Caritas Nairobi.
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

      {/* Product Comparison Table */}
      <section className="py-14 md:py-16 xl:py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-3 text-[#16210E] font-semibold uppercase">Product Details at a Glance</h2>
          <p className="text-gray-600 text-lg mb-10 xl:mb-14 max-w-2xl">
            A side-by-side comparison of eligibility, repayment terms, and guarantor requirements across every
            product.
          </p>

          {/* Desktop/tablet: full table, horizontally scrollable if the viewport is
              narrower than the content (e.g. small tablets in portrait). */}
          <div className="hidden md:block overflow-x-auto border border-gray-200">
            <table className="w-full min-w-[1000px] border-collapse text-left table-fixed">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[17%]" />
                <col className="w-[15%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
                <col className="w-[26%]" />
              </colgroup>
              <thead>
                <tr className="bg-[#B00117] text-[#FAF9F5]">
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold">Product</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold">Eligibility</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold">Max Term</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold">Interest Rate</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold">Guarantor</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_TABLE.map((row, index) => (
                  <tr
                    key={row.product}
                    className={`border-t border-gray-200 align-top ${index % 2 === 1 ? 'bg-[#F3F0E8]/50' : 'bg-white'}`}
                  >
                    <td className="p-4 font-bold text-[#16210E] break-words">{row.product}</td>
                    <td className="p-4 text-gray-700 break-words">{row.eligibility}</td>
                    <td className="p-4 text-gray-700 break-words">{row.maxTerm}</td>
                    <td className="p-4 text-gray-700 break-words">{row.interestRate}</td>
                    <td className="p-4 text-gray-700 break-words">{row.guarantorRequired}</td>
                    <td className="p-4 text-gray-600 leading-relaxed break-words">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked definition-list cards instead of a cramped table -
              each product becomes its own block with labeled rows. */}
          <div className="md:hidden space-y-6">
            {PRODUCT_TABLE.map((row) => (
              <div key={row.product} className="border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-bold text-[#16210E] uppercase mb-3 pb-3 border-b border-gray-100">
                  {row.product}
                </h3>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[#237A17] tracking-[0.08em] uppercase text-xs font-semibold">Eligibility</dt>
                    <dd className="text-gray-700">{row.eligibility}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[#237A17] tracking-[0.08em] uppercase text-xs font-semibold">Max Term</dt>
                    <dd className="text-gray-700">{row.maxTerm}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[#237A17] tracking-[0.08em] uppercase text-xs font-semibold">Interest Rate</dt>
                    <dd className="text-gray-700">{row.interestRate}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[#237A17] tracking-[0.08em] uppercase text-xs font-semibold">Guarantor</dt>
                    <dd className="text-gray-700">{row.guarantorRequired}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[#237A17] tracking-[0.08em] uppercase text-xs font-semibold">Purpose</dt>
                    <dd className="text-gray-600 leading-relaxed">{row.purpose}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}