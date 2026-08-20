import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Wallet, Building2, HandCoins, AlertTriangle, GraduationCap, Sprout, Church, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import productsHeroPhoto from '../../assets/products-hero.jpg';

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

// Table data - built from the same product facts already used in the cards
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
      {/* Hero */}
      <section className="relative bg-[#16210E] text-[#FAF9F5] py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={productsHeroPhoto}
            alt="St Gabriel Catholic Church SHG members"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 font-bold uppercase">Savings & Credit Products</h1>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Everything St Gabriel Catholic Church SHG offers members, from regular savings to affordable credit
            for life's needs. Interest on all loans is 1% per month on a reducing balance.
          </p>
        </div>
      </section>

      {/* Member Savings */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={CARD_CLASSES}>
            <div className="flex items-start gap-4">
              <Wallet className="text-[#237A17] shrink-0 mt-1" size={32} strokeWidth={1.5} />
              <div>
                <p className="text-base tracking-[0.15em] uppercase text-[#237A17] mb-1">Savings</p>
                <h2 className="text-2xl mb-3 text-[#16210E] font-semibold uppercase">Member Savings</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Regular share contributions that grow the group's capital and earn dividends. New members pay a
                  one-time registration fee of KES 1,000 and maintain a minimum monthly contribution of KES 600.
                  To keep the group's capital fairly distributed, no single member may hold more than 15% of
                  total members' savings.
                </p>
                <Link to="/register">
                  <Button variant="outline" className="border-[#16210E] text-[#16210E] rounded-none">
                    Become a Member
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="py-16 md:py-20 bg-[#F3F0E8] border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl mb-12 text-[#16210E] font-semibold uppercase max-w-lg">
            Six loan products designed for different needs.
          </h2>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
            {LOAN_PRODUCTS.map((product) => (
              <div key={product.title} className={CARD_CLASSES}>
                <product.icon className="text-[#237A17] mb-3" size={28} strokeWidth={1.5} />
                <h3 className="text-xl mb-1 text-[#16210E] font-bold">{product.title}</h3>
                <p className="text-base text-[#237A17] mb-3">{product.terms}</p>
                <p className="text-gray-600 leading-relaxed">{product.desc}</p>
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

      {/* Product Comparison Table */}
      <section className="py-16 md:py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl mb-3 text-[#16210E] font-semibold uppercase">Product Details at a Glance</h2>
          <p className="text-gray-600 mb-10 max-w-2xl">
            A side-by-side comparison of eligibility, repayment terms, and guarantor requirements across every
            product.
          </p>

          {/* Desktop/tablet: full table, horizontally scrollable if the viewport is
              narrower than the content (e.g. small tablets in portrait). */}
          <div className="hidden md:block overflow-x-auto border border-gray-200">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-[#16210E] text-[#FAF9F5]">
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold whitespace-nowrap">Product</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold whitespace-nowrap">Eligibility</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold whitespace-nowrap">Max Term</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold whitespace-nowrap">Interest Rate</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold whitespace-nowrap">Guarantor</th>
                  <th className="p-4 text-sm tracking-[0.1em] uppercase font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_TABLE.map((row, index) => (
                  <tr
                    key={row.product}
                    className={`border-t border-gray-200 align-top ${index % 2 === 1 ? 'bg-[#F3F0E8]/50' : 'bg-white'}`}
                  >
                    <td className="p-4 font-bold text-[#16210E] whitespace-nowrap">{row.product}</td>
                    <td className="p-4 text-gray-700">{row.eligibility}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{row.maxTerm}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{row.interestRate}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{row.guarantorRequired}</td>
                    <td className="p-4 text-gray-600 leading-relaxed min-w-[260px]">{row.purpose}</td>
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