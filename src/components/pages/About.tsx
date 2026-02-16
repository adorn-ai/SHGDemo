import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Target, Heart, Eye, Award, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Link } from 'react-router';

export function About() {
  const leaders = [
    {
      name: 'John Kamau',
      role: 'Chairman',
      image: 'https://images.unsplash.com/photo-1768489038991-b120542c84f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZW55YW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAxODk0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Leading the group with 15+ years of community service experience.',
    },
    {
      name: 'Sarah Njeri',
      role: 'Secretary',
      image: 'https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDE4OTQwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Managing operations and member relations with dedication and care.',
    },
    {
      name: 'Michael Ochieng',
      role: 'Treasurer',
      image: 'https://images.unsplash.com/photo-1768489038991-b120542c84f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZW55YW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAxODk0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Ensuring financial transparency and responsible fund management.',
    },
  ];

  const benefits = [
    {
      title: 'Financial Security',
      content: 'Build a safety net through regular savings with attractive interest rates. Your money is secure and grows over time, providing you with financial stability.',
    },
    {
      title: 'Easy Access to Credit',
      content: 'Get loans quickly at competitive interest rates (12% per annum) without the hassle of traditional banking procedures. Terms range from 12 to 60 months.',
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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background */}
      <section className="relative bg-[#2D5016] text-white py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1640119259111-acc19f7c38f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZW55YW4lMjB3b21lbiUyMGdyb3VwJTIwY29tbXVuaXR5JTIwbWVldGluZ3xlbnwxfHx8fDE3NzAxODkzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Kenya community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D5016]/95 to-[#4A7C2C]/85"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl mb-6 drop-shadow-lg">About St Gabriel SHG</h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto drop-shadow">
            Building stronger communities through financial empowerment since 2015
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6 text-[#2D5016]">Our Story</h2>
              <p className="text-lg text-gray-700 mb-4">
                St Gabriel Self-Help Group was founded in 2015 by a small group of visionaries who believed in the power of collective action. What started as a gathering of 10 individuals has now grown into a thriving community of over 250 active members.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Our journey began in a small community hall where members would meet weekly to discuss their financial challenges and aspirations. Through mutual support, disciplined saving, and shared knowledge, we've helped countless families achieve their dreams.
              </p>
              <p className="text-lg text-gray-700">
                Today, we stand as a testament to what communities can achieve when they come together with a common purpose - financial inclusion and empowerment for all.
              </p>
            </div>
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1601071733462-d0bbb6ee7a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZW55YW4lMjB2aWxsYWdlJTIwY29tbXVuaXR5JTIwZ2F0aGVyaW5nfGVufDF8fHx8MTc3MDE4OTQwMHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Community gathering"
                className="rounded-lg shadow-xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-t-4 border-[#2D5016]">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#2D5016] rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#2D5016]">Our Mission</h3>
                    <p className="text-gray-700">
                      To provide accessible financial services and foster economic independence among our members through collective savings, affordable credit, and continuous education.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-[#4A7C2C]">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#4A7C2C] rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#2D5016]">Our Vision</h3>
                    <p className="text-gray-700">
                      To become the most trusted and effective self-help group in the region, creating a model of financial inclusion that empowers every member to achieve their dreams.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="border-t-4 border-[#6B9E4D]">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#6B9E4D] rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#2D5016]">Our Values</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-semibold text-[#4A7C2C] mb-1">Transparency</p>
                        <p className="text-gray-600 text-sm">Open and honest communication in all dealings</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#4A7C2C] mb-1">Mutual Support</p>
                        <p className="text-gray-600 text-sm">Members helping members succeed</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#4A7C2C] mb-1">Financial Discipline</p>
                        <p className="text-gray-600 text-sm">Responsible saving and lending practices</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#4A7C2C] mb-1">Empowerment</p>
                        <p className="text-gray-600 text-sm">Building confidence and independence</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-[#2D5016]">Our Leadership Team</h2>
            <p className="text-lg text-gray-600">Dedicated individuals committed to your success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {leaders.map((leader, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="mb-4">
                    <ImageWithFallback
                      src={leader.image}
                      alt={leader.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#6B9E4D]"
                    />
                  </div>
                  <h3 className="text-xl mb-1 text-[#2D5016]">{leader.name}</h3>
                  <p className="text-[#4A7C2C] font-semibold mb-3">{leader.role}</p>
                  <p className="text-gray-600">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Operations */}
      <section className="py-16 bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">How We Operate</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-xl mb-3">Monthly Meetings</h3>
              <p className="text-gray-100">
                Regular meetings on the first Saturday of each month to discuss progress, share experiences, and make collective decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-xl mb-3">Democratic Decisions</h3>
              <p className="text-gray-100">
                All major decisions are made collectively through voting, ensuring every member has a voice in the group's direction.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-xl mb-3">Transparent Accounting</h3>
              <p className="text-gray-100">
                Complete financial transparency with regular audits and detailed reports shared with all members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Accordion */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-[#2D5016]">Member Benefits</h2>
            <p className="text-lg text-gray-600">Everything you get as a member of St Gabriel SHG</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {benefits.map((benefit, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-[#6B9E4D]">
                <AccordionTrigger className="text-lg text-[#2D5016] hover:text-[#4A7C2C]">
                  {benefit.title}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {benefit.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Gallery Link Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-4 text-[#2D5016]">Our Journey in Pictures</h2>
          <p className="text-lg text-gray-600 mb-8">
            Explore our photo gallery showcasing memorable moments, community events, and the growth of St Gabriel SHG over the years.
          </p>
          <Link to="/gallery">
            <Button size="lg" className="bg-[#2D5016] hover:bg-[#4A7C2C] shadow-lg">
              View Full Gallery <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Office Location with Google Maps */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 text-[#2D5016]">Visit Our Office</h2>
            <p className="text-lg text-gray-600">Come meet us in person at our headquarters</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <Card className="border-2 border-[#6B9E4D]">
                <CardContent className="pt-6">
                  <h3 className="text-2xl mb-4 text-[#2D5016]">Contact Information</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Address:</strong><br />St Gabriel Catholic Church<br />Thome, Nairobi<br />Kenya</p>
                    <p><strong>Phone:</strong> +254 712 345 678</p>
                    <p><strong>Email:</strong> contact@stgabrielshg.org</p>
                    <p><strong>Office Hours:</strong><br />Monday - Friday: 9:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg overflow-hidden shadow-xl border-4 border-[#2D5016]">
              <iframe
                src="https://maps.app.goo.gl/gAKRRVHGqvbqifGA7"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="St Gabriel Catholic Church, Thome Nairobi"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}