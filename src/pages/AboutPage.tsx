import { useQuery } from '@tanstack/react-query';
import { Users, Target, ShieldCheck, MapPin } from 'lucide-react';
import { fetchAboutData } from '../lib/api';
import { FAILSAFE_ABOUT } from '../constants/failsafe';
import SEO from '../components/SEO';

export default function AboutPage() {
  const { data: aboutDataRaw } = useQuery({
    queryKey: ['about-data'],
    queryFn: fetchAboutData,
    initialData: FAILSAFE_ABOUT
  });

  const about = aboutDataRaw || FAILSAFE_ABOUT;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://letsolutions.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Us",
        "item": "https://letsolutions.in/about"
      }
    ]
  };

  return (
    <>
      <SEO 
        title="About Let Solutions | Premier Technical Training Center in Tirur"
        description="Learn about Let Solutions, Tirur's leading technical institute. We provide industry-standard training in smartphone repair, laptop technology, and security systems since inception."
        keywords="about let solutions, technical institute tirur, vocational training malappuram history, let solutions leadership, tech training mission kerala"
        canonical="/about"
        structuredData={breadcrumbSchema}
      />

      {/* Hero */}
      <section className="bg-[var(--color-surface)] py-20 md:py-32 relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full text-[var(--color-text-primary)]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
           </svg>
        </div>
        <div className="container-wide px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-[var(--color-text-primary)] drop-shadow-[0_0_15px_rgba(0,255,156,0.3)]">{about.hero.title}</h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] leading-relaxed max-w-3xl mx-auto">
            {about.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-32 bg-[var(--color-surface-alt)]">
        <div className="container-wide px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">{about.story.title}</h2>
            <div className="prose prose-invert text-[var(--color-text-secondary)] space-y-4 text-lg">
              {about.story.content.map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {about.story.images.slice(0, 2).map((img: string, i: number) => (
              <img 
                key={i}
                src={img} 
                alt={`About page visual ${i + 1}`} 
                className={`w-full aspect-[4/5] object-cover rounded-[var(--radius-xl)] opacity-80 hover:opacity-100 transition-opacity border border-[var(--color-border)] ${i === 1 ? 'translate-y-8' : ''}`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 md:py-32 bg-[var(--color-surface)]">
        <div className="container-wide px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-[var(--color-surface-alt)] p-10 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-lg hover:border-[var(--color-text-primary)]/30 transition-all group">
            <div className="w-16 h-16 bg-[var(--color-text-primary)]/10 text-[var(--color-text-primary)] rounded-[var(--radius-xl)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">{about.vision.title}</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {about.vision.content}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] text-white p-10 rounded-[var(--radius-2xl)] shadow-xl relative overflow-hidden group">
             <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
               <ShieldCheck size={180} className="transform translate-x-1/4 -translate-y-1/4" />
             </div>
             <div className="relative z-10 text-white">
               <div className="w-16 h-16 bg-white/20 text-white rounded-[var(--radius-xl)] flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{about.mission.title}</h3>
              <p className="text-blue-50 leading-relaxed font-medium">
                {about.mission.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-[var(--color-surface-alt)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">Faculty & Leadership</h2>
            <p className="text-[var(--color-text-secondary)]">Guided by experts committed to your success.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {about.leadership.map((member: any, i: number) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left bg-[var(--color-surface)] p-6 border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm hover:border-[var(--color-text-primary)]/20 transition-all">
                <div className="w-32 h-32 bg-[var(--color-surface-alt)] rounded-full shrink-0 overflow-hidden border border-[var(--color-border)]">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover opacity-80" />
                  ) : null}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--color-text-primary)]">{member.name}</h4>
                  <div className="text-[var(--color-text-secondary)] font-bold mb-3">{member.role}</div>
                  <p className="text-sm text-[var(--color-text-tertiary)]">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
