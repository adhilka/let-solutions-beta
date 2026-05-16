import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dualWrite } from '../lib/firebase/dualWrite';
import TipTapEditor from '../components/TipTapEditor';

export default function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft',
    category: 'industry-updates',
    content: '',
    coverImage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalCoverImage = formData.coverImage;

      if (imageFile) {
        const { uploadToImgBB } = await import('../lib/imgbb');
        const res = await uploadToImgBB(imageFile);
        finalCoverImage = res.url;
      }

      const docId = id || `post_${Date.now()}`;
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'posts', docId], {
        ...formData,
        coverImage: finalCoverImage,
        updatedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['latest-posts'] });
      navigate('/admin/posts');
    } catch (err) {
      console.error(err);
      alert("Error saving post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] p-8">
           <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Post Title</label>
               <input type="text" className="input text-lg font-bold" placeholder="Write a catchy title..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} required />
             </div>
             
             <div className="mt-6">
               <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Content</label>
               <TipTapEditor 
                 content={formData.content} 
                 onChange={content => setFormData({ ...formData, content })}
               />
             </div>
           </form>
        </div>
        
        <div className="space-y-6">
           <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] p-6">
               <h3 className="font-bold mb-4">Publishing</h3>
               <button type="submit" form="post-form" disabled={isSubmitting} className="btn-primary w-full mb-3">
                 {isSubmitting ? 'Saving...' : 'Save Draft'}
               </button>
               <button type="button" onClick={() => navigate('/admin/posts')} className="btn-secondary w-full">Cancel</button>
           </div>
           
           <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] p-6">
               <h3 className="font-bold mb-4">Meta Data</h3>

               <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Cover Image</label>
               <div className="space-y-2 mb-4">
                 {formData.coverImage && <img src={formData.coverImage} className="w-full h-32 object-cover rounded border" alt="Cover" />}
                 <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[10px]" />
               </div>
               <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Category</label>
               <select className="input mb-4 text-sm py-2 px-3" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                 <option value="chip-level">Chip Level</option>
                 <option value="hardware-tips">Hardware Tips</option>
                 <option value="industry-updates">Industry Updates</option>
               </select>

               <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2 mt-4">Status</label>
               <select className="input mb-4 text-sm py-2 px-3" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                 <option value="draft">Draft</option>
                 <option value="published">Published</option>
                 <option value="archived">Archived</option>
               </select>
           </div>
        </div>
      </div>
    </div>
  );
}
