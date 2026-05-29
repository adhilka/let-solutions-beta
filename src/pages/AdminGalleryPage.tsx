import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Plus, Trash2, Image as ImageIcon, Loader2, X, Search } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmVariant: "danger" | "primary" | "success";
    confirmText: string;
    mode: "confirm" | "status";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmVariant: "primary",
    confirmText: "Confirm",
    mode: "confirm",
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'labs',
    imageUrl: ''
  });

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const db = getReadDb();
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/gallery'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(data);
    } catch (err) {
      console.error("Error fetching gallery images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        const { uploadToImgBB } = await import('../lib/imgbb');
        const result = await uploadToImgBB(imageFile);
        finalImageUrl = result.url;
      }

      if (!finalImageUrl) throw new Error("Image is required");

      const newId = `img-${Date.now()}`;
      const newImage = {
        ...formData,
        imageUrl: finalImageUrl,
        createdAt: new Date().toISOString()
      };

      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'gallery', newId], newImage);
      
      setIsModalOpen(false);
      setFormData({ title: '', category: 'labs', imageUrl: '' });
      setImageFile(null);
      fetchImages();
    } catch (err) {
      console.error("Error adding image:", err);
      alert("Failed to add image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const performDelete = async (id: string) => {
    try {
      await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'gallery', id]);
      fetchImages();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Failed to delete image.");
    }
  };

  const handleDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Photo?",
      message: "This action cannot be undone. This photo will be removed from the public gallery.",
      confirmVariant: "danger",
      confirmText: "Delete Photo",
      mode: "confirm",
      onConfirm: () => performDelete(id),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white mb-2 uppercase italic tracking-tight">Gallery Management</h1>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">Upload and manage institute photos for the public gallery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-xl shadow-blue-900/20"
        >
          <Plus size={18} /> Add Photo
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[var(--color-primary-400)]" size={32} />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-[var(--color-surface-alt)] rounded-3xl border-2 border-dashed border-[var(--color-border)] p-20 text-center shadow-inner">
          <div className="w-20 h-20 bg-[var(--color-surface)] text-[var(--color-text-tertiary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ImageIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase italic">No photographic data</h3>
          <p className="text-[var(--color-text-secondary)] mb-8 font-medium">Initialize your first institute moment for the public cluster.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-8"
          >
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pb-12">
          {images.map((img) => (
            <div key={img.id} className="bg-[var(--color-surface-alt)] rounded-2xl border border-[var(--color-border)] overflow-hidden group shadow-lg hover:shadow-2xl hover:border-[var(--color-primary-600)] transition-all duration-300">
              <div className="relative aspect-square">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute top-3 right-3 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDelete(img.id)}
                    className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-2xl"
                    title="Delete Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-[var(--color-primary-900)] text-[var(--color-primary-400)] border border-[var(--color-primary-800)] text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md">
                    {img.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="font-bold text-white truncate text-sm uppercase tracking-tight">{img.title || 'Untitled Photo'}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 uppercase font-extrabold tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)]" />
                   {new Date(img.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface-alt)] rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-[var(--color-border)] animate-scale-up">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-black/20">
              <h2 className="font-display font-bold text-xl text-white italic uppercase tracking-tight">Upload Photo</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-text-tertiary)] hover:text-white bg-white/5 p-2 rounded-full border border-[var(--color-border)] transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-3">Photo Title</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="e.g. Lab Session - Tirur Batch" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-3">System Category</label>
                  <select 
                    className="input w-full"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="labs">Labs & Infrastructure</option>
                    <option value="classroom">Classroom Environment</option>
                    <option value="events">Events & Seminars</option>
                    <option value="students">Student Projects</option>
                    <option value="campus">Campus Life</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-3">Source Selection</label>
                  <div className="space-y-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-[var(--color-text-tertiary)] file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border file:border-[var(--color-border)] file:text-[10px] file:font-extrabold file:uppercase file:tracking-widest file:bg-white/5 file:text-white hover:file:bg-white/10 file:transition-all"
                    />
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--color-text-tertiary)]">
                         <span className="text-[10px] font-extrabold">URL</span>
                      </div>
                      <input 
                        type="url" 
                        className="input w-full pl-14" 
                        placeholder="Paste image link directly..." 
                        value={formData.imageUrl}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-[var(--color-border)] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-2 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Initialize Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
        mode={modalConfig.mode}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

