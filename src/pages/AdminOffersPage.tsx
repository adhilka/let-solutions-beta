import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Search, CheckCircle, XCircle, Trash2, Edit2 } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';

export default function AdminOffersPage() {
  const queryClient = useQueryClient();
  
  // Fetch all available links for suggestions
  const { data: siteLinks } = useQuery({
    queryKey: ['all-site-links'],
    queryFn: async () => {
      const db = getReadDb();
      const staticLinks = [
        { label: 'Home', value: '/' },
        { label: 'Courses', value: '/courses' },
        { label: 'About Us', value: '/about' },
        { label: 'Contact', value: '/contact' },
        { label: 'Admissions', value: '/admissions' },
        { label: 'Blog', value: '/blog' },
        { label: 'Feedbacks', value: '/feedbacks' },
      ];

      try {
        // Fetch Courses
        const coursesSnap = await getDocs(query(collection(db, 'artifacts/tech-institute/public/data/courses'), where('isActive', '==', true)));
        const courseLinks = coursesSnap.docs.map(doc => ({
          label: `Course: ${doc.data().title}`,
          value: `/courses/${doc.data().slug}`
        }));

        // Fetch Posts
        const postsSnap = await getDocs(query(collection(db, 'artifacts/tech-institute/public/data/posts'), where('status', '==', 'published')));
        const postLinks = postsSnap.docs.map(doc => ({
          label: `Blog: ${doc.data().title}`,
          value: `/blog/${doc.data().slug}`
        }));

        return [...staticLinks, ...courseLinks, ...postLinks];
      } catch (err) {
        console.error("Error fetching links for suggestions:", err);
        return staticLinks;
      }
    }
  });

  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    headline: '',
    subtext: '',
    badgeLabel: 'LIMITED',
    ctaLabel: 'Claim Now',
    ctaHref: '/contact',
    showOnAdmissions: true,
    order: 0,
    imageUrl: '',
    discountedFee: ''
  });

  const openEditModal = (offer: any) => {
    setEditingId(offer.id);
    setFormData({
      headline: offer.headline || '',
      subtext: offer.subtext || '',
      badgeLabel: offer.badgeLabel || 'LIMITED',
      ctaLabel: offer.ctaLabel || 'Claim Now',
      ctaHref: offer.ctaHref || '/contact',
      showOnAdmissions: offer.showOnAdmissions ?? true,
      order: offer.order || 0,
      imageUrl: offer.imageUrl || '',
      discountedFee: offer.discountedFee || ''
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      headline: '',
      subtext: '',
      badgeLabel: 'LIMITED',
      ctaLabel: 'Claim Now',
      ctaHref: '/contact',
      showOnAdmissions: true,
      order: 0,
      imageUrl: '',
      discountedFee: ''
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const db = getReadDb();
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/offers'),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'offers', id], { showOnAdmissions: !currentStatus });
      setOffers(prev => prev.map(t => t.id === id ? { ...t, showOnAdmissions: !currentStatus } : t));
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this offer?")) return;
      await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'offers', id]);
      setOffers(prev => prev.filter(t => t.id !== id));
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
    } catch (error) {
      console.error("Error deleting offer:", error);
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

      const id = editingId || `offer-${Date.now()}`;
      const offerData = { ...formData, imageUrl: finalImageUrl };
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'offers', id], offerData);
      
      if (editingId) {
        setOffers(prev => prev.map(o => o.id === editingId ? { id, ...offerData } : o));
      } else {
        setOffers(prev => [...prev, { id, ...offerData }]);
      }

      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ headline: '', subtext: '', badgeLabel: 'LIMITED', ctaLabel: 'Claim Now', ctaHref: '/contact', showOnAdmissions: true, order: 0, imageUrl: '', discountedFee: '' });
      setImageFile(null);
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Failed to save offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white mb-2 uppercase italic tracking-tight">Offers & Notices</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] font-medium">Manage admission offers, <span className="text-[var(--color-neon-green)] font-bold">scholarships</span>, and system notices.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2 shadow-xl shadow-blue-900/20"
        >
          <Plus size={18} /> Add Offer
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin w-10 h-10 border-4 border-[var(--color-primary-400)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {offers.map(offer => (
            <div key={offer.id} className="bg-[var(--color-surface-alt)] p-6 rounded-[2rem] shadow-xl border border-[var(--color-border)] flex flex-col items-start relative hover:border-[var(--color-primary-600)] transition-all duration-300 group">
              <div className="absolute top-5 right-5 flex space-x-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleVisibility(offer.id!, offer.showOnAdmissions)}
                    title={offer.showOnAdmissions ? "Visible - Click to Hide" : "Hidden - Click to Show"}
                    className={`p-2 rounded-xl transition-colors ${offer.showOnAdmissions ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'text-[var(--color-text-tertiary)] bg-white/5 hover:bg-white/10'}`}
                  >
                    {offer.showOnAdmissions ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => openEditModal(offer)}
                    className="p-2 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id!)}
                    className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
              
              <div className="flex items-start gap-5 mb-5 w-full">
                {offer.imageUrl && (
                  <div className="relative shrink-0">
                    <img src={offer.imageUrl} className="w-20 h-20 object-cover rounded-2xl border border-[var(--color-border)] shadow-md" alt="" />
                    <div className="absolute inset-0 bg-black/10 rounded-2xl" />
                  </div>
                )}
                <div className="flex-grow min-w-0 pr-12">
                  {offer.badgeLabel && (
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-[0.2em] mb-2 border ${
                      offer.badgeLabel === 'LIMITED' 
                        ? 'text-red-400 bg-red-500/10 border-red-500/20' 
                        : 'text-[var(--color-primary-400)] bg-[var(--color-primary-900)] border-[var(--color-primary-800)]'
                    }`}>
                      {offer.badgeLabel}
                    </span>
                  )}
                  <h3 className="font-extrabold text-white text-lg leading-tight uppercase tracking-tight line-clamp-2">{offer.headline}</h3>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 flex-grow font-medium leading-relaxed line-clamp-3">
                {offer.subtext}
              </p>
              
              <div className="w-full pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <div className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)]" />
                  {offer.ctaLabel}
                </div>
                {offer.discountedFee && (
                  <div className="text-sm font-black text-[var(--color-neon-green)] italic">
                    {offer.discountedFee}
                  </div>
                )}
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[var(--color-surface-alt)] rounded-[2rem] border-2 border-dashed border-[var(--color-border)]">
              <Search className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-4 opacity-20" />
              <p className="text-[var(--color-text-secondary)] text-lg font-bold uppercase italic">No active offers detected.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface-alt)] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--color-border)] animate-scale-up">
            <div className="flex justify-between items-center p-8 border-b border-[var(--color-border)] bg-black/20">
              <h2 className="text-2xl font-extrabold text-white uppercase italic tracking-tight">
                {editingId ? 'Edit Configuration' : 'Add New Notice'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-[var(--color-text-tertiary)] hover:text-white bg-white/5 p-2 rounded-full border border-[var(--color-border)] transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Headline</label>
                  <input required type="text" value={formData.headline} onChange={e => setFormData({ ...formData, headline: e.target.value })} className="input w-full" placeholder="e.g. 30% Scholarship on MDCE" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Detailed Logic (Subtext)</label>
                  <textarea required rows={4} value={formData.subtext} onChange={e => setFormData({ ...formData, subtext: e.target.value })} className="input w-full" placeholder="Describe the offer parameters..."></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Badge Identifier</label>
                  <input type="text" value={formData.badgeLabel} onChange={e => setFormData({ ...formData, badgeLabel: e.target.value })} className="input w-full" placeholder="e.g. EARLY BIRD" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Discounted Metric (Optional)</label>
                  <input type="text" value={formData.discountedFee} onChange={e => setFormData({ ...formData, discountedFee: e.target.value })} className="input w-full font-mono" placeholder="e.g. ₹15,000" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Visual Anchor (Banner)</label>
                  <div className="flex items-center gap-4 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                    {formData.imageUrl && !imageFile && (
                      <img src={formData.imageUrl} className="w-10 h-10 object-cover rounded-lg border border-[var(--color-border)]" alt="" />
                    )}
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[10px] text-[var(--color-text-tertiary)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary-900)] file:text-[var(--color-primary-400)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Priority Sequence (Order)</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} className="input w-full font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Interaction Label (CTA)</label>
                  <input type="text" value={formData.ctaLabel} onChange={e => setFormData({ ...formData, ctaLabel: e.target.value })} className="input w-full" placeholder="e.g. Claim Now" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] mb-2 uppercase tracking-[0.2em]">Target Destination (CTA Href)</label>
                  <input 
                    type="text" 
                    list="site-links"
                    value={formData.ctaHref} 
                    onChange={e => setFormData({ ...formData, ctaHref: e.target.value })} 
                    className="input w-full font-mono" 
                    placeholder="/contact" 
                  />
                  <datalist id="site-links">
                    {siteLinks?.map((link, idx) => (
                      <option key={idx} value={link.value}>{link.label}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex items-center bg-white/5 p-4 rounded-2xl border border-[var(--color-border)] mt-4">
                <input type="checkbox" id="showOnAdmissions" checked={formData.showOnAdmissions} onChange={e => setFormData({ ...formData, showOnAdmissions: e.target.checked })} className="w-5 h-5 text-[var(--color-primary-600)] rounded-lg border-[var(--color-border)] focus:ring-[var(--color-primary-500)] mr-3 bg-[var(--color-surface)]" />
                <label htmlFor="showOnAdmissions" className="text-sm font-bold text-white uppercase tracking-wider cursor-pointer">Broadcast on Public Interface</label>
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
                  {isSubmitting ? 'Syncing...' : (editingId ? 'Update Notice' : 'Initialize Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
