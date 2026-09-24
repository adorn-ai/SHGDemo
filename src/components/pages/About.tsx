import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../ui/carousel';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import faqData from '../../faq.json';
import caritasLogo from '../../assets/caritas-logo.png';
import ourStoryPhoto from '../../assets/about-hero.jpg';
import churchPhoto from '../../assets/church-building.jpg';
import heroPhoto from '../../assets/luncheon-04.jpg';
import samuelWainaina from '../../assets/board/samuel_wainaina.jpg';
import raphaelKabando from '../../assets/board/raphael_kabando.jpeg';
import josephineNjau from '../../assets/board/josephine_njau.png';
import elizabethThiaka from '../../assets/board/elizabeth_thiaka.jpeg';
import sulemanChege from '../../assets/board/suleman_chege.jpeg';
import naomiMungai from '../../assets/board/naomi_mungai.jpeg';
import maryNjoroge from '../../assets/board/mary_njoroge.jpeg';
import danielMwendwa from '../../assets/board/daniel_mwendwa.jpeg'

interface Leader {
  name: string;
  role: string;
  image: string;
  bio?: string;
}

const HERO_IMAGE = { src: heroPhoto, position: 'center' };

// PLACEHOLDER - Fr Mumo's photo, full profile, and exact title are pending
// confirmation. Listed first (before the Chairman) as the Patron, per
// request. image is deliberately left blank so ImageWithFallback renders
// its built-in placeholder until a real photo is supplied.
const PATRON: Leader = {
  name: 'Fr Mumo',
  role: 'Patron',
  image: '',
  bio: 'Full profile to be added.',
};

const LEADERS: Leader[] = [
  PATRON,
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

// PLACEHOLDER - Faith Esaabu's and Daniel's photos, full profiles, and
// exact position titles are pending confirmation. Positions below are
// explicitly marked TBC rather than guessed.
const STAFF: Leader[] = [
  {
    name: 'Faith Esaabu',
    role: 'Accountant',
    image: '',
    bio: 'Full profile to be added.',
  },
  {
    name: 'Daniel Mwendwa',
    role: 'Accounts Assistant',
    image: danielMwendwa,
    bio: 'Finance graduate with a Bachelor of Commerce (Finance option). Equipped with strong numerical and problem solving skills gained through academic training and practical experience.',
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

      {/* Hero - same sizing/behavior as the Landing page hero: height is
          viewport-relative (100svh minus the actual TopBar+Navbar height,
          computed per breakpoint) with min-h/max-h clamps, so it fits one
          screen at any device size without pushing content below the fold. */}
      <section className="relative bg-[#16210E] text-white overflow-hidden h-[calc(100svh-89px)] sm:h-[calc(100svh-93px)] md:h-[calc(100svh-105px)] lg:h-[calc(100svh-113px)] min-h-[420px] max-h-[660px]">
        <ImageWithFallback
          src={HERO_IMAGE.src}
          alt="St Gabriel Catholic Church SHG"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: HERO_IMAGE.position }}
        />
        {/* Legibility overlay, separate from the photo itself - darkest on
            the left where the text sits, fading out toward the right so the
            photo reads clearly there - matching the Landing hero treatment. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#16210E]/85 via-[#16210E]/55 to-[#16210E]/20" />

        <div className="relative z-10 h-full px-6 sm:px-8 lg:px-10 flex items-center justify-start">
          <div className="max-w-xl">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight font-bold uppercase drop-shadow-lg opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
              style={{ animationDelay: '0ms' }}
            >
              About St Gabriel Catholic Church SHG
            </h1>
            <div
              className="w-14 h-1 bg-[#D4A537] mb-5 opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="flex items-center gap-4 font-sans text-base text-gray-200 opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
              style={{ animationDelay: '300ms' }}
            >
              <span>Est. {faqData.organization.established}</span>
              <span className="w-px h-4 bg-gray-400" />
              <span>Registered {faqData.organization.registered}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-8 md:py-10">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
            <Reveal className="md:col-span-8">
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
            <Reveal delayMs={150} className="md:col-span-4 aspect-[4/3] overflow-hidden">
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
      <section className="py-8 md:py-10">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="grid md:grid-cols-12 gap-10 md:gap-20 items-center">
            <Reveal className="md:col-span-8">
              <h2 className="text-3xl md:text-4xl mb-4 text-[#16210E] font-semibold uppercase">Rooted in St Gabriel Catholic Church</h2>
              <p className="font-sans text-lg text-gray-700 leading-relaxed max-w-xl">
                The SHG is situated at St. Gabriel Catholic Church grounds along the Northern Bypass, operating
                from a permanent structure on church premises. Our members are drawn largely from the Church's
                own congregation in Thome and Garden Estates, and our savings and credit programme extends the
                parish's mission of solidarity, self-reliance, and dignity of work into the everyday financial
                lives of the faithful we serve.
              </p>
            </Reveal>
            <Reveal delayMs={150} className="md:col-span-4 aspect-[4/3] overflow-hidden">
              <img
                src={churchPhoto}
                alt="St Gabriel Catholic Church"
                className="w-full h-full object-cover object-[center_30%]"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Correlation 2: Caritas Nairobi - reframed as umbrella organization rather than a bank/funding relationship.
          Explicit 4/12-8/12 split (logo/text) instead of an auto-sized logo column, plus extra breathing
          room (py-20/28, gap-20) so it reads as a clearly separate, deliberately spaced section from the one above. */}
      <section className="py-20 md:py-28 border-t border-gray-100 bg-[#F3F0E8]">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="grid md:grid-cols-12 gap-10 md:gap-20 items-center">
            <Reveal className="md:col-span-4 flex items-center justify-center md:justify-start order-2 md:order-1">
              <img src={caritasLogo} alt="Caritas Nairobi" className="h-24 sm:h-28 w-auto object-contain" />
            </Reveal>
            <Reveal delayMs={150} className="md:col-span-8 order-1 md:order-2">
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
        <div className="px-6 sm:px-8 lg:px-12 xl:px-20 text-center">
          <Reveal>
            <p className="italic text-3xl md:text-5xl text-[#FAF9F5] leading-tight">
              Save <span className="text-[#8FBF6B]">&middot;</span> Borrow <span className="text-[#8FBF6B]">&middot;</span> Grow
            </p>
          </Reveal>
        </div>
      </section>

      {/* Management Committee - Fr Mumo (Patron) now leads the list, ahead
          of the Chairman. With the Patron added, the group is exactly 8
          people, which divides evenly into 4 columns x 2 rows - so the
          desktop layout goes back to a plain 4-column grid instead of the
          flex-wrap/justify-center workaround the previous odd count (7)
          needed to center its incomplete last row. */}
      <section className="py-20 md:py-28 bg-[#F3F0E8] border-t border-gray-100">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
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

          {/* Desktop: even 4x4 grid now that the Patron makes the count 8. */}
          <div className="hidden md:grid md:grid-cols-4 gap-x-8 gap-y-12">
            {LEADERS.map((leader, index) => (
              <Reveal key={index} delayMs={index * 80}>
                <LeaderProfile leader={leader} onSelect={setSelectedLeader} />
              </Reveal>
            ))}
          </div>

          {/* Divider marking the end of the Management Committee grid, ahead of Our Staff below. */}
          <div className="border-t border-gray-300 mt-16 md:mt-20" />
        </div>
      </section>

      {/* Our Staff - Faith Esaabu and Daniel, placeholder entries pending
          confirmed photos, profiles and exact position titles. Kept as its
          own section (not folded into Management Committee) since staff are
          a distinct group from the elected/appointed committee above. Just
          two people, so a simple 2-column grid rather than a carousel. */}
      <section className="py-20 md:py-28 border-t border-gray-100">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
          <Reveal className="mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl text-[#16210E] max-w-lg font-semibold uppercase">Our Staff</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:max-w-2xl gap-x-8 gap-y-12">
            {STAFF.map((member, index) => (
              <Reveal key={index} delayMs={index * 80}>
                <LeaderProfile leader={member} onSelect={setSelectedLeader} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <LeaderModal leader={selectedLeader} onClose={() => setSelectedLeader(null)} />
    </div>
  );
}