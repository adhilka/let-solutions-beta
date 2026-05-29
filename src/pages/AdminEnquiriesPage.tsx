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
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-sm text-[var(--color-text-secondary)]">Loading...</div>
        ) : enquiries?.length === 0 ? (
          <div className="py-8 text-center text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-sm">No enquiries found.</div>
        ) : (
          enquiries?.map(enq => (
            <div key={enq.id} className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-md border border-[var(--color-border)] p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 transition-colors hover:border-[var(--color-primary-600)]">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-lg text-white">{enq.name}</h3>
                  <span className="text-sm text-[var(--color-text-tertiary)]">
                    {enq.submittedAt?.toDate?.() ? new Date(enq.submittedAt.toDate()).toLocaleDateString() : 'N/A'}
                  </span>
                  {getStatusBadge(enq.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                  <span><strong className="text-white">Phone:</strong> <a href={`tel:${enq.phone}`} className="text-[var(--color-primary-400)] hover:underline">{enq.phone}</a></span>
                  {enq.email && <span><strong className="text-white">Email:</strong> <a href={`mailto:${enq.email}`} className="text-[var(--color-primary-400)] hover:underline">{enq.email}</a></span>}
                  <span><strong className="text-white">Course:</strong> <span className="badge badge-blue">{enq.courseInterested}</span></span>
                </div>

                {enq.message && (
                  <div className="mt-2 text-sm bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] whitespace-pre-wrap text-[var(--color-text-secondary)]">
                    <strong className="text-white">Message:</strong><br/>
                    {enq.message}
                  </div>
                )}
              </div>

              <div className="md:ml-auto md:min-w-[140px] shrink-0 border-t border-[var(--color-border)] md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <label className="block text-xs font-semibold text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Update Status</label>
                <select 
                  value={enq.status} 
                  onChange={(e) => updateStatus(enq.id, e.target.value)}
                  className="input bg-[var(--color-surface)] py-2 text-sm w-full font-medium"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="closed">Closed / Failed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
