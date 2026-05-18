import { useState, useEffect } from 'react';
import { Layout, Save, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { fetchHomeContent } from '../lib/api';
import { dualWrite } from '../lib/firebase/dualWrite';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminHomeSettings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [homeData, setHomeData] = useState<any>({
    hero: {
      title: 'Master Chip-Level Engineering & Secure Your Future',
      subtitle: 'Equip yourself with industry-standard training in Laptop, Smartphone, and Tablet repair alongside networking and CCTV modules.',
      description: '',
      bgType: 'photo',
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      features: ['100% Job Assistance', 'Industry Experts', 'Hands-on Labs']
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchHomeContent();
        if (data) {
          setHomeData(data);
        }
      } catch (error) {
        console.error("Error loading home content:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...homeData.hero.features];
    newFeatures[index] = value;
    setHomeData({
      ...homeData,
      hero: { ...homeData.hero, features: newFeatures }
    });
  };

  const addFeature = () => {
    setHomeData({
      ...homeData,
      hero: { ...homeData.hero, features: [...homeData.hero.features, ''] }
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = homeData.hero.features.filter((_: any, i: number) => i !== index);
    setHomeData({
      ...homeData,
      hero: { ...homeData.hero, features: newFeatures }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImageUrl = homeData.hero.imageUrl;
      
      if (imageFile) {
        const { uploadToImgBB } = await import('../lib/imgbb');
        const uploadResult = await uploadToImgBB(imageFile);
        finalImageUrl = uploadResult.url;
      }

      const updatedData = {
        ...homeData,
        hero: {
          ...homeData.hero,
          imageUrl: finalImageUrl
        }
      };

      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'settings', 'home'], updatedData);
      
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
      alert('Home content updated successfully!');
      navigate('/admin');
    } catch (error) {
      console.error("Error updating home content:", error);
      alert('Failed to update home content.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Layout className="text-blue-600" />
        <h1 className="text-3xl font-bold">Home Page Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
            Hero Section
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Headline</label>
              <input 
                type="text" 
                className="input"
                value={homeData.hero.title}
                onChange={e => setHomeData({ ...homeData, hero: { ...homeData.hero, title: e.target.value } })}
                placeholder="Master Chip-Level Engineering..."
              />
              <p className="mt-1 text-xs text-slate-500">Supports HTML tags for styling (e.g., &lt;span className="text-blue-600"&gt;...&lt;/span&gt;)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pre-headline Tagline (Branding)</label>
                <input 
                  type="text" 
                  className="input"
                  value={homeData.hero.description}
                  onChange={e => setHomeData({ ...homeData, hero: { ...homeData.hero, description: e.target.value } })}
                  placeholder="Defaults to Branding Tagline"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sub-headline Content</label>
                <textarea 
                  className="input min-h-[100px]"
                  value={homeData.hero.subtitle}
                  onChange={e => setHomeData({ ...homeData, hero: { ...homeData.hero, subtitle: e.target.value } })}
                  placeholder="Equip yourself with industry-standard training..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Layout Background</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="heroBgType"
                    value="solid"
                    checked={homeData.hero.bgType === 'solid'}
                    onChange={e => setHomeData({ ...homeData, hero: { ...homeData.hero, bgType: e.target.value } })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span>Solid Background</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="heroBgType"
                    value="photo"
                    checked={homeData.hero.bgType === 'photo'}
                    onChange={e => setHomeData({ ...homeData, hero: { ...homeData.hero, bgType: e.target.value } })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span>Photo Background</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-slate-500">Choose whether the hero section has a solid color or a large photo background.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Image</label>
              <div className="flex items-start gap-4">
                <div className="w-48 aspect-video rounded-xl overflow-hidden border bg-slate-50 flex-shrink-0">
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : homeData.hero.imageUrl} 
                    alt="Hero Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="file" 
                    id="hero-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="hero-image" 
                    className="btn-secondary btn-sm inline-flex items-center gap-2 cursor-pointer mb-2"
                  >
                    <ImageIcon size={16} />
                    Change Image
                  </label>
                  <p className="text-xs text-slate-500">Recommended size: 1200x900px. High quality JPEG or WebP.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">Feature Highlights (Bottom checklist)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeData.hero.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      className="input flex-1"
                      value={feature}
                      onChange={e => handleFeatureChange(idx, e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeFeature(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addFeature}
                  className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin')}
            className="btn-secondary"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Home Settings
          </button>
        </div>
      </form>
    </div>
  );
}
