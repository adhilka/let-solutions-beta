import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
import { Course } from '../../types';

interface HeroCarouselProps {
  courses: Course[];
  admissionStatus: string;
}

export default function HeroCarousel({ courses, admissionStatus }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const featuredCourses = courses.length > 0 ? courses : [];

  useEffect(() => {
    if (featuredCourses.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, [current, featuredCourses.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % featuredCourses.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + featuredCourses.length) % featuredCourses.length);
  };

  if (featuredCourses.length === 0) return null;

  const activeCourse = featuredCourses[current];

  return (
    <section className="relative h-[85vh] md:h-[80vh] overflow-hidden -mt-16 bg-slate-900">
      <AnimatePresence custom={direction}>
        <motion.div
          key={activeCourse.id}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={activeCourse.imageUrl} 
            alt={activeCourse.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30"></div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full container-wide px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCourse.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-[10px] md:text-xs uppercase tracking-widest bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                {admissionStatus}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-white drop-shadow-2xl">
                {activeCourse.title}
              </h1>
              
              <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-slate-100 drop-shadow-lg font-medium opacity-90">
                {activeCourse.shortDescription}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link 
                  to={`/courses/${activeCourse.slug}`} 
                  className="group relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold px-6 py-3 text-sm md:text-base transition-all shadow-xl shadow-blue-900/40 hover:-translate-y-1 active:translate-y-0"
                >
                  Learn More
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/courses" 
                  className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-lg font-semibold px-4 py-2 text-xs transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Browse All
                </Link>
              </div>
              
              {activeCourse.highlights && activeCourse.highlights.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-white/20">
                  {activeCourse.highlights.slice(0, 2).map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-white">
                      <CheckCircle size={18} className="text-blue-400" />
                      <span className="text-xs md:text-sm font-medium drop-shadow-md">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      {featuredCourses.length > 1 && (
        <>
          <div className="absolute bottom-10 right-4 sm:right-10 z-20 flex gap-2">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
              aria-label="Next Slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="absolute bottom-10 left-4 sm:left-10 z-20 flex gap-2">
            {featuredCourses.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
