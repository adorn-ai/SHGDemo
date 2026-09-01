import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../ui/carousel';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import faqData from '../../faq.json';
import caritasLogo from '../../assets/caritas-logo.png';
import aboutHeroPhoto from '../../assets/group-photo.jpg';
import ourStoryPhoto from '../../assets/about-hero.jpg';
import churchPhoto from '../../assets/church-building.jpg';
import samuelWainaina from '../../assets/board/samuel_wainaina.jpg';
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
    bio: 'Executive Financial Advisor with over two decades of experience guiding individuals, families, and businesses through cash flow management, strategic saving, investment planning, and wealth preservation. As Chairman, he provides strategic leadership and financial oversight, championing a culture of consistent saving, responsible borrowing, and timely repayment - keeping the Group a trusted vehicle for members\u2019 collective economic empowerment.',
  },
  {
    name: 'Raphael Kabando',
    role: 'Vice-Chairman \u00b7 Chairman, Capacity Building, Strategy and Development Committee',
    image: raphaelKabando,
    bio: 'A socio-economist specialising in economic planning; institutional development; project planning, M&E; governance; among others.',
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
    bio: 'A retired Senior District Commissioner with a distinguished career in national administration, including oversight of national elections and parliamentary affairs. Holds a BA from the University of Nairobi and a Master\u2019s in Public Administration from Liverpool University, with further training from the Washington International Institute and Lok Sabha, India\u2019s Parliament. Currently involved in hospitality, works of mercy, and Catholic men\u2019s association leadership.',
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
    bio: 'A seasoned professional and accomplished businesswoman with over 30 years of experience as an Executive Secretary in the oil industry. Today, she channels that experience and entrepreneurial spirit into her own ventures, with a primary focus on farming and real estate, driven by a passion for sustainable growth and lasting value.',
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
        className="aspect-[4/5] w-full overflow-hidden mb-4 cursor-pointer bg-[#F3F0E8]"
      >
        <ImageWithFallback
          src={leader.image}
          alt={leader.name}
          className="w-full h-full object-cover object-top"
        />
      </button>
      <button type="button" onClick={() => onSelect(leader)} className="text-left cursor-pointer">
        <h3 className="text-xl text-[#16210E] leading-snug font-bold uppercase">{leader.name}</h3>
      </button>
      <p className="font-sans text-base tracking-[0.05em] text-[#237A17] mt-1 mb-2 leading-relaxed">{leader.role}</p>
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
      <DialogContent className="sm:max-w-md rounded-none font-sans p-0 max-h-[85vh] overflow-hidden">
        {leader && (
          // Everything lives inside ONE wrapper div, deliberately - DialogContent's
          // own default classes (likely a CSS grid, per the shadcn/radix template)
          // place direct children into the same implicit cell rather than stacking
          // them, which is what caused the image and text to render on top of each
          // other. Making this a single child sidesteps that entirely: whatever
          // display type the parent uses, a lone child just gets sized to fill the
          // available box, and layout inside this div is fully self-determined.
          <div className="flex flex-col max-h-[85vh] overflow-hidden">
            <DialogTitle className="sr-only">{leader.name}</DialogTitle>
            <div className="h-72 sm:h-80 w-full overflow-hidden bg-[#F3F0E8] shrink-0">
              <ImageWithFallback
                src={leader.image}
                alt={leader.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 overflow-y-auto">
              <h3 className="text-2xl text-[#16210E] font-bold uppercase mb-1">{leader.name}</h3>
              <p className="text-base tracking-[0.05em] text-[#237A17] mb-4">{leader.role}</p>
              <p className="text-base text-gray-600 leading-relaxed">
                {leader.bio || 'A dedicated member of the Management Committee serving St Gabriel Catholic Church SHG.'}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
            src={aboutHeroPhoto}
            alt="St Gabriel Catholic Church SHG members"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight font-bold uppercase opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
            style={{ animationDelay: '0ms' }}
          >
            About St Gabriel<br className="hidden sm:block" /> Catholic Church SHG
          </h1>
          <div
            className="flex items-center justify-center gap-4 font-sans text-base text-gray-200 opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
            style={{ animationDelay: '200ms' }}
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
                src={ourStoryPhoto}
                alt="SHG leaders outside St Gabriel Catholic Church"
                className="w-full h-full object-cover object-[center_60%]"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Correlation 1: St Gabriel Catholic Church */}
      <section className="py-16 md:py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <Reveal>
              <h2 className="text-3xl md:text-4xl mb-4 text-[#16210E] font-semibold uppercase">Rooted in St Gabriel Catholic Church</h2>
              <p className="font-sans text-lg text-gray-700 leading-relaxed max-w-xl">
                The SHG is situated at St. Gabriel Catholic Church grounds along the Northern Bypass, operating
                from a permanent structure on church premises. Our members are drawn largely from the Church's
                own congregation in Thome and Garden Estates, and our savings and credit programme extends the
                parish's mission of solidarity, self-reliance, and dignity of work into the everyday financial
                lives of the faithful we serve.
              </p>
            </Reveal>
            <Reveal delayMs={150} className="aspect-[4/3] overflow-hidden">
              <img
                src={churchPhoto}
                alt="St Gabriel Catholic Church"
                className="w-full h-full object-cover object-[center_30%]"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Correlation 2: Caritas Nairobi - reframed as umbrella organization rather than a bank/funding relationship */}
      <section className="py-16 md:py-20 border-t border-gray-100 bg-[#F3F0E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
            <Reveal className="flex items-center justify-start order-2 md:order-1">
              <img src={caritasLogo} alt="Caritas Nairobi" className="h-24 sm:h-28 w-auto object-contain" />
            </Reveal>
            <Reveal delayMs={150} className="order-1 md:order-2">
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
      <section className="bg-[#B00117] py-20 md:py-28">
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

          {/* Desktop: flex-wrap so an incomplete last row (7 leaders in 4 columns) centers
              itself instead of sticking to the left edge - same fix as the Values grid. */}
          <div className="hidden md:flex md:flex-wrap md:justify-center gap-x-8 gap-y-12">
            {LEADERS.map((leader, index) => (
              <Reveal key={index} delayMs={index * 80} className="md:w-[calc(25%-1.5rem)]">
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