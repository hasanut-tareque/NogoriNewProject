import { useState, useEffect } from 'react';
import { ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from '@/hooks/useRouter';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const { route, navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isHome = route.path === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [route.path]);

  const navBase = isHome && !scrolled && !mobileOpen
    ? 'bg-transparent text-white'
    : 'bg-white text-stone-900 shadow-sm';

  const logoClass = isHome && !scrolled && !mobileOpen
    ? 'text-white'
    : 'text-stone-900';

  const iconClass = isHome && !scrolled && !mobileOpen
    ? 'text-white hover:text-gold-300'
    : 'text-stone-600 hover:text-stone-900';

  const linkBase = 'text-sm font-medium tracking-wide uppercase transition-colors duration-200';
  const activeLinkClass = isHome && !scrolled
    ? 'text-gold-300 border-b border-gold-300'
    : 'text-gold-500 border-b border-gold-500';

  const navLinks = [
    { label: 'Home', href: '#/' },
    { label: 'Men', href: '#/products?category=men' },
    { label: 'Women', href: '#/products?category=women' },
    { label: 'Kids', href: '#/products?category=kids' },
    { label: 'All', href: '#/products' },
  ];

  const isActiveLink = (href: string) => {
    if (href === '#/') return route.path === '/';
    if (href.includes('category=men')) return route.path === '/products' && route.query.category === 'men';
    if (href.includes('category=women')) return route.path === '/products' && route.query.category === 'women';
    if (href.includes('category=kids')) return route.path === '/products' && route.query.category === 'kids';
    if (href === '#/products') return route.path === '/products' && !route.query.category;
    return false;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBase}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => navigate('#/')} className={`font-display text-2xl lg:text-3xl font-bold tracking-widest uppercase ${logoClass} transition-colors duration-300`}>
            Nogori
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className={`${linkBase} pb-0.5 ${isActiveLink(link.href) ? activeLinkClass : iconClass}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3">
            {/* User Menu */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className={`flex items-center gap-1 p-2 rounded-full transition-colors ${iconClass}`}
              >
                <User size={20} />
                {user && <ChevronDown size={14} />}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white shadow-xl border border-cream-300 animate-fade-in">
                  {user ? (
                    <>
                      <button onClick={() => navigate('#/account')} className="block w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-cream-100 transition-colors">
                        My Account
                      </button>
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-cream-300">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button onClick={() => navigate('#/auth')} className="block w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-cream-100 transition-colors">
                      Sign In / Register
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => navigate('#/cart')}
              className={`relative p-2 rounded-full transition-colors ${iconClass}`}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-400 text-stone-900 text-[10px] font-bold flex items-center justify-center rounded-full">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={`lg:hidden p-2 rounded-full transition-colors ${iconClass}`}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-cream-300 animate-fade-in">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="py-3 text-sm font-medium tracking-wide uppercase text-stone-700 hover:text-stone-900 border-b border-cream-200 last:border-0"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 mt-2 border-t border-cream-200 flex flex-col gap-1">
              {user ? (
                <>
                  <a href="#/account" className="py-3 text-sm font-medium text-stone-700">My Account</a>
                  <button onClick={signOut} className="text-left py-3 text-sm font-medium text-red-600">Sign Out</button>
                </>
              ) : (
                <a href="#/auth" className="py-3 text-sm font-medium text-stone-700">Sign In / Register</a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
