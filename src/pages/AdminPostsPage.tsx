import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import { docToData } from '../lib/api';
import { Edit2, Eye, EyeOff, Trash2, File as FileIcon, FileText, Github, Plus, Loader2 } from 'lucide-react';

export default function AdminPostsPage() {
  const queryClient = useQueryClient();

  const isGitHubLink = (url?: string) => url?.includes('github.com');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const db = getReadDb();
      // Fetch all posts without orderBy to ensure posts with missing fields show up
      const q = query(collection(db, 'artifacts/tech-institute/public/data/posts'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => docToData<any>(doc));
      
      // Sort manually in memory
      return data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white mb-2 uppercase italic tracking-tight italic">Blog Artifacts</h1>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">Manage articles and news updates for the public cluster.</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary flex items-center gap-2 shadow-xl shadow-blue-900/20">
          <Plus size={18} /> New Article
        </Link>
      </div>

      <div className="bg-[var(--color-surface-alt)] rounded-[2rem] border border-[var(--color-border)] shadow-2xl overflow-hidden min-h-[400px]">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-black/20 border-b border-[var(--color-border)]">
              <tr>
                <th className="py-5 px-8 text-[10px] font-extrabold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">Published</th>
                <th className="py-5 px-8 text-[10px] font-extrabold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">Post Title</th>
                <th className="py-5 px-8 text-[10px] font-extrabold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">Type Architecture</th>
                <th className="py-5 px-8 text-[10px] font-extrabold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">Status Metric</th>
                <th className="py-5 px-8 text-right text-[10px] font-extrabold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin w-8 h-8 text-[var(--color-primary-400)] mx-auto" /></td></tr>
              ) : posts?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[var(--color-text-secondary)]">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold uppercase tracking-widest italic">No blog artifacts detected.</p>
                  </td>
                </tr>
              ) : (
                posts?.map(post => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-6 px-8 text-xs font-mono text-white opacity-80 whitespace-nowrap uppercase tracking-tighter">
                      {post.publishedAt 
                        ? (typeof post.publishedAt === 'string' 
                            ? new Date(post.publishedAt).toLocaleDateString() 
                            : post.publishedAt.toDate?.() 
                              ? new Date(post.publishedAt.toDate()).toLocaleDateString() 
                              : '-'
                          ) 
                        : '-'}
                    </td>
                    <td className="py-6 px-8">
                       <Link to={`/admin/posts/${post.id}/edit`} className="font-extrabold text-white hover:text-[var(--color-primary-400)] transition-colors uppercase tracking-tight text-sm line-clamp-1 block">
                          {post.title}
                       </Link>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-2">
                        {post.isFile ? (
                          <span className={`flex items-center gap-1.5 font-black px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest ${isGitHubLink(post.downloadUrl) ? 'text-white bg-slate-800' : 'text-[var(--color-primary-400)] bg-[var(--color-primary-900)]'}`}>
                            {isGitHubLink(post.downloadUrl) ? <Github size={12} /> : <FileIcon size={12} />}
                            {isGitHubLink(post.downloadUrl) ? 'GitHub' : 'Binary'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[var(--color-text-tertiary)] font-black bg-white/5 px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest border border-[var(--color-border)]">
                            <FileText size={12} /> Narrative
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        post.status === 'published' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-white/5 text-[var(--color-text-tertiary)] border-[var(--color-border)]'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${post.status === 'published' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-[var(--color-text-tertiary)]'}`} />
                        {post.status}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-end gap-3 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/posts/${post.id}/edit`} className="p-2.5 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-[var(--color-border)]" title="Edit Artifact">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => toggleStatus(post)} className="p-2.5 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-[var(--color-border)]" title={post.status === 'published' ? 'Archive' : 'Activate'}>
                          {post.status === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => deletePost(post)} className="p-2.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-transparent hover:border-red-500/20" title="Delete Artifact">
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

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[var(--color-border)]">
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin w-8 h-8 text-[var(--color-primary-400)] mx-auto" /></div>
          ) : posts?.length === 0 ? (
            <div className="py-20 text-center text-[var(--color-text-secondary)] italic">No artifacts stored.</div>
          ) : (
            posts?.map(post => (
              <div key={post.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-white text-base leading-tight uppercase italic tracking-tight line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-3">
                       <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          post.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-[var(--color-text-tertiary)]'
                       }`}>
                         {post.status}
                       </span>
                       <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono font-bold uppercase tracking-tight">
                        {post.publishedAt 
                          ? (typeof post.publishedAt === 'string' 
                              ? new Date(post.publishedAt).toLocaleDateString() 
                              : post.publishedAt.toDate?.() 
                                ? new Date(post.publishedAt.toDate()).toLocaleDateString() 
                                : 'DRAFT'
                            ) 
                          : 'DRAFT'}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
                  <Link to={`/admin/posts/${post.id}/edit`} className="flex-1 flex justify-center py-2.5 text-white bg-white/5 hover:bg-white/10 border border-[var(--color-border)] rounded-xl transition-all" title="Edit">
                    <Edit2 size={16} />
                  </Link>
                  <button onClick={() => toggleStatus(post)} className="flex-1 flex justify-center py-2.5 text-white bg-white/5 hover:bg-white/10 border border-[var(--color-border)] rounded-xl transition-all" title={post.status === 'published' ? 'Archive' : 'Activate'}>
                    {post.status === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => deletePost(post)} className="flex-1 flex justify-center py-2.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
