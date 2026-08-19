import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../ui/carousel';
import { Building2, Church, Landmark } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import faqData from '../../faq.json';
import shgLogo from '../../assets/shg-logo.png';
import caritasLogo from '../../assets/caritas-logo.png';
import samuelWainaina from '../../assets/board/samuel_wainaina.jpeg';
import raphaelKabando from '../../assets/board/raphael_kabando.jpeg';
import josephineNjau from '../../assets/board/josephine_njau.png';
import elizabethThiaka from '../../assets/board/elizabeth_thiaka.jpeg';
import sulemanChege from '../../assets/board/suleman_chege.jpeg';
import naomiMungai from '../../assets/board/naomi_mungai.jpeg';
import maryNjoroge from '../../assets/board/mary_njoroge.jpeg';

interface Leader {
  name: string;
  role: string;
  image: string;
  bio?: string;
}

const LEADERS: Leader[] = [
  {
    name: 'Samuel Wainaina',
    role: 'Chairman, Management Committee',
    image: samuelWainaina,
  },
  {
    name: 'Raphael Kabando',
    role: 'Vice-Chairman \u00b7 Chairman, Capacity Building, Strategy and Development Committee',
    image: raphaelKabando,
  },
  {
    name: 'Josephine Njau',
    role: 'Executive Secretary \u00b7 Chairperson, Risk, Audit and Compliance Committee',
    image: josephineNjau,
    bio: 'HR and business leader with 15+ years in strategic HR management and organizational development. Member of the Institute of Human Resource Management (IHRM), Kenya.',
  },
  {
    name: 'Elizabeth Thiaka',
    role: 'Treasurer \u00b7 Chairperson, Finance and Budget Committee',
    image: elizabethThiaka,
    bio: 'Senior Internal Audit and Enterprise Risk Management leader with 12+ years providing independent assurance to Boards and Audit Committees. Holds an MBA and CIA/CRMA certifications; active member, IIA Kenya Chapter.',
  },
  {
    name: 'Suleman Chege',
    role: 'Secretary, Capacity Building and Development Committee',
    image: sulemanChege,
  },
  {
    name: 'Naomi Mungai',
    role: 'Secretary, Risk, Audit and Compliance Committee',
    image: naomiMungai,
  },
  {
    name: 'Mary Njoroge',
    role: 'Secretary, Finance and Budget Committee',
    image: maryNjoroge,
  },
];

// Scroll-triggered fade/slide-in wrapper. Fires once, first time the element
// enters the viewport, then disconnects - no dependency, just IntersectionObserver.
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

// Profile card: photo, name, and role are all clickable (same behavior on
// every screen size), plus an explicit "View Profile" link so the
// interaction is discoverable even without hovering/tapping the image.
function LeaderProfile({ leader, onSelect }: { leader: Leader; onSelect: (leader: Leader) => void }) {
  return (
    <div className="flex flex-col h-full">
      <button
        type="button"
        onClick={() => onSelect(leader)}
        className="aspect-square w-full overflow-hidden mb-4 cursor-pointer"
      >
        <ImageWithFallback src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
      </button>
      <button type="button" onClick={() => onSelect(leader)} className="text-left cursor-pointer">
        <h3 className="text-xl text-[#16210E] leading-snug font-bold uppercase">{leader.name}</h3>
      </button>
      <p className="font-sans text-base tracking-[0.1em] uppercase text-[#237A17] mt-1 mb-2 leading-relaxed">{leader.role}</p>
      <button
        type="button"
        onClick={() => onSelect(leader)}
        className="text-sm text-[#16210E] underline underline-offset-2 hover:text-[#237A17] text-left w-fit cursor-pointer"
      >
        View Profile
      </button>
    </div>
  );
}

// Full profile modal - identical behavior/markup on mobile and desktop,
// triggered from either the carousel (mobile) or grid (desktop) below.
function LeaderModal({ leader, onClose }: { leader: Leader | null; onClose: () => void }) {
  return (
    <Dialog open={leader !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-none font-sans p-0 overflow-hidden">
        {leader && (
          <>
            <DialogTitle className="sr-only">{leader.name}</DialogTitle>
            <div className="aspect-square w-full overflow-hidden">
              <ImageWithFallback src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl text-[#16210E] font-bold uppercase mb-1">{leader.name}</h3>
              <p className="text-base tracking-[0.1em] uppercase text-[#237A17] mb-4">{leader.role}</p>
              <p className="text-base text-gray-600 leading-relaxed">
                {leader.bio || 'A dedicated member of the Management Committee serving St Gabriel Catholic Church SHG.'}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* Placeholder for a logo not yet supplied - swap the contents of this div for a real
   <img src={...} alt="..." className="h-16 sm:h-20 w-auto object-contain" /> once available. */
function LogoPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-16 sm:h-20 aspect-square flex flex-col items-center justify-center gap-1 border border-gray-300 bg-[#F3F0E8] text-gray-400 px-3">
      <Building2 size={20} strokeWidth={1.5} />
      <span className="font-sans text-[9px] tracking-wide uppercase text-center leading-tight">{label}</span>
    </div>
  );
}

export function About() {
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero */}
      <section className="relative bg-[#16210E] text-[#FAF9F5] py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1640119259111-acc19f7c38f2?auto=format&fit=crop&w=1080&q=80"
            alt="Kenya community"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="font-sans text-base tracking-[0.3em] uppercase text-[#B8D4A0] mb-6 opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
            style={{ animationDelay: '0ms' }}
          >
            Thome &middot; Nairobi
          </p>
          <h1
            className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight font-bold uppercase opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
            style={{ animationDelay: '150ms' }}
          >
            About St Gabriel<br className="hidden sm:block" /> Catholic Church SHG
          </h1>
          <div
            className="flex items-center justify-center gap-4 font-sans text-base text-gray-200 opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
            style={{ animationDelay: '350ms' }}
          >
            <span>Est. {faqData.organization.established}</span>
            <span className="w-px h-4 bg-[#FAF9F5]/30" />
            <span>Registered {faqData.organization.registered}</span>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal>
              <p className="font-sans text-base tracking-[0.2em] uppercase text-[#237A17] mb-4">Our Story</p>
              <h2 className="text-3xl md:text-4xl mb-6 text-[#16210E] font-semibold uppercase">29 members. KES 23,100.<br />A shared purpose.</h2>
              <div className="font-sans text-gray-700 space-y-4 leading-relaxed">
                <p>
                  St. Gabriel Catholic Church Thome Self Help Group is one of the Self-Help Programme (SHP)
                  affiliated financial empowerment groups within the Archdiocese of Nairobi. The SHG was founded
                  on 18th December 2011 with 29 members and an initial share capital of KES 23,100.
                </p>
                <p>
                  With consistent growth and improved organizational capacity, the Group formally registered with
                  Caritas Nairobi on 21st February 2013 under an Interim Management Committee, later confirmed at
                  our first Annual General Meeting on 11th October 2014.
                </p>
                <p>
                  Our core purpose remains unchanged: to promote savings, provide affordable credit, and enhance
                  the socio-economic wellbeing of our parishioners and the wider community.
                </p>
              </div>
            </Reveal>
            <Reveal delayMs={150} className="aspect-[4/3] overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1601071733462-d0bbb6ee7a02?auto=format&fit=crop&w=1080&q=80"
                alt="Community gathering"
                className="w-full h-full object-cover"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Correlation 1: St Gabriel Catholic Church */}
      <section className="py-16 md:py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-center">
            <Reveal>
              <p className="font-sans text-base tracking-[0.2em] uppercase text-[#237A17] mb-4 flex items-center gap-2">
                <Church size={14} strokeWidth={1.5} /> Our Founding Church
              </p>
              <h2 className="text-3xl md:text-4xl mb-4 text-[#16210E] font-semibold uppercase">Rooted in St Gabriel Catholic Church</h2>
              <p className="font-sans text-lg text-gray-700 leading-relaxed max-w-xl">
                The SHG is situated at St. Gabriel Catholic Church grounds along the Northern Bypass, operating
                from a permanent structure on church premises. Our members are drawn largely from the Church's
                own congregation in Thome and Garden Estates, and our savings and credit programme extends the
                parish's mission of solidarity, self-reliance, and dignity of work into the everyday financial
                lives of the faithful we serve.
              </p>
            </Reveal>
            <Reveal delayMs={150} className="flex items-center gap-4 justify-start md:justify-end">
              <img src={shgLogo} alt="St Gabriel Catholic Church SHG" className="h-16 sm:h-20 w-auto object-contain" />
              <span className="text-2xl text-gray-300 font-light">&times;</span>
              <LogoPlaceholder label="St Gabriel Catholic Church" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Correlation 2: Caritas Nairobi - reframed as umbrella organization rather than a bank/funding relationship */}
      <section className="py-16 md:py-20 border-t border-gray-100 bg-[#F3F0E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
            <Reveal className="flex items-center gap-4 justify-start order-2 md:order-1">
              <img src={shgLogo} alt="St Gabriel Catholic Church SHG" className="h-16 sm:h-20 w-auto object-contain" />
              <span className="text-2xl text-gray-300 font-light">&times;</span>
              <img src={caritasLogo} alt="Caritas Nairobi" className="h-16 sm:h-20 w-auto object-contain" />
            </Reveal>
            <Reveal delayMs={150} className="order-1 md:order-2">
              <p className="font-sans text-base tracking-[0.2em] uppercase text-[#C41230] mb-4 flex items-center gap-2">
                <Landmark size={14} strokeWidth={1.5} /> Our Umbrella Organization
              </p>
              <h2 className="text-3xl md:text-4xl mb-4 text-[#16210E] font-semibold uppercase">Under the Umbrella of Caritas Nairobi</h2>
              <p className="font-sans text-lg text-gray-700 leading-relaxed max-w-xl">
                Caritas Nairobi, the Aid and Development Department of the Catholic Archdiocese of Nairobi, serves
                as our coordinating, regulatory, and trust fund management institution. It safeguards member
                contributions, provides capacity-building, accountancy and audit services, and oversees our
                operations through the Co-Bank+ system and the Self-Regulatory Framework (SRF) launched in 2024.
                Our funds are held with Caritas Nairobi, giving members a secure, trusted home for their
                savings and access to treasury instruments.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Signature moment: the motto */}
      <section className="bg-[#16210E] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="italic text-3xl md:text-5xl text-[#FAF9F5] leading-tight">
              Save <span className="text-[#8FBF6B]">&middot;</span> Borrow <span className="text-[#8FBF6B]">&middot;</span> Grow
            </p>
          </Reveal>
        </div>
      </section>

      {/* Management Committee */}
      <section className="py-20 md:py-28 bg-[#F3F0E8] border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 md:mb-16">
            <p className="font-sans text-base tracking-[0.2em] uppercase text-[#237A17] mb-4">Our Board</p>
            <h2 className="text-3xl md:text-4xl text-[#16210E] max-w-lg font-semibold uppercase">Management Committee</h2>
          </Reveal>

          {/* Mobile: carousel, same click behavior as desktop */}
          <div className="md:hidden">
            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselContent>
                {LEADERS.map((leader, index) => (
                  <CarouselItem key={index} className="basis-[80%]">
                    <LeaderProfile leader={leader} onSelect={setSelectedLeader} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-3 mt-8">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </div>

          {/* Desktop: plain grid, same click behavior as mobile */}
          <div className="hidden md:grid md:grid-cols-4 gap-x-8 gap-y-12">
            {LEADERS.map((leader, index) => (
              <Reveal key={index} delayMs={index * 80}>
                <LeaderProfile leader={leader} onSelect={setSelectedLeader} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <LeaderModal leader={selectedLeader} onClose={() => setSelectedLeader(null)} />
    </div>
  );
}