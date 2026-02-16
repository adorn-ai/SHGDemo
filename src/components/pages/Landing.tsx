import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { PiggyBank, HandCoins, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function Landing() {
  const [counts, setCounts] = useState({ members: 0, savings: 0, loans: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

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
    
    // Animated counter
    const targets = { members: 250, savings: 12500000, loans: 180 };
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

  const testimonials = [
    {
      name: 'Grace Wanjiru',
      text: 'St Gabriel SHG helped me start my small business. The loan process was smooth and the support from the community has been incredible.',
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
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative bg-[#2D5016] text-white py-20 md:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1536539754812-56b166f0e89b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZW55YSUyMGxhbmRzY2FwZSUyMHNhdmFubmFoJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzAxODk0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Kenya landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/95 to-[#4A7C2C]/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 drop-shadow-lg">
              Empowering Communities Through Financial Unity
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 drop-shadow">
              Join St Gabriel Self-Help Group and take control of your financial future through collective savings, affordable loans, and community support.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-[#2D5016] hover:bg-gray-100 shadow-lg">
                  Become a Member
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="bg-white text-[#2D5016] hover:bg-gray-100 shadow-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-[#2D5016]">What We Offer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              St Gabriel SHG provides comprehensive financial services designed to help our members thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-[#2D5016] hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-[#6B9E4D] rounded-full flex items-center justify-center mb-4">
                  <PiggyBank className="text-white" size={24} />
                </div>
                <h3 className="text-xl mb-3 text-[#2D5016]">Collective Savings</h3>
                <p className="text-gray-600">
                  Build your financial security through regular savings with attractive interest rates and flexible options.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-[#4A7C2C] hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-[#6B9E4D] rounded-full flex items-center justify-center mb-4">
                  <HandCoins className="text-white" size={24} />
                </div>
                <h3 className="text-xl mb-3 text-[#2D5016]">Affordable Loans</h3>
                <p className="text-gray-600">
                  Access quick loans at competitive rates for education, business, medical emergencies, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-[#6B9E4D] hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-[#6B9E4D] rounded-full flex items-center justify-center mb-4">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl mb-3 text-[#2D5016]">Community Support</h3>
                <p className="text-gray-600">
                  Join a supportive network that shares knowledge, experiences, and opportunities for growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Counter Section with Fade In */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center mb-2">
                <Users size={40} />
              </div>
              <div className="text-4xl md:text-5xl mb-2">{counts.members}+</div>
              <div className="text-lg text-gray-100">Active Members</div>
            </div>
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp size={40} />
              </div>
              <div className="text-4xl md:text-5xl mb-2">KES {(counts.savings / 1000000).toFixed(1)}M</div>
              <div className="text-lg text-gray-100">Total Savings</div>
            </div>
            <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center mb-2">
                <CheckCircle size={40} />
              </div>
              <div className="text-4xl md:text-5xl mb-2">{counts.loans}+</div>
              <div className="text-lg text-gray-100">Loans Disbursed</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-[#2D5016]">How It Works</h2>
            <p className="text-lg text-gray-600">Join us in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Register', desc: 'Fill out the membership form with your details and KYC documents' },
              { step: 2, title: 'Get Approved', desc: 'Our team reviews your application and approves membership' },
              { step: 3, title: 'Start Saving', desc: 'Begin your regular savings journey with flexible options' },
              { step: 4, title: 'Access Loans', desc: 'Apply for loans when needed at competitive interest rates' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#2D5016] text-white rounded-full flex items-center justify-center text-2xl mb-4 relative z-10">
                    {item.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-[#6B9E4D]" />
                  )}
                  <h3 className="text-xl mb-2 text-[#2D5016]">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register">
              <Button size="lg" className="bg-[#2D5016] hover:bg-[#4A7C2C]">
                Get Started Today <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-[#2D5016]">What Our Members Say</h2>
            <p className="text-lg text-gray-600">Real stories from real people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D5016]">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D5016] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl mb-4">St Gabriel SHG</h3>
              <p className="text-gray-300">
                Empowering communities through financial inclusion and collective growth since 2015.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-300 hover:text-white">About Us</Link>
                <Link to="/register" className="block text-gray-300 hover:text-white">Register</Link>
                <Link to="/apply-loan" className="block text-gray-300 hover:text-white">Apply for Loan</Link>
              </div>
            </div>
            <div>
              <h3 className="text-xl mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-300">
                <p>Email: contact@stgabrielshg.org</p>
                <p>Phone: +254 712 345 678</p>
                <p>Office Hours: Mon-Fri, 9 AM - 5 PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
            <p>© 2026 St Gabriel Self-Help Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}