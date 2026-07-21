import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseBySlug, fetchActiveOffers } from '../lib/api';
import { FAILSAFE_COURSES } from '../constants/courses';
import { CheckCircle, Clock, Zap, Cpu, Share2, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

import SEO from '../components/SEO';

export default function LaptopChipLevelPage() {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const shareData = {
      title: 'Laptop Chip Level Repairing Course | Let Solutions',
      text: 'Master advanced motherboard engineering and chip level diagnostics with 100% practical training at Let Solutions Tirur.',
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

  // Fetch the actual dynamic master-diploma course if available from backend
  const { data: serverCourse, isLoading } = useQuery({
    queryKey: ['course', 'master-diploma-in-chiplevel-engeneering-'],
    queryFn: () => fetchCourseBySlug('master-diploma-in-chiplevel-engeneering-'),
  });

  const { data: offers } = useQuery({
    queryKey: ['active-offers-all'],
    queryFn: fetchActiveOffers,
  });

  // Fallback to the chip-level course in FAILSAFE_COURSES
  const course = serverCourse || FAILSAFE_COURSES.find(c => c.category === 'chip-level') || FAILSAFE_COURSES[0];

  // Find dynamic pinned offers if available
  const pinnedOffer = course?.pinnedOfferId && offers 
    ? offers.find((o: any) => o.id === course.pinnedOfferId) 
    : null;

  // SEO Structured Data schemas
  const structuredData = course ? [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Master Diploma In Chiplevel Engineering (Laptop & Motherboard Servicing)",
      "description": course.shortDescription,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Let Solutions Technical Institute",
        "sameAs": "https://letsolutions.in",
        "url": "https://letsolutions.in",
        "logo": "https://letsolutions.in/images/banner.jpg"
      },
      "image": course.imageUrl,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": course.price > 0 ? course.price : "85000",
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
          "name": "Laptop Chip Level Repairing",
          "item": "https://letsolutions.in/c/laptop-chip-level"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Which is the best institute for Laptop Chip Level Repairing in Kerala?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Let Solutions in Tirur, Malappuram is Kerala's premium, top-rated institute for advanced Laptop Chip Level Repairing courses. We offer 100% practical, component-level motherboard diagnostics, BGA reballing, schematics, and boardview analysis in our high-end dedicated labs."
          }
        },
        {
          "@type": "Question",
          "name": "What is the duration of the Laptop Chip Level course in Tirur?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The course is available in two flexible formats: a 6-month intensive track or a 12-month comprehensive track, featuring extensive daily practical lab hours."
          }
        },
        {
          "@type": "Question",
          "name": "Does Let Solutions offer a certificate and placement assistance?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, on successful completion, students receive an official, industry-recognized certificate of completion. Let Solutions also offers complete placement support and a lifetime technical backup backup system."
          }
        }
      ]
    }
  ] : [];

  const defaultHighlights = [
    'SMD Component Soldering & Replacement',
    'Full Motherboard Circuit Tracing',
    'Advanced BGA Rework & Reballing',
    'Schematic & Boardview Analysis',
    'BIOS / UEFI Programming (RT809F/RT809H)',
    '100% Practical Labs & Lifetime Tech Support Backup'
  ];

  const highlights = (course?.highlights && course.highlights.length > 0) ? course.highlights : defaultHighlights;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="No.1 Laptop Chip Level Repairing Course in Kerala | Let Solutions Tirur"
        description="Master Laptop Motherboard diagnostics, BGA chip reballing, SMD micro-soldering, and power circuits. Enroll in the best Laptop Chip Level Repair course in Kerala with 100% practical labs and placements!"
        keywords="laptop chip level repairing course kerala, laptop repair training malappuram, chip level motherboard repair tirur, best chip level repairing institute kerala, learn bga reballing, laptop repair technician course, let solutions tirur"
        ogType="course"
        ogImage={course?.imageUrl || 'https://i.ibb.co/TDmbYZnm/1000110893.jpg'}
        canonical="/c/laptop-chip-level"
        structuredData={structuredData}
      />

      {/* Dark Hero Section */}
      <div className="bg-[#0B1120] border-b border-slate-800 pt-6 pb-40">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-12"
          >
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} className="text-slate-600" />
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight size={14} className="text-slate-600" />
            <span className="text-slate-300 font-medium truncate">Laptop Chip Level</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                <Cpu size={14} className="text-blue-400"/>
                Chip-Level Electronics
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg font-display">
                Laptop Chip Level Repairing
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-xl">
                {course?.shortDescription || "Master advanced electronics repair. Learn to diagnose and fix motherboard issues, BGA chips, power circuits, and bios firmware at component level."}
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
            </motion.div>

            {/* Desktop Hero Image Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 12 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block relative z-10 w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/10 aspect-video transform"
            >
              <img 
                src={course?.imageUrl || 'https://i.ibb.co/TDmbYZnm/1000110893.jpg'} 
                alt="Laptop Chip Level Repairing" 
                className="w-full h-full object-cover animate-ken-burns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
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
              className="lg:hidden rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#0B1120] aspect-video"
            >
              <img 
                src={course?.imageUrl || 'https://i.ibb.co/TDmbYZnm/1000110893.jpg'} 
                alt="Laptop Chip Level Repairing" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface-alt rounded-[2rem] p-8 md:p-12 shadow-sm border border-border relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2zm0 3.8l7.1 14.2H4.9L12 5.8z"/></svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 tracking-tight font-display">About the Course</h2>
              <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap relative z-10 font-medium">
                {course?.description || 'Our Master Diploma in Chip Level Engineering is designed to turn students into professional chip-level electronics repair specialists. This course covers everything from scratch: basic components, resistance/capacitance testing, circuit tracing, BGA reballing, motherboard repairing, power section troubleshooting, schematic analysis, BIOS/UEFI programming, and advanced diagnosis tricks. We focus entirely on high-end hands-on laboratory practice.'}
              </div>
            </motion.div>
            
            <div className="w-full">
              <h3 className="text-2xl font-extrabold text-white mb-6 px-2 tracking-tight font-display">Key Highlights</h3>
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
                    className="flex items-start gap-4 bg-surface-alt p-5 rounded-2xl border border-border shadow-sm hover:border-primary-600 transition-all group"
                  >
                    <div className="bg-primary-900 text-primary-400 p-2 rounded-xl group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <CheckCircle size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-white leading-snug">{item}</span>
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
              <div className="bg-surface-alt rounded-[2.5rem] border border-border shadow-xl p-8 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-900 rounded-full blur-2xl opacity-20"></div>
                
                {pinnedOffer && (
                  <div className="bg-gradient-to-br from-primary-600 to-indigo-900 rounded-2xl p-6 mb-8 relative overflow-hidden text-white shadow-lg shadow-black/40 group transform transition-all hover:scale-[1.02]">
                    <div className="relative z-10">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-2 block">{pinnedOffer.badgeLabel || 'Exclusive Offer'}</span>
                      <h4 className="font-extrabold text-white text-lg mb-2">{pinnedOffer.headline}</h4>
                      <p className="text-sm text-white/80 mb-4 leading-relaxed">{pinnedOffer.subtext}</p>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  {pinnedOffer?.discountedFee ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-lg text-slate-400 line-through tracking-tight mb-1">
                        ₹{course?.price ? course.price.toLocaleString('en-IN') : '85,000'}
                      </span>
                      <span className="text-4xl md:text-5xl font-extrabold text-neon-green tracking-tight font-display">
                        ₹{pinnedOffer.discountedFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : course?.price ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Course Fee</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
                        ₹85,000
                      </span>
                    </div>
                  )}
                </div>

                {course?.feeStructure && (course.feeStructure.registrationFee || course.feeStructure.description) && (
                  <div className="space-y-4 mb-8">
                    {course.feeStructure.registrationFee && (
                      <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-border">
                        <span className="text-sm font-semibold text-slate-400">Registration</span>
                        <span className="font-bold text-white">
                          ₹{course.feeStructure.registrationFee}
                        </span>
                      </div>
                    )}
                    {course.feeStructure.description && (
                      <div className="p-4 bg-primary-900/50 rounded-2xl border border-primary-800">
                        <p className="text-xs text-primary-200 font-medium leading-relaxed">
                          {course.feeStructure.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 mb-8 bg-surface rounded-2xl p-5 border border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-slate-400 font-semibold">
                      <Clock size={16} className="text-primary-400" />
                      <span>Duration</span>
                    </div>
                    <span className="font-bold text-white">{course?.duration || "6 or 12 Months"}</span>
                  </div>
                  <div className="w-full h-px bg-border"></div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 text-slate-400 font-semibold">
                      <Zap size={16} className="text-amber-500" />
                      <span>Experience Level</span>
                    </div>
                    <span className="font-bold text-white">{course?.level || "All Levels"}</span>
                  </div>
                </div>

                <Link to="/contact" className="block w-full text-center py-4 px-6 text-base font-bold text-white btn-primary rounded-xl transition-all shadow-lg active:translate-y-0">
                  Enquire for Details
                </Link>

                <p className="text-xs font-semibold text-center text-slate-400 mt-4">
                  Questions? <Link to="/contact" className="text-primary-400 hover:text-white transition-colors">Contact Support</Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
