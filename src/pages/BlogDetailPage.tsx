import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPostBySlug, fetchLatestPosts } from '../lib/api';
import { ChevronRight, Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SEO from '../components/SEO';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug || ''),
    enabled: !!slug
  });

  const { data: morePosts } = useQuery({
    queryKey: ['latest-posts-sidebar'],
    queryFn: fetchLatestPosts
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
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold mb-4">Post Not Found</h1>
          <p className="text-slate-600 mb-8 text-lg">The article you are looking for does not exist or has been moved. Explore our latest technical guides below.</p>
          <Link to="/blog" className="btn-primary">View All Posts</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {morePosts?.slice(0, 3).map((p: any) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {p.coverImage && <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-blue-600 uppercase mb-2 block">{p.category}</span>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt || post.content.substring(0, 160)}
        ogType="article"
        ogImage={post.coverImage}
        canonical={`/blog/${post.slug}`}
      />

      <div className="bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/blog" className="hover:text-blue-600">Blog</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium truncate">{post.title}</span>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-12 text-center">
          <div className="flex justify-center gap-2 mb-6">
            <span className="badge badge-blue px-4 py-1">{post.category}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="aspect-video rounded-[var(--radius-2xl)] overflow-hidden mb-12 shadow-2xl">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-slate prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <footer className="mt-16 pt-8 border-t">
          <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
            <ArrowLeft size={18} />
            Back to Blog
          </Link>
        </footer>
      </article>

      {/* More Articles */}
      {morePosts && morePosts.length > 1 && (
        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Recent Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {morePosts.filter((p: any) => p.slug !== post.slug).slice(0, 3).map((p: any) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-all">
                  <div className="aspect-video bg-gray-100">
                    {p.coverImage && <img src={p.coverImage} className="w-full h-full object-cover" alt={p.title} />}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold group-hover:text-blue-600 transition-colors line-clamp-2">{p.title}</h3>
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
