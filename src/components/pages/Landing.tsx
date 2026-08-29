import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import {
  Icon,
  Users, TrendingUp, CheckCircle, ArrowRight,
  UserPlus, ShieldCheck, PiggyBank, HandCoins, Smartphone, ExternalLink,
  Eye, Scale, Briefcase, Lightbulb, HeartHandshake, Church,
} from 'lucide-react';
import { targetArrow } from '@lucide/lab';
import { useEffect, useRef, useState, Fragment, type ReactNode } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import shgLogo from '../../assets/shg-logo.png';
import caritasLogo from '../../assets/caritas-logo.png';
import whyJoinUsPhoto from '../../assets/why-join-us.jpg';
import heroCarouselPhoto1 from '../../assets/group-photo.jpg';
import heroCarouselPhoto2 from '../../assets/church-building.jpg';
import faqData from '../../faq.json';

const HERO_BG_IMAGES = [heroCarouselPhoto1, heroCarouselPhoto2];

// Full-bleed background carousel for the hero - crossfades between images on
// a timer, no arrows/dots/manual controls, just ambient auto-rotation.
function HeroBackgroundCarousel({ images, intervalMs = 1500 }: { images: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((src, i) => (
        <ImageWithFallback
          key={src}
          src={src}
          alt="St Gabriel Catholic Church SHG"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-30' : 'opacity-0'
          }`}
        />
      ))}
    </>
  );
}

const HEADLINE_WORDS = ['Empowering', 'Communities', 'Through', 'Financial', 'Unity'];

function AnimatedHeadline() {
  return (
    <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 drop-shadow-lg leading-tight font-bold">
      {HEADLINE_WORDS.map((word, i) => (
        <span
          key={word}
          className="inline-block opacity-0 animate-[wordIn_0.7s_ease_forwards] mr-3"
          style={{ animationDelay: `${i * 130}ms` }}
        >
          {word === 'Unity' ? <span className="text-[#D4A537]">{word}</span> : word}
        </span>
      ))}
    </h1>
  );
}

// Scroll-triggered fade/slide-in wrapper - the same entrance treatment as the
// hero, but fired by IntersectionObserver as each section enters view rather
// than on page load. Fires once, then disconnects.
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

// Values: real title + description + scripture reference (from the Strategic
// Plan, matching the About page), each paired with an icon.
const VALUES = [
  { icon: Scale, title: 'Integrity', verse: 'Proverbs 10:9', desc: 'Accountability and transparency in all our undertakings.' },
  { icon: Briefcase, title: 'Professionalism', verse: 'Ephesians 4:25', desc: 'Honest communication and open sharing of information.' },
  { icon: Users, title: 'Teamwork', verse: 'Ecclesiastes 4:9', desc: 'Supporting and encouraging each other in all SHG activities.' },
  { icon: Lightbulb, title: 'Innovation', verse: 'Isaiah 43:19', desc: 'A commitment to innovation in our work and our collaborations.' },
  { icon: ShieldCheck, title: 'Accountability', verse: 'Luke 16:10', desc: 'Answerable to God, the Church, and fellow members for resources entrusted to the Group.' },
  { icon: HeartHandshake, title: 'Inclusivity', verse: 'Galatians 3:28', desc: 'Everyone has a voice, participates, and benefits fairly.' },
  { icon: Church, title: 'Christian Stewardship', verse: '1 Peter 4:10', desc: 'Using contributions, skills, and opportunities wisely for the common good.' },
];

const JOURNEY_STEPS = [
  { icon: UserPlus, step: '01', title: 'Register', desc: 'Fill out the membership form with your details and KYC documents' },
  { icon: ShieldCheck, step: '02', title: 'Get Approved', desc: 'Our team reviews your application and approves membership' },
  { icon: PiggyBank, step: '03', title: 'Start Saving', desc: 'Begin your regular savings journey with flexible options' },
  { icon: HandCoins, step: '04', title: 'Access Loans', desc: 'Apply for loans when needed at competitive interest rates' },
  { icon: Smartphone, step: '05', title: 'Monitor Your Account', desc: 'View your savings and loans anytime on the Caritas Mobi App or website' },
];

function JourneyStepCard({ item }: { item: (typeof JOURNEY_STEPS)[number] }) {
  return (
    <div className="group text-center transition-transform duration-300 hover:-translate-y-1">
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#16210E] group-hover:bg-[#237A17] transition-colors duration-300 mb-4 shadow-md">
        <item.icon className="text-[#FAF9F5]" size={26} strokeWidth={1.5} />
        <span className="absolute -top-1.5 -right-1.5 bg-[#D4A537] text-[#16210E] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {item.step}
        </span>
      </div>
      <h3 className="text-lg lg:text-xl mb-2 text-[#16210E] font-bold">{item.title}</h3>
      <p className="text-base text-gray-600 leading-relaxed px-2">{item.desc}</p>
      {item.step === '05' && (
        <a href="https://fufinet.com/Default" target="_blank" rel="noopener noreferrer" className="inline-block mt-4">
          <Button size="sm" variant="outline" className="border-[#16210E] text-[#16210E] rounded-none">
            View Account <ExternalLink className="ml-1.5" size={14} />
          </Button>
        </a>
      )}
    </div>
  );
}

export function Landing() {
  const [counts, setCounts] = useState({ members: 0, savings: 0, loans: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [testimonialApi, setTestimonialApi] = useState<any>(null);
  const [journeyApi, setJourneyApi] = useState<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Figures from the Strategic Plan 2026-2030 (FY2025 baseline):
    // 376 active members, KES 87,228,750 share capital, KES 19,381,000 loans issued in 2025
    const targets = { members: 376, savings: 87228750, loans: 19381000 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      members: targets.members / steps,
      savings: targets.savings / steps,
      loans: targets.loans / steps,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts({
        members: Math.min(Math.floor(increment.members * step), targets.members),
        savings: Math.min(Math.floor(increment.savings * step), targets.savings),
        loans: Math.min(Math.floor(increment.loans * step), targets.loans),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Auto-advance the testimonial carousel. Embla's own `duration` option (not literal
  // ms) controls how snappy the slide-to-slide glide feels.
  useEffect(() => {
    if (!testimonialApi) return;
    const interval = setInterval(() => {
      testimonialApi.scrollNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [testimonialApi]);

  // Mobile "How It Works" carousel: 2.5s hold per slide, slow duration value
  // below gives a smooth glide rather than a snap-cut between slides.
  useEffect(() => {
    if (!journeyApi) return;
    const interval = setInterval(() => {
      journeyApi.scrollNext();
    }, 2500);
    return () => clearInterval(interval);
  }, [journeyApi]);

  const testimonials = [
    {
      name: 'Grace Wanjiru',
      text: 'St Gabriel Catholic Church SHG helped me start my small business. The loan process was smooth and the support from the community has been incredible.',
      role: 'Small Business Owner',
    },
    {
      name: 'Joseph Kimani',
      text: 'Being part of this SHG has not only helped me financially but also gave me a sense of belonging to a supportive community.',
      role: 'Active Member',
    },
    {
      name: 'Mary Akinyi',
      text: 'The financial literacy programs and regular savings have transformed how I manage my family finances.',
      role: 'Member since 2020',
    },
    {
      name: 'Samuel Kariuki',
      text: 'I financed my motorbike through an emergency loan when I needed it most. The guarantors process felt fair and the group trusted me.',
      role: 'Boda Boda Operator',
    },
    {
      name: 'Esther Wairimu',
      text: "The education loan meant my daughter never missed a term of school. I didn't have to choose between her fees and our rent.",
      role: 'Teacher',
    },
    {
      name: 'Daniel Otieno',
      text: 'The Agribusiness loan let me expand my poultry farm right before the festive season. Best decision I made all year.',
      role: 'Farmer',
    },
    {
      name: 'Lucy Chebet',
      text: "I've saved consistently for six years now. Watching my shares grow while knowing my neighbours are growing too - that's the real value.",
      role: 'Tailor \u00b7 Member since 2018',
    },
  ];

  const benefits = [
    {
      title: 'Financial Security',
      content: 'Build a safety net through regular savings with attractive interest rates. Your money is secure and grows over time, providing you with financial stability.',
    },
    {
      title: 'Easy Access to Credit',
      content: 'Get loans quickly at competitive interest rates (1% per month on a reducing balance) without the hassle of traditional banking procedures. Terms range from 12 to 60 months depending on the loan product.',
    },
    {
      title: 'Community Support',
      content: 'Be part of a supportive network where members help each other grow. Share knowledge, experiences, and opportunities for personal and financial development.',
    },
    {
      title: 'Financial Literacy',
      content: 'Regular training sessions on budgeting, saving, investment planning, and financial management to help you make informed decisions.',
    },
    {
      title: 'No Hidden Charges',
      content: 'Complete transparency in all transactions. No processing fees, no hidden charges. What you see is what you get.',
    },
  ];

  return (
    <div className="min-h-screen font-sans">
      <style>{`
        @keyframes wordIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero - intentionally left on the original dark green + gold palette.
          Top padding trimmed (was py-24/36 symmetric) now that the eyebrow
          label above the headline is gone sitewide - brings the headline up
          into that space while keeping the original bottom spacing. */}
      <section className="relative bg-[#2D5016] text-white pt-14 md:pt-20 pb-24 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <HeroBackgroundCarousel images={HERO_BG_IMAGES} intervalMs={1500} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <AnimatedHeadline />
            <p
              className="text-base md:text-lg lg:text-xl mb-8 text-gray-100 max-w-xl opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
              style={{ animationDelay: '850ms' }}
            >
              A leading Christian-based financial service provider committed to inclusive, ethical, and
              innovative socio-economic empowerment - empowering members through savings mobilization,
              affordable credit, financial literacy, and value-based service delivery supported by modern
              technology.
            </p>
            <div
              className="flex flex-wrap gap-4 opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
              style={{ animationDelay: '1050ms' }}
            >
              <Link to="/register">
                <Button size="lg" className="bg-[#D4A537] text-[#2D5016] hover:bg-[#c2962e] shadow-lg rounded-none border-0">
                  Become a Member
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-none">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-20 md:py-28 xl:py-32 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl md:text-4xl mb-14 text-[#16210E] max-w-lg font-semibold uppercase">
              Our Mission, Vision & Values
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Reveal className="rounded-lg border-2 border-[#C41230]/30 hover:border-[#C41230] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 md:p-10">
              <Eye className="text-[#237A17] mb-4" size={36} strokeWidth={1.5} />
              <h3 className="text-2xl mb-3 text-[#16210E] font-semibold">Our Vision</h3>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">{faqData.organization.vision}</p>
            </Reveal>
            <Reveal delayMs={150} className="rounded-lg border-2 border-[#C41230]/30 hover:border-[#C41230] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 md:p-10">
              <Icon iconNode={targetArrow} className="text-[#237A17] mb-4" size={36} strokeWidth={1.5} />
              <h3 className="text-2xl mb-3 text-[#16210E] font-semibold">Our Mission</h3>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">{faqData.organization.mission}</p>
            </Reveal>
          </div>

          <Reveal className="pt-10 border-t border-gray-200">
            <h3 className="text-xl lg:text-2xl mb-8 text-[#16210E] font-bold uppercase">Our Values</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {VALUES.map((value, index) => (
                <Reveal
                  key={value.title}
                  delayMs={index * 60}
                  className="rounded-lg border-2 border-[#C41230]/30 hover:border-[#C41230] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(25%-1.125rem)]"
                >
                  <value.icon className="text-[#237A17] mb-2" size={30} strokeWidth={1.5} />
                  <p className="text-[#16210E] mb-1 font-bold text-lg">{value.title}</p>
                  <p className="text-gray-600 text-base lg:text-lg leading-relaxed">{value.desc}</p>
                  <p className="text-base lg:text-lg text-[#237A17] mt-1 italic">{value.verse}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats - kept dark for contrast, but on the new near-black rather than forest green */}
      <section ref={statsRef} className="py-20 bg-[#16210E] text-[#FAF9F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {[
              { icon: Users, value: `${counts.members}+`, label: 'Active Members', delay: '' },
              { icon: TrendingUp, value: `KES ${(counts.savings / 1000000).toFixed(1)}M`, label: 'Share Capital (Savings)', delay: 'delay-200' },
              { icon: CheckCircle, value: `KES ${(counts.loans / 1000000).toFixed(1)}M`, label: 'Loans Disbursed (2025)', delay: 'delay-400' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`transition-all duration-1000 ${stat.delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <stat.icon className="mx-auto mb-3 text-[#8FBF6B]" size={32} strokeWidth={1.5} />
                <div className="text-4xl md:text-5xl mb-2 font-bold">{stat.value}</div>
                <div className="text-gray-300 tracking-wide uppercase text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - process-flow journey, 5 steps */}
      <section className="py-20 md:py-28 bg-[#FAF9F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl md:text-4xl mb-16 text-[#16210E] text-center font-semibold uppercase">How It Works</h2>
          </Reveal>

          {/* Desktop/tablet: circular badges connected by bold arrows - a real journey path, not a static grid */}
          <div className="hidden md:flex items-start">
            {JOURNEY_STEPS.map((item, index) => (
              <Fragment key={item.step}>
                <Reveal delayMs={index * 120} className="flex-1">
                  <JourneyStepCard item={item} />
                </Reveal>
                {index < JOURNEY_STEPS.length - 1 && (
                  <div className="w-8 lg:w-12 shrink-0 flex items-center justify-center pt-8">
                    <ArrowRight className="text-[#D4A537]" size={28} strokeWidth={2.5} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Mobile: gliding auto-advancing carousel, no arrows - swipe/drag only */}
          <div className="md:hidden">
            <Carousel opts={{ align: 'start', loop: true, duration: 28 }} setApi={setJourneyApi} className="w-full">
              <CarouselContent>
                {JOURNEY_STEPS.map((item) => (
                  <CarouselItem key={item.step} className="basis-[85%]">
                    <JourneyStepCard item={item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          <Reveal className="text-center mt-16">
            <Link to="/register">
              <Button size="lg" className="bg-[#16210E] hover:bg-[#237A17] rounded-none">
                Get Started Today <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Why Join Us (formerly Member Benefits) - photo as full section background,
          same overlay treatment as the page heroes, with the accordion sitting on
          top in a translucent dark panel for legibility over the image. */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={whyJoinUsPhoto}
            alt="St Gabriel Catholic Church SHG members"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#16210E]/88" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-4xl md:text-5xl mb-12 text-[#FAF9F5] text-center font-semibold uppercase">Why Join Us</h2>
          </Reveal>
          <Reveal delayMs={150}>
            <Accordion type="single" collapsible className="w-full">
              {benefits.map((benefit, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-[#8FBF6B]/40">
                  <AccordionTrigger className="text-xl lg:text-2xl text-[#FAF9F5] hover:text-[#8FBF6B] font-bold">
                    {benefit.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-100 text-lg lg:text-xl">
                    {benefit.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Testimonials - auto-advancing carousel */}
      <section className="py-20 md:py-28 bg-[#FAF9F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl md:text-4xl mb-14 text-[#16210E] text-center font-semibold uppercase">What Our Members Say</h2>
          </Reveal>

          <Reveal delayMs={150}>
            <Carousel opts={{ align: 'start', loop: true, duration: 25 }} setApi={setTestimonialApi} className="w-full">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="h-full flex flex-col border-t-2 border-[#6B9E4D] pt-6 px-2">
                      <p className="text-3xl text-[#237A17] leading-none mb-3">&ldquo;</p>
                      <p className="text-lg text-[#16210E] leading-relaxed mb-5 italic flex-1">
                        {testimonial.text}
                      </p>
                      <div className="font-bold text-[#16210E]">{testimonial.name}</div>
                      <div className="text-base text-gray-500 tracking-wide uppercase">{testimonial.role}</div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16210E] text-[#FAF9F5] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <img src={shgLogo} alt="St Gabriel Catholic Church SHG" className="h-32 w-auto object-contain mb-4" />
              <h3 className="text-xl mb-4 font-bold">St Gabriel Catholic Church SHG</h3>
              <p className="text-gray-300 leading-relaxed text-base">
                Empowering communities through financial inclusion and collective growth since 2011.
              </p>
              <div className="flex items-center gap-2 mt-5 pt-5 border-t border-white/10">
                <div className="bg-[#FAF9F5] rounded p-1.5">
                  <img src={caritasLogo} alt="Caritas Nairobi" className="h-6 w-auto object-contain" />
                </div>
                <p className="text-sm text-gray-400">In partnership with Caritas Nairobi</p>
              </div>
            </div>
            <div>
              <p className="text-base tracking-[0.2em] uppercase text-[#8FBF6B] mb-4">Quick Links</p>
              <div className="space-y-2 font-sans">
                <Link to="/about" className="block text-gray-300 hover:text-[#FAF9F5]">About Us</Link>
                <Link to="/products" className="block text-gray-300 hover:text-[#FAF9F5]">Products</Link>
                <Link to="/register" className="block text-gray-300 hover:text-[#FAF9F5]">Register</Link>
                <Link to="/apply-loan" className="block text-gray-300 hover:text-[#FAF9F5]">Apply for Loan</Link>
                <Link to="/contact" className="block text-gray-300 hover:text-[#FAF9F5]">Contact Us</Link>
              </div>
            </div>
            <div>
              <p className="text-base tracking-[0.2em] uppercase text-[#8FBF6B] mb-4">Contact Us</p>
              <div className="space-y-2 text-gray-300 font-sans">
                <p>St. Gabriel Catholic Church, Thome</p>
                <p>1st Floor, above PMC Chapel</p>
                <p>shg@thomecaritasnairobi.org</p>
                <p>+254 715 590 028</p>
                <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
                <p>4th Sunday of the month till 1:00 PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-gray-400 text-base">
            <p>&copy; 2026 St Gabriel Catholic Church SHG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}