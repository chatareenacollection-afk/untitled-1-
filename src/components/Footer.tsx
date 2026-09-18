import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  ArrowRight,
  Heart,
  Lock,
} from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  onSelectCategory: (cat: string) => void;
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenTracking,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#151312] text-[#ECE7DF] border-t border-[#C5A059]/30">
      {/* Brand Perks Strip */}
      <div className="border-b border-stone-800/80 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 bg-stone-900 flex items-center justify-center text-[#C5A059]">
              ✨
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">100% Pure Fabric</p>
              <p className="text-[11px] text-stone-400">Certified silks, lawns & chiffons</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 bg-stone-900 flex items-center justify-center text-[#C5A059]">
              🚚
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Nationwide Delivery</p>
              <p className="text-[11px] text-stone-400">Cash on Delivery across Pakistan</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 bg-stone-900 flex items-center justify-center text-[#C5A059]">
              ✂️
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Master Tailoring</p>
              <p className="text-[11px] text-stone-400">Hand-finished bespoke stitching</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 bg-stone-900 flex items-center justify-center text-[#C5A059]">
              💬
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">WhatsApp Concierge</p>
              <p className="text-[11px] text-stone-400">Personal stylist assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded border border-[#C5A059] bg-stone-900 flex items-center justify-center text-[#C5A059] font-serif font-bold text-sm">
                A•R
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-wider text-white">
                  A-R STYLES
                </span>
                <span className="block text-[10px] uppercase tracking-[0.25em] text-[#C5A059]">
                  Haute Couture & Eastern Pret
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Curating ethereal South Asian couture where historic artisanal craftsmanship meets modern elegance. Handcrafted embroidery, pure fabrics, and exquisite cuts tailored for the modern woman.
            </p>

            <div className="space-y-1.5 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Gulberg III, Lahore, Pakistan • Worldwide Delivery</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>WhatsApp: {settings?.whatsappNumber || '+92 300 1234567'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Mon–Sat: 10:00 AM – 8:00 PM (PKT)</span>
              </p>
            </div>
          </div>

          {/* Couture Collections */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <p className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Collections
            </p>
            <ul className="space-y-2 text-stone-400 font-light">
              <li>
                <button
                  onClick={() => onSelectCategory('pret')}
                  className="hover:text-[#DFCA95] transition-colors"
                >
                  Ready-to-Wear (Pret)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('luxury-lawn')}
                  className="hover:text-[#DFCA95] transition-colors"
                >
                  Luxury Lawn & Silk
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('unstitched')}
                  className="hover:text-[#DFCA95] transition-colors"
                >
                  Unstitched 3-Piece
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('formals-bridal')}
                  className="hover:text-[#DFCA95] transition-colors"
                >
                  Formal & Bridal Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('shawls')}
                  className="hover:text-[#DFCA95] transition-colors"
                >
                  Pure Velvet Shawls
                </button>
              </li>
            </ul>
          </div>

          {/* Client Experience */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <p className="font-serif text-sm font-bold text-white uppercase tracking-wider">
              Client Care
            </p>
            <ul className="space-y-2 text-stone-400 font-light">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-[#DFCA95] transition-colors font-medium text-white"
                >
                  Track Your Parcel Live
                </button>
              </li>
              <li>
                <span className="cursor-default text-stone-400">Standard Sizing Guide</span>
              </li>
              <li>
                <span className="cursor-default text-stone-400">Nationwide Shipping Rates</span>
              </li>
              <li>
                <span className="cursor-default text-stone-400">7-Day Exchange Policy</span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${(settings?.whatsappNumber || '+92 300 1234567').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#DFCA95] transition-colors text-emerald-400"
                >
                  WhatsApp Concierge Chat
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter & Loyalty */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <p className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                The Couture Gazette
              </p>
              <p className="text-xs text-stone-400 font-light mt-1">
                Subscribe to receive private invitations to festive collection previews, secret seasonal sales, and style curations.
              </p>
            </div>

            <form onSubmit={handleNewsletter} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-stone-900 border border-stone-700 rounded py-2 px-3 text-xs text-white placeholder-stone-500 flex-1 focus:border-[#C5A059] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#A37F37] text-stone-950 font-bold text-xs uppercase rounded transition-all cursor-pointer"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-400">
                  ✓ Welcome to the A-R Styles circle! Check your inbox shortly.
                </p>
              )}
            </form>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
                Accepted Payment Methods
              </span>
              <div className="flex flex-wrap gap-2 text-[10px] text-stone-400">
                <span className="px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">Cash on Delivery (COD)</span>
                <span className="px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">Meezan Bank</span>
                <span className="px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">JazzCash</span>
                <span className="px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">Easypaisa</span>
                <span className="px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">Visa / Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Footer Copyright */}
      <div className="border-t border-stone-800 py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} A-R Styles Couture. All Rights Reserved. Crafted with pristine artisanal luxury.</p>
        <p className="text-stone-600 text-[11px]">Nationwide & Worldwide Express Delivery</p>
      </div>
    </footer>
  );
};
