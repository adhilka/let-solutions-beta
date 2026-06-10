import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug, fetchLatestPosts } from "../lib/api";
import {
  ChevronRight,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  FileText,
  Video,
  Play,
  Share2
} from "lucide-react";
import SEO from "../components/SEO";

// Helper to parse YouTube ID safely
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const isGitHubLink = (url?: string) => url?.includes("github.com");

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug || ""),
    enabled: !!slug,
  });

  const { data: morePosts } = useQuery({
    queryKey: ["latest-posts-sidebar"],
    queryFn: fetchLatestPosts,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-surface)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary-450)]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 bg-[var(--color-surface)]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold mb-4 text-white uppercase italic">Post Not Found</h1>
          <p className="text-[var(--color-text-secondary)] mb-8 text-lg">
            The article or video guide you are looking for does not exist or has been archived. Check our other recent uploads.
          </p>
          <Link to="/blog" className="btn-primary inline-block px-6 py-2.5 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white font-bold uppercase text-xs tracking-widest rounded">
            View All Guides
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {morePosts?.slice(0, 3).map((p: any) => (
            <Link
              key={p.id}
              to={`/blog/${p.slug}`}
              className="group bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                {p.coverImage && (
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--color-primary-400)] transition-colors line-clamp-2 text-white">
                  {p.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const isVideo = post.postType === "video" || !!post.videoUrl;
  const youtubeId = isVideo ? getYouTubeId(post.videoUrl) : null;

  // Article Schema for SEO
  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.coverImage || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : ""),
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Let Solutions"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Let Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": "https://i.ibb.co/SXRGw6x8/logo.png"
      }
    },
    "datePublished": post.publishedAt || post.createdAt,
    "description": post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, "")
  } : undefined;

  // Breadcrumb Schema
  const breadcrumbSchema = post ? {
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://letsolutions.in/blog/${post.slug}`
      }
    ]
  } : undefined;

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, "")}
        keywords={`${post.title.toLowerCase()}, repair course malappuram, free guides let solutions, repair circuit files`}
        ogType="article"
        ogImage={post.coverImage || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined)}
        canonical={`/blog/${post.slug}`}
        structuredData={[articleSchema, breadcrumbSchema].filter(Boolean) as object[]}
      />

      {/* Breadcrumb row */}
      <div className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] select-none">
          <Link to="/" className="hover:text-[var(--color-primary-400)] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link to="/blog" className="hover:text-[var(--color-primary-400)] transition-colors">
            Blog
          </Link>
          <ChevronRight size={12} />
          <span className="text-white font-medium truncate max-w-[200px]" title={post.title}>
            {post.title}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Cinematic YouTube Player (Only for video guides) */}
        {isVideo && youtubeId && (
          <div className="mb-12 bg-black border border-rose-950/20 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-t from-rose-500 to-transparent" />
            <div className="aspect-video w-full">
              <iframe
                title={`YouTube Player - ${post.title}`}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Content Area */}
          <article className="lg:col-span-8 space-y-8">
            <header className="space-y-4 pb-6 border-b border-[var(--color-border)]">
              <div className="flex gap-2">
                {isVideo ? (
                  <span className="flex items-center gap-1.5 text-rose-400 font-extrabold bg-rose-500/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border border-rose-500/20">
                    <Video size={12} /> Sourced Video Guide
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-blue-400 font-extrabold bg-blue-500/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border border-blue-500/20">
                    <FileText size={12} /> Tech Report
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight uppercase italic tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-[var(--color-text-tertiary)] text-xs">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>
                    {post.publishedAt
                      ? typeof post.publishedAt === "string"
                        ? new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: "long" })
                        : post.publishedAt.toDate?.()
                          ? new Date(post.publishedAt.toDate()).toLocaleDateString(undefined, { dateStyle: "long" })
                          : "Recently"
                      : "Recently"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span className="font-semibold text-[var(--color-text-secondary)]">{post.author?.name || "Admin"}</span>
                </div>
              </div>
            </header>

            {/* Standard cover image ONLY if it is not a video post (as video features the prime player) */}
            {!isVideo && post.coverImage && (
              <div className="aspect-video rounded-[1.5rem] overflow-hidden shadow-2xl border border-[var(--color-border)] bg-slate-900">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rich Markdown / TipTap HTML Body Container */}
            <div className="relative">
              <div
                className="prose prose-invert prose-lg max-w-none tiptap select-text"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            <footer className="pt-8 border-t border-[var(--color-border)] select-none">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] hover:gap-3 transition-all"
              >
                <ArrowLeft size={16} />
                Explore repair guides
              </Link>
            </footer>
          </article>

          {/* Related posts Side bar Desk */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Other relevant posts/videos sidebar */}
            {morePosts && morePosts.length > 1 && (
              <div className="border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Recent Guides</h4>
                <div className="space-y-4">
                  {morePosts
                    .filter((p: any) => p.slug !== post.slug)
                    .slice(0, 4)
                    .map((p: any) => (
                      <Link
                        key={p.id}
                        to={`/blog/${p.slug}`}
                        className="group flex gap-3 items-center"
                      >
                        <div className="w-16 h-12 bg-black rounded-lg overflow-hidden shrink-0 border border-white/5 relative">
                          {p.coverImage ? (
                            <img
                              src={p.coverImage}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-tertiary)]">
                              {p.postType === "video" ? <Video size={14} /> : <FileText size={14} />}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-xs uppercase tracking-tight text-white group-hover:text-[var(--color-primary-400)] transition-colors line-clamp-2 leading-tight">
                            {p.title}
                          </h5>
                          <span className="text-[9px] font-mono text-[var(--color-text-tertiary)] uppercase mt-1 block">
                            {p.postType === "video" ? "Video tutorial" : "Technical article"}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
