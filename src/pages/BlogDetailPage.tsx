import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug, fetchLatestPosts } from "../lib/api";
import {
  ChevronRight,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  File as FileIcon,
  FileText,
  Download,
  Github,
} from "lucide-react";
import SEO from "../components/SEO";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const isGitHubLink = (url?: string) => url?.includes('github.com');

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 bg-[var(--color-surface)]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold mb-4 text-white">Post Not Found</h1>
          <p className="text-[var(--color-text-secondary)] mb-8 text-lg">
            The article you are looking for does not exist or has been moved.
            Explore our latest technical guides below.
          </p>
          <Link to="/blog" className="btn-primary">
            View All Posts
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {morePosts?.slice(0, 3).map((p: any) => (
            <Link
              key={p.id}
              to={`/blog/${p.slug}`}
              className="group bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                {p.coverImage && (
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-6">
                {p.isFile ? (
                  <span className="flex items-center gap-1.5 text-[var(--color-primary-400)] font-bold bg-[var(--color-primary-950)] px-2 py-0.5 rounded text-[10px] uppercase mb-2 w-fit">
                    <FileIcon size={12} /> File
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded text-[10px] uppercase mb-2 w-fit">
                    <FileText size={12} /> Post
                  </span>
                )}
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

  // Article Schema
  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.coverImage,
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
    "datePublished": post.publishedAt,
    "description": post.excerpt || post.content.substring(0, 160)
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
        description={post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, '')}
        keywords={`${post.title.toLowerCase()}, tech insight, let solutions blog, tirur technical institute news`}
        ogType="article"
        ogImage={post.coverImage}
        canonical={`/blog/${post.slug}`}
        structuredData={[articleSchema, breadcrumbSchema].filter(Boolean) as object[]}
      />

      <div className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Link to="/" className="hover:text-[var(--color-primary-400)]">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/blog" className="hover:text-[var(--color-primary-400)]">
            Blog
          </Link>
          <ChevronRight size={14} />
          <span className="text-white font-medium truncate">
            {post.title}
          </span>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12 md:py-20 bg-[var(--color-surface)]">
        <header className="mb-12 text-center">
          <div className="flex justify-center gap-2 mb-6">
            {post.isFile ? (
              <span className="flex items-center gap-2 text-[var(--color-primary-400)] font-bold bg-[var(--color-primary-950)] px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-[var(--color-primary-900)]">
                <FileIcon size={14} /> Resource File / Downloadable
              </span>
            ) : (
              <span className="flex items-center gap-2 text-slate-400 font-bold bg-slate-900 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-slate-800">
                <FileText size={14} /> Technical Article
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-[var(--color-text-tertiary)] text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                {post.publishedAt
                  ? typeof post.publishedAt === "string"
                    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                        dateStyle: "long",
                      })
                    : post.publishedAt.toDate?.()
                      ? new Date(post.publishedAt.toDate()).toLocaleDateString(
                          undefined,
                          { dateStyle: "long" },
                        )
                      : "Recently"
                  : "Recently"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="aspect-video rounded-[var(--radius-2xl)] overflow-hidden mb-12 shadow-2xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none tiptap"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.isFile && post.downloadUrl && (
          <div className="mt-12 p-8 bg-[var(--color-primary-950)] rounded-[var(--radius-2xl)] border border-[var(--color-primary-900)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--color-primary-600)] text-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                {isGitHubLink(post.downloadUrl) ? <Github size={24} /> : <FileIcon size={24} />}
              </div>
              <div>
                <h4 className="font-bold text-white uppercase tracking-tight">
                  {isGitHubLink(post.downloadUrl) ? 'View Artifact on GitHub' : 'Download Resource'}
                </h4>
                <p className="text-sm text-[var(--color-primary-300)]">Access the full file for this technical resource.</p>
              </div>
            </div>
            <a 
              href={post.downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2 px-8 py-3 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] border-none shadow-md hover:shadow-lg transition-all"
            >
              {isGitHubLink(post.downloadUrl) ? <Github size={20} /> : <Download size={20} />}
              {isGitHubLink(post.downloadUrl) ? 'View on GitHub' : 'Download Now'}
            </a>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-[var(--color-border)]">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[var(--color-primary-400)] font-bold hover:gap-3 transition-all"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>
        </footer>
      </article>

      {/* More Articles */}
      {morePosts && morePosts.length > 1 && (
        <section className="bg-[var(--color-surface-alt)] py-20 border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-white">
              Recent Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {morePosts
                .filter((p: any) => p.slug !== post.slug)
                .slice(0, 3)
                .map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    className="group bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all"
                  >
                    <div className="aspect-video bg-black">
                      {p.coverImage && (
                        <img
                          src={p.coverImage}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          alt={p.title}
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-white group-hover:text-[var(--color-primary-400)] transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
