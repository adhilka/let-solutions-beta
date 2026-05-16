import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MonitorSmartphone, ShieldCheck, Server, Filter, Clock, Zap, MessageSquare } from 'lucide-react';
import { fetchActiveCourses } from '../lib/api';
import { FAILSAFE_COURSES } from '../constants/courses';

import SEO from '../components/SEO';

export default function CoursesPage() {
  const { data: coursesDataRaw, error } = useQuery({
    queryKey: ['active-courses'],
    queryFn: fetchActiveCourses,
    initialData: FAILSAFE_COURSES
  });

  const allCourses = useMemo(() => {
    if (coursesDataRaw && coursesDataRaw.length > 0) return coursesDataRaw;
    return FAILSAFE_COURSES;
  }, [coursesDataRaw]);

  return (
    <>
      <SEO 
        title="Technical Courses & Training Programs"
        description="Explore our range of professional technical courses including Chip-Level Repairing, Networking, and CCTV systems."
        canonical="/courses"
      />

      <div className="bg-[var(--color-primary-50)] py-12 md:py-16 border-b border-[var(--color-border)]">
        <div className="container-wide px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-text-primary)]">
            Our <span className="text-[var(--color-primary-600)]">Courses</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl">
            Choose from our specialized programs designed to give you practical, hands-on experience and a guaranteed path to your career.
          </p>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        {/* Content */}
        {error ? (
           <div className="text-center py-12">
             <p className="text-[var(--color-error)]">Failed to load courses. Please try again.</p>
           </div>
        ) : allCourses.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)]">
            <p className="text-[var(--color-text-primary)] text-lg font-medium mb-2">No courses found matching this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real Data rendering logic will map over allCourses */}
            {allCourses.map(course => (
              <div key={course.id} className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary-200)] flex flex-col h-full group">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={course.imageUrl || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&w=600&q=80'} 
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
                    <div className="font-bold text-lg text-[var(--color-primary-700)]">
                      {course.price > 0 ? `₹${course.price}` : 'Fee Details →'}
                    </div>
                    <Link to={`/courses/${course.slug}`} className="btn-primary">
                      {course.price > 0 ? 'View Details' : 'Enquire Now'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
