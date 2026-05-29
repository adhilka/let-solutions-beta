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

      <div className="bg-[var(--color-surface)] py-12 md:py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-[var(--color-text-primary)]/10 text-[var(--color-text-primary)] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--color-text-primary)]/20">
            Tech Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-text-primary)]">
            Institute News &{" "}
            <span className="text-[var(--color-text-primary)] drop-shadow-[0_0_10px_rgba(0,255,156,0.5)]">
              Tech Updates
            </span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto md:mx-0">
            Read up on the latest trends in hardware networking, cybersecurity,
            chip-level logic, and student achievements.
          </p>
        </div>
      </div>

      <div className="container-wide px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="text-center py-12 font-medium text-[var(--color-text-tertiary)]">
            Loading posts...
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link
                to={`/blog/${post.slug}`}
                key={post.id}
                className="group bg-[var(--color-surface-alt)] border flex flex-col border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-xl overflow-hidden hover:scale-[1.02] hover:border-[var(--color-text-primary)]/40 transition-all duration-300"
              >
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-2 mb-3">
                    {post.isFile ? (
                      <span className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${isGitHubLink(post.downloadUrl) ? 'text-[var(--color-surface)] bg-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)] bg-[var(--color-text-primary)]/10 border border-[var(--color-text-primary)]/20'}`}>
                        {isGitHubLink(post.downloadUrl) ? <Github size={12} /> : <FileIcon size={12} />}
                        {isGitHubLink(post.downloadUrl) ? 'GitHub Project' : 'Resource File'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)] font-bold bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                        <FileText size={12} /> Article
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 text-[var(--color-text-primary)] group-hover:underline transition-colors uppercase tracking-tight">
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
                        className="w-8 h-8 rounded-full border border-[var(--color-border)]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--color-text-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-text-primary)]">
                        LS
                      </div>
                    )}
                    <div className="text-xs">
                      <div className="font-semibold text-[var(--color-text-primary)]">
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
