import React from 'react';
import { 
  Type, 
  Palette, 
  MousePointer2, 
  CheckSquare, 
  AlertTriangle, 
  Layout, 
  Box, 
  Layers,
  ChevronRight,
  Search,
  Mail,
  User,
  ArrowRight,
  Star,
  Clock,
  BookOpen,
  MapPin,
  Calendar,
  Share2,
  MoreVertical,
  ExternalLink,
  Github,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';

export default function DesignSystemPage() {
  const SectionHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="mb-12 border-b border-slate-200 pb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Icon size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900">{title}</h2>
      </div>
      <p className="text-slate-600 text-lg">{description}</p>
    </div>
  );

  const Swatch = ({ name, hex, variable }: { name: string, hex: string, variable: string }) => (
    <div className="group space-y-2">
      <div 
        className="h-24 w-full rounded-2xl shadow-sm border border-slate-200 transition-transform group-hover:scale-[1.02]" 
        style={{ backgroundColor: `var(${variable})` }} 
      />
      <div>
        <h4 className="font-semibold text-slate-900 text-sm">{name}</h4>
        <p className="text-slate-500 text-xs font-mono">{variable}</p>
        <p className="text-slate-400 text-xs uppercase">{hex}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title="Design System | Let Solutions" noindex />
      
      {/* Sidebar / Navigation (Simulated) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-16">
          <h1 className="text-5xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">
            Design <span className="text-blue-600">System</span>
          </h1>
          <p className="text-slate-600 text-xl max-w-2xl leading-relaxed">
            The visual language and comprehensive UI patterns powering Let Solutions. 
            Used for maintaining architectural consistency across the platform.
          </p>
        </header>

        {/* 1. Typography */}
        <section id="typography" className="mb-24">
          <SectionHeader 
            icon={Type} 
            title="Typography" 
            description="Our primary font pairings: Plus Jakarta Sans for display and DM Sans for body content."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 block">Headings (Display)</span>
                <div className="space-y-4">
                  <h1 className="text-6xl font-extrabold">Heading 1 - 6xl</h1>
                  <h2 className="text-5xl font-bold">Heading 2 - 5xl</h2>
                  <h3 className="text-4xl font-bold">Heading 3 - 4xl</h3>
                  <h4 className="text-3xl font-bold">Heading 4 - 3xl</h4>
                  <h5 className="text-2xl font-bold">Heading 5 - 2xl</h5>
                  <h6 className="text-xl font-bold">Heading 6 - xl</h6>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 block">Body & UI</span>
                <div className="space-y-6">
                  <p className="text-xl text-slate-700">Large body text (text-xl) - Ideal for intro paragraphs and feature highlights.</p>
                  <p className="text-lg text-slate-600">Standard body text (text-lg) - Used for primary content sections for readability.</p>
                  <p className="text-base text-slate-600 uppercase font-semibold tracking-wide">Small Caps Label (text-base)</p>
                  <p className="text-sm text-slate-500">Secondary information (text-sm) - Used for metadata, captions, and fine print.</p>
                  <p className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">Monospace Variant (text-xs) - Used for code, data, and technical info.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Colors */}
        <section id="colors" className="mb-24">
          <SectionHeader 
            icon={Palette} 
            title="Colors" 
            description="Our semantic palette ensures accessibility and emotional resonance."
          />
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-bold mb-6">Primary Blue</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <Swatch name="50" hex="#EFF6FF" variable="--color-primary-50" />
                <Swatch name="100" hex="#DBEAFE" variable="--color-primary-100" />
                <Swatch name="200" hex="#BFDBFE" variable="--color-primary-200" />
                <Swatch name="400" hex="#60A5FA" variable="--color-primary-400" />
                <Swatch name="500" hex="#3B82F6" variable="--color-primary-500" />
                <Swatch name="600" hex="#2563EB" variable="--color-primary-600" />
                <Swatch name="700" hex="#1D4ED8" variable="--color-primary-700" />
                <Swatch name="900" hex="#1E3A8A" variable="--color-primary-900" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-6">Neutrals</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <Swatch name="Surface" hex="#F8FAFF" variable="--color-surface" />
                  <Swatch name="Surface Alt" hex="#EEF3FB" variable="--color-surface-alt" />
                  <Swatch name="Border" hex="#D1E3FF" variable="--color-border" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6">Semantic</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <Swatch name="Success" hex="#16A34A" variable="--color-success" />
                  <Swatch name="Warning" hex="#D97706" variable="--color-warning" />
                  <Swatch name="Error" hex="#DC2626" variable="--color-error" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section id="buttons" className="mb-24">
          <SectionHeader 
            icon={MousePointer2} 
            title="Buttons" 
            description="Primary and secondary call-to-actions for user intent."
          />
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-400 uppercase block">Primary</span>
                <button className="btn-primary w-full">Primary Button</button>
                <button className="btn-primary w-full opacity-50 cursor-not-allowed">Disabled Primary</button>
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  Icon Left <ArrowRight size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-400 uppercase block">Secondary</span>
                <button className="btn-secondary w-full">Secondary Button</button>
                <button className="btn-secondary w-full opacity-50 cursor-not-allowed">Disabled Secondary</button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Mail size={18} /> Icon Left
                </button>
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-400 uppercase block">Ghost</span>
                <button className="btn-ghost px-4 py-2 block">Ghost Button</button>
                <button className="btn-ghost px-4 py-2 opacity-50 block">Disabled Ghost</button>
                <button className="btn-ghost px-4 py-2 flex items-center gap-2">
                  Learn More <ChevronRight size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono text-slate-400 uppercase block">Special States</span>
                <button className="relative overflow-hidden group btn-primary w-full shadow-lg shadow-blue-200">
                  <span className="relative z-10">Animated Hover</span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                </button>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 w-full">
                  Rounded Pill
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Form Components */}
        <section id="forms" className="mb-24">
          <SectionHeader 
            icon={CheckSquare} 
            title="Form Components" 
            description="Consistent inputs for collecting user data and admissions."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Standard Input</label>
                <input className="input" placeholder="Type something..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Icon Input</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input pl-11" placeholder="Search resources..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Error State</label>
                <input className="input error" defaultValue="Invalid email address" />
                <p className="text-xs text-red-600">Please enter a valid email.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Select</label>
                  <select className="input">
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Checkbox</label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">Agree to terms</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Textarea</label>
                <textarea className="input min-h-[160px]" placeholder="Tell us more about your background..."></textarea>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                    <Github size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">GitHub Attachment</h4>
                    <p className="text-xs text-slate-500">Repository link verified</p>
                  </div>
                  <button className="ml-auto text-blue-600 text-xs font-bold">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Alerts & Feedback */}
        <section id="feedback" className="mb-24">
          <SectionHeader 
            icon={AlertTriangle} 
            title="Alerts & Feedback" 
            description="Status indicators for system events and user actions."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-start gap-3">
              <Award className="shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm">Success State</h4>
                <p className="text-xs opacity-90">Your application has been submitted successfully.</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm">Warning Message</h4>
                <p className="text-xs opacity-90">Please verify your phone number before continuing.</p>
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm">Error Notification</h4>
                <p className="text-xs opacity-90">Connection failed. Please check your internet.</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl flex items-start gap-3">
              <Box className="shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm">Info Capsule</h4>
                <p className="text-xs opacity-90">New technical batch starts on June 1st.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Card Patterns */}
        <section id="cards" className="mb-24">
          <SectionHeader 
            icon={Layout} 
            title="Card Patterns" 
            description="Structural containers for our primary entities: Courses and Articles."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card Example */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1540339832862-47459980783f?q=80&w=800&auto=format&fit=crop" 
                  alt="Pattern Example" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] uppercase font-extrabold px-2 py-1 rounded-md tracking-wider">
                  Popular
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Course Card Title Example</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">A brief description of the course content and learning outcomes for the students.</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} /> <span>3 Months</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">₹15,000</div>
                </div>
              </div>
            </div>

            {/* Blog Post Example */}
            <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm group">
              <div className="aspect-[16/9] bg-slate-100 rounded-2xl mb-4 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1544244015-0cd4b3ff0797?q=80&w=800&auto=format&fit=crop" 
                  alt="Blog" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 pb-4">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Education</span>
                  <span className="text-xs text-slate-400">May 15, 2024</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">How Chip-Level Repairing is Changing the Tech Landscape</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                  <span className="text-sm font-semibold text-slate-700">Admin Team</span>
                </div>
              </div>
            </div>

            {/* Testimonial Example */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-lg relative h-fit">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Layers size={24} />
              </div>
              <div className="flex gap-1 text-amber-400 mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <p className="text-slate-700 italic mb-8 leading-relaxed">
                "The training here is exceptional. I went from having zero knowledge of electronics to being a confident smartphone technician in just 3 months."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900">Muhammed Shafeer</h4>
                  <p className="text-xs text-slate-500">Alumni, 2023 Batch</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Advanced UI Components */}
        <section id="advanced" className="mb-24">
          <SectionHeader 
            icon={Layers} 
            title="Advanced Components" 
            description="Complex interactive components used for specialized tasks."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Rich Text Style Preview */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Editor Content Style</h3>
              <div className="prose prose-slate max-w-none">
                <p>This is how content from the <strong>TipTap Editor</strong> appears on the live site. It supports <em>formatting</em>, <a href="#">links</a>, and more.</p>
                <ul className="list-disc pl-5">
                  <li>Technical module updates</li>
                  <li>Industrial standards</li>
                </ul>
                <blockquote>"Practical training is the key to mastering electronics."</blockquote>
              </div>
            </div>
            {/* Modal/Overlay Preview */}
            <div className="bg-slate-900 p-8 rounded-3xl text-white">
              <h3 className="text-xl font-bold mb-6">Dark Theme / Overlays</h3>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <h4 className="font-bold mb-2">Confirmation Required</h4>
                  <p className="text-sm text-slate-400 mb-4">Are you sure you want to delete this course? This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold">Delete</button>
                    <button className="px-4 py-2 bg-white/10 rounded-lg text-sm font-bold">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Icons & UI Elements */}
        <section id="elements" className="mb-24">
          <SectionHeader 
            icon={Box} 
            title="UI Elements" 
            description="Micro-components and icon sets used throughout the application."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layers className="text-blue-600" size={20} /> Icons (Lucide)
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {[CheckSquare, Mail, User, Star, Clock, MapPin, Calendar, Share2, MoreVertical, ExternalLink].map((Icon, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                    <Icon size={20} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Box className="text-blue-600" size={20} /> Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Primary</span>
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">Dark</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Available</span>
                <span className="px-3 py-1 border border-slate-200 text-slate-500 text-xs font-bold rounded-full">Outline</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Sale</span>
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layers className="text-blue-600" size={20} /> Shadow Tiers
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center text-xs text-slate-400">shadow-sm</div>
                <div className="h-20 bg-white rounded-xl shadow-md border border-slate-50 flex items-center justify-center text-xs text-slate-400">shadow-md</div>
                <div className="h-20 bg-white rounded-xl shadow-lg border border-slate-50 flex items-center justify-center text-xs text-slate-400">shadow-lg</div>
                <div className="h-20 bg-white rounded-xl shadow-xl border border-slate-50 flex items-center justify-center text-xs text-slate-400">shadow-xl</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer info for Design System */}
        <footer className="mt-32 pt-12 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
            End of Visual Specifications
          </p>
        </footer>
      </div>
    </div>
  );
}
