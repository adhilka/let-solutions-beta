import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestPosts } from "../lib/api";
import { FileText, Github, Video, Paperclip, Play, Tag, Search, X } from "lucide-react";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "motion/react";

// Helper to parse YouTube ID safely
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-posts"],
    queryFn: fetchLatestPosts,
  });

  const categories = [
    { id: "all", label: "All" },
    { id: "repairing", label: "Repairing" }
  ];

  const filteredPosts = posts?.filter((post: any) => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchLower) || 
      post.excerpt?.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  }) || [];

  const getCardImage = (post: any) => {
    if (post.coverImage) return post.coverImage;
    if (post.postType === "video" && post.videoUrl) {
      const videoId = getYouTubeId(post.videoUrl);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    // Fallback placeholder image that fits our tech brand style
    return "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=700&q=80";
  };

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
        "name": "Blog",
        "item": "https://letsolutions.in/blog"
      }
    ]
  };

  return (
    <>
      <SEO
        title="Tech Blog, Youtube Video Guides & Repairs Hub"
        description="Source the latest chip-level repair walkthroughs, download circuit diagram files, and explore technical tutorials straight from our channel."
        keywords="technical tutorials tirur, hardware repair videos kerala, circuit diagram downloads, chip level logic malappuram, free repair guide files"
        canonical="/blog"
        structuredData={breadcrumbSchema}
      />

      <div className="bg-[var(--color-surface)] py-12 md:py-20 border-b border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4 text-white">
           <FileText size={300} />
        </div>
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left relative z-10">
          <span className="inline-block px-4 py-1.5 bg-[var(--color-primary-900)] text-[var(--color-primary-400)] border border-[var(--color-primary-800)] rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6">
            Tech Channel & Blogs
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white uppercase italic">
            Video Tutorials &{" "}
            <span className="text-[var(--color-neon-green)] not-italic">
              Lab Resources
            </span>
          </h1>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                  activeCategory === cat.id
                    ? "bg-[var(--color-primary-600)] text-white border-[var(--color-primary-500)] shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:border-white/20 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative h-10 flex items-center">
            <AnimatePresence mode="wait">
              {!isSearchOpen ? (
                <motion.button
                  key="search-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-tertiary)] hover:border-white/20 hover:text-white transition-all shadow-lg"
                >
                  <Search size={18} />
                </motion.button>
              ) : (
                <motion.div
                  key="search-input"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  className="relative flex items-center"
                >
                  <Search size={16} className="absolute left-3.5 text-[var(--color-text-tertiary)]" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search for blogs and repair videos"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    className="w-full h-10 pl-10 pr-10 bg-[var(--color-surface-alt)] border border-[var(--color-primary-600)]/50 rounded-full text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-600)] shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  />
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-3 text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-medium text-slate-500">
            Scanning archives, loading posts...
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post: any) => {
              const coverUrl = getCardImage(post);
              const isVideo = post.postType === "video";
              const filesCount = post.files ? post.files.length : (post.downloadUrl ? 1 : 0);

              return (
                <Link
                  to={`/blog/${post.slug}`}
                  key={post.id}
                  className="group bg-[var(--color-surface-alt)] border flex flex-col border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-video bg-black overflow-hidden select-none">
                    <img
                      src={coverUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all">
                        <div className="w-12 h-12 bg-rose-600 group-hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Play size={20} className="ml-1 fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {isVideo ? (
                        <span className="flex items-center gap-1 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-rose-450 bg-rose-500/10 border border-rose-500/20">
                          <Video size={10} /> Video tutorial
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20">
                          <FileText size={10} /> {post.category || 'Article'}
                        </span>
                      )}
                      
                      {filesCount > 0 && (
                        <span className="flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wide bg-slate-900 border border-[var(--color-border)] text-slate-350">
                          {filesCount} {filesCount === 1 ? 'file' : 'files'} included
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 line-clamp-2 uppercase tracking-tight text-white group-hover:text-[var(--color-primary-450)] transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-[var(--color-text-secondary)] text-sm mb-6 line-clamp-2 flex-grow font-medium">
                      {post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '') : 'Sourced repair guides and downloadable resource sheets.')}
                    </p>

                    <div className="flex items-center gap-2.5 pt-4 border-t border-[var(--color-border)] mt-auto select-none">
                      {post.author?.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author?.name || "Admin"}
                          className="w-8 h-8 rounded-full border border-[var(--color-border)]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-900)] flex items-center justify-center text-[10px] font-bold text-[var(--color-primary-400)] border border-[var(--color-primary-800)]">
                          LS
                        </div>
                      )}
                      <div className="text-xs">
                        <div className="font-semibold text-white">
                          {post.author?.name || "Admin"}
                        </div>
                        <div className="text-[var(--color-text-tertiary)] font-mono text-[10px]">
                          {post.publishedAt
                            ? typeof post.publishedAt === "string"
                              ? new Date(post.publishedAt).toLocaleDateString()
                              : post.publishedAt.toDate?.()
                                ? new Date(post.publishedAt.toDate()).toLocaleDateString()
                                : "Recent"
                            : "Recent"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[var(--radius-xl)]">
            <p className="text-[var(--color-text-primary)] text-lg font-medium mb-2 uppercase tracking-wide">
              No technical guides stored.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              We are working on releasing fresh repair videos and diagrams soon!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
