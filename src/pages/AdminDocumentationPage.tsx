import React from 'react';
import { 
  Book, 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Users, 
  MessageSquare, 
  Settings, 
  Search, 
  Globe, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Eye,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import SEO from '../components/SEO';

export default function AdminDocumentationPage() {
  const NavItem = ({ icon: Icon, title, href }: { icon: any, title: string, href: string }) => (
    <a 
      href={href} 
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 hover:text-blue-600 font-medium"
    >
      <Icon size={18} />
      <span>{title}</span>
    </a>
  );

  const DocSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
    <section id={id} className="mb-20 scroll-mt-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <Icon size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900">{title}</h2>
      </div>
      <div className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-blue-600 prose-strong:text-slate-900">
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Admin Documentation | Let Solutions" noindex />
      
      {/* Header */}
      <header className="bg-slate-900 text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <Book size={20} />
            <span className="uppercase tracking-widest text-xs font-bold">Official Resource</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
            Admin <span className="text-blue-400">Manual</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            The comprehensive guide for managing the Let Solutions technical platform. 
            Learn how to manage courses, blogs, students, and overall site configuration.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Nav */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Topics</p>
              <NavItem icon={ShieldCheck} title="Authentication" href="#auth" />
              <NavItem icon={LayoutDashboard} title="Dashboard" href="#dashboard" />
              <NavItem icon={BookOpen} title="Courses" href="#courses" />
              <NavItem icon={FileText} title="Blog & News" href="#blog" />
              <NavItem icon={ImageIcon} title="Gallery" href="#gallery" />
              <NavItem icon={Users} title="Admissions" href="#admissions" />
              <NavItem icon={MessageSquare} title="Testimonials" href="#testimonials" />
              <NavItem icon={Settings} title="Settings" href="#settings" />
              <NavItem icon={Search} title="SEO Guide" href="#seo" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* 1. Authentication */}
            <DocSection id="auth" title="Authentication & Security" icon={ShieldCheck}>
              <p>
                Access to the administration panel is restricted to authorized personnel. 
                The system uses a persistent sessions mechanism to keep you logged in.
              </p>
              <ul>
                <li><strong>Access URL:</strong> <code>/admin/login</code></li>
                <li><strong>Login Credentials:</strong> Managed via the secure administrative backend.</li>
                <li><strong>Session Expiry:</strong> Sessions remain active for 7 days unless manually logged out.</li>
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
                <div className="flex gap-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-sm text-amber-800 m-0">
                    Never share your login credentials. If you suspect unauthorized access, contact the system administrator immediately to reset passwords.
                  </p>
                </div>
              </div>
            </DocSection>

            {/* 2. Dashboard */}
            <DocSection id="dashboard" title="Dashboard Overview" icon={LayoutDashboard}>
              <p>
                The Dashboard provides an at-a-glance view of your institute's digital activity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <h4 className="flex items-center gap-2 font-bold mb-2 m-0"><Users size={16}/> Student Enquiries</h4>
                  <p className="text-sm m-0">Shows recent admission applications that need review.</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <h4 className="flex items-center gap-2 font-bold mb-2 m-0"><FileText size={16}/> Content Stats</h4>
                  <p className="text-sm m-0">Count of active courses, blog posts, and gallery images.</p>
                </div>
              </div>
            </DocSection>

            {/* 3. Courses */}
            <DocSection id="courses" title="Course Management" icon={BookOpen}>
              <p>
                Manage the technical programs offered at Let Solutions. This is the core of site content.
              </p>
              <h3>Adding a New Course</h3>
              <ol>
                <li>Navigate to <strong>Courses</strong> in the admin menu.</li>
                <li>Click the <strong>Add New Course</strong> button.</li>
                <li>Fill in the details:
                  <ul>
                    <li><strong>Title:</strong> Full name of the course (e.g., Master Smartphone Repairing).</li>
                    <li><strong>Short Description:</strong> Appears on list pages.</li>
                    <li><strong>Content:</strong> Use the Rich Text Editor to describe modules, benefits, and tools used.</li>
                    <li><strong>Price:</strong> Set the fee or leave 0 for "Contact for Pricing".</li>
                    <li><strong>Image URL:</strong> A high-quality landscape image (16:9 recommended).</li>
                  </ul>
                </li>
                <li>Click <strong>Save Course</strong>.</li>
              </ol>
              <div className="p-4 bg-blue-50 rounded-xl text-sm italic">
                <strong>Tip:</strong> Use the "Featured" toggle to move specific courses to the top of the homepage.
              </div>
            </DocSection>

            {/* 4. Blog & News */}
            <DocSection id="blog" title="Blog & News Updates" icon={FileText}>
              <p>
                Publish technical tutorials, industry updates, and institute announcements.
              </p>
              <h3>Editor Features</h3>
              <p>Our custom editor supports:</p>
              <ul>
                <li><strong>Markdown & HTML:</strong> Headings, bold text, lists, and links.</li>
                <li><strong>Categories:</strong> Tag posts as "Repairing", "Technical", "News", etc.</li>
                <li><strong>Draft Mode:</strong> Save progress without publishing to the live site.</li>
              </ul>
              <div className="flex items-center gap-6 my-6 border p-6 rounded-2xl bg-slate-50">
                <Eye className="text-blue-600" size={32} />
                <p className="m-0 leading-relaxed"><strong>Preview Mode:</strong> Always use the preview button to see how your post looks on mobile and desktop devices before going live.</p>
              </div>
            </DocSection>

            {/* 5. Gallery */}
            <DocSection id="gallery" title="Gallery Management" icon={ImageIcon}>
              <p>
                Visual proof of our facilities and student life. Group images into categories like "Labs", "Classroom", "Events".
              </p>
              <ul>
                <li><strong>Format:</strong> JPEG or PNG preferred.</li>
                <li><strong>Size:</strong> Recommended under 500KB per image for fast loading.</li>
                <li><strong>Captions:</strong> Every image should have a descriptive caption for SEO and accessibility.</li>
              </ul>
            </DocSection>

            {/* 6. Admissions */}
            <DocSection id="admissions" title="Admissions & Leads" icon={Users}>
              <p>
                When a student fills out the Admission form or Course Inquiry, it appears here.
              </p>
              <ul>
                <li><strong>Status tracking:</strong> Mark leads as "New", "Contacted", or "Enrolled".</li>
                <li><strong>Export:</strong> You can view all contact details including WhatsApp numbers.</li>
              </ul>
            </DocSection>

            {/* 7. Settings */}
            <DocSection id="settings" title="Global Site Settings" icon={Settings}>
              <p>
                Configure the "DNA" of the website from one central hub.
              </p>
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold flex items-center gap-2 m-0 mb-2"><Smartphone size={18}/> Branding</h4>
                  <p className="text-sm">Change Logos, Favicons, Primary Colors, and the Institute name across the entire site instantly.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold flex items-center gap-2 m-0 mb-2"><Globe size={18}/> Business Info</h4>
                  <p className="text-sm">Update Phone, Email, WhatsApp, and physical Office Address used in Contact pages and Footer.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold flex items-center gap-2 m-0 mb-2"><LayoutDashboard size={18}/> Homepage Sections</h4>
                  <p className="text-sm">Edit the Hero title, descriptions, and the feature bullet points shown to first-time visitors.</p>
                </div>
              </div>
            </DocSection>

            {/* 8. SEO Guide */}
            <DocSection id="seo" title="The Admin's SEO Checklist" icon={Search}>
              <p>
                The site is heavily optimized for Tirur and Malappuram local search. Keep it that way by following these rules:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start border-b pb-4">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={18} />
                  <div>
                    <strong>Keyword Rich Titles:</strong> Instead of "Our Course", use "Smartphone Repairing Course in Tirur".
                  </div>
                </div>
                <div className="flex gap-4 items-start border-b pb-4">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={18} />
                  <div>
                    <strong>Internal Linking:</strong> In your blog posts, link to relevant Courses or the Admissions page.
                  </div>
                </div>
                <div className="flex gap-4 items-start border-b pb-4">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={18} />
                  <div>
                    <strong>Meta Descriptions:</strong> Ensure every course and blog post has a "Short Description" under 160 characters.
                  </div>
                </div>
              </div>
            </DocSection>

            <div className="mt-20 pt-10 border-t border-slate-200">
              <p className="text-slate-400 text-center text-sm font-mono uppercase tracking-widest">
                Confidential Document — For Admin Use Only
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
