import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Wallet, Building2, HandCoins, AlertTriangle, GraduationCap, Sprout, Church, ArrowRight } from 'lucide-react';

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

export function Products() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans">
      {/* Header */}
      <section className="py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-base tracking-[0.2em] uppercase text-[#237A17] mb-3">Our Products</p>
          <h1 className="text-3xl md:text-4xl mb-4 text-[#16210E]">Savings & Credit Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything St Gabriel Catholic Church SHG offers members, from regular savings to affordable credit
            for life's needs. Interest on all loans is 1% per month on a reducing balance.
          </p>
        </div>
      </section>

      {/* Member Savings */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t-2 border-[#16210E] pt-6">
            <div className="flex items-start gap-4">
              <Wallet className="text-[#237A17] shrink-0 mt-1" size={32} strokeWidth={1.5} />
              <div>
                <p className="text-base tracking-[0.15em] uppercase text-[#237A17] mb-1">Savings</p>
                <h2 className="text-2xl mb-3 text-[#16210E]">Member Savings</h2>
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
          <p className="text-base tracking-[0.2em] uppercase text-[#237A17] mb-4">Loan Products</p>
          <h2 className="text-3xl md:text-4xl mb-12 text-[#16210E] max-w-lg">
            Six loan products designed for different needs.
          </h2>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {LOAN_PRODUCTS.map((product) => (
              <div key={product.title} className="border-t-2 border-[#16210E] pt-5">
                <product.icon className="text-[#237A17] mb-3" size={28} strokeWidth={1.5} />
                <h3 className="text-xl mb-1 text-[#16210E]">{product.title}</h3>
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
    </div>
  );
}