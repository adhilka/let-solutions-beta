import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAboutData } from '../lib/api';
import { dualWrite } from '../lib/firebase/dualWrite';
import { FAILSAFE_ABOUT } from '../constants/failsafe';
import { Save, Plus, Trash2, Upload, Loader2, Users } from 'lucide-react';
import { uploadToImgBB } from '../lib/imgbb';

export default function AdminAboutPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const { data: aboutData, isLoading } = useQuery({
    queryKey: ['about-data-admin'],
    queryFn: fetchAboutData
  });

  useEffect(() => {
    const ensureArray = (val: any, fallback: any[]) => {
      if (Array.isArray(val)) return val;
      if (val && typeof val === 'object') {
        const keys = Object.keys(val).sort((a, b) => Number(a) - Number(b));
        return keys.map(k => val[k]);
      }
      return fallback;
    };

    if (aboutData) {
      const merged = {
        ...FAILSAFE_ABOUT,
        ...aboutData,
        hero: {
          ...FAILSAFE_ABOUT.hero,
          ...(aboutData.hero || {})
        },
        story: {
          ...FAILSAFE_ABOUT.story,
          ...(aboutData.story || {}),
          content: ensureArray(aboutData.story?.content, FAILSAFE_ABOUT.story.content),
          images: ensureArray(aboutData.story?.images, FAILSAFE_ABOUT.story.images)
        },
        vision: {
          ...FAILSAFE_ABOUT.vision,
          ...(aboutData.vision || {})
        },
        mission: {
          ...FAILSAFE_ABOUT.mission,
          ...(aboutData.mission || {})
        },
        leadership: ensureArray(aboutData.leadership, FAILSAFE_ABOUT.leadership)
      };
      setFormData(merged);
    } else if (!isLoading) {
      setFormData(FAILSAFE_ABOUT);
    }
  }, [aboutData, isLoading]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'settings', 'about'], data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-data'] });
      queryClient.invalidateQueries({ queryKey: ['about-data-admin'] });
      alert('About page settings saved successfully!');
    },
    onError: (err) => {
      console.error('Error saving about settings:', err);
      alert('Failed to save about settings.');
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string[]) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const pathStr = path.join('.');
    setIsUploading(pathStr);
    try {
      const result = await uploadToImgBB(file);
      updateNestedField(path, result.url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed.');
    } finally {
      setIsUploading(null);
    }
  };

  const updateNestedField = (path: string[], value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (Array.isArray(current[key])) {
          current[key] = [...current[key]];
        } else {
          current[key] = { ...current[key] };
        }
        current = current[key];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const addLeadershipMember = () => {
    setFormData((prev: any) => ({
      ...prev,
      leadership: [
        ...prev.leadership,
        { name: '', role: '', bio: '', imageUrl: '' }
      ]
    }));
  };

  const removeLeadershipMember = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      leadership: prev.leadership.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateLeadershipMember = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newLeadership = [...prev.leadership];
      newLeadership[index] = { ...newLeadership[index], [field]: value };
      return { ...prev, leadership: newLeadership };
    });
  };

  const handleContentChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const newContent = [...prev.story.content];
      newContent[index] = value;
      return { ...prev, story: { ...prev.story, content: newContent } };
    });
  };

  const addParagraph = () => {
    setFormData((prev: any) => ({
      ...prev,
      story: { ...prev.story, content: [...prev.story.content, ''] }
    }));
  };

  const removeParagraph = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      story: { ...prev.story, content: prev.story.content.filter((_: any, i: number) => i !== index) }
    }));
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-600)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Edit About Page</h1>
        <button 
          onClick={() => saveMutation.mutate(formData)}
          disabled={saveMutation.isPending}
          className="btn btn-primary flex items-center gap-2 px-6 py-2 shadow-lg shadow-blue-900/40 rounded-xl"
        >
          {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8 pb-12">
        {/* Hero Section */}
        <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-md">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white italic">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Hero Title</label>
              <input 
                type="text" 
                className="input" 
                value={formData.hero.title} 
                onChange={e => updateNestedField(['hero', 'title'], e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Hero Subtitle</label>
              <textarea 
                className="input min-h-[80px]" 
                value={formData.hero.subtitle} 
                onChange={e => updateNestedField(['hero', 'subtitle'], e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-md">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white italic">Our Story</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Story Title</label>
              <input 
                type="text" 
                className="input" 
                value={formData.story.title} 
                onChange={e => updateNestedField(['story', 'title'], e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Content Paragraphs</label>
              <div className="space-y-4">
                {formData.story.content.map((p: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <textarea 
                      className="input min-h-[120px]" 
                      value={p} 
                      onChange={e => handleContentChange(i, e.target.value)}
                    />
                    <button 
                      onClick={() => removeParagraph(i)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg h-fit transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addParagraph}
                  className="text-sm text-[var(--color-primary-400)] font-bold flex items-center gap-1 mt-2 hover:text-[var(--color-primary-300)] transition-colors"
                >
                  <Plus size={16} /> Add Paragraph
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Story Images (2 recommended)</label>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1].map((idx) => (
                  <div key={idx} className="relative aspect-video bg-[var(--color-surface)] rounded-2xl overflow-hidden border-2 border-dashed border-[var(--color-border)] group shadow-inner">
                    {formData.story.images[idx] ? (
                      <>
                        <img src={formData.story.images[idx]} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer p-3 bg-white rounded-full text-gray-900 shadow-xl hover:scale-110 transition-transform">
                            <Upload size={20} />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={e => handleImageUpload(e, ['story', 'images', idx.toString()])}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                        <Upload className="text-[var(--color-text-tertiary)] mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Upload Image {idx + 1}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={e => handleImageUpload(e, ['story', 'images', idx.toString()])}
                        />
                      </label>
                    )}
                    {isUploading === `story.images.${idx}` && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="animate-spin text-[var(--color-primary-400)]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-md">
            <h2 className="text-lg font-bold mb-4 text-white italic">Vision</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                className="input" 
                value={formData.vision.title} 
                onChange={e => updateNestedField(['vision', 'title'], e.target.value)}
                placeholder="Title"
              />
              <textarea 
                className="input min-h-[100px]" 
                value={formData.vision.content} 
                onChange={e => updateNestedField(['vision', 'content'], e.target.value)}
                placeholder="Content"
              />
            </div>
          </div>
          <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-md">
            <h2 className="text-lg font-bold mb-4 text-white italic">Mission</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                className="input" 
                value={formData.mission.title} 
                onChange={e => updateNestedField(['mission', 'title'], e.target.value)}
                placeholder="Title"
              />
              <textarea 
                className="input min-h-[100px]" 
                value={formData.mission.content} 
                onChange={e => updateNestedField(['mission', 'content'], e.target.value)}
                placeholder="Content"
              />
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white italic">Leadership</h2>
            <button 
              onClick={addLeadershipMember}
              className="text-xs bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-xl flex items-center gap-1 font-bold shadow-lg"
            >
              <Plus size={16} /> Add Member
            </button>
          </div>
          <div className="space-y-8">
            {formData.leadership.map((member: any, i: number) => (
              <div key={i} className="p-6 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] relative group">
                <button 
                  onClick={() => removeLeadershipMember(i)}
                  className="absolute top-4 right-4 text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-8">
                  <div className="space-y-2">
                    <div className="w-28 h-28 bg-[var(--color-surface-alt)] rounded-2xl overflow-hidden relative group/avatar mx-auto md:mx-0 border border-[var(--color-border)]">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-tertiary)]">
                          <Users size={40} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Upload size={20} className="text-white" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={e => handleImageUpload(e, ['leadership', i.toString(), 'imageUrl'])}
                        />
                      </label>
                      {isUploading === `leadership.${i}.imageUrl` && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="animate-spin text-[var(--color-primary-400)] w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Name</label>
                        <input 
                          type="text" 
                          className="input py-2" 
                          value={member.name} 
                          onChange={e => updateLeadershipMember(i, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Role</label>
                        <input 
                          type="text" 
                          className="input py-2" 
                          value={member.role} 
                          onChange={e => updateLeadershipMember(i, 'role', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Bio</label>
                      <textarea 
                        className="input py-2 min-h-[80px]" 
                        value={member.bio} 
                        onChange={e => updateLeadershipMember(i, 'bio', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button 
          onClick={() => saveMutation.mutate(formData)}
          disabled={saveMutation.isPending}
          className="btn btn-primary px-8 flex items-center gap-2"
        >
          {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saveMutation.isPending ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
