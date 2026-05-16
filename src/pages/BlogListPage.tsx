import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPosts } from '../lib/api';

import SEO from '../components/SEO';

export default function BlogListPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['latest-posts'],
    queryFn: fetchLatestPosts
  });

  return (
    <>
      <SEO 
        title="Tech Blog & Updates"
        description="Latest news, technical guides, and industry updates from Let Solutions Technical Institute."
        canonical="/blog"
      />

      <div className="bg-[var(--color-primary-50)] py-12 md:py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full text-xs font-bold uppercase tracking-wider mb-4">Tech Blog</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-text-primary)]">
            Institute News & <span className="text-[var(--color-primary-600)]">Tech Updates</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto md:mx-0">
            Read up on the latest trends in hardware networking, cybersecurity, chip-level logic, and student achievements.
          </p>
        </div>
      </div>

      <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 py-16">
         {isLoading ? (
             <div className="text-center py-12 font-medium text-slate-500">Loading posts...</div>
         ) : posts && posts.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {posts.map((post: any) => (
                     <Link to={`/blog/${post.slug}`} key={post.id} className="group bg-white border flex flex-col border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden hover:shadow-lg transition-all duration-300">
                         <div className="relative aspect-video bg-gray-200 overflow-hidden">
                             {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                         </div>
                         <div className="p-6 flex flex-col flex-1">
                             <div className="flex gap-2 mb-3">
                                <span className="badge badge-blue">{post.category}</span>
                             </div>
                             <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{post.title}</h3>
                             <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>
                             <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border)] mt-auto">
                                 {post.author?.avatarUrl ? (
                                     <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full" />
                                 ) : (
                                     <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-[10px] font-bold text-blue-600">LS</div>
                                 )}
                                 <div className="text-xs">
                                     <div className="font-semibold">{post.author?.name || 'Admin'}</div>
                                     <div className="text-[var(--color-text-tertiary)]">{new Date(post.publishedAt).toLocaleDateString()}</div>
                                 </div>
                             </div>
                         </div>
                     </Link>
                 ))}
             </div>
         ) : (
             <div className="text-center py-20 bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)]">
                <p className="text-[var(--color-text-primary)] text-lg font-medium mb-2">No posts available right now.</p>
                <p className="text-[var(--color-text-secondary)]">Check back soon for new content.</p>
             </div>
         )}
      </div>
    </>
  );
}
