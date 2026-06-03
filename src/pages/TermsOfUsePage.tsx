import SEO from '../components/SEO';
import { Scale, CheckCircle, AlertTriangle, HelpCircle, Database } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <>
      <SEO 
        title="Terms of Use | Let Solutions"
        description="Read the terms and conditions for using our website and enrolling in our courses."
        canonical="/terms"
      />

      <div className="bg-[var(--color-surface)] py-16">
        <div className="container-wide px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Terms of Use</h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Rules and guidelines for interacting with Let Solutions.
          </p>
        </div>
      </div>

      <div className="container-narrow py-16 px-4 bg-black">
        <div className="prose prose-invert max-w-none">
          <p className="text-[var(--color-text-tertiary)] italic mb-8">Last Updated: May 14, 2026</p>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--color-primary-900)] text-[var(--color-primary-400)] rounded-lg flex items-center justify-center border border-[var(--color-primary-800)]">
                <CheckCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">Acceptance of Terms</h2>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              By accessing or using our website and services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-950/50 text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-900/50">
                <Scale size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">USE LICENSE</h2>
            </div>
            <div className="text-[var(--color-text-secondary)]">
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
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-950/30 text-amber-500 rounded-lg flex items-center justify-center border border-amber-900/50">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">Disclaimer</h2>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              The materials on Let Solutions' website are provided on an 'as is' basis. Let Solutions makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-950/50 text-blue-400 rounded-lg flex items-center justify-center border border-blue-900/50">
                <Database size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">Data Hosting & Cloud Platforms</h2>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              All of-record application schemas, database entities, student contact data, registration form replies, and secure authentication structures are fully stored and backed up on secure Cloud systems managed by <strong>Google servers</strong>. This ensures high availability and enterprise-grade data security. However, please note that static media assets, user-submitted image resources, and external blogging articles/collateral may be hosted and served from third-party image hosts or CDNs. By accessing our services, you acknowledge and agree to this distribution configuration.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-950/50 text-green-400 rounded-lg flex items-center justify-center border border-green-900/50">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">Course Enrollment</h2>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              Enrollment in courses is subject to availability and meeting the specified prerequisites. Let Solutions reserves the right to cancel or reschedule courses due to unforeseen circumstances. Refunds will be processed according to our specific course refund policy provided during enrollment.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
            <p className="text-[var(--color-text-secondary)]">
              These terms and conditions are governed by and construed in accordance with the laws of Kerala, India, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
