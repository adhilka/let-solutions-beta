import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { fetchCourseBySlug } from '../lib/api';
import { FAILSAFE_COURSES } from '../constants/courses';
import { CheckCircle, Clock, Zap, MessageSquare, ArrowLeft, ChevronRight, MonitorSmartphone, ShieldCheck, Server, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

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

  const course = serverCourse || FAILSAFE_COURSES.find(c => c.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="text-slate-600 mb-8">The course you are looking for does not exist or has been moved.</p>
        <Link to="/courses" className="btn-primary">Back to All Courses</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{course.title} | Let Solutions</title>
        <meta name="description" content={course.shortDescription} />
      </Helmet>

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
                {[
                  '100% Practical Training',
                  'Live Projects & Industry Cases',
                  'Internship Opportunities',
                  'Job Placement Assistance',
                  'Latest Tools & Equipment',
                  'Certification of Completion'
                ].map((item, i) => (
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
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-3xl font-extrabold text-blue-700">
                    {course.price > 0 ? `₹${course.price}` : 'Free'}
                  </span>
                  {course.badge && <span className="badge badge-red">{course.badge}</span>}
                </div>

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
                  <div className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MessageSquare size={16} />
                      <span>Language</span>
                    </div>
                    <span className="font-bold text-slate-900">English / Hindi</span>
                  </div>
                </div>

                <button className="w-full btn-primary py-4 px-6 text-lg font-bold shadow-lg shadow-blue-100">
                  Enroll Now
                </button>
                <Link to="/contact" className="block w-full btn-secondary text-center">
                  Enquire for Details
                </Link>

                <p className="text-xs text-center text-slate-400">
                  Locked for enrollment? <Link to="/contact" className="text-blue-600 underline">Contact Support</Link>
                </p>
              </div>

              <div className="bg-blue-600 rounded-3xl p-8 text-white space-y-4">
                <h3 className="text-xl font-bold">Have Questions?</h3>
                <p className="text-blue-100 text-sm">
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
