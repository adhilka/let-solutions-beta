import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGalleryImages } from '../lib/api';
import { Image as ImageIcon, Maximize2, Loader2, Filter } from 'lucide-react';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['All', 'Labs', 'Classroom', 'Events', 'Campus', 'Students'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: fetchGalleryImages
  });

  const filteredImages = images?.filter(img => 
    selectedCategory === 'All' || img.category === selectedCategory.toLowerCase()
  ) || [];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://letsolutions.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Gallery",
        "item": "https://letsolutions.in/gallery"
      }
    ]
  };

  return (
    <>
      <SEO 
        title="Institute Gallery & Technical Labs | Let Solutions Tirur"
        description="View our technical labs, classroom activities, and student achievements at Let Solutions. Tirur's most advanced chip-level engineering lab photos."
        keywords="technical institute gallery, tirur repair lab photos, vocational training student activities, electronics workshop kerala, let solutions campus tour"
        canonical="/gallery"
        structuredData={breadcrumbSchema}
      />

      <div className="bg-[var(--color-primary-600)] py-16">
        <div className="container-wide px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Our Gallery</h1>
          <p className="text-xl text-[var(--color-primary-100)] max-w-2xl mx-auto">
            A glimpse into the hands-on learning environment and student life at our institute.
          </p>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat 
                  ? 'bg-[var(--color-primary-600)] text-white shadow-lg shadow-blue-900 border-0' 
                  : 'bg-[var(--color-surface-alt)] text-slate-300 border border-[var(--color-border)] hover:border-[var(--color-primary-400)] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[var(--color-primary-400)] mb-4" />
            <p className="text-slate-400 font-medium">Loading memories...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-surface-alt)] rounded-3xl border border-dashed border-[var(--color-border)]">
            <ImageIcon size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 text-lg">No images found in this category yet.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence mode='popLayout'>
              {filteredImages.map((img) => (
                <motion.div
                  layout
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-square bg-[var(--color-surface-alt)] rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-[var(--color-border)]"
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <img 
                    src={img.imageUrl} 
                    alt={img.title || 'Institute Gallery Image'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 md:p-6">
                    <h3 className="text-white font-bold text-sm md:text-lg mb-1 line-clamp-2 drop-shadow-md">{img.title || 'Institute Moment'}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-[8px] md:text-xs uppercase tracking-widest font-bold">{img.category || 'General'}</span>
                      <Maximize2 size={16} className="text-white/70 group-hover:text-white hidden md:block" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button 
              className="absolute top-6 right-6 text-white/70 hover:text-white"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              alt="Gallery Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
