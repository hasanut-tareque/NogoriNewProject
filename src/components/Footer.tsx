import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h2 className="font-display text-3xl font-bold text-white tracking-widest uppercase mb-4">Nogori</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Urban fashion crafted for the modern soul. Premium clothing for Men, Women & Kids — where style meets culture.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-gold-400 hover:text-stone-900 transition-all duration-200">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Shop</h3>
            <ul className="space-y-3">
              {[
                { label: "Men's Collection", href: '#/products?category=men' },
                { label: "Women's Collection", href: '#/products?category=women' },
                { label: "Kids' Collection", href: '#/products?category=kids' },
                { label: 'New Arrivals', href: '#/products?filter=new' },
                { label: 'Sale', href: '#/products?filter=sale' },
              ].map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-stone-400 text-sm hover:text-gold-300 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Help</h3>
            <ul className="space-y-3">
              {['Size Guide', 'Shipping Policy', 'Return Policy', 'Track Order', 'FAQ'].map(item => (
                <li key={item}>
                  <span className="text-stone-400 text-sm hover:text-gold-300 transition-colors duration-200 cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-stone-400">
                <MapPin size={16} className="text-gold-400 mt-0.5 shrink-0" />
                <span>123 Fashion Street, Gulshan-1, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-stone-400">
                <Phone size={16} className="text-gold-400 shrink-0" />
                <span>+880 1700 000000</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-stone-400">
                <Mail size={16} className="text-gold-400 shrink-0" />
                <span>hello@nogori.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">© 2026 Nogori. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map(t => (
              <span key={t} className="text-stone-500 text-sm hover:text-stone-300 cursor-pointer transition-colors">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
