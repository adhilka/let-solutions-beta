import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchCourseBySlug, fetchActiveOffers } from '../lib/api';
import { FAILSAFE_COURSES } from '../constants/courses';
import { CheckCircle, Clock, Zap, MessageSquare, ArrowLeft, ChevronRight, MonitorSmartphone, ShieldCheck, Server, Share2, Copy, Check, Award, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

import SEO from '../components/SEO';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const shareData = {
      title: course?.title || 'Let Solutions Course',
      text: course?.shortDescription || 'Check out this technical course!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const { data: serverCourse, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => fetchCourseBySlug(slug || ''),
    enabled: !!slug
  });

  const { data: offers } = useQuery({
    queryKey: ['active-offers-all'],
    queryFn: fetchActiveOffers,
  });

  const course = serverCourse || FAILSAFE_COURSES.find(c => c.slug === slug);

  // Find the pinned offer if available
  const pinnedOffer = course?.pinnedOfferId && offers 
    ? offers.find((o: any) => o.id === course.pinnedOfferId) 
    : null;

  // Structured Data for Course & Breadcrumbs
  const detailSchemas = course ? [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.shortDescription,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Let Solutions Technical Institute",
        "sameAs": "https://letsolutions.in",
        "url": "https://letsolutions.in",
        "logo": "https://i.ibb.co/SXRGw6x8/logo.png"
      },
      "image": course.imageUrl,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": course.price > 0 ? course.price : undefined,
        "availability": "https://schema.org/InStock"
      }
    },
    {
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
          "name": "Courses",
          "item": "https://letsolutions.in/courses"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": course.title,
          "item": `https://letsolutions.in/courses/${course.slug}`
        }
      ]
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-surface)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-text-primary)]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-secondary)] px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold mb-4 text-[var(--color-text-primary)]">Course Not Found</h1>
            <p className="mb-8 text-lg">The course you are looking for does not exist or has been moved. Check out our other popular programs below.</p>
            <Link to="/courses" className="btn-primary">View All Courses</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FAILSAFE_COURSES.slice(0, 3).map((c) => (
              <Link key={c.id} to={`/courses/${c.slug}`} className="group bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="aspect-video relative overflow-hidden">
                  <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-[var(--color-text-primary)] group-hover:underline transition-colors">{c.title}</h3>
                  <p className="text-[var(--color-text-tertiary)] text-sm line-clamp-2">{c.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const defaultHighlights = [
    '100% Practical Training',
    'Live Projects & Industry Cases',
    'Internship Opportunities',
    'Job Placement Assistance',
    'Latest Tools & Equipment',
    'Certification of Completion'
  ];

  const highlights = (course.highlights && course.highlights.length > 0) ? course.highlights : defaultHighlights;

  return (
    <>
      <SEO 
        title={`${course.title} | Technical Training Course in Tirur`}
        description={course.shortDescription}
        keywords={`${course.title.toLowerCase()}, technician course kerala, vocational training Tirur, ${course.category} training`}
        ogType="course"
        ogImage={course.imageUrl}
        canonical={`/courses/${course.slug}`}
        structuredData={detailSchemas}
      />

      {/* Dark Hero Section */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] pt-6 pb-40">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs md:text-sm text-[var(--color-text-tertiary)] mb-12"
          >
            <Link to="/" className="hover:text-[var(--color-text-primary)] transition-colors">Home</Link>
            <ChevronRight size={14} className="text-[var(--color-text-tertiary)]" />
            <Link to="/courses" className="hover:text-[var(--color-text-primary)] transition-colors">Courses</Link>
            <ChevronRight size={14} className="text-[var(--color-text-tertiary)]" />
            <span className="text-[var(--color-text-primary)] font-medium truncate">{course.title}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-text-primary)]/10 text-[var(--color-text-primary)] border border-[var(--color-text-primary)]/20 text-xs font-bold uppercase tracking-wider rounded-full">
                {course.category === 'software' ? <ShieldCheck size={14}/> : 
                 course.category === 'networking' ? <Server size={14}/> : 
                 <MonitorSmartphone size={14}/>}
                {course.category?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-text-primary)] tracking-tight leading-[1.1] drop-shadow-[0_0_15px_rgba(0,255,156,0.3)]">
                {course.title}
              </h1>
              
              <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed font-medium max-w-xl">
                {course.shortDescription}
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={handleShare}
                  className="btn-secondary flex items-center gap-2 rounded-full font-bold px-6 py-3"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                  {copied ? 'Link Copied!' : 'Share Course'}
                </button>
              </div>
            </motion.div>

            {/* Desktop Hero Image Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 12 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block relative z-10 w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-[var(--color-text-primary)]/10 border border-[var(--color-text-primary)]/10 aspect-video transform"
            >
              <img 
                src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                alt={course.title} 
                className="w-full h-full object-cover animate-ken-burns opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)]/80 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Mobile Hero Image */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:hidden rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[var(--color-surface)] aspect-video"
            >
              <img 
                src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                alt={course.title} 
                className="w-full h-full object-cover opacity-80"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[var(--color-surface-alt)] rounded-[2rem] p-8 md:p-12 shadow-sm border border-[var(--color-border)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none text-[var(--color-text-primary)]">
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2zm0 3.8l7.1 14.2H4.9L12 5.8z"/></svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)] mb-6 tracking-tight">About the Course</h2>
              <div className="prose prose-lg prose-invert text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap relative z-10 font-medium font-body">
                {course.description || 'Our specialized program is designed to provide you with practical, hands-on experience and a guaranteed path to your career. You will study from basics to advance with industrial level equipment and guidance.'}
              </div>
            </motion.div>
            
            <div className="w-full">
              <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-6 px-2 tracking-tight">Key Highlights</h3>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                {highlights.map((item: string, i: number) => (
                  <motion.div 
                    key={i} 
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="flex items-start gap-4 bg-[var(--color-surface-alt)] p-5 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="bg-[var(--color-text-primary)]/10 text-[var(--color-text-primary)] p-2 rounded-xl group-hover:scale-110 group-hover:bg-[var(--color-text-primary)] group-hover:text-[var(--color-surface)] shadow-[0_0_10px_rgba(0,255,156,0.2)] transition-all">
                      <CheckCircle size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-[var(--color-text-secondary)] leading-snug">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="sticky top-24 space-y-6">
              <div className="bg-[var(--color-surface)] rounded-[2.5rem] border border-[var(--color-border)] shadow-xl shadow-[var(--color-text-primary)]/5 p-8 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-text-primary)]/10 rounded-full blur-2xl opacity-60"></div>
                
                {pinnedOffer && (
                  <div className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] rounded-2xl p-6 mb-8 relative overflow-hidden text-white shadow-lg shadow-black/40 group transform transition-all hover:scale-[1.02] border border-white/10">
                    <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Award size={100} className="transform translate-x-1/4 -translate-y-1/4" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-text-primary)] mb-2 block">{pinnedOffer.badgeLabel || 'Exclusive Offer'}</span>
                      <h4 className="font-extrabold text-white text-lg mb-2">{pinnedOffer.headline}</h4>
                      <p className="text-sm text-blue-100/80 mb-4 leading-relaxed font-medium">{pinnedOffer.subtext}</p>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  {pinnedOffer?.discountedFee ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-lg text-[var(--color-text-tertiary)] line-through tracking-tight mb-1">
                        {course.feeStructure?.totalFee 
                          ? (course.feeStructure.totalFee.startsWith('₹') ? course.feeStructure.totalFee : `₹${course.feeStructure.totalFee}`) 
                          : `₹${course.price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight drop-shadow-[0_0_15px_rgba(0,255,156,0.3)]">
                        {pinnedOffer.discountedFee.startsWith('₹') ? pinnedOffer.discountedFee : `₹${pinnedOffer.discountedFee}`}
                      </span>
                    </div>
                  ) : course.feeStructure?.totalFee ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight drop-shadow-[0_0_15px_rgba(0,255,156,0.3)]">
                        {course.feeStructure.totalFee.startsWith('₹') 
                          ? course.feeStructure.totalFee 
                          : `₹${course.feeStructure.totalFee}`}
                      </span>
                    </div>
                  ) : course.price > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight drop-shadow-[0_0_15px_rgba(0,255,156,0.3)]">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="py-4 border-b border-dashed border-[var(--color-border)] mb-6">
                       <span className="text-lg font-bold text-[var(--color-text-tertiary)]">Course Fee: On Enquiry</span>
                    </div>
                  )}
                  {course.badge && <span className="inline-block mt-4 px-3 py-1 bg-red-950/30 text-red-400 border border-red-900/50 rounded-full text-[10px] font-bold uppercase tracking-widest">{course.badge}</span>}
                </div>

                {course.feeStructure && (course.feeStructure.registrationFee || course.feeStructure.description) && (
                  <div className="space-y-4 mb-8">
                    {course.feeStructure.registrationFee && (
                      <div className="flex justify-between items-center bg-[var(--color-surface-alt)] p-4 rounded-2xl border border-[var(--color-border)]">
                        <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Registration</span>
                        <span className="font-bold text-[var(--color-text-primary)]">
                          {course.feeStructure.registrationFee.startsWith('₹') 
                            ? course.feeStructure.registrationFee 
                            : `₹${course.feeStructure.registrationFee}`}
                        </span>
                      </div>
                    )}
                    {course.feeStructure.description && (
                      <div className="p-4 bg-[var(--color-text-primary)]/5 rounded-2xl border border-[var(--color-text-primary)]/10">
                        <p className="text-xs text-[var(--color-text-tertiary)] font-medium leading-relaxed">
                          {course.feeStructure.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 mb-8 bg-[var(--color-surface-alt)] rounded-2xl p-5 border border-[var(--color-border)]">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-[var(--color-text-tertiary)] font-semibold">
                      <Clock size={16} className="text-[var(--color-text-primary)]" />
                      <span>Duration</span>
                    </div>
                    <span className="font-bold text-[var(--color-text-primary)]">{course.duration}</span>
                  </div>
                  <div className="w-full h-px bg-[var(--color-border)]"></div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-[var(--color-text-tertiary)] font-semibold">
                      <Zap size={16} className="text-[var(--color-text-primary)]" />
                      <span>Experience Level</span>
                    </div>
                    <span className="font-bold text-[var(--color-text-primary)]">{course.level}</span>
                  </div>
                </div>

                <Link to="/contact" className="btn-primary block w-full text-center">
                  Enquire for Details
                </Link>

                <p className="text-xs font-semibold text-center text-[var(--color-text-tertiary)] mt-4">
                  Questions? <Link to="/contact" className="text-[var(--color-text-primary)] hover:underline transition-all">Contact Support</Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
