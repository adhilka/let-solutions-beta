import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Quote, Star, PlayCircle, PlusCircle, XCircle } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { dualWrite } from '../lib/firebase/dualWrite';
import { Testimonial } from '../types';
import { FAILSAFE_TESTIMONIALS } from '../constants/failsafe';

import SEO from '../components/SEO';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    rating: 5,
    content: '',
    imageUrl: ''
  });

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const db = getReadDb();
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/testimonials'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(data.length > 0 ? data : FAILSAFE_TESTIMONIALS as Testimonial[]);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

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
        approved: true, // Auto-approve as requested
        isFeatured: false,
        createdAt: new Date().toISOString()
      };
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', newId], testimonialData);
      alert('Thank you! Your feedback has been published.');
      setIsModalOpen(false);
      setFormData({ name: '', course: '', rating: 5, content: '', imageUrl: '' });
      setImageFile(null);
      fetchTestimonials(); // Refresh list immediately
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbSchema = {
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
        "name": "Student Reviews",
        "item": "https://letsolutions.in/feedbacks"
      }
    ]
  };

  return (
    <div className="bg-[var(--color-surface)] min-h-screen pt-24 pb-16">
      <SEO 
        title="Student Success Stories & Reviews | Let Solutions Tirur"
        description="Read what our students say about their learning experience at Let Solutions. Join hundreds of successful technicians who started their journey with us."
        keywords="student reviews let solutions, tirur technical institute testimonials, repair course success stories, malappuram tech training reviews"
        canonical="/feedbacks"
        structuredData={breadcrumbSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">Student Feedbacks</h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Hear directly from our alumni who have transformed their careers through our practical training programs.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 btn-primary px-6 py-3 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Share Your Experience
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--color-primary-600)] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map(t => (
              <div key={t.id} className="break-inside-avoid bg-[var(--color-surface-alt)] p-6 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary-600)] transition">
                <Quote className="w-8 h-8 text-[var(--color-primary-900)] mb-4" />
                <p className="text-[var(--color-text-primary)] italic mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center">
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={t.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-900)] flex items-center justify-center text-[var(--color-primary-400)] font-bold mr-4 flex shrink-0">
                      <span className="mx-auto">{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[var(--color-text-primary)]">{t.name}</h4>
                    <p className="text-sm text-[var(--color-primary-400)]">{t.course} {t.batch && <span className="text-[var(--color-text-tertiary)]">- Batch {t.batch}</span>}</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {t.videoUrl && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                     <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-red-400 text-sm font-medium hover:text-red-300">
                       <PlayCircle className="w-4 h-4 mr-2" />
                       Watch Video Testimonial
                     </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && testimonials.length === 0 && (
          <div className="text-center py-20 bg-[var(--color-surface-alt)] rounded-2xl border border-[var(--color-border)] shadow-sm">
            <Star className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">No feedbacks yet</h3>
            <p className="text-slate-500">Student feedbacks will appear here once approved.</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)]">
              <h2 className="text-xl font-bold text-white">Share Your Experience</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Your Name</label>
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
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Course Attended</label>
                <input
                  required
                  type="text"
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Laptop Chip-Level Repair"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 transition-transform active:scale-95"
                    >
                      <Star className={`w-8 h-8 ${star <= formData.rating ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Profile Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary-900)] file:text-[var(--color-primary-400)] hover:file:bg-[var(--color-primary-800)] transition"
                />
                {imageFile && <p className="text-[10px] text-blue-400 mt-1">Selected: {imageFile.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Your Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="input w-full"
                  placeholder="Tell us about your learning journey..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <p className="text-center text-xs text-slate-500">
                Your feedback will be visible on the site after a quick review.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
