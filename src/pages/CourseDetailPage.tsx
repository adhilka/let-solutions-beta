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

      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/courses" className="hover:text-blue-600">Courses</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium truncate">{course.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <span className="badge badge-blue">
                {course.category === 'software' ? <ShieldCheck size={12} className="inline mr-1"/> : 
                 course.category === 'networking' ? <Server size={12} className="inline mr-1"/> : 
                 <MonitorSmartphone size={12} className="inline mr-1"/>}
                {course.category?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {course.shortDescription}
              </p>
              <div className="pt-2">
                <button 
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
                  {copied ? 'Link Copied!' : 'Share Course'}
                </button>
              </div>
            </div>

            <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border relative group">
              <img 
                src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold">About the Course</h2>
              <p className="text-slate-700 whitespace-pre-wrap">
                {course.description || 'Our specialized program is designed to provide you with practical, hands-on experience and a guaranteed path to your career. You will study from basics to advance with industrial level equipment and guidance.'}
              </p>
              
              <h3 className="text-xl font-bold mt-8 mb-4">Key Highlights</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle className="text-green-500 shrink-0 mt-1" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                
                {pinnedOffer && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-2 relative overflow-hidden group">
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Award size={64} className="text-blue-600" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-extrabold uppercase tracking-tighter text-blue-600 mb-1 block">{pinnedOffer.badgeLabel || 'Exclusive Offer'}</span>
                      <h4 className="font-bold text-blue-900 mb-2">{pinnedOffer.headline}</h4>
                      <p className="text-xs text-blue-700/80 mb-3 leading-relaxed">{pinnedOffer.subtext}</p>
                      <Link to="/admissions" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:gap-2 transition-all">
                        Claim This Offer <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-b pb-4">
                  {course.feeStructure?.totalFee ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Course Fee</span>
                      <span className="text-3xl font-extrabold text-blue-700">
                        {course.feeStructure.totalFee.startsWith('₹') 
                          ? course.feeStructure.totalFee 
                          : `₹${course.feeStructure.totalFee}`}
                      </span>
                    </div>
                  ) : course.price > 0 ? (
                    <span className="text-3xl font-extrabold text-blue-700">
                      ₹{course.price.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-400">Course Fee: On Enquiry</span>
                  )}
                  {course.badge && <span className="badge badge-red">{course.badge}</span>}
                </div>

                {course.feeStructure && (course.feeStructure.registrationFee || course.feeStructure.description) && (
                  <div className="space-y-4 py-2">
                    {course.feeStructure.registrationFee && (
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Registration Fee</span>
                        <span className="font-bold text-slate-900">
                          {course.feeStructure.registrationFee.startsWith('₹') 
                            ? course.feeStructure.registrationFee 
                            : `₹${course.feeStructure.registrationFee}`}
                        </span>
                      </div>
                    )}
                    {course.feeStructure.description && (
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          {course.feeStructure.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={16} />
                      <span>Duration</span>
                    </div>
                    <span className="font-bold text-slate-900">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Zap size={16} />
                      <span>Level</span>
                    </div>
                    <span className="font-bold text-slate-900">{course.level}</span>
                  </div>
                </div>

                <Link to="/contact" className="block w-full btn-primary text-center py-4 px-6 text-lg font-bold shadow-lg shadow-blue-100">
                  Enquire for Details
                </Link>

                <p className="text-xs text-center text-slate-400">
                  Locked for enrollment? <Link to="/contact" className="text-blue-600 underline">Contact Support</Link>
                </p>
              </div>

              <div className="bg-[var(--color-primary-600)] rounded-3xl p-8 text-white space-y-4 shadow-xl shadow-blue-900/10">
                <h3 className="text-xl font-display font-extrabold text-white">Have Questions?</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Our career counselors are ready to help you choose the right path.
                </p>
                <div className="pt-2">
                  <Link to="/contact" className="inline-block bg-white text-blue-600 font-bold px-6 py-2 rounded-xl text-sm">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
