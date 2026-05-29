import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, Star, Award, PenLine, Image as ImageIcon, Settings, LogOut, Menu, X, Users, Info, Layout, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';
import SEO from '../SEO';

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useGlobalSettings();

  const instituteName = settings?.branding?.instituteName || "Let Solutions";

  interface NavItem {
    label: string;
    icon: any;
    href: string;
    badge?: string | number;
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Home Page', icon: Layout, href: '/admin/home' },
    { label: 'Courses', icon: BookOpen, href: '/admin/courses' },
    { label: 'Enquiries', icon: MessageSquare, href: '/admin/enquiries' },
    { label: 'Blog Posts', icon: PenLine, href: '/admin/posts' },
    { label: 'Feedbacks', icon: Star, href: '/admin/testimonials' },
    { label: 'Gallery', icon: ImageIcon, href: '/admin/gallery' },
    { label: 'About Page', icon: Info, href: '/admin/about' },
    { label: 'Offers', icon: Award, href: '/admin/offers' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  /*
  const handleLogout = async () => {
    await signOut(authA);
    window.location.href = '/login';
  };
  */

  return (
    <div className="flex bg-[var(--color-surface)] min-h-screen">
      <SEO title="Admin Panel" noindex />
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-primary-900)] text-white fixed h-full shrink-0 overflow-y-auto border-r border-white/5 scrollbar-hide">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={settings?.branding?.logoUrl || "https://i.ibb.co/DDmJMDzP/1000107715.png"} alt={instituteName} className="h-8 w-auto brightness-0 invert" />
            <span className="font-display font-bold text-lg tracking-tight text-white">{instituteName.split(' ')[0]}. Admin</span>
          </Link>
        </div>
        
        <nav className="flex-grow py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-6 h-12 text-sm font-medium transition-colors hover:bg-[var(--color-primary-700)]",
                    location.pathname === item.href && "bg-[var(--color-primary-600)] border-l-4 border-[var(--color-primary-200)] px-5"
                  )}
                >
                  <item.icon size={20} className={location.pathname === item.href ? "text-white" : "text-[var(--color-primary-200)]"} />
                  <span className={location.pathname === item.href ? "text-white" : "text-[var(--color-primary-100)]"}>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-[var(--color-error)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button className="flex items-center gap-3 px-2 h-10 w-full text-sm font-medium text-[var(--color-primary-200)] hover:text-white transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Universal Header (Mobile & Desktop) */}
        <header className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-[var(--color-text-secondary)]">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <h1 className="font-display font-medium text-white hidden md:block uppercase tracking-wider text-xs opacity-50 underline decoration-[var(--color-primary-500)] underline-offset-4">Workspace Control</h1>
            <Link to="/admin" className="font-display font-bold md:hidden text-white">Admin Hub</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary-900)] rounded-lg transition-all font-medium text-sm border border-transparent hover:border-[var(--color-primary-800)]"
              title="Go to Live Site"
            >
              <ExternalLink size={18} />
              <span className="hidden sm:inline">View Site</span>
            </Link>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
           <div className="md:hidden fixed inset-0 top-16 bg-black/50 z-40">
             <div className="w-64 bg-[var(--color-primary-900)] h-full ml-auto">
               <nav className="py-4 h-full flex flex-col">
                  <ul className="space-y-1">
                    {navItems.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-6 h-12 text-sm font-medium text-[var(--color-primary-100)] hover:bg-[var(--color-primary-700)] hover:text-white"
                        >
                          <item.icon size={20} className="text-[var(--color-primary-200)]" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
               </nav>
             </div>
           </div>
        )}

        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
