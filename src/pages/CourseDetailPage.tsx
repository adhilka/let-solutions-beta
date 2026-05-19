import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchCourseBySlug, fetchActiveOffers } from '../lib/api';
import { FAILSAFE_COURSES } from '../constants/courses';
import { CheckCircle, Clock, Zap, MessageSquare, ArrowLeft, ChevronRight, MonitorSmartphone, ShieldCheck, Server, Share2, Copy, Check, Award, ArrowRight } from 'lucide-react';
import { useState } from 'react';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold mb-4">Course Not Found</h1>
          <p className="text-slate-600 mb-8 text-lg">The course you are looking for does not exist or has been moved. Check out our other popular programs below.</p>
          <Link to="/courses" className="btn-primary">View All Courses</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FAILSAFE_COURSES.slice(0, 3).map((c) => (
            <Link key={c.id} to={`/courses/${c.slug}`} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">{c.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{c.shortDescription}</p>
              </div>
            </Link>
          ))}
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
      <div className="bg-[#0B1120] border-b border-slate-800 pt-6 pb-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-12">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} className="text-slate-600" />
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight size={14} className="text-slate-600" />
            <span className="text-slate-300 font-medium truncate">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider rounded-full">
                {course.category === 'software' ? <ShieldCheck size={14}/> : 
                 course.category === 'networking' ? <Server size={14}/> : 
                 <MonitorSmartphone size={14}/>}
                {course.category?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg">
                {course.title}
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-xl">
                {course.shortDescription}
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                  {copied ? 'Link Copied!' : 'Share Course'}
                </button>
              </div>
            </div>

            {/* Desktop Hero Image Container */}
            <div className="hidden lg:block relative z-10 w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/10 aspect-video transform translate-y-12">
              <img 
                src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Mobile Hero Image */}
            <div className="lg:hidden rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#0B1120] aspect-video">
              <img 
                src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2zm0 3.8l7.1 14.2H4.9L12 5.8z"/></svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">About the Course</h2>
              <div className="prose prose-lg prose-slate text-slate-600 leading-relaxed whitespace-pre-wrap relative z-10 font-medium">
                {course.description || 'Our specialized program is designed to provide you with practical, hands-on experience and a guaranteed path to your career. You will study from basics to advance with industrial level equipment and guidance.'}
              </div>
            </div>
            
            <div className="w-full">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-6 px-2 tracking-tight">Key Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-xl group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <CheckCircle size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-slate-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 p-8 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60"></div>
                
                {pinnedOffer && (
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 relative overflow-hidden text-white shadow-lg shadow-blue-900/20 group transform transition-all hover:scale-[1.02]">
                    <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Award size={100} className="transform translate-x-1/4 -translate-y-1/4" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 mb-2 block">{pinnedOffer.badgeLabel || 'Exclusive Offer'}</span>
                      <h4 className="font-extrabold text-white text-lg mb-2">{pinnedOffer.headline}</h4>
                      <p className="text-sm text-blue-100/90 mb-4 leading-relaxed">{pinnedOffer.subtext}</p>
                      <Link to="/admissions" className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all">
                        Claim Offer <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  {pinnedOffer?.discountedFee ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-lg text-slate-400 line-through tracking-tight mb-1">
                        {course.feeStructure?.totalFee 
                          ? (course.feeStructure.totalFee.startsWith('₹') ? course.feeStructure.totalFee : `₹${course.feeStructure.totalFee}`) 
                          : `₹${course.price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-tight">
                        {pinnedOffer.discountedFee.startsWith('₹') ? pinnedOffer.discountedFee : `₹${pinnedOffer.discountedFee}`}
                      </span>
                    </div>
                  ) : course.feeStructure?.totalFee ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        {course.feeStructure.totalFee.startsWith('₹') 
                          ? course.feeStructure.totalFee 
                          : `₹${course.feeStructure.totalFee}`}
                      </span>
                    </div>
                  ) : course.price > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="py-4 border-b border-dashed border-slate-200 mb-6">
                       <span className="text-lg font-bold text-slate-500">Course Fee: On Enquiry</span>
                    </div>
                  )}
                  {course.badge && <span className="inline-block mt-4 badge bg-red-50 text-red-600 border-red-100">{course.badge}</span>}
                </div>

                {course.feeStructure && (course.feeStructure.registrationFee || course.feeStructure.description) && (
                  <div className="space-y-4 mb-8">
                    {course.feeStructure.registrationFee && (
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-sm font-semibold text-slate-600">Registration</span>
                        <span className="font-bold text-slate-900">
                          {course.feeStructure.registrationFee.startsWith('₹') 
                            ? course.feeStructure.registrationFee 
                            : `₹${course.feeStructure.registrationFee}`}
                        </span>
                      </div>
                    )}
                    {course.feeStructure.description && (
                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {course.feeStructure.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 mb-8 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold">
                      <Clock size={16} className="text-blue-500" />
                      <span>Duration</span>
                    </div>
                    <span className="font-bold text-slate-900">{course.duration}</span>
                  </div>
                  <div className="w-full h-px bg-slate-200"></div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-slate-500 font-semibold">
                      <Zap size={16} className="text-amber-500" />
                      <span>Experience Level</span>
                    </div>
                    <span className="font-bold text-slate-900">{course.level}</span>
                  </div>
                </div>

                <Link to="/contact" className="block w-full text-center py-4 px-6 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0">
                  Enquire for Details
                </Link>

                <p className="text-xs font-semibold text-center text-slate-400 mt-4">
                  Questions? <Link to="/contact" className="text-blue-500 hover:text-blue-600 transition-colors">Contact Support</Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
