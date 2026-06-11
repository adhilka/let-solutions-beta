import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ShieldCheck, Award, Tv, MonitorSmartphone, Server, Quote, Star, PenLine, XCircle, Clock, Zap, ChevronRight, X, ZoomIn, Cpu } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { fetchFeaturedTestimonials, fetchActiveCourses, fetchHomeContent, fetchActiveOffers, fetchGalleryImages, fetchLatestPosts } from '../lib/api';
import { Testimonial } from '../types';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { dualWrite } from '../lib/firebase/dualWrite';
import { getAdmissionYearText } from '../lib/dateUtils';
import { useQuery } from '@tanstack/react-query';
import { FAILSAFE_COURSES } from '../constants/courses';
import { FAILSAFE_TESTIMONIALS } from '../constants/failsafe';
import { motion, AnimatePresence } from 'motion/react';

import SEO from '../components/SEO';
import HeroCarousel from '../components/layout/HeroCarousel';

export default function HomePage() {
  const { settings } = useGlobalSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<any>(null);

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

  const feedbacks = (() => {
    const rawFeedbacks = (feedbacksData && feedbacksData.length > 0) ? feedbacksData : FAILSAFE_TESTIMONIALS;
    return [...rawFeedbacks].sort((a, b) => {
      // First priority: Presence of profile picture
      const hasImageA = !!a.imageUrl;
      const hasImageB = !!b.imageUrl;
      if (hasImageA !== hasImageB) {
        return hasImageA ? -1 : 1;
      }

      // Second priority: Recency
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  })();

  const { data: offers } = useQuery({
    queryKey: ['active-offers-home'],
    queryFn: fetchActiveOffers
  });

  const { data: galleryImages } = useQuery({
    queryKey: ['gallery-images-home'],
    queryFn: fetchGalleryImages
  });

  const { data: latestPosts } = useQuery({
    queryKey: ['latest-posts-home'],
    queryFn: fetchLatestPosts
  });

  const recentPosts = latestPosts?.slice(0, 2) || [];

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

  const heroImage = homeContent?.hero?.imageUrl || "https://i.ibb.co/YB04NqYj/1000107571.jpg";
  const heroTitle = homeContent?.hero?.title || "Master Chip-Level Engineering & Secure Your Future";
  const heroSubtitle = homeContent?.hero?.subtitle || `Equip yourself with industry-standard training in Laptop, Smartphone, and Tablet repair alongside networking and CCTV modules.`;
  const heroDescription = homeContent?.hero?.description || tagline;
  const heroFeatures = homeContent?.hero?.features || ["100% Job Assistance", "Industry Experts", "Hands-on Labs"];

  const fallbackImages = [
    {
      id: "img-1780206547983",
      imageUrl: "https://i.ibb.co/Qt6QbkH/1000110995.jpg",
      title: "Seminars",
      category: "events"
    },
    {
      id: "img-1780206614339",
      imageUrl: "https://i.ibb.co/7JpJDwzm/1000110997.jpg",
      title: "Football Match",
      category: "campus"
    },
    {
      id: "img-1780206885741",
      imageUrl: "https://i.ibb.co/rKWt7ytR/1000110996.jpg",
      title: "Football Match ",
      category: "campus"
    }
  ];

  const stickyPhotos = galleryImages && galleryImages.length > 0 ? galleryImages.slice(0, 3) : fallbackImages;

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
        heroSettings={homeContent?.hero}
      />


      {/* Stats Bar */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-border)] py-8 md:py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform translate-x-1/3 -translate-y-1/3 text-white">
           <Quote size={200} className="scale-x-[-1]" />
        </div>
        <div className="container-wide px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-12 lg:divide-x divide-[var(--color-border)] text-center animate-pulse-subtle">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="hover:scale-105 transition-transform duration-300"
            >
              <div className="text-3xl lg:text-4xl @lg:text-5xl font-extrabold text-green-500 mb-1">{statsValues.studentsTrained}</div>
              <div className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Students Trained</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="hover:scale-105 transition-transform duration-300"
            >
              <div className="text-3xl lg:text-4xl @lg:text-5xl font-extrabold text-green-500 mb-1">{statsValues.yearsExcellence}</div>
              <div className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Years Experience</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="hover:scale-105 transition-transform duration-300"
            >
              <div className="text-3xl lg:text-4xl @lg:text-5xl font-extrabold text-green-500 mb-1">{statsValues.placementRate}</div>
              <div className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Placement Rate</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="hover:scale-105 transition-transform duration-300"
            >
              <div className="text-3xl lg:text-4xl @lg:text-5xl font-extrabold text-green-500 mb-1">{statsValues.courseModules}</div>
              <div className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Course Modules</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 md:py-24 2xl:py-32 relative bg-[var(--color-surface-alt)]/30">
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary-300) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="container-wide px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 lg:mb-16 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Featured Courses</h2>
              <p className="text-[var(--color-text-secondary)] font-medium">Master the most in-demand technical skills with our professional certification programs.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/courses" className="btn-secondary group flex items-center gap-2 rounded-xl transition-all hover:gap-3">
                View All Courses <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {featuredCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
              >
                <Link 
                  to={`/courses/${course.slug}`}
                  className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[2rem] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-[var(--color-primary-600)] flex flex-col h-full group relative"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`glass-light backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-white/40 ${
                        course.category === 'ethical-hacking' 
                          ? 'text-green-600 bg-green-50/90 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.35)]' 
                          : 'text-slate-800'
                      }`}>
                        {course.category === 'electronics' ? <Cpu size={12} className="text-blue-600"/> : 
                         course.category === 'networking' ? <Server size={12} className="text-blue-600"/> : 
                         course.category === 'ethical-hacking' ? <ShieldCheck size={12} className="text-green-600"/> : 
                         <MonitorSmartphone size={12} className="text-blue-600"/>} 
                        {course.category?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                    {course.badge && (
                      <div className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-extrabold uppercase tracking-widest shadow-lg transform rotate-2">
                        {course.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-extrabold mb-3 line-clamp-2 group-hover:text-[var(--color-primary-600)] transition-colors leading-snug tracking-tight">{course.title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-6 line-clamp-2 flex-grow font-medium leading-relaxed">{course.shortDescription}</p>
                    
            <div className="flex justify-between items-center py-4 border-y border-[var(--color-border)] mb-6 bg-[var(--color-surface)]/50 -mx-8 px-8">
                      <div className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-2">
                        <div className="p-1.5 bg-[var(--color-primary-900)] text-[var(--color-primary-400)] rounded-lg">
                          <Clock size={14} />
                        </div>
                        <span>{course.duration}</span>
                      </div>
                      <div className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-2">
                        <div className="p-1.5 bg-[var(--color-primary-900)] text-amber-500 rounded-lg">
                          <Zap size={14} />
                        </div>
                        <span className="font-mono">{course.level}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
              <div className="font-extrabold text-xl text-[var(--color-text-primary)] tracking-tight">
                        {course.pinnedOfferId && offers?.find((o: any) => o.id === course.pinnedOfferId)?.discountedFee ? (
                          <div className="flex flex-col">
                             <span className="text-[10px] text-[var(--color-text-tertiary)] line-through font-semibold mb-0.5">
                               {course.feeStructure?.totalFee ? (course.feeStructure.totalFee.startsWith('₹') ? course.feeStructure.totalFee : `₹${course.feeStructure.totalFee}`) : (course.price > 0 ? `₹${course.price.toLocaleString('en-IN')}` : '')}
                             </span>
                             <span className="text-[var(--color-neon-green)]">
                               {offers.find((o: any) => o.id === course.pinnedOfferId).discountedFee.startsWith('₹') 
                                 ? offers.find((o: any) => o.id === course.pinnedOfferId).discountedFee 
                                 : `₹${offers.find((o: any) => o.id === course.pinnedOfferId).discountedFee}`}
                             </span>
                          </div>
                        ) : course.feeStructure?.totalFee ? (
                          course.feeStructure.totalFee.startsWith('₹') 
                            ? course.feeStructure.totalFee 
                            : `₹${course.feeStructure.totalFee}`
                        ) : course.price > 0 ? (
                          `₹${course.price.toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-sm text-[var(--color-text-tertiary)]">Fee on Enquiry</span>
                        )}
                      </div>
                      <div className="btn-primary flex items-center gap-2 rounded-xl text-xs font-bold tracking-wider px-5 py-3 group-hover:scale-105 group-hover:bg-blue-700 transition-all shadow-lg border-0">
                        {course.price > 0 || course.feeStructure?.totalFee ? 'VIEW COURSE' : 'ENQUIRE NOW'}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Offer Banner / Dynamic Offers */}
      {offers && offers.length > 0 ? (
        <section className="py-16 md:py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
          <div className="container-wide px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="badge badge-blue mb-3">Limited Opportunities</span>
              <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Current Offers & <span className="text-neon-green">Scholarships</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer: any) => (
                <div key={offer.id} className="bg-[var(--color-surface-alt)] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-slate-900 italic">
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
                  <p className="text-[var(--color-text-secondary)] text-sm mb-6 line-clamp-2 leading-relaxed h-10">{offer.subtext}</p>
                  <Link 
                    to={offer.ctaHref || '/admissions'} 
                    className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-primary-600)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-700)] transition-colors shadow-lg shadow-black/40 border border-white/5"
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
                <p className="text-[var(--color-primary-100)]">Register now to secure your seat and avail early enrollment <span className="text-neon-green font-bold">scholarship</span> facilities.</p>
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
        <section className="py-16 md:py-24 2xl:py-32 bg-[var(--color-surface)] border-t border-[var(--color-border)] overflow-hidden">
          <div className="container-wide px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Student Success Stories</h2>
                <p className="text-[var(--color-text-secondary)]">Discover how our practical training approach has helped students launch successful technical careers.</p>
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
                    className="min-w-[300px] md:min-w-[420px] bg-[var(--color-surface-alt)] p-8 rounded-[2.5rem] shadow-sm border border-[var(--color-border)] flex flex-col relative group snap-center"
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
                    <Quote className="absolute top-8 right-10 w-20 h-20 text-[var(--color-primary-900)] group-hover:text-[var(--color-primary-800)] transition-all duration-500 -scale-x-100 opacity-50 group-hover:opacity-80" />
                    
                    <div className="flex gap-1 mb-6 bg-[var(--color-primary-900)] self-start px-3 py-1.5 rounded-full">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                      ))}
                    </div>

                    <p className="text-[var(--color-text-primary)] italic mb-10 leading-relaxed text-lg relative z-10 flex-grow pt-2">
                      "{t.content}"
                    </p>

                    <div className="flex items-center gap-4 mt-auto">
                      <div className="relative">
                        {t.imageUrl ? (
                          <img src={t.imageUrl} alt={t.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--color-border)] shadow-md" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center text-white text-xl font-extrabold shadow-md">
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[var(--color-surface)]"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--color-text-primary)] text-base leading-tight">{t.name}</h4>
                        <p className="text-sm font-semibold text-[var(--color-primary-400)] tracking-tight">{t.course}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Desktop fade indicators */}
              <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[var(--color-surface)] via-[var(--color-surface)]/20 to-transparent pointer-events-none hidden lg:block"></div>
              <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/20 to-transparent pointer-events-none hidden lg:block"></div>

              {/* Scroll Indicator Hint */}
              <motion.div 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[var(--color-surface-alt)]/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-[var(--color-border)] text-white opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none"
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
                className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-[1.25rem] font-bold shadow-2xl shadow-blue-900/40 hover:scale-105 transition-transform"
              >
                <PenLine size={20} /> Share Your Experience
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Sticky Notes Campus Highlights */}
      <section className="py-16 md:py-24 bg-[var(--color-surface-alt)]/20 border-t border-[var(--color-border)] overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-500)]/40 to-transparent"></div>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary-400) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
        <div className="container-wide px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="badge badge-green mb-3">Snapped from our Labs</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Campus & Lab Highlights</h2>
            <p className="text-[var(--color-text-secondary)] font-medium">Polaroid snapshots of students getting real hands-on experience in our micro-soldering labs, logic diagnostics seminars, and campus events.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 max-w-5xl mx-auto">
            {stickyPhotos.map((img: any, idx: number) => {
              const colors = [
                'bg-[#faf8f5] border-[#e2ddd5]',
                'bg-[#f5f8f5] border-[#dae3da]',
                'bg-[#f5f7fa] border-[#dae0e8]'
              ];
              const angles = [
                'md:-rotate-2 md:translate-y-1',
                'md:rotate-3 md:-translate-y-1',
                'md:-rotate-1 md:translate-y-2'
              ];
              
              const paperEffects = [
                {
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%)',
                  flap: (
                    <div 
                      className="absolute bottom-0 right-0 w-4 h-4 bg-[#eae6dc] border-t border-l border-slate-300/40 shadow-[-1px_-1px_2px_rgba(0,0,0,0.08)] pointer-events-none z-20" 
                      style={{ clipPath: 'polygon(100% 0%, 0% 100%, 0% 0%)' }} 
                    />
                  )
                },
                {
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 16px 100%, 0% calc(100% - 16px))',
                  flap: (
                    <div 
                      className="absolute bottom-0 left-0 w-4 h-4 bg-[#e5e9e5] border-t border-r border-slate-300/40 shadow-[1px_-1px_2px_rgba(0,0,0,0.08)] pointer-events-none z-20" 
                      style={{ clipPath: 'polygon(0% 0%, 100% 100%, 100% 0%)' }} 
                    />
                  )
                },
                {
                  clipPath: 'polygon(1% 1%, 99% 0%, 99% 15%, 100% 35%, 99% 60%, 100% 85%, 98% 97%, 95% 96%, 91% 98%, 86% 96%, 81% 97%, 76% 95%, 72% 98%, 65% 96%, 58% 98%, 51% 95%, 45% 97%, 38% 95%, 32% 98%, 26% 96%, 19% 97%, 12% 95%, 6% 98%, 0% 96%, 1% 70%, 0% 40%, 1% 15%)',
                  flap: null
                }
              ];

              const chosenColor = colors[idx % colors.length];
              const chosenAngle = angles[idx % angles.length];
              const paperStyle = paperEffects[idx % paperEffects.length];

              return (
                <motion.div
                  key={img.id || idx}
                  className={`relative ${chosenAngle} hover:rotate-0 hover:translate-y-0 hover:scale-[1.03] active:scale-98 cursor-pointer transition-all duration-300 group flex flex-col justify-start filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.06)] hover:drop-shadow-[0_15px_24px_rgba(0,0,0,0.11)]`}
                  onClick={() => setActivePhoto(img)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <div
                    className={`relative p-3 pb-5 border rounded-sm ${chosenColor} flex flex-col justify-start flex-grow h-full`}
                    style={{ clipPath: paperStyle.clipPath }}
                  >
                    {/* Subtle paper grain texture simulated via a soft highlight gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.015] via-transparent to-white/[0.04] rounded-sm pointer-events-none" />

                    {/* Inner Polaroid Frame Image */}
                    <div className="bg-white/90 p-1.5 rounded-sm border border-slate-200/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden flex-grow group-hover:shadow-sm transition-shadow">
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                        <img
                          src={img.imageUrl}
                          alt={img.title || 'Campus life snapshot'}
                          className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 right-1.5 bg-black/55 backdrop-blur-sm text-[8px] text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold z-10">
                          {img.category || 'lab'}
                        </div>

                        {/* Tap to View Zoom Overlay */}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                          <div className="bg-white/95 text-slate-800 px-3 py-1.5 rounded shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <ZoomIn size={12} className="text-slate-800" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Tap to view</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Polaroid caption - typewriter styled for authentic paper feel */}
                    <div className="mt-4 text-center px-1">
                      <p className="text-xs font-semibold tracking-tight text-slate-700 font-mono truncate">
                        {img.title || 'Lab Practice'}
                      </p>
                    </div>

                    {paperStyle.flap}
                  </div>

                  {/* Frosted tape at the top of the polaroid */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/30 backdrop-blur-[1px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-white/20 -rotate-1 z-20 group-hover:bg-white/40 transition-colors pointer-events-none"></div>
                  
                  {/* Push Pin effect style */}
                  <div className="absolute top-1 left-3 w-1.5 h-1.5 rounded-full bg-red-500/75 shadow-inner z-20 pointer-events-none"></div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/gallery" 
              className="inline-flex items-center gap-2 text-sm font-bold bg-[var(--color-primary-900)] text-[var(--color-primary-400)] px-6 py-3 rounded-xl hover:bg-[var(--color-primary-800)] hover:text-white transition-all hover:scale-102"
            >
              Explore Full Gallery <ArrowRight size={16} />
            </Link>
          </div>

          {/* Recent Blog Posts Integration */}
          {recentPosts.length > 0 && (
            <div className="mt-24 pt-16 border-t border-white/5">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Recent Articles & Guides</h3>
                </div>
                <Link to="/blog" className="text-sm font-bold text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] flex items-center gap-1 group transition-all">
                  Visit Library <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {recentPosts.map((post: any, idx: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="group block bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-[var(--color-primary-600)]/50 transition-all duration-500 shadow-2xl hover:shadow-[var(--color-primary-900)]/20"
                    >
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="sm:w-2/5 relative aspect-video sm:aspect-auto overflow-hidden bg-black">
                          <img 
                            src={post.coverImage || (post.postType === 'video' ? `https://img.youtube.com/vi/${post.videoUrl?.split('v=')[1]?.split('&')[0] || post.videoUrl?.split('/').pop()}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=500&q=80')} 
                            alt={post.title}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[9px] font-extrabold text-white uppercase tracking-wider border border-white/20">
                              {post.category || post.postType || 'Tech'}
                            </span>
                          </div>
                        </div>
                        <div className="sm:w-3/5 p-6 flex flex-col justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
                          <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-[var(--color-primary-400)] transition-colors">
                            {post.title}
                          </h4>
                          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4 font-medium leading-relaxed">
                            {post.excerpt || post.content?.replace(/<[^>]*>/g, '').slice(0, 100) + '...'}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase tracking-widest">
                              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </span>
                            <div className="w-7 h-7 rounded-full bg-[var(--color-primary-900)] flex items-center justify-center text-[var(--color-primary-400)] transform group-hover:rotate-45 transition-transform">
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 z-[110] backdrop-blur-md cursor-zoom-out animate-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 h-10 w-10 flex items-center justify-center rounded-full transition-all duration-200 z-[120]"
              aria-label="Close image viewer"
            >
              <X size={20} />
            </button>

            {/* Photo Container */}
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[95%] max-h-[80vh] flex flex-col items-center justify-center"
            >
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title || 'Campus highlight'}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating Caption Overlay or under-image subtitle */}
              <div className="mt-4 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activePhoto.title || 'Lab Practice Snapshot'}
                </h3>
                {activePhoto.category && (
                  <span className="inline-block mt-1 text-[10px] text-white/50 bg-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-extrabold">
                    {activePhoto.category}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Simple Dismiss Indicator */}
            <div className="mt-6 text-center pointer-events-none select-none">
              <p className="text-xs text-white/40 font-medium tracking-wide">
                Tap anywhere to close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)]">
              <h2 className="text-xl font-bold text-white">Share Your Experience</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1">Your Name</label>
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
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1">Course Attended</label>
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
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      <Star className={`w-6 h-6 ${star <= formData.rating ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1">Your Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary-900)] file:text-[var(--color-primary-400)] hover:file:bg-[var(--color-primary-800)] transition"
                />
                {imageFile && <p className="text-[10px] text-blue-400 mt-1">Selected: {imageFile.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1">Feedback</label>
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
