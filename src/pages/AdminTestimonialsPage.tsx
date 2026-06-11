import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { Plus, Search, CheckCircle, XCircle, Trash2, Edit2, PlayCircle, Star, Filter } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import { Testimonial } from '../types';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    batch: '',
    rating: 5,
    content: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const db = getReadDb();
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/testimonials'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unapprove' : 'approve'} this feedback?`)) return;
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', id], { approved: !currentStatus });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: !currentStatus } : t));
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', id], { isFeatured: !currentStatus });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isFeatured: !currentStatus } : t));
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this feedback?")) return;
      await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', id]);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        const { uploadToImgBB } = await import('../lib/imgbb');
        const res = await uploadToImgBB(imageFile);
        finalImageUrl = res.url;
      }

      const newId = `testimonial-${Date.now()}`;
      const testimonialData = {
        name: formData.name,
        course: formData.course,
        batch: formData.batch,
        rating: formData.rating,
        content: formData.content,
        imageUrl: finalImageUrl,
        approved: true,
        isFeatured: false,
        createdAt: new Date().toISOString()
      };
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', newId], testimonialData);
      
      setTestimonials(prev => [{ id: newId, ...testimonialData } as Testimonial, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
      setIsModalOpen(false);
      setFormData({ name: '', course: '', batch: '', rating: 5, content: '', imageUrl: '' });
      setImageFile(null);
    } catch (error) {
      console.error('Error adding testimonial:', error);
      alert('Failed to add feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (!t) return false;
    const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'approved') return matchesSearch && t.approved;
    if (filter === 'pending') return matchesSearch && !t.approved;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white mb-2 uppercase italic tracking-tight">Student Feedbacks</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] font-medium">Manage student reviews and video testimonials</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-xl shadow-blue-900/20"
        >
          <Plus size={18} /> Add Feedback
        </button>
      </div>

      <div className="bg-[var(--color-surface-alt)] p-5 rounded-2xl shadow-lg border border-[var(--color-border)] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search student records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-white text-sm"
          />
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-[var(--color-text-tertiary)]" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="flex-1 md:flex-none bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none text-white text-sm font-bold uppercase tracking-wider"
          >
            <option value="all">All Records</option>
            <option value="approved">Approved</option>
            <option value="pending">In Review</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin w-10 h-10 border-4 border-[var(--color-primary-400)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {filteredTestimonials.map(t => (
            <div key={t.id} className="bg-[var(--color-surface-alt)] rounded-[2rem] shadow-xl border border-[var(--color-border)] hover:border-[var(--color-primary-600)] transition-all duration-300 overflow-hidden flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    {t.imageUrl ? (
                      <div className="relative">
                        <img src={t.imageUrl} alt={t.name || ""} className="w-12 h-12 rounded-2xl object-cover mr-4 border border-[var(--color-border)] shadow-lg" />
                        <div className="absolute inset-0 bg-black/10 rounded-2xl" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] flex items-center justify-center text-[var(--color-primary-400)] font-black text-xl mr-4 shadow-lg uppercase">
                        {(t.name || "T").charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-white uppercase tracking-tight text-sm">{t.name || "Anonymous"}</h3>
                      <p className="text-[10px] text-[var(--color-primary-400)] font-black uppercase tracking-widest mt-1">{t.course} {t.batch && `— ${t.batch}`}</p>
                    </div>
                  </div>
                  {t.videoUrl && (
                    <span className="text-red-500 animate-pulse" title="Video Testimonial">
                      <PlayCircle className="w-7 h-7" />
                    </span>
                  )}
                </div>

                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 mr-0.5 ${i < t.rating ? 'text-yellow-400 fill-current' : 'text-[var(--color-border)]'}`} />
                  ))}
                </div>

                <p className="text-[var(--color-text-secondary)] text-sm italic font-medium leading-relaxed line-clamp-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-inner">
                   "{t.content}"
                </p>
              </div>

              <div className="bg-black/20 p-4 flex items-center justify-between border-t border-[var(--color-border)] mt-auto">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => toggleApproval(t.id!, t.approved)}
                    title={t.approved ? "Approved - Click to Unapprove" : "Pending - Click to Approve"}
                    className={`p-2 rounded-xl transition-all ${t.approved ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'}`}
                  >
                    {t.approved ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => toggleFeatured(t.id!, t.isFeatured)}
                    title={t.isFeatured ? "Featured" : "Not Featured"}
                    className={`p-2 rounded-xl transition-all ${t.isFeatured ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 shadow-lg' : 'text-[var(--color-text-tertiary)] bg-white/5 hover:bg-white/10'}`}
                  >
                    <Star className={`w-5 h-5 ${t.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-2 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id!)}
                    className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredTestimonials.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[var(--color-surface-alt)] rounded-[2.5rem] border-2 border-dashed border-[var(--color-border)]">
              <Star className="w-16 h-16 text-[var(--color-text-tertiary)] mx-auto mb-6 opacity-20" />
              <p className="text-[var(--color-text-secondary)] text-lg font-bold uppercase italic tracking-widest">No matching feedback artifacts.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface-alt)] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--color-border)] animate-scale-up">
            <div className="flex justify-between items-center p-8 border-b border-[var(--color-border)] bg-black/20">
              <h2 className="text-2xl font-extrabold text-white uppercase italic tracking-tight">Manual Input Feedback</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text-tertiary)] hover:text-white bg-white/5 p-2 rounded-full border border-[var(--color-border)] transition-all">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Student Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    placeholder="e.g. Adhil Tirur"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Course Architecture</label>
                  <input
                    required
                    type="text"
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="input w-full"
                    placeholder="e.g. Master Diploma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Batch Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={e => setFormData({ ...formData, batch: e.target.value })}
                    className="input w-full font-mono"
                    placeholder="e.g. 2024-C1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Rating Metric</label>
                  <select
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="input w-full text-white font-bold"
                  >
                    <option value="5">Excellent (5 Stars)</option>
                    <option value="4">Good (4 Stars)</option>
                    <option value="3">Average (3 Stars)</option>
                    <option value="2">Below Average (2 Stars)</option>
                    <option value="1">Poor (1 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Testimonial Content</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="input w-full min-h-[120px]"
                  placeholder="Insert student narrative..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Profile Picture</label>
                  <div className="relative aspect-square w-32 bg-[var(--color-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border)] overflow-hidden flex flex-col items-center justify-center transition-all hover:border-[var(--color-primary-600)]">
                    {imageFile || formData.imageUrl ? (
                      <>
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt="Profile Preview" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-[8px] font-black uppercase text-white shadow-sm">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <Plus size={16} className="text-[var(--color-text-tertiary)] mx-auto mb-1" />
                        <p className="text-[8px] text-[var(--color-text-tertiary)] font-bold uppercase">Upload</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setImageFile(e.target.files?.[0] || null)} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 rounded-xl border border-[var(--color-border)] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-10 shadow-xl shadow-blue-900/40"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Deploy Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
