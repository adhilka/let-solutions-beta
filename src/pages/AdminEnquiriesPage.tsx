import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { dualWrite } from '../lib/firebase/dualWrite';
import { docToData } from '../lib/api';

export default function AdminEnquiriesPage() {
  const queryClient = useQueryClient();

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['admin-enquiries'],
    queryFn: async () => {
      const db = getReadDb();
      const q = query(collection(db, 'artifacts/tech-institute/public/data/enquiries'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    }
  });

  const updateStatus = async (id: string, status: string) => {
    await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'enquiries', id], { status });
    queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="badge badge-yellow">New</span>;
      case 'contacted': return <span className="badge badge-blue">Contacted</span>;
      case 'enrolled': return <span className="badge badge-green">Enrolled</span>;
      case 'closed': return <span className="badge bg-gray-200 text-gray-700">Closed</span>;
      default: return <span className="badge bg-gray-200">Unknown</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Enquiries</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Manage student leads and applications.</p>
        </div>
        <button className="btn-secondary btn-sm" onClick={() => alert("CSV Export feature not implemented in this demo.")}>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Date</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Phone</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Course</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center">Loading...</td></tr>
              ) : enquiries?.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[var(--color-text-secondary)]">No enquiries found.</td></tr>
              ) : (
                enquiries?.map(enq => (
                  <tr key={enq.id} className="hover:bg-[var(--color-primary-50)] transition-colors">
                    <td className="py-4 px-6 text-sm whitespace-nowrap">
                      {enq.submittedAt?.toDate?.() ? new Date(enq.submittedAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-medium">{enq.name}</td>
                    <td className="py-4 px-6 text-sm">{enq.phone}</td>
                    <td className="py-4 px-6 text-sm"><span className="badge badge-blue">{enq.courseInterested}</span></td>
                    <td className="py-4 px-6">{getStatusBadge(enq.status)}</td>
                    <td className="py-4 px-6 text-sm">
                      <select 
                        value={enq.status} 
                        onChange={(e) => updateStatus(enq.id, e.target.value)}
                        className="input bg-white py-1 text-xs appearance-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="closed">Closed / Failed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
