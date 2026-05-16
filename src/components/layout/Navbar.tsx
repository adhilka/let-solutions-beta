import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useGlobalSettings();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'Admissions', href: '/admissions' },
    { label: 'Feedbacks', href: '/feedbacks' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const logoUrl = settings?.branding?.logoUrl || "https://i.ibb.co/SXRGw6x8/logo.png";
  const instituteName = settings?.branding?.instituteName || "Let Solutions";

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full h-16 transition-all duration-300 border-b',
        isHome
          ? isScrolled 
            ? 'bg-white/80 backdrop-blur-md border-[var(--color-border)] shadow-sm' 
            : 'bg-white/30 backdrop-blur-md border-transparent text-slate-900 shadow-none'
          : isScrolled
            ? 'bg-white/95 backdrop-blur-sm border-[var(--color-border)] shadow-sm'
            : 'bg-white border-[var(--color-border)]'
      )}
    >
      <div className="container-wide h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt={instituteName} className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="font-body font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/admissions" className="btn-primary">
            Enroll Now
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-[var(--color-text-primary)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-[var(--color-border)] shadow-lg md:hidden">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="font-body font-medium text-lg text-[var(--color-text-primary)] py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admissions"
              className="btn-primary block text-center w-full mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Enroll Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
