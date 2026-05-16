import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { fetchActiveOffers } from '../lib/api';
import { Calendar, MonitorSmartphone, Server, ShieldCheck } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { getAdmissionYearText } from '../lib/dateUtils';

export default function AdmissionsPage() {
  const { settings } = useGlobalSettings();
  const admissionTitle = getAdmissionYearText(settings);

  const { data: offers } = useQuery({
    queryKey: ['active-offers'],
    queryFn: fetchActiveOffers,
  });

  const { data: batches } = useQuery({
    queryKey: ['active-batches'],
    queryFn: async () => {
      const db = getReadDb();
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/batches'),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  });

  return (
    <>
      <Helmet>
        <title>Admissions & Offers | Let Solutions</title>
        <meta name="description" content="Join Let Solutions. Check out our latest batches and admission offers." />
      </Helmet>

      <div className="bg-[var(--color-primary-50)] py-12 md:py-16 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-text-primary)]">
            {admissionTitle.split(' ')[0]} <span className="text-[var(--color-primary-600)]">{admissionTitle.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto md:mx-0">
            Take the first step towards a stable technical career. View our upcoming batches and available scholarships.
          </p>
        </div>
      </div>

      <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Dynamic Offers from API (Fallback to dummy if empty) */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Current Offers & Notices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {offers && offers.length > 0 && offers.filter((o: any) => o.showOnAdmissions).length > 0 ? (
                offers.filter((o: any) => o.showOnAdmissions).map((offer: any) => (
                  <div key={offer.id} className="bg-white p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] border-l-4 border-[var(--color-primary-500)] flex flex-col items-start">
                     {offer.badgeLabel && (
                       <span className={`badge ${offer.badgeLabel === 'LIMITED' ? 'badge-red' : 'badge-blue'} mb-3`}>{offer.badgeLabel}</span>
                     )}
                     <h3 className="font-bold text-lg mb-2">{offer.headline}</h3>
                     <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-grow">{offer.subtext}</p>
                     {offer.ctaLabel && (
                       <a href={offer.ctaHref} className="btn-secondary btn-sm">{offer.ctaLabel}</a>
                     )}
                  </div>
                ))
             ) : (
                <div className="col-span-full py-12 text-center text-[var(--color-text-secondary)]">
                  <p>No active offers at the moment. Please check back later.</p>
                </div>
             )}
          </div>
        </div>

        {/* Upcoming Batches */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Upcoming Batches</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
              <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="py-4 px-6 font-semibold text-[var(--color-text-secondary)]">Course Name</th>
                  <th className="py-4 px-6 font-semibold text-[var(--color-text-secondary)]">Start Date</th>
                  <th className="py-4 px-6 font-semibold text-[var(--color-text-secondary)]">Timings</th>
                  <th className="py-4 px-6 font-semibold text-[var(--color-text-secondary)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {batches && batches.length > 0 ? (
                  batches.map((batch: any) => (
                    <tr key={batch.id} className="hover:bg-[var(--color-primary-50)] transition-colors">
                      <td className="py-4 px-6 font-medium">{batch.courseName}</td>
                      <td className="py-4 px-6">{batch.startDate}</td>
                      <td className="py-4 px-6">{batch.timings}</td>
                      <td className="py-4 px-6">
                        <span className={`badge ${batch.status === 'Open' ? 'badge-green' : batch.status === 'Filling Fast' ? 'badge-yellow' : 'badge-blue'} text-[10px]`}>
                          {batch.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No batches announced yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Apply */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Admission Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="text-center p-6 border border-[var(--color-border)] rounded-[var(--radius-xl)] bg-white relative">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--color-primary-600)] text-white flex items-center justify-center font-bold">1</div>
                 <h3 className="font-bold text-lg mb-2 mt-2">Enquire Online</h3>
                 <p className="text-sm text-[var(--color-text-secondary)]">Browse our courses and fill out the online enquiry form with your basic details.</p>
             </div>
             <div className="text-center p-6 border border-[var(--color-border)] rounded-[var(--radius-xl)] bg-white relative">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--color-primary-600)] text-white flex items-center justify-center font-bold">2</div>
                 <h3 className="font-bold text-lg mb-2 mt-2">Expert Counseling</h3>
                 <p className="text-sm text-[var(--color-text-secondary)]">Our academic counselor will contact you to discuss your career goals and suggest the best fit.</p>
             </div>
             <div className="text-center p-6 border border-[var(--color-border)] rounded-[var(--radius-xl)] bg-white relative">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--color-primary-600)] text-white flex items-center justify-center font-bold">3</div>
                 <h3 className="font-bold text-lg mb-2 mt-2">Confirm Admission</h3>
                 <p className="text-sm text-[var(--color-text-secondary)]">Visit the institute to complete your registration, check the lab facilities, and join the batch.</p>
             </div>
          </div>
          <div className="mt-12 text-center">
             <a href="/contact" className="btn-primary" style={{ display: 'inline-block' }}>Start Your Application</a>
          </div>
        </div>

      </div>
    </>
  );
}
