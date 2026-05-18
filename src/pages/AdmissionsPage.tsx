import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchActiveOffers } from '../lib/api';
import { Calendar, MonitorSmartphone, Server, ShieldCheck, ArrowRight } from 'lucide-react';
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://letsolutions.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Admissions",
        "item": "https://letsolutions.in/admissions"
      }
    ]
  };

  return (
    <>
      <SEO 
        title="Admissions & Scholarship Offers"
        description="Join Let Solutions Technical Institute. Apply now for professional technical courses with 100% job placement assistance."
        keywords="technical institute admissions, smartphone repair scholarship, laptop training application tirur, vocational training maladppuram"
        canonical="/admissions"
        structuredData={breadcrumbSchema}
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
        
        {/* Dynamic Offers Redesigned with Image Support */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">Current Offers & Notices</h2>
            <div className="hidden md:block h-[1px] flex-grow mx-8 bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredOffers.length > 0 ? (
                filteredOffers.map((offer: any) => (
                  <div key={offer.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                     {/* Image Header */}
                     <div className="relative aspect-[16/10] bg-slate-50 overflow-hidden">
                        {offer.imageUrl ? (
                          <img 
                            src={offer.imageUrl} 
                            alt={offer.headline} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary-50)] text-[var(--color-primary-200)]">
                            <MonitorSmartphone size={48} strokeWidth={1.5} />
                          </div>
                        )}
                        
                        {offer.badgeLabel && (
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg ${
                              offer.badgeLabel.toLowerCase().includes('limit') || offer.badgeLabel.toLowerCase().includes('off')
                              ? 'bg-red-600 text-white' 
                              : 'bg-[var(--color-primary-600)] text-white'
                            }`}>
                              {offer.badgeLabel}
                            </span>
                          </div>
                        )}
                     </div>

                     <div className="p-8 flex flex-col flex-grow">
                        <h3 className="font-display font-extrabold text-xl text-slate-900 mb-3 group-hover:text-[var(--color-primary-600)] transition-colors">
                          {offer.headline}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                          {offer.subtext}
                        </p>
                        
                        {offer.ctaLabel && (
                          <a 
                            href={offer.ctaHref || '/admissions'} 
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95"
                          >
                            {offer.ctaLabel}
                            <Calendar size={16} />
                          </a>
                        )}
                     </div>
                  </div>
                ))
             ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                     <ShieldCheck size={32} />
                  </div>
                  <p className="text-slate-400 font-medium italic">Redirecting to our contact specialists...</p>
                </div>
             )}
          </div>
        </div>

        <div className="mt-16 text-center">
           <a href="/contact" className="btn-primary inline-flex items-center gap-3 px-10 py-5 rounded-[2rem] text-lg shadow-xl shadow-blue-100 hover:scale-105 transition-transform active:scale-95">
              Start Your Application <ArrowRight size={20} />
           </a>
        </div>
      </div>
    </>
  );
}
