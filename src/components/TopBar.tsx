import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const CONTACT_ITEMS = [
  { icon: Phone, label: '+254 715 590 028' },
  { icon: Mail, label: 'shg@thomecaritasnairobi.org' },
  { icon: MapPin, label: 'St. Gabriel Catholic Church, Thome' },
];

const ITEM_HEIGHT_PX = 32; // must match the h-8 (2rem) rows below
const HOLD_MS = 2500; // how long each item stays visible before sliding to the next

export function TopBar() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CONTACT_ITEMS.length);
    }, HOLD_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-[#16210E] text-[#FAF9F5] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop / tablet: all contact info shown at once, always visible, centered */}
        <div className="hidden sm:flex items-center justify-center gap-6 h-9 text-base md:text-base tracking-wide">
          {CONTACT_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
              <item.icon size={13} strokeWidth={1.5} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Mobile: a slow vertical slider cycling through the same info, one at a time, centered */}
        <div className="sm:hidden h-8 overflow-hidden">
          <div
            className="flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${activeIndex * ITEM_HEIGHT_PX}px)` }}
          >
            {CONTACT_ITEMS.map((item, i) => (
              <div key={i} className="h-8 flex items-center justify-center gap-1.5 text-base tracking-wide">
                <item.icon size={13} strokeWidth={1.5} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}