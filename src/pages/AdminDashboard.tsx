import { useState, useEffect } from 'react';
import { Users, BookOpen, MessageSquare, Award, Plus, FileText, Settings, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { getReadDb } from '../lib/firebase/loadBalancer';

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
        const db = getReadDb();
        
        // Fetch Stats
        const coursesSnap = await getDocs(query(collection(db, 'artifacts/tech-institute/public/data/courses')));
        const enquiriesSnap = await getDocs(query(collection(db, 'artifacts/tech-institute/public/data/enquiries')));
        const testimonialsSnap = await getDocs(query(collection(db, 'artifacts/tech-institute/public/data/testimonials')));
        const offersSnap = await getDocs(query(collection(db, 'artifacts/tech-institute/public/data/offers'), where('showOnAdmissions', '==', true)));

        setStats({
          courses: coursesSnap.size,
          enquiries: enquiriesSnap.size,
          testimonials: testimonialsSnap.size,
          offers: offersSnap.size
        });

        // Recent Enquiries
        const enquiriesQ = query(
          collection(db, 'artifacts/tech-institute/public/data/enquiries'),
          orderBy('submittedAt', 'desc'),
          limit(5)
        );
        const recentSnap = await getDocs(enquiriesQ);
        setRecentEnquiries(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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
          <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--color-border)] group hover:border-[var(--color-primary-300)] transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
                  <BookOpen size={24} />
               </div>
               <span className="text-xs font-bold text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2 py-1 rounded">Live</span>
             </div>
             <h3 className="font-bold text-lg mb-1">Total Courses</h3>
             <p className="text-3xl font-display font-black text-[var(--color-text-primary)]">{isLoading ? '...' : stats.courses}</p>
          </div>

          <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--color-border)] group hover:border-[var(--color-warning)] transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)] flex items-center justify-center">
                  <MessageSquare size={24} />
               </div>
               <span className="text-xs font-bold text-[var(--color-warning)] bg-[var(--color-warning)]/5 px-2 py-1 rounded">Action Needed</span>
             </div>
             <h3 className="font-bold text-lg mb-1">Enquiries</h3>
             <p className="text-3xl font-display font-black text-[var(--color-text-primary)]">{isLoading ? '...' : stats.enquiries}</p>
          </div>

          <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--color-border)] group hover:border-[var(--color-error)] transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] flex items-center justify-center">
                  <Users size={24} />
               </div>
             </div>
             <h3 className="font-bold text-lg mb-1">Feedbacks</h3>
             <p className="text-3xl font-display font-black text-[var(--color-text-primary)]">{isLoading ? '...' : stats.testimonials}</p>
          </div>

          <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--color-border)] group hover:border-[var(--color-success)] transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center">
                  <Award size={24} />
               </div>
             </div>
             <h3 className="font-bold text-lg mb-1">Active Offers</h3>
             <p className="text-3xl font-display font-black text-[var(--color-text-primary)]">{isLoading ? '...' : stats.offers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
             <Link to="/admin/courses/new" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <Plus size={20} className="mb-2 text-blue-600" />
                <span className="text-xs font-medium">New Course</span>
             </Link>
             <Link to="/admin/home" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <Layout size={20} className="mb-2 text-orange-600" />
                <span className="text-xs font-medium">Home Content</span>
             </Link>
             <Link to="/admin/settings" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <Settings size={20} className="mb-2 text-gray-600" />
                <span className="text-xs font-medium">Settings</span>
             </Link>
             <Link to="/" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <Layout size={20} className="mb-2 text-green-600" />
                <span className="text-xs font-medium">View Site</span>
             </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--color-border)] p-6">
         <h2 className="text-lg font-bold mb-4">Recent Enquiries</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--color-surface-alt)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-3 px-4 font-semibold text-sm text-[var(--color-text-secondary)] rounded-tl-[8px]">Name</th>
                  <th className="py-3 px-4 font-semibold text-sm text-[var(--color-text-secondary)]">Course</th>
                  <th className="py-3 px-4 font-semibold text-sm text-[var(--color-text-secondary)]">Status</th>
                  <th className="py-3 px-4 font-semibold text-sm text-[var(--color-text-secondary)] rounded-tr-[8px]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-[var(--color-surface-alt)]/50">
                    <td className="py-3 px-4 text-sm font-medium">{enquiry.name}</td>
                    <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{enquiry.courseInterested || 'General'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${enquiry.status === 'new' ? 'badge-yellow' : 'badge-blue'} text-[10px]`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--color-text-tertiary)]">
                      {new Date(enquiry.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentEnquiries.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No enquiries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
         <div className="mt-4 text-center">
            <Link to="/admin/enquiries" className="text-sm font-medium text-[var(--color-primary-600)] hover:underline">View All Enquiries</Link>
         </div>
      </div>
    </div>
  );
}
