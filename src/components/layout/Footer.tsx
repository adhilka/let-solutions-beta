import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Linkedin, Facebook, Youtube } from 'lucide-react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';

export default function Footer() {
  const { settings } = useGlobalSettings();

  const logoUrl = settings?.branding?.logoUrl || "https://i.ibb.co/DDmJMDzP/1000107715.png";
  const instituteName = settings?.branding?.instituteName || "Let Solutions";
  const tagline = settings?.branding?.tagline || "A Ray of Hope For Your Future. Empowering the next generation of technicians through accessible, high-end technical education.";
  const contact = settings?.contact || {
    email: 'info@letsolutions.in',
    phone: '+91 95628 54444',
    whatsapp: '919562854444',
    address: '1st Floor, Bus Stand Building, Tirur, Malappuram (Dist), Kerala, India - 676101'
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-[var(--color-border)]">
      <div className="container-wide px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Col */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoUrl} alt={instituteName} className="h-12 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-blue-200 text-sm mb-6 leading-relaxed">
              {tagline}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/letsolutionstirur?igsh=d285MjcybDk0YWtw" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-blue-400 flex items-center justify-center hover:bg-blue-600 hover:border-transparent transition-all text-white">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-blue-400 flex items-center justify-center hover:bg-blue-600 hover:border-transparent transition-all text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-blue-400 flex items-center justify-center hover:bg-blue-600 hover:border-transparent transition-all text-white">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-blue-400 flex items-center justify-center hover:bg-blue-600 hover:border-transparent transition-all text-white">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-blue-200 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link to="/courses" className="text-blue-200 hover:text-white transition-colors text-sm">Courses</Link></li>
              <li><Link to="/admissions" className="text-blue-200 hover:text-white transition-colors text-sm">Admissions</Link></li>
              <li><Link to="/blog" className="text-blue-200 hover:text-white transition-colors text-sm">Tech Blog</Link></li>
              <li><Link to="/about" className="text-blue-200 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-blue-200 hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-white">Our Courses</h3>
            <ul className="space-y-3">
              <li><Link to="/courses?cat=laptop-chip-level" className="text-blue-200 hover:text-white transition-colors text-sm">Laptop chip Level</Link></li>
              <li><Link to="/courses?cat=mobile-chip-level" className="text-blue-200 hover:text-white transition-colors text-sm">Mobile chip Level</Link></li>
              <li><Link to="/courses?cat=computer-hardware" className="text-blue-200 hover:text-white transition-colors text-sm">Computer Hardware</Link></li>
              <li><Link to="/courses?cat=electronics" className="text-blue-200 hover:text-white transition-colors text-sm">Electronics</Link></li>
              <li><Link to="/courses?cat=ethical-hacking" className="text-blue-200 hover:text-white transition-colors text-sm">Ethical Hacking</Link></li>
              <li><Link to="/courses?cat=cctv" className="text-blue-200 hover:text-white transition-colors text-sm">Cctv</Link></li>
              <li><Link to="/courses?cat=networking" className="text-blue-200 hover:text-white transition-colors text-sm">Networking</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <span className="text-blue-200 text-sm whitespace-pre-line">
                  {contact.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-blue-400 shrink-0" size={18} />
                <a href={`tel:${contact.phone}`} className="text-blue-200 hover:text-white transition-colors text-sm">{contact.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-blue-400 shrink-0" size={18} />
                <a href={`mailto:${contact.email}`} className="text-blue-200 hover:text-white transition-colors text-sm">{contact.email}</a>
              </li>
            </ul>
            <div className="mt-6">
              <a href={`https://wa.me/${contact.whatsapp}?text=Hi,%20I'm%20interested%20in%20your%20courses`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#20BE5A] transition-colors">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Certifications and Affiliations */}
        <div className="border-t border-white/10 mt-12 pt-10 pb-2">
          <div className="flex flex-col items-center justify-center">
            <h4 className="text-blue-300/50 text-xs font-bold uppercase tracking-widest mb-6">Recognitions & Certifications</h4>
            
            {/* First one displayed singly and slightly larger */}
            <div className="w-full flex justify-center mb-8">
              <div className="bg-white p-5 sm:p-8 rounded-xl shadow-lg border border-white/20 max-w-[98%] sm:max-w-[720px] md:max-w-[850px] lg:max-w-[950px] flex items-center justify-center transition-all hover:shadow-xl hover:scale-[1.01]">
                <img 
                  src="https://i.ibb.co/b5bf0s8L/1000110355-removebg-preview.png" 
                  alt="National Board Certificate" 
                  className="h-36 sm:h-48 md:h-60 lg:h-72 xl:h-80 w-auto object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Other two side-by-side underneath */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 px-4">
              <img 
                src="https://i.ibb.co/Bd7kdjp/1000110356-removebg-preview.png" 
                alt="Affiliation Authority" 
                className="h-14 sm:h-16 md:h-18 w-auto object-contain max-w-[100px] sm:max-w-[130px] md:max-w-[150px]" 
                referrerPolicy="no-referrer"
              />
              <img 
                src="https://i.ibb.co/HfgsJG55/1000110359-removebg-preview.png" 
                alt="ISO Certification Seal" 
                className="h-14 sm:h-16 md:h-18 w-auto object-contain max-w-[100px] sm:max-w-[130px] md:max-w-[150px]" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-blue-200 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} {instituteName}. All rights reserved.
            </p>
            <p className="text-blue-200/60 text-sm">
              Build By <a href="https://www.instagram.com/axhilxif" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/90 hover:text-white transition-colors">Muhammed Adhil</a>
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-blue-200 hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-blue-200 hover:text-white transition-colors text-sm">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
