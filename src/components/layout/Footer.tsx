import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Linkedin, Facebook, Youtube } from 'lucide-react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';

export default function Footer() {
  const { settings } = useGlobalSettings();

  const logoUrl = settings?.branding?.logoUrl || "https://i.ibb.co/SXRGw6x8/logo.png";
  const instituteName = settings?.branding?.instituteName || "Let Solutions";
  const tagline = settings?.branding?.tagline || "A Ray of Hope For Your Future. Empowering the next generation of technicians through accessible, high-end technical education.";
  const contact = settings?.contact || {
    email: 'info@letsolutions.in',
    phone: '+91 95628 54444',
    whatsapp: '919562854444',
    address: '1st Floor, Bus Stand Building, Tirur, Malappuram (Dist), Kerala, India - 676101'
  };

  return (
    <footer className="bg-[var(--color-primary-900)] text-white pt-16 pb-8">
      <div className="container-wide px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Col */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoUrl} alt={instituteName} className="h-12 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-[var(--color-primary-200)] text-sm mb-6 leading-relaxed">
              {tagline}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/letsolutionstirur?igsh=d285MjcybDk0YWtw" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-[var(--color-primary-400)] flex items-center justify-center hover:bg-[var(--color-primary-600)] hover:border-transparent transition-all text-white">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-[var(--color-primary-400)] flex items-center justify-center hover:bg-[var(--color-primary-600)] hover:border-transparent transition-all text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-[var(--color-primary-400)] flex items-center justify-center hover:bg-[var(--color-primary-600)] hover:border-transparent transition-all text-white">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-[var(--color-primary-400)] flex items-center justify-center hover:bg-[var(--color-primary-600)] hover:border-transparent transition-all text-white">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link to="/courses" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Courses</Link></li>
              <li><Link to="/admissions" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Admissions</Link></li>
              <li><Link to="/blog" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Tech Blog</Link></li>
              <li><Link to="/about" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Our Courses</h3>
            <ul className="space-y-3">
              <li><Link to="/courses?cat=laptop-chip-level" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Laptop Chip-Level</Link></li>
              <li><Link to="/courses?cat=mobile-chip-level" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Mobile Chip-Level</Link></li>
              <li><Link to="/courses?cat=hardware" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Hardware Setup</Link></li>
              <li><Link to="/courses?cat=software" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Software Training</Link></li>
              <li><Link to="/courses?cat=cctv" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">CCTV Installation</Link></li>
              <li><Link to="/courses?cat=networking" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Networking</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-[var(--color-primary-400)] shrink-0 mt-0.5" size={18} />
                <span className="text-[var(--color-primary-200)] text-sm whitespace-pre-line">
                  {contact.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[var(--color-primary-400)] shrink-0" size={18} />
                <a href={`tel:${contact.phone}`} className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">{contact.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[var(--color-primary-400)] shrink-0" size={18} />
                <a href={`mailto:${contact.email}`} className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">{contact.email}</a>
              </li>
            </ul>
            <div className="mt-6">
              <a href={`https://wa.me/${contact.whatsapp}?text=Hi,%20I'm%20interested%20in%20your%20courses`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#20BE5A] transition-colors">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-primary-200)] text-sm">
            &copy; {new Date().getFullYear()} {instituteName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-[var(--color-primary-200)] hover:text-white transition-colors text-sm">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
