import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestPosts } from "../lib/api";
import { File as FileIcon, FileText, Github } from "lucide-react";

import SEO from "../components/SEO";

export default function BlogListPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-posts"],
    queryFn: fetchLatestPosts,
  });

  const isGitHubLink = (url?: string) => url?.includes('github.com');

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
        title="Tech Blog, Repair Guides & Institute Updates"
        description="Stay updated with the latest in electronics repair, chip-level engineering tutorials, and institute news from Let Solutions Tirur."
        keywords="technical blog tirur, smartphone repair guides kerala, electronics repair tutorials malappuram, chip level engineering updates, tech training news kerala"
        canonical="/blog"
        structuredData={breadcrumbSchema}
      />

      <div className="bg-[var(--color-surface)] py-12 md:py-20 border-b border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4 text-white">
           <FileText size={300} />
        </div>
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left relative z-10">
          <span className="inline-block px-4 py-1.5 bg-[var(--color-primary-900)] text-[var(--color-primary-400)] border border-[var(--color-primary-800)] rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6">
            Tech Journal
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white uppercase italic">
            Institute News &{" "}
            <span className="text-[var(--color-neon-green)] not-italic">
              Tech Updates
            </span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Stay updated with the latest trends in hardware networking, cybersecurity,
            chip-level logic tutorials, and student achievements from Tirur's leading tech hub.
          </p>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="text-center py-12 font-medium text-slate-500">
            Loading posts...
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link
                to={`/blog/${post.slug}`}
                key={post.id}
                className="group bg-[var(--color-surface-alt)] border flex flex-col border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-2 mb-3">
                    {post.isFile ? (
                      <span className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${isGitHubLink(post.downloadUrl) ? 'text-white bg-slate-800' : 'text-[var(--color-primary-400)] bg-[var(--color-primary-900)]'}`}>
                        {isGitHubLink(post.downloadUrl) ? <Github size={12} /> : <FileIcon size={12} />}
                        {isGitHubLink(post.downloadUrl) ? 'GitHub Project' : 'Resource File'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 font-bold bg-[var(--color-surface)] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                        <FileText size={12} /> Article
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[var(--color-primary-400)] transition-colors uppercase tracking-tight text-white">
                    {post.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2 flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border)] mt-auto">
                    {post.author?.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        className="w-8 h-8 rounded-full"
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
                      <div className="text-[var(--color-text-tertiary)]">
                        {post.publishedAt
                          ? typeof post.publishedAt === "string"
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : post.publishedAt.toDate?.()
                              ? new Date(
                                  post.publishedAt.toDate(),
                                ).toLocaleDateString()
                              : "Recent"
                          : "Recent"}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[var(--radius-xl)]">
            <p className="text-[var(--color-text-primary)] text-lg font-medium mb-2">
              No posts available right now.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              Check back soon for new content.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
