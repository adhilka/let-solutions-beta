import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ShieldCheck, Award, Tv, MonitorSmartphone, Server, Quote, Star, PenLine, XCircle, Clock, Zap, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { fetchFeaturedTestimonials, fetchActiveCourses, fetchHomeContent, fetchActiveOffers } from '../lib/api';
import { Testimonial } from '../types';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { dualWrite } from '../lib/firebase/dualWrite';
import { getAdmissionYearText } from '../lib/dateUtils';
import { useQuery } from '@tanstack/react-query';
import { FAILSAFE_COURSES } from '../constants/courses';
import { FAILSAFE_TESTIMONIALS } from '../constants/failsafe';
import { motion, AnimatePresence } from 'motion/react';

import SEO from '../components/SEO';
import InitialLoader from '../components/layout/InitialLoader';
import HeroCarousel from '../components/layout/HeroCarousel';

export default function HomePage() {
  const { settings } = useGlobalSettings();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    rating: 5,
    content: '',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: feedbacksData } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: fetchFeaturedTestimonials,
    initialData: FAILSAFE_TESTIMONIALS as any
  });

  const feedbacks = (feedbacksData && feedbacksData.length > 0) ? feedbacksData : FAILSAFE_TESTIMONIALS;

  const { data: offers } = useQuery({
    queryKey: ['active-offers-home'],
    queryFn: fetchActiveOffers
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const { uploadToImgBB } = await import('../lib/imgbb');
        const uploadResult = await uploadToImgBB(imageFile);
        finalImageUrl = uploadResult.url;
      }

      const newId = `feedback-${Date.now()}`;
      const testimonialData = {
        ...formData,
        imageUrl: finalImageUrl,
        approved: true,
        isFeatured: true, // Mark as featured for home page display
        createdAt: new Date().toISOString()
      };
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', newId], testimonialData);
      alert('Thank you! Your feedback has been published.');
      setIsModalOpen(false);
      setFormData({ name: '', course: '', rating: 5, content: '', imageUrl: '' });
      setImageFile(null);
      // Invalidate to refresh
      window.location.reload(); 
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: coursesDataRaw } = useQuery({
    queryKey: ['active-courses-featured'],
    queryFn: fetchActiveCourses,
    initialData: FAILSAFE_COURSES
  });

  const { data: homeContent } = useQuery({
    queryKey: ['home-content'],
    queryFn: fetchHomeContent
  });

  const coursesData = (coursesDataRaw && coursesDataRaw.length > 0) ? coursesDataRaw : FAILSAFE_COURSES;

  const featuredCourses = (() => {
    // Get pinned courses first from whatever source we are using (server or failsafe)
    const pinned = coursesData.filter((c: any) => c.isPinned).slice(0, 3);
    
    if (pinned.length >= 3) return pinned;
    
    // Supplement with unpinned active courses if less than 3 are pinned
    const unpinned = coursesData.filter((c: any) => !c.isPinned).slice(0, 3 - pinned.length);
    
    return [...pinned, ...unpinned];
  })();

  const instituteName = settings?.branding?.instituteName || "Let Solutions";
  const tagline = settings?.branding?.tagline || "A Ray of Hope For Your Future.";
  const admissionStatus = getAdmissionYearText(settings);
  const statsValues = settings?.stats || {
    yearsExcellence: '0',
    studentsTrained: '0',
    placementRate: '0',
    courseModules: '0'
  };

  const heroImage = homeContent?.hero?.imageUrl || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  const heroTitle = homeContent?.hero?.title || "Master Chip-Level Engineering & Secure Your Future";
  const heroSubtitle = homeContent?.hero?.subtitle || `Equip yourself with industry-standard training in Laptop, Smartphone, and Tablet repair alongside networking and CCTV modules.`;
  const heroDescription = homeContent?.hero?.description || tagline;
  const heroFeatures = homeContent?.hero?.features || ["100% Job Assistance", "Industry Experts", "Hands-on Labs"];

  // Structured Data for Organization & WebSite
  const homeSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Let Solutions",
      "url": "https://letsolutions.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://letsolutions.in/courses?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ];

  const isPhotoBg = homeContent?.hero?.bgType !== 'solid';

  return (
    <>
      <AnimatePresence>
        {isInitialLoading && <InitialLoader key="loader" />}
      </AnimatePresence>
      
      <SEO 
        title="Let Solutions | #1 Technical Training Institute in Tirur, Kerala"
        description="Master Smartphone Repairing, Laptop Chip-Level Engineering, Networking & CCTV at Let Solutions. Tirur's leading technical institute with 100% placement assistance."
        keywords="smartphone repair course tirur, laptop chip level training malappuram, cctv technician course kerala, networking training tirur, technical institute kerala, let solutions vocational training"
        structuredData={homeSchemas}
      />

      {/* Hero Section Carousel */}
      <HeroCarousel 
        courses={coursesData.filter((c: any) => c.isPinned).length > 0 
          ? coursesData.filter((c: any) => c.isPinned) 
          : coursesData.slice(0, 3)
        }
        admissionStatus={admissionStatus} 
      />


      {/* Stats Bar */}
      <section className="bg-white border-y border-[var(--color-border)] py-8 md:py-12">
        <div className="container-wide px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-12 lg:divide-x divide-[var(--color-border)] text-center">
            <div>
              <div className="text-3xl font-bold text-[var(--color-primary-700)] mb-1">{statsValues.studentsTrained}</div>
              <div className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">Students Trained</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-primary-700)] mb-1">{statsValues.yearsExcellence}</div>
              <div className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-primary-700)] mb-1">{statsValues.placementRate}</div>
              <div className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">Placement Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-primary-700)] mb-1">{statsValues.courseModules}</div>
              <div className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">Course Modules</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 md:py-24 2xl:py-32">
        <div className="container-wide px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 lg:mb-16 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-3">Featured Courses</h2>
              <p className="text-[var(--color-text-secondary)]">Master the most in-demand technical skills.</p>
            </div>
            <Link to="/courses" className="text-[var(--color-primary-600)] font-semibold flex items-center gap-1 hover:underline">
              View All Courses <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Link 
                key={course.id} 
                to={`/courses/${course.slug}`}
                className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary-200)] flex flex-col h-full group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="badge badge-blue flex items-center gap-1">
                      {course.category === 'software' ? <ShieldCheck size={12}/> : 
                       course.category === 'networking' ? <Server size={12}/> : 
                       <MonitorSmartphone size={12}/>} 
                      {course.category?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  {course.badge && (
                    <div className="absolute top-3 right-3 text-xs bg-[var(--color-warning)] text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">
                      {course.badge}
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-[var(--color-primary-600)] transition-colors">{course.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2 flex-grow">{course.shortDescription}</p>
                  
                  <div className="flex justify-between items-center py-4 border-y border-[var(--color-border)] mb-4 bg-slate-50/50 -mx-6 px-6">
                    <div className="text-sm font-medium text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="text-sm font-medium text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                      <Zap size={14} className="text-slate-400" />
                      <span className="font-mono">{course.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-[var(--color-primary-700)] line-clamp-1">
                      {course.feeStructure?.totalFee ? (
                        course.feeStructure.totalFee.startsWith('₹') 
                          ? course.feeStructure.totalFee 
                          : `₹${course.feeStructure.totalFee}`
                      ) : course.price > 0 ? (
                        `₹${course.price.toLocaleString('en-IN')}`
                      ) : (
                        'Fee Details →'
                      )}
                    </div>
                    <div className="btn-primary">
                      {course.price > 0 || course.feeStructure?.totalFee ? 'View Details' : 'Enquire Now'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offer Banner / Dynamic Offers */}
      {offers && offers.length > 0 ? (
        <section className="py-16 md:py-24 bg-[var(--color-primary-50)]">
          <div className="container-wide px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="badge badge-blue mb-3">Limited Opportunities</span>
              <h2 className="text-3xl font-bold text-slate-900">Current Offers & Scholarships</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer: any) => (
                <div key={offer.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-slate-100 italic">
                    {offer.imageUrl ? (
                      <img src={offer.imageUrl} alt={offer.headline} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[var(--color-primary-200)]">
                        <Award size={48} />
                      </div>
                    )}
                    {offer.badgeLabel && (
                      <div className="absolute top-4 left-4 shadow-lg">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tighter text-white ${
                          offer.badgeLabel.toLowerCase().includes('limit') || offer.badgeLabel.toLowerCase().includes('off')
                          ? 'bg-red-600' 
                          : 'bg-[var(--color-primary-600)]'
                        }`}>
                          {offer.badgeLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold mb-3 line-clamp-1">{offer.headline}</h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed h-10">{offer.subtext}</p>
                  <Link 
                    to={offer.ctaHref || '/admissions'} 
                    className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-primary-600)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-700)] transition-colors shadow-lg shadow-blue-100"
                  >
                    {offer.ctaLabel || 'Enquire Now'} <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[var(--color-primary-600)] text-white py-12 my-8">
          <div className="max-w-[var(--container-lg)] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-full hidden md:block">
                <Award size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{admissionStatus} — New Batch!</h2>
                <p className="text-[var(--color-primary-100)]">Register now to secure your seat and avail early enrollment scholarship facilities.</p>
              </div>
            </div>
            <Link to="/admissions" className="bg-white text-[var(--color-primary-700)] font-bold py-3 px-8 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap">
              Register Today
            </Link>
          </div>
        </section>
      )}

      {/* Featured Feedbacks */}
      {feedbacks.length > 0 && (
        <section className="py-16 md:py-24 2xl:py-32 bg-slate-50 border-t border-[var(--color-border)] overflow-hidden">
          <div className="container-wide px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Student Success Stories</h2>
                <p className="text-slate-600">Discover how our practical training approach has helped students launch successful technical careers.</p>
              </div>
              <div className="hidden md:flex gap-4">
                 <Link to="/feedbacks" className="text-[var(--color-primary-600)] font-semibold flex items-center gap-1 hover:underline">
                   View All Stories <ArrowRight size={18} />
                 </Link>
              </div>
            </div>
            
            <div className="relative group">
              <motion.div 
                className="flex gap-6 overflow-x-auto pb-10 pt-4 no-scrollbar snap-x snap-mandatory px-4 md:px-0"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.15
                    }
                  }
                }}
              >
                {feedbacks.map((t, index) => (
                  <motion.div 
                    key={t.id || index} 
                    className="min-w-[300px] md:min-w-[420px] bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative group snap-center"
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { 
                          type: "spring", 
                          stiffness: 100, 
                          damping: 15 
                        }
                      }
                    }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.02,
                      boxShadow: "0 25px 30px -10px rgb(0 0 0 / 0.1)" 
                    }}
                    whileInView={{ 
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{ once: false, amount: 0.5 }}
                  >
                    <Quote className="absolute top-8 right-10 w-20 h-20 text-slate-50 group-hover:text-blue-50 transition-all duration-500 -scale-x-100 opacity-50 group-hover:opacity-80" />
                    
                    <div className="flex gap-1 mb-6 bg-slate-50 self-start px-3 py-1.5 rounded-full">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>

                    <p className="text-slate-700 italic mb-10 leading-relaxed text-lg relative z-10 flex-grow pt-2">
                      "{t.content}"
                    </p>

                    <div className="flex items-center gap-4 mt-auto">
                      <div className="relative">
                        {t.imageUrl ? (
                          <img src={t.imageUrl} alt={t.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center text-white text-xl font-extrabold shadow-md">
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base leading-tight">{t.name}</h4>
                        <p className="text-sm font-semibold text-[var(--color-primary-600)] tracking-tight">{t.course}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Desktop fade indicators */}
              <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-slate-50 via-slate-50/20 to-transparent pointer-events-none hidden lg:block"></div>
              <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-slate-50 via-slate-50/20 to-transparent pointer-events-none hidden lg:block"></div>

              {/* Scroll Indicator Hint */}
              <motion.div 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-slate-200 text-slate-400 opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none"
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ChevronRight size={24} />
              </motion.div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center mt-4 gap-6">
              <Link to="/feedbacks" className="md:hidden btn-secondary inline-flex items-center gap-2 px-8 rounded-xl font-bold">
                View All Stories <ArrowRight size={18} />
              </Link>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-[1.25rem] font-bold shadow-xl shadow-blue-100 hover:scale-105 transition-transform"
              >
                <PenLine size={20} /> Share Your Experience
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FEEDBACK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Share Your Experience</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Rahul Kumar"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course Attended</label>
                <input
                  required
                  type="text"
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Laptop Repairing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      <Star className={`w-6 h-6 ${star <= formData.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                />
                {imageFile && <p className="text-[10px] text-blue-600 mt-1">Selected: {imageFile.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="input w-full"
                  placeholder="Your experience..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
