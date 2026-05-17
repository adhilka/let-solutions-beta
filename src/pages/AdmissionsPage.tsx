import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchActiveOffers } from '../lib/api';
import { Calendar, MonitorSmartphone, Server, ShieldCheck } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { getAdmissionYearText } from '../lib/dateUtils';
import { FAILSAFE_OFFERS } from '../constants/failsafe';

import SEO from '../components/SEO';

export default function AdmissionsPage() {
  const { settings } = useGlobalSettings();
  const admissionTitle = getAdmissionYearText(settings);
  const navigate = useNavigate();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['active-offers'],
    queryFn: fetchActiveOffers
  });

  const filteredOffers = offers?.filter((o: any) => o.showOnAdmissions) || [];

  useEffect(() => {
    // If not loading and no filtered offers, redirect to contact
    if (!isLoading && filteredOffers.length === 0) {
      navigate('/contact', { replace: true });
    }
  }, [filteredOffers, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Admissions & Scholarship Offers"
        description="Join Let Solutions Technical Institute. Apply now for professional technical courses with 100% job placement assistance."
        canonical="/admissions"
      />

      <div className="bg-[var(--color-primary-50)] py-12 md:py-16 border-b border-[var(--color-border)]">
        <div className="container-wide px-4 sm:px-6 lg:px-8 text-center md:text-left">
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Current Offers & Notices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredOffers.length > 0 ? (
                filteredOffers.map((offer: any) => (
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
                  <p>Redirecting to application...</p>
                </div>
             )}
          </div>
        </div>

        <div className="mt-12 text-center">
           <a href="/contact" className="btn-primary" style={{ display: 'inline-block' }}>Start Your Application</a>
        </div>
      </div>
    </>
  );
}
