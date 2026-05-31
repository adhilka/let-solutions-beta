import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dualWrite } from '../lib/firebase/dualWrite';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { fetchActiveOffers } from '../lib/api';

export default function AdminCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch offers for the pinned offer dropdown
    fetchActiveOffers().then(data => {
      setAvailableOffers(data || []);
    });

    if (isEdit && id) {
      const fetchCourse = async () => {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { getReadDb } = await import('../lib/firebase/loadBalancer');
          const db = getReadDb();
          const d = await getDoc(doc(db, `artifacts/tech-institute/public/data/courses/${id}`));
          if (d.exists()) {
            setFormData(prev => ({ 
              ...prev, 
              ...d.data(),
              highlights: d.data().highlights || [] 
            }));
          }
        } catch (err) {
          console.error("Error fetching course for edit:", err);
        }
      };
      fetchCourse();
    }
  }, [id, isEdit]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    isActive: true,
    price: 0,
    order: 1,
    category: 'laptop-chip-level',
    duration: '',
    level: 'Beginner',
    shortDescription: '',
    description: '',
    imageUrl: '',
    badge: '',
    isPinned: false,
    highlights: [] as string[],
    pinnedOfferId: '',
    feeStructure: {
      registrationFee: '',
      totalFee: '',
      duration: '',
      description: ''
    }
  });

  const updateFeeStructure = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      feeStructure: {
        ...prev.feeStructure,
        [field]: value
      }
    }));
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData(prev => ({ ...prev, highlights: newHighlights }));
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

      const docId = id || `course_${Date.now()}`;
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'courses', docId], {
        ...formData,
        imageUrl: finalImageUrl,
        id: docId, // Ensure ID is present
      });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['active-courses'] });
      navigate('/admin/courses');
    } catch (err) {
      console.error(err);
      alert("Error saving course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">
            {isEdit ? 'Edit Course' : 'Create Course'}
          </h1>
        </div>
      </div>
      
      <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-lg border border-[var(--color-border)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Course Title</label>
                <input type="text" className="input" placeholder="e.g. Master Diploma In Chip-Level Engineering" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Slug (URL friendly)</label>
                <input type="text" className="input" placeholder="e.g. master-diploma-in-chip-level-engineering" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Price (₹)</label>
                <input type="number" className="input font-mono" placeholder="e.g. 15000" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Sort Order</label>
                <input type="number" className="input font-mono" placeholder="e.g. 1" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Badge (Optional)</label>
                <input type="text" className="input" placeholder="e.g. Bestseller" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Category</label>
                <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                  <option value="chip-level">Chip level</option>
                  <option value="laptop-chip-level">Laptop Chip-Level</option>
                  <option value="mobile-chip-level">Mobile Chip-Level</option>
                  <option value="hardware">Hardware</option>
                  <option value="electronics">Electronics</option>
                  <option value="cctv">CCTV</option>
                  <option value="networking">Networking</option>
                  <option value="ethical-hacking">Ethical Hacking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Duration</label>
                <input type="text" className="input" placeholder="e.g. 6 Months" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Level</label>
                <select className="input" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Short Description (for index cards)</label>
              <textarea className="input text-sm min-h-[80px]" placeholder="A brief summary for cards..." rows={2} value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Thumbnail Image</label>
                <div className="flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                  {formData.imageUrl && <img src={formData.imageUrl} className="w-16 h-16 object-cover rounded-lg border border-[var(--color-border)] shadow-sm" alt="Thumbnail" />}
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm text-[var(--color-text-tertiary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary-900)] file:text-[var(--color-primary-400)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Pinned Offer (Optional)</label>
                <select 
                  className="input" 
                  value={formData.pinnedOfferId || ''} 
                  onChange={e => setFormData({ ...formData, pinnedOfferId: e.target.value })}
                >
                  <option value="">No offer pinned</option>
                  {availableOffers.map(offer => (
                    <option key={offer.id} value={offer.id}>{offer.headline}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-8 border-t border-[var(--color-border)] pt-8">
              <label className="block text-sm font-bold text-white uppercase tracking-wider mb-6">Fee Structure (Displayed on detail page)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Registration Fee</label>
                  <input 
                    type="text" 
                    className="input font-mono" 
                    placeholder="e.g. ₹1,000" 
                    value={formData.feeStructure?.registrationFee || ''} 
                    onChange={e => updateFeeStructure('registrationFee', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Total Fee</label>
                  <input 
                    type="text" 
                    className="input font-mono" 
                    placeholder="e.g. ₹25,000" 
                    value={formData.feeStructure?.totalFee || ''} 
                    onChange={e => updateFeeStructure('totalFee', e.target.value)} 
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Fee Description / Installment Details</label>
                <textarea 
                  className="input min-h-[80px]" 
                  placeholder="Details about installments, periodic payments etc." 
                  rows={2}
                  value={formData.feeStructure?.description || ''} 
                  onChange={e => updateFeeStructure('description', e.target.value)} 
                />
              </div>
            </div>

            <div className="mt-8 border-t border-[var(--color-border)] pt-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-white uppercase tracking-wider">Key Highlights</label>
                <button type="button" onClick={addHighlight} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 border-0 shadow-md">
                  <Plus size={14} /> Add Highlight
                </button>
              </div>
              <div className="space-y-3">
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="text-slate-500 cursor-grab px-1"><GripVertical size={16} /></div>
                    <input 
                      type="text" 
                      className="input flex-grow" 
                      placeholder={`Highlight #${index + 1}`} 
                      value={highlight} 
                      onChange={e => updateHighlight(index, e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeHighlight(index)} 
                      className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {formData.highlights.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
                    <p className="text-[var(--color-text-tertiary)] text-sm italic">No highlights added yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--color-border)] pt-8">
              <label className="block text-sm font-bold text-white uppercase tracking-wider mb-2">Detailed Course Content / Description</label>
              <textarea 
                className="input w-full min-h-[250px]" 
                placeholder="Write detailed course content here..." 
                value={formData.description || ''} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
           
           <div className="mt-6 flex flex-col gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
             <div className="flex items-center gap-3">
               <input type="checkbox" id="isActive" className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
               <label htmlFor="isActive" className="text-sm font-semibold text-white">Active (Visible to public)</label>
             </div>
             <div className="flex items-center gap-3">
               <input type="checkbox" id="isPinned" className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]" checked={formData.isPinned} onChange={e => setFormData({ ...formData, isPinned: e.target.checked })} />
               <label htmlFor="isPinned" className="text-sm font-semibold text-white">Pin to Hero Carousel (Max 5)</label>
             </div>
           </div>

           <div className="flex justify-end gap-3 mt-10 pb-10">
             <button type="button" onClick={() => navigate('/admin/courses')} className="btn-secondary px-8">Cancel</button>
             <button type="submit" disabled={isSubmitting} className="btn-primary px-8 shadow-xl shadow-blue-900/20">
               {isSubmitting ? 'Saving...' : 'Save Course Data'}
             </button>
           </div>
          </form>
      </div>
    </div>
  );
}
