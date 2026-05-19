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
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Gallery Management</h1>
          <p className="text-slate-500 text-sm">Upload and manage institute photos for the public gallery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Photo
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No photos yet</h3>
          <p className="text-slate-500 mb-6">Start by uploading your first institute moment.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-secondary btn-sm"
          >
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl md:rounded-2xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-square">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDelete(img.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                    title="Delete Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {img.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-slate-900 truncate">{img.title || 'Untitled Photo'}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                  {new Date(img.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-display font-bold text-xl text-slate-900">Upload Photo</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 shadow-sm transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Photo Title</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="e.g. Lab Session - Batch 2024" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    className="input w-full"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="labs">Labs</option>
                    <option value="classroom">Classroom</option>
                    <option value="events">Events</option>
                    <option value="students">Students</option>
                    <option value="campus">Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Image Selection</label>
                  <div className="space-y-3">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-sm file:font-semibold file:bg-white file:text-blue-700 hover:file:bg-blue-50 file:transition-all"
                    />
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                         <span className="text-xs font-bold">OR</span>
                      </div>
                      <input 
                        type="url" 
                        className="input w-full pl-10" 
                        placeholder="Paste image URL here..." 
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
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : 'Save to Gallery'}
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

