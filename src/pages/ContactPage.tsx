import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';
import { dualWrite } from '../lib/firebase/dualWrite';
import { useQuery } from '@tanstack/react-query';
import { fetchActiveCourses } from '../lib/api';
import { FAILSAFE_COURSES } from '../constants/courses';

import SEO from '../components/SEO';

export default function ContactPage() {
  const { data: coursesDataRaw, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['active-courses-dropdown'],
    queryFn: fetchActiveCourses,
    initialData: FAILSAFE_COURSES
  });

  const courses = (coursesDataRaw && coursesDataRaw.length > 0) ? coursesDataRaw : FAILSAFE_COURSES;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    courseInterested: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newId = `enquiry-${Date.now()}`;
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'enquiries', newId], {
        ...formData,
        status: 'new',
        submittedAt: new Date().toISOString()
      });
      alert('Thank you for contacting us! We will get back to you shortly.');
      setFormData({ name: '', phone: '', email: '', courseInterested: '', message: '' });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with Let Solutions Technical Institute in Tirur, Kerala. Call us at +91 95628 54444 for admissions and course enquiries."
        canonical="/contact"
      />

      <div className="bg-[var(--color-primary-900)] text-white py-16">
        <div className="container-wide px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Get in <span className="text-[var(--color-primary-400)]">Touch</span>
          </h1>
          <p className="text-lg text-[var(--color-primary-200)] max-w-2xl mx-auto">
            We are always here to help you. Reach out to us for any queries regarding courses or admissions.
          </p>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-16 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] border border-[var(--color-border)] flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Visit Us</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  1st Floor, Bus Stand Building,<br />
                  Tirur, Malappuram (Dist),<br />
                  Kerala, India - 676101
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] border border-[var(--color-border)] flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                 <h3 className="font-bold text-lg mb-2">Call Us</h3>
                 <p className="text-[var(--color-text-secondary)] text-sm mb-1">
                   Primary: <a href="tel:+919562854444" className="text-[var(--color-primary-600)] hover:underline">+91 95628 54444</a>
                 </p>
                 <p className="text-[var(--color-text-secondary)] text-sm">
                   WhatsApp: <a href="https://wa.me/919562854444" className="text-[var(--color-primary-600)] hover:underline">+91 95628 54444</a>
                 </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] border border-[var(--color-border)] flex items-start gap-4">
               <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Email</h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-1">
                   <a href="mailto:info@letsolutions.in" className="text-[var(--color-primary-600)] hover:underline">info@letsolutions.in</a>
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                   <a href="mailto:letsolutionstirur@gmail.com" className="text-[var(--color-primary-600)] hover:underline">letsolutionstirur@gmail.com</a>
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] border border-[var(--color-border)] flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
               <div>
                <h3 className="font-bold text-lg mb-2">Working Hours</h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-1">Monday – Saturday</p>
                <p className="text-[var(--color-primary-600)] font-medium text-sm border bg-[var(--color-primary-50)] border-[var(--color-primary-200)] mt-2 inline-block px-2 py-1 rounded">09:30 AM – 05:30 PM</p>
              </div>
            </div>
          </div>

          {/* Form and Map */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] border border-[var(--color-border)]">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-sm text-[var(--color-text-secondary)] mb-2">Full Name *</label>
                    <input type="text" className="input" placeholder="Enter your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block font-medium text-sm text-[var(--color-text-secondary)] mb-2">Phone Number *</label>
                    <input type="tel" className="input" placeholder="10-digit mobile number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required pattern="[6-9][0-9]{9}" />
                  </div>
                </div>
                <div>
                   <label className="block font-medium text-sm text-[var(--color-text-secondary)] mb-2">Email Address</label>
                   <input type="email" className="input" placeholder="Enter your email (optional)" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block font-medium text-sm text-[var(--color-text-secondary)] mb-2">Course Interested In</label>
                  <div className="relative">
                    <select 
                      className="input bg-white appearance-none pr-10" 
                      value={formData.courseInterested} 
                      onChange={e => setFormData({ ...formData, courseInterested: e.target.value })}
                      required
                    >
                      <option value="">Select a course...</option>
                      {courses.map((course: any) => (
                        <option key={course.id} value={course.title}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    {isCoursesLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-sm text-[var(--color-text-secondary)] mb-2">Message</label>
                  <textarea className="input min-h-[120px] resize-y" placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full md:w-auto">
                  {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </form>
            </div>
            
            {/* Map Placeholder, would be an iframe */}
            <div className="h-[400px] w-full bg-gray-200 rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-card)] border border-[var(--color-border)] flex items-center justify-center">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.634123545671!2d75.922119!3d10.990479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7b16555555555%3A0xc000000000000000!2sLet%20Solutions!5e0!3m2!1sen!2sin!4v1625555555555!5m2!1sen!2sin" 
                className="w-full h-full border-0"
                allowFullScreen={true} 
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
