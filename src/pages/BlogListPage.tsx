import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestPosts } from "../lib/api";
import { FileText, Github, Video, Paperclip, Play } from "lucide-react";
import SEO from "../components/SEO";

// Helper to parse YouTube ID safely
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function BlogListPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-posts"],
    queryFn: fetchLatestPosts,
  });

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
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Watch repair tutorials sourced from our channel, download technical circuit diagrams, 
            and browse logic guides handcrafted by Tirur's top trainers.
          </p>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="text-center py-20 font-medium text-slate-500">
            Scanning archives, loading posts...
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => {
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
                      ) : filesCount > 0 ? (
                        <span className="flex items-center gap-1 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                          <Paperclip size={10} /> Resource Guide
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20">
                          <FileText size={10} /> Technical Article
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
                          alt={post.author.name}
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
