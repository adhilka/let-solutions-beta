import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import { docToData } from '../lib/api';
import { Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function AdminPostsPage() {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const db = getReadDb();
      const q = query(collection(db, 'artifacts/tech-institute/public/data/posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    }
  });

  const toggleStatus = async (post: any) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'posts', post.id], { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    queryClient.invalidateQueries({ queryKey: ['latest-posts'] });
  };

  const deletePost = async (post: any) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'posts', post.id]);
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['latest-posts'] });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Blog Posts</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Manage articles and news updates.</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary flex items-center gap-2">
          + New Post
        </Link>
      </div>

      <div className="hidden md:block bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Published</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Title</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Category</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center">Loading...</td></tr>
              ) : posts?.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-[var(--color-text-secondary)]">No posts found.</td></tr>
              ) : (
                posts?.map(post => (
                  <tr key={post.id} className="hover:bg-[var(--color-primary-50)] transition-colors">
                    <td className="py-4 px-6 text-sm whitespace-nowrap">
                      {post.publishedAt?.toDate?.() ? new Date(post.publishedAt.toDate()).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-6 font-medium max-w-[200px] truncate">{post.title}</td>
                    <td className="py-4 px-6 text-sm"><span className="badge badge-blue">{post.category}</span></td>
                    <td className="py-4 px-6">
                      <span className={`badge ${post.status === 'published' ? 'badge-green' : post.status === 'draft' ? 'badge-yellow' : 'bg-gray-200'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/posts/${post.id}/edit`} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] bg-[var(--color-primary-50)] rounded transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => toggleStatus(post)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] bg-[var(--color-primary-50)] rounded transition-colors" title={post.status === 'published' ? 'Unpublish' : 'Publish'}>
                          {post.status === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => deletePost(post)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] bg-[var(--color-primary-50)] rounded transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="py-8 text-center bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)]">Loading...</div>
        ) : posts?.length === 0 ? (
          <div className="py-8 text-center text-[var(--color-text-secondary)] bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)]">No posts found.</div>
        ) : (
          posts?.map(post => (
            <div key={post.id} className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] p-4 flex flex-col gap-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm line-clamp-2 pr-2">{post.title}</h3>
                  <span className={`shrink-0 badge ${post.status === 'published' ? 'badge-green' : post.status === 'draft' ? 'badge-yellow' : 'bg-gray-200'} text-[10px]`}>
                    {post.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="badge badge-blue text-[10px]">{post.category}</span>
                  <span className="text-xs text-slate-500">
                    {post.publishedAt?.toDate?.() ? new Date(post.publishedAt.toDate()).toLocaleDateString() : 'Draft'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 border-t pt-3">
                <Link to={`/admin/posts/${post.id}/edit`} className="flex-1 flex justify-center py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] bg-[var(--color-primary-50)] rounded transition-colors" title="Edit">
                  <Edit2 size={16} />
                </Link>
                <button onClick={() => toggleStatus(post)} className="flex-1 flex justify-center py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] bg-[var(--color-primary-50)] rounded transition-colors" title={post.status === 'published' ? 'Unpublish' : 'Publish'}>
                  {post.status === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => deletePost(post)} className="flex-1 flex justify-center py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] bg-[var(--color-primary-50)] rounded transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
