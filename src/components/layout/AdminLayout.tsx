import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, Star, Award, PenLine, Image as ImageIcon, Settings, LogOut, Menu, X, Users, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';

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
    { label: 'Courses', icon: BookOpen, href: '/admin/courses' },
    { label: 'Enquiries', icon: MessageSquare, href: '/admin/enquiries' },
    { label: 'Blog Posts', icon: PenLine, href: '/admin/posts' },
    { label: 'Feedbacks', icon: Star, href: '/admin/testimonials' },
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
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-primary-900)] text-white fixed h-full shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={settings?.branding?.logoUrl || "https://i.ibb.co/Q705yK0d/logo-only.png"} alt={instituteName} className="h-8 w-auto brightness-0 invert" />
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
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-[var(--color-border)] h-16 flex items-center justify-between px-4 sticky top-0 z-50">
          <Link to="/admin" className="font-display font-bold">Admin Panel</Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
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
