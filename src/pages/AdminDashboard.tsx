import { useState, useEffect } from 'react';
import { Users, BookOpen, MessageSquare, Award, Plus, FileText, Settings, Layout, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchRecentEnquiries } from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    enquiries: 0,
    testimonials: 0,
    offers: 0
  });
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [statsData, enquiriesData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentEnquiries(5)
        ]);

        if (statsData) setStats(statsData);
        if (enquiriesData) setRecentEnquiries(enquiriesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Dashboard</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Welcome back. Here is what is happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/courses/new" className="btn-secondary btn-sm flex items-center gap-2">
            + Course
          </Link>
          <Link to="/admin/posts/new" className="btn-primary btn-sm flex items-center gap-2">
            + Blog Post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] group hover:border-[var(--color-primary-400)] transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-950)] text-[var(--color-primary-400)] flex items-center justify-center border border-[var(--color-primary-900)]">
                  <BookOpen size={24} />
               </div>
               <span className="text-[10px] font-bold text-[var(--color-primary-400)] bg-[var(--color-primary-950)] px-2 py-1 rounded border border-[var(--color-primary-900)] uppercase tracking-widest">Live</span>
             </div>
             <h3 className="font-bold text-lg mb-1 text-white">Total Courses</h3>
             <p className="text-3xl font-display font-black text-white">{isLoading ? '...' : stats.courses}</p>
          </div>

          <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] group hover:border-amber-500 transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-amber-950/30 text-amber-500 flex items-center justify-center border border-amber-900/30">
                  <MessageSquare size={24} />
               </div>
               <span className="text-[10px] font-bold text-amber-500 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/20 uppercase tracking-widest">Inquiries</span>
             </div>
             <h3 className="font-bold text-lg mb-1 text-white">Enquiries</h3>
             <p className="text-3xl font-display font-black text-white">{isLoading ? '...' : stats.enquiries}</p>
          </div>

          <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] group hover:border-[var(--color-success)] transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-950/30 text-emerald-400 flex items-center justify-center border border-emerald-900/30">
                  <Users size={24} />
               </div>
             </div>
             <h3 className="font-bold text-lg mb-1 text-white">Feedbacks</h3>
             <p className="text-3xl font-display font-black text-white">{isLoading ? '...' : stats.testimonials}</p>
          </div>

          <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] group hover:border-[var(--color-neon-green)] transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-green-950/30 text-[var(--color-neon-green)] flex items-center justify-center border border-green-900/30">
                  <Award size={24} />
               </div>
             </div>
             <h3 className="font-bold text-lg mb-1 text-white">Active Offers</h3>
             <p className="text-3xl font-display font-black text-[var(--color-neon-green)]">{isLoading ? '...' : stats.offers}</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface-alt)] p-6 rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-4 text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
             <Link to="/admin/courses/new" className="flex flex-col items-center justify-center p-4 bg-black rounded-2xl hover:bg-[var(--color-primary-900)] transition group border border-white/5">
                <Plus size={20} className="mb-2 text-[var(--color-primary-400)] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">New Course</span>
             </Link>
             <Link to="/admin/home" className="flex flex-col items-center justify-center p-4 bg-black rounded-2xl hover:bg-orange-950/30 transition group border border-white/5">
                <Layout size={20} className="mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Home Page</span>
             </Link>
             <Link to="/admin/settings" className="flex flex-col items-center justify-center p-4 bg-black rounded-2xl hover:bg-slate-900 transition group border border-white/5">
                <Settings size={20} className="mb-2 text-slate-400 group-hover:rotate-45 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Settings</span>
             </Link>
             <Link to="/" className="flex flex-col items-center justify-center p-4 bg-black rounded-2xl hover:bg-green-950/30 transition group border border-white/5">
                <ExternalLink size={20} className="mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Live Site</span>
             </Link>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] p-6">
         <h2 className="text-lg font-bold mb-4 text-white">Recent Enquiries</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/50">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] rounded-tl-xl">Name</th>
                  <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)]">Course</th>
                  <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)]">Status</th>
                  <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] rounded-tr-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-white/5 group transition-colors">
                    <td className="py-4 px-4 text-sm font-bold text-white">{enquiry.name}</td>
                    <td className="py-4 px-4 text-sm text-[var(--color-text-secondary)]">{enquiry.courseInterested || 'General Inquiry'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${enquiry.status === 'new' ? 'bg-amber-950 text-amber-500 border border-amber-900/50' : 'bg-blue-950 text-blue-400 border border-blue-900/50'}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-[var(--color-text-tertiary)]">
                      {new Date(enquiry.submittedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
                {recentEnquiries.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--color-text-tertiary)] italic">No recent activity detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
         <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-center">
            <Link to="/admin/enquiries" className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary-400)] hover:text-white transition-colors">View All Archive</Link>
         </div>
      </div>
    </div>
  );
}
