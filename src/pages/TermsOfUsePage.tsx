import SEO from '../components/SEO';
import { Scale, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <>
      <SEO 
        title="Terms of Use | Let Solutions"
        description="Read the terms and conditions for using our website and enrolling in our courses."
        canonical="/terms"
      />

      <div className="bg-[var(--color-primary-600)] text-white py-16">
        <div className="container-wide px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Terms of Use</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Rules and guidelines for interacting with Let Solutions.
          </p>
        </div>
      </div>

      <div className="container-narrow py-16 px-4">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 italic mb-8">Last Updated: May 14, 2026</p>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Acceptance of Terms</h2>
            </div>
            <p>
              By accessing or using our website and services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <Scale size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">USE LICENSE</h2>
            </div>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Let Solutions' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
            <p>Under this license, you may not:</p>
            <ul>
              <li>Modify or copy the materials.</li>
              <li>Use the materials for any commercial purpose or for any public display.</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Disclaimer</h2>
            </div>
            <p>
              The materials on Let Solutions' website are provided on an 'as is' basis. Let Solutions makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Course Enrollment</h2>
            </div>
            <p>
              Enrollment in courses is subject to availability and meeting the specified prerequisites. Let Solutions reserves the right to cancel or reschedule courses due to unforeseen circumstances. Refunds will be processed according to our specific course refund policy provided during enrollment.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Kerala, India, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
