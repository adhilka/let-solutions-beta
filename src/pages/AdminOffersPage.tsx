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
    imageUrl: ''
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
      imageUrl: offer.imageUrl || ''
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
      imageUrl: ''
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
      setFormData({ headline: '', subtext: '', badgeLabel: 'LIMITED', ctaLabel: 'Claim Now', ctaHref: '/contact', showOnAdmissions: true, order: 0, imageUrl: '' });
      setImageFile(null);
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Failed to save offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Notices</h1>
          <p className="mt-1 text-sm text-gray-500">Manage admission offers, scholarships, and notices.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[var(--color-primary-700)] transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Offer
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] flex flex-col items-start relative opacity-100 transition-opacity">
              <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={() => toggleVisibility(offer.id!, offer.showOnAdmissions)}
                    title={offer.showOnAdmissions ? "Visible - Click to Hide" : "Hidden - Click to Show"}
                    className={`p-1.5 rounded-md ${offer.showOnAdmissions ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                  >
                    {offer.showOnAdmissions ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => openEditModal(offer)}
                    className="p-1.5 text-gray-500 hover:text-[var(--color-primary-600)] hover:bg-blue-50 rounded-md"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id!)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
              
              <div className="flex items-start gap-4 mb-3 w-full">
                {offer.imageUrl && <img src={offer.imageUrl} className="w-16 h-16 object-cover rounded-lg border flex-shrink-0" alt="" />}
                <div className="flex-grow min-w-0 pr-24">
                  {offer.badgeLabel && (
                    <span className={`badge ${offer.badgeLabel === 'LIMITED' ? 'badge-red' : 'badge-blue'} mb-1 inline-block text-[10px]`}>{offer.badgeLabel}</span>
                  )}
                  <h3 className="font-bold text-lg leading-tight truncate">{offer.headline}</h3>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-grow line-clamp-2">{offer.subtext}</p>
              <div className="text-xs text-gray-400 mt-auto">CTA: {offer.ctaLabel} ({offer.ctaHref})</div>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-lg border border-gray-100">
              <p className="text-gray-500 text-lg">No offers found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Offer' : 'Add New Offer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                  <input required type="text" value={formData.headline} onChange={e => setFormData({ ...formData, headline: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 30% Scholarship on MDCE" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
                  <textarea required rows={3} value={formData.subtext} onChange={e => setFormData({ ...formData, subtext: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Describe the offer..."></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Label</label>
                  <input type="text" value={formData.badgeLabel} onChange={e => setFormData({ ...formData, badgeLabel: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. EARLY BIRD" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Photo (Banner)</label>
                  <div className="flex items-center gap-3">
                    {formData.imageUrl && !imageFile && (
                      <img src={formData.imageUrl} className="w-10 h-10 object-cover rounded border" alt="" />
                    )}
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Label</label>
                  <input type="text" value={formData.ctaLabel} onChange={e => setFormData({ ...formData, ctaLabel: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Claim Now" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Href</label>
                  <input 
                    type="text" 
                    list="site-links"
                    value={formData.ctaHref} 
                    onChange={e => setFormData({ ...formData, ctaHref: e.target.value })} 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="/contact" 
                  />
                  <datalist id="site-links">
                    {siteLinks?.map((link, idx) => (
                      <option key={idx} value={link.value}>{link.label}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input type="checkbox" id="showOnAdmissions" checked={formData.showOnAdmissions} onChange={e => setFormData({ ...formData, showOnAdmissions: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2" />
                <label htmlFor="showOnAdmissions" className="text-sm font-medium text-gray-700">Show on Admissions & Home Page</label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[var(--color-primary-600)] text-white rounded-lg font-bold hover:bg-[var(--color-primary-700)] shadow-lg shadow-blue-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Offer' : 'Create Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
