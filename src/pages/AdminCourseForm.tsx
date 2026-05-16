import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dualWrite } from '../lib/firebase/dualWrite';

export default function AdminCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      import('../lib/api').then(({ fetchCourseBySlug }) => {
        // Here we'd ideally fetch by ID, but based on current API let's assume we can find it
        // Or better yet, we might need a fetchCourseById. 
        // For now let's assume we use what we have or just wait for the user to select.
        // Actually, let's implement a quick fetch from Firestore directly if needed or use api
      });
      
      // Better implementation:
      const fetchCourse = async () => {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { getReadDb } = await import('../lib/firebase/loadBalancer');
          const db = getReadDb();
          const d = await getDoc(doc(db, `artifacts/tech-institute/public/data/courses/${id}`));
          if (d.exists()) {
            setFormData(prev => ({ ...prev, ...d.data() }));
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
    isPinned: false
  });

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
        imageUrl: finalImageUrl
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
      
      <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Course Title</label>
                <input type="text" className="input" placeholder="e.g. Master Diploma In Chip-Level Engineering" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Slug</label>
                <input type="text" className="input" placeholder="e.g. master-diploma-in-chip-level-engineering" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Price (₹)</label>
                <input type="number" className="input" placeholder="e.g. 15000" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Sort Order</label>
                <input type="number" className="input" placeholder="e.g. 1" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Badge (Optional)</label>
                <input type="text" className="input" placeholder="e.g. Bestseller" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Category</label>
                <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="chip-level">Chip level</option>
                  <option value="laptop-chip-level">Laptop Chip-Level</option>
                  <option value="mobile-chip-level">Mobile Chip-Level</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="cctv">CCTV</option>
                  <option value="networking">Networking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Duration</label>
                <input type="text" className="input" placeholder="e.g. 6 Months" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Level</label>
                <select className="input" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Short Description</label>
              <textarea className="input text-sm" placeholder="A brief summary for cards..." rows={2} value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Thumbnail Image</label>
              <div className="flex items-center gap-4">
                {formData.imageUrl && <img src={formData.imageUrl} className="w-20 h-20 object-cover rounded border" alt="Thumbnail" />}
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Full Description</label>
              <textarea 
                className="input w-full min-h-[200px]" 
                placeholder="Write detailed course content here..." 
                value={formData.description || ''} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
           
           <div className="mt-6 flex flex-col gap-3">
             <div className="flex items-center gap-2">
               <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
               <label htmlFor="isActive" className="text-sm font-medium text-[var(--color-text-secondary)]">Active (visible to public)</label>
             </div>
             <div className="flex items-center gap-2">
               <input type="checkbox" id="isPinned" checked={formData.isPinned} onChange={e => setFormData({ ...formData, isPinned: e.target.checked })} />
               <label htmlFor="isPinned" className="text-sm font-medium text-[var(--color-text-secondary)]">Pin to Home Screen (Max 3)</label>
             </div>
           </div>

           <div className="flex justify-end gap-3 mt-8">
             <button type="button" onClick={() => navigate('/admin/courses')} className="btn-secondary">Cancel</button>
             <button type="submit" disabled={isSubmitting} className="btn-primary">
               {isSubmitting ? 'Saving...' : 'Save Course'}
             </button>
           </div>
         </form>
      </div>
    </div>
  );
}
