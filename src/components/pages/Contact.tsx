import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { Phone, Mail, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import faqData from '../../faq.json';

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[#237A17] pl-4 py-1 font-sans text-base text-gray-700 leading-relaxed">
      {children}
    </div>
  );
}

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'A valid email is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length > 5000) newErrors.message = 'Message is too long (max 5000 characters)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Request failed: ${response.status}`);
      }

      setSubmitted(true);
      toast.success('Your message has been sent. We will get back to you shortly.');
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't send your message right now. Please try again or email us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] font-sans flex items-center justify-center py-24 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl md:text-4xl mb-4 text-[#16210E] font-bold uppercase">Thank you for reaching out</h1>
          <p className="text-gray-600 mb-8">
            We've received your message and will get back to you as soon as possible, usually within one
            business day.
          </p>
          <Button
            variant="outline"
            className="border-[#16210E] text-[#16210E] rounded-none"
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            }}
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 text-[#16210E] font-bold uppercase">Contact Us</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Have a question about membership, savings, or loans? Send us a message and our team will respond
            directly.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12 md:gap-16">
          {/* Contact info + map - left on desktop, SECOND on mobile (form comes first) */}
          <div className="md:col-span-2 space-y-8 order-2 md:order-1">
            <div className="border-t-2 border-[#16210E] pt-6">
              <div className="flex items-start gap-3 mb-6">
                <MapPin className="text-[#237A17] shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
                <div>
                  <p className="text-[#16210E]">Address</p>
                  <p className="text-base text-gray-600">St. Gabriel Catholic Church, Thome</p>
                  <p className="text-base text-gray-600">1st Floor, above PMC Chapel</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-6">
                <Phone className="text-[#237A17] shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
                <div>
                  <p className="text-[#16210E]">Phone</p>
                  <p className="text-base text-gray-600">{faqData.contact_info.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-6">
                <Mail className="text-[#237A17] shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
                <div>
                  <p className="text-[#16210E]">Email</p>
                  {faqData.contact_info.email.map((addr: string) => (
                    <p key={addr} className="text-base text-gray-600">{addr}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-[#237A17] shrink-0 mt-0.5" size={18} strokeWidth={1.5} />
                <div>
                  <p className="text-[#16210E]">Office Hours</p>
                  <p className="text-base text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p className="text-base text-gray-600">4th Sunday of every month</p>
                </div>
              </div>
            </div>

            {/* Map - moved here from the About page */}
            <div className="overflow-hidden border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.818!2d36.8716!3d-1.2341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f16d7b2c3b4a1%3A0x0!2sSt+Gabriel+Catholic+Church%2C+Thome%2C+Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="St Gabriel Catholic Church, Thome Nairobi"
              ></iframe>
            </div>

            <Notice>
              Prefer to chat? Use the assistant in the bottom-right corner of the site for quick answers about
              membership, savings, and loans.
            </Notice>
          </div>

          {/* Form - FIRST on mobile, right column on desktop */}
          <div className="md:col-span-3 order-1 md:order-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`bg-[#FAF9F5] ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-base text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0712345678"
                    className="bg-[#FAF9F5]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`bg-[#FAF9F5] ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-base text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="e.g., Question about loan eligibility"
                  className={`bg-[#FAF9F5] ${errors.subject ? 'border-red-500' : ''}`}
                />
                {errors.subject && <p className="text-base text-red-500 mt-1">{errors.subject}</p>}
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={6}
                  className={`bg-[#FAF9F5] ${errors.message ? 'border-red-500' : ''}`}
                />
                <div className="flex justify-between mt-1">
                  {errors.message ? (
                    <p className="text-base text-red-500">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-base text-gray-400">{formData.message.length}/5000</p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#16210E] hover:bg-[#237A17] rounded-none w-full sm:w-auto px-10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} /> Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="ml-2" size={16} />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}