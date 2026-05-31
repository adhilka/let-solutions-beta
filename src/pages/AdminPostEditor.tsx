import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { dualWrite } from '../lib/firebase/dualWrite';
import TipTapEditor from '../components/TipTapEditor';
import { 
  ChevronLeft, 
  Save, 
  Globe, 
  FileText, 
  Image as ImageIcon, 
  Layout, 
  Type, 
  Link as LinkIcon, 
  AlertCircle, 
  Plus, 
  Video, 
  Trash2, 
  Paperclip, 
  Loader2 
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { docToData } from '../lib/api';

interface FileAttachment {
  name: string;
  url: string;
}

export default function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft',
    downloadUrl: '',
    content: '',
    excerpt: '',
    coverImage: '',
    postType: 'article', // 'article' | 'video'
    videoUrl: '',
    files: [] as FileAttachment[],
    author: {
      name: 'Admin',
      role: 'Staff'
    }
  });

  // Fetch post if editing
  const { isLoading: isFetching } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: async () => {
      if (!id) return null;
      const db = getReadDb();
      const d = await getDoc(doc(db, `artifacts/tech-institute/public/data/posts/${id}`));
      if (d.exists()) {
        const data = docToData<any>(d);
        
        // Backward-compatibility: if legacy files format is missing but downloadUrl exists
        let initialFiles: FileAttachment[] = [];
        if (data.files && Array.isArray(data.files)) {
          initialFiles = data.files;
        } else if (data.downloadUrl) {
          initialFiles = [{ name: 'Technical Material', url: data.downloadUrl }];
        }

        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          status: data.status || 'draft',
          downloadUrl: data.downloadUrl || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          coverImage: data.coverImage || '',
          postType: data.postType || (data.videoUrl ? 'video' : 'article'),
          videoUrl: data.videoUrl || '',
          files: initialFiles,
          author: data.author || { name: 'Admin', role: 'Staff' }
        });
        return data;
      }
      return null;
    },
    enabled: isEdit
  });

  const handleAddAttachment = () => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, { name: '', url: '' }]
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateAttachment = (index: number, key: 'name' | 'url', value: string) => {
    setFormData(prev => {
      const updatedFiles = [...prev.files];
      updatedFiles[index] = { ...updatedFiles[index], [key]: value };
      return { ...prev, files: updatedFiles };
    });
  };

  const handleAttachmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const gitFormData = new FormData();
      gitFormData.append('file', file);
      
      const response = await fetch('/api/github/upload', {
        method: 'POST',
        body: gitFormData
      });
      
      const data = await response.json();
      if (data.success && data.url) {
        handleUpdateAttachment(index, 'url', data.url);
        if (!formData.files[index].name) {
          handleUpdateAttachment(index, 'name', data.name || file.name.substring(0, 40));
        }
      } else {
        throw new Error(data.error || 'Server error or credentials unconfigured');
      }
    } catch (githubErr) {
      console.warn("GitHub upload failed, falling back to ImgBB upload:", githubErr);
      try {
        const { uploadToImgBB } = await import('../lib/imgbb');
        const res = await uploadToImgBB(file);
        handleUpdateAttachment(index, 'url', res.url);
        if (!formData.files[index].name) {
          handleUpdateAttachment(index, 'name', file.name.substring(0, 40));
        }
      } catch (err) {
        console.error("Local/ImgBB upload failed, falling back to local encoding:", err);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64Url = reader.result as string;
            handleUpdateAttachment(index, 'url', base64Url);
            // Wait, set name safely
            setFormData(prev => {
              const updated = [...prev.files];
              if (!updated[index].name) {
                updated[index].name = file.name.substring(0, 40);
              }
              return { ...prev, files: updated };
            });
          };
        } catch (fallbackErr) {
          console.error(fallbackErr);
          alert("Upload failed.");
        }
      }
    } finally {
      setUploadingIndex(null);
    }
  };

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
      const now = new Date().toISOString();
      
      // Make sure downstream backward compatibility is maintained
      const primaryDownloadUrl = formData.files.length > 0 ? formData.files[0].url : formData.downloadUrl;

      const payload: any = {
        ...formData,
        downloadUrl: primaryDownloadUrl,
        isFile: formData.files.length > 0,
        coverImage: finalCoverImage,
        updatedAt: now
      };

      // Set createdAt if new
      if (!isEdit) {
        payload.createdAt = now;
      }

      // Set publishedAt if status is published and not already set
      if (formData.status === 'published') {
        payload.publishedAt = now;
      }

      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'posts', docId], payload);
      
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['latest-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-post', docId] });
      
      navigate('/admin/posts');
    } catch (err) {
      console.error(err);
      alert("Error saving post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading post data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/posts" className="p-2 hover:bg-white/10 text-white rounded-full transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] uppercase italic">
              {isEdit ? 'Edit Post Artifact' : 'Create New Post'}
            </h1>
            <p className="text-[var(--color-text-secondary)] text-sm">Design text articles, upload lab resource files, or embed channel videos.</p>
          </div>
        </div>
        <div className="flex gap-3 font-semibold">
          <button type="button" onClick={() => navigate('/admin/posts')} className="btn-secondary text-xs uppercase font-bold tracking-wider px-4 py-2 border rounded border-[var(--color-border)] hover:bg-white/5 text-white">Cancel</button>
          <button 
            type="submit" 
            form="post-form" 
            disabled={isSubmitting} 
            className="btn-primary flex items-center gap-2 text-xs uppercase font-bold tracking-wider px-6 py-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded transition-all shadow-md"
          >
            {isSubmitting ? <span className="animate-spin text-lg">◌</span> : <Save size={16} />}
            {isSubmitting ? 'Saving...' : (formData.status === 'published' ? 'Publish Now' : 'Save as Draft')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Main Content Card */}
          <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden">
             <div className="p-1 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center px-6 py-4 justify-between">
               <div className="flex items-center">
                 <Type size={16} className="text-[var(--color-text-tertiary)] mr-2" />
                 <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Main Content Details</span>
               </div>
               
               {/* Post Type Selector Switch */}
               <div className="flex gap-1.5 p-1 bg-slate-900 border border-[var(--color-border)] rounded-md">
                 <button
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, postType: 'article' }))}
                   className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded transition-all ${
                     formData.postType === 'article' 
                       ? 'bg-[var(--color-primary-900)] text-[var(--color-primary-400)] border border-[var(--color-primary-800)]' 
                       : 'text-slate-400 hover:text-white'
                   }`}
                 >
                   <FileText size={12} />
                   Text / Files
                 </button>
                 <button
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, postType: 'video' }))}
                   className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded transition-all ${
                     formData.postType === 'video' 
                       ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                       : 'text-slate-400 hover:text-white'
                   }`}
                 >
                   <Video size={12} />
                   YouTube Video
                 </button>
               </div>
             </div>
             
             <form id="post-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
               <div>
                 <label className="block text-xs uppercase tracking-widest font-extrabold text-[var(--color-text-tertiary)] mb-2">Title</label>
                 <input 
                    type="text" 
                    className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-600 text-white leading-tight focus:outline-none" 
                    placeholder="Enter descriptive post title..." 
                    value={formData.title} 
                    onChange={e => {
                       const title = e.target.value;
                       const slug = title.toLowerCase()
                         .replace(/[^a-z0-9]+/g, '-')
                         .replace(/(^-|-$)/g, '');
                       setFormData({ ...formData, title, slug });
                    }} 
                    required 
                 />
                 <div className="flex items-center gap-1 mt-3 text-xs text-[var(--color-text-tertiary)]">
                    <LinkIcon size={12} />
                    <span>Slug: </span>
                    <span className="font-mono text-[var(--color-text-secondary)]">/blog/{formData.slug || 'your-post-url'}</span>
                 </div>
               </div>

               {/* Conditional YouTube Link Field */}
               {formData.postType === 'video' && (
                 <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-3">
                   <label className="block text-xs uppercase tracking-widest font-extrabold text-rose-400 flex items-center gap-1.5 animate-fade-in">
                     <Video size={14} /> Embedded YouTube Link
                   </label>
                   <input
                     type="url"
                     required={formData.postType === 'video'}
                     placeholder="https://www.youtube.com/watch?v=your-video-id"
                     value={formData.videoUrl}
                     className="input w-full bg-black/40 text-sm border-rose-500/20 text-white placeholder:text-rose-950/40 focus:border-rose-500 focus:ring-0"
                     onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                   />
                   <p className="text-[10px] text-rose-300/60 font-medium">
                     Supports Standard, Mobile, Shorts, and Channel Live link formats.
                   </p>
                 </div>
               )}
               
               <div className="pt-6 border-t border-[var(--color-border)]">
                 <label className="block text-xs uppercase tracking-widest font-extrabold text-[var(--color-text-tertiary)] mb-4">
                   {formData.postType === 'video' ? 'Video Description & Complimentary Notes' : 'Article Narrative Content'}
                 </label>
                 <TipTapEditor 
                   content={formData.content} 
                   onChange={content => setFormData({ ...formData, content })}
                 />
               </div>
             </form>
          </div>

          {/* Interactive downloadable attachments list redone */}
          <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 md:p-8 space-y-4">
             <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                   <Paperclip size={18} className="text-[var(--color-primary-450)]" />
                   <h3 className="font-bold text-[var(--color-text-primary)] uppercase tracking-tight text-sm">Downloadable Resource Files ({formData.files.length})</h3>
                </div>
                <button
                   type="button"
                   onClick={handleAddAttachment}
                   className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-400)] hover:text-[var(--color-primary-500)] transition-colors"
                >
                   <Plus size={14} /> Add File Row
                </button>
             </div>
             
             <p className="text-xs text-[var(--color-text-secondary)]">
                Attach code bundles, schematics, cheat sheets, or manuals for students to source directly from this post.
             </p>

             {formData.files.length === 0 ? (
                <div className="border border-dashed border-[var(--color-border)] rounded-xl py-8 text-center text-slate-500 text-xs font-medium">
                   No files attached. Click "Add File Row" to link materials to this guide.
                </div>
             ) : (
                <div className="space-y-3">
                   {formData.files.map((file, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-black/20 border border-[var(--color-border)] rounded-xl relative group">
                         {/* Name Input */}
                         <div className="flex-1 min-w-0">
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-1">Label Name</label>
                            <input
                               type="text"
                               required
                               placeholder="e.g. Schematics, Part list code"
                               value={file.name}
                               onChange={e => handleUpdateAttachment(idx, 'name', e.target.value)}
                               className="input w-full text-xs bg-slate-900 border-none px-3 py-1.5 focus:ring-0"
                            />
                         </div>

                         {/* URL Input with Inline Uploader */}
                         <div className="flex-1 min-w-0 flex gap-2 items-end">
                            <div className="flex-grow min-w-0">
                               <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-1">File URL Link / Blob Path</label>
                               <input
                                  type="text"
                                  required
                                  placeholder="Paste Link or click Upload Right ↓"
                                  value={file.url}
                                  onChange={e => handleUpdateAttachment(idx, 'url', e.target.value)}
                                  className="input w-full text-xs bg-slate-900 border-none px-3 py-1.5 font-mono focus:ring-0"
                               />
                            </div>
                            
                            {/* Inline file upload triggers */}
                            <div className="relative shrink-0">
                               <label className="cursor-pointer flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded p-2 h-8 w-8 text-xs border border-white/5 transition-all">
                                  {uploadingIndex === idx ? (
                                     <Loader2 size={14} className="animate-spin text-[var(--color-primary-400)]" />
                                  ) : (
                                     <Paperclip size={14} />
                                  )}
                                  <input
                                     type="file"
                                     className="absolute inset-0 opacity-0 cursor-pointer hidden"
                                     disabled={uploadingIndex !== null}
                                     onChange={e => handleAttachmentFileUpload(e, idx)}
                                  />
                               </label>
                            </div>
                         </div>

                         {/* Delete Row button */}
                         <div className="flex items-end justify-end shrink-0 sm:pb-1">
                            <button
                               type="button"
                               onClick={() => handleRemoveAttachment(idx)}
                               className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors self-end"
                               title="Remove Document"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          {/* Excerpt/Summary */}
          <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-blue-500" />
              <h3 className="font-bold text-[var(--color-text-primary)]">Short Excerpt</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              This summary will appear on the blog listing page and in search results. Keep it catchy!
            </p>
            <textarea 
              className="input w-full min-h-[100px] text-sm" 
              placeholder="Brief summary of the article..."
              value={formData.excerpt}
              onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
            {/* Publishing Status Card */}
            <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-[var(--color-text-primary)]">
                    <Globe size={18} className="text-green-500" />
                    Publishing
                  </h3>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    formData.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {formData.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Change Status</label>
                    <select 
                       className="input w-full" 
                       value={formData.status} 
                       onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                     <div className="flex gap-3">
                       <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                       <p className="text-xs text-blue-300">
                         {formData.status === 'published' 
                           ? 'This post will be visible to everyone on your website.' 
                           : 'This post is currently hidden from the public site.'}
                       </p>
                     </div>
                  </div>
                </div>
            </div>
            
             {/* Cover Image & Type Card */}
             <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                 <div className="flex items-center gap-2 mb-6">
                   <Layout size={18} className="text-purple-500" />
                   <h3 className="font-bold text-[var(--color-text-primary)]">Visuals & Meta</h3>
                 </div>
 
                 <div className="space-y-6">
                   <div>
                     <label className="block text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                       <ImageIcon size={14} /> Cover Image
                     </label>
                     <div className="group relative aspect-video bg-[var(--color-surface)] rounded-lg border-2 border-dashed border-[var(--color-border)] overflow-hidden flex flex-col items-center justify-center transition-all hover:border-[var(--color-primary-600)]">
                       {formData.coverImage ? (
                         <>
                           <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform">Change Image</label>
                           </div>
                         </>
                       ) : (
                         <div className="text-center p-4">
                           <div className="w-10 h-10 bg-[var(--color-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-2 border border-[var(--color-border)]">
                              <Plus size={20} className="text-[var(--color-text-tertiary)]" />
                           </div>
                           <p className="text-xs text-[var(--color-text-tertiary)]">Click to upload photo</p>
                         </div>
                       )}
                       <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => setImageFile(e.target.files?.[0] || null)} 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                       />
                     </div>
                     {formData.postType === 'video' && !formData.coverImage && (
                       <p className="text-[10px] text-slate-500 mt-2 italic">
                         No custom image set. YouTube's high-definition cover thumbnail will automatically fetch and display!
                       </p>
                     )}
                   </div>
 
                   <div>
                     <label className="block text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Author Name</label>
                     <input 
                        type="text" 
                        className="input w-full text-sm" 
                        value={formData.author.name} 
                        onChange={e => setFormData({ ...formData, author: { ...formData.author, name: e.target.value } })}
                     />
                   </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}
