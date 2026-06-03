import SEO from '../components/SEO';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO 
        title="Privacy Policy | Let Solutions"
        description="Read our privacy policy to understand how we handle your data and protect your privacy."
        canonical="/privacy"
      />

      <div className="bg-[var(--color-surface)] py-16">
        <div className="container-wide px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Privacy Policy</h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Your privacy is important to us. We are committed to protecting your personal information at Let Solutions.
          </p>
        </div>
      </div>

      <div className="container-narrow py-16 px-4 bg-black">
        <div className="prose prose-invert max-w-none">
          <p className="text-[var(--color-text-tertiary)] italic mb-8">Last Updated: May 14, 2026</p>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--color-primary-900)] text-[var(--color-primary-400)] rounded-lg flex items-center justify-center border border-[var(--color-primary-800)]">
                <Eye size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">Information We Collect</h2>
            </div>
            <div className="text-[var(--color-text-secondary)]">
              <p>
                We collect information that you provide directly to us when you register for courses, subscribe to our newsletter, or contact us through our website. This may include:
              </p>
              <ul>
                <li>Contact information (Name, Email, Phone Number, Address)</li>
                <li>Academic background and employment details</li>
                <li>Inquiry details regarding specific courses</li>
                <li>Feedback and testimonials you provide</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-950/50 text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-900/50">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">How We Use Your Information</h2>
            </div>
            <div className="text-[var(--color-text-secondary)]">
              <p>The information we collect is used to:</p>
              <ul>
                <li>Process your admissions and enrollment requests</li>
                <li>Provide support and respond to your inquiries</li>
                <li>Send you updates about our courses, events, and offers</li>
                <li>Improve our website and educational services</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-950/50 text-green-400 rounded-lg flex items-center justify-center border border-green-900/50">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">Data Security & Storage</h2>
            </div>
            <div className="text-[var(--color-text-secondary)] space-y-4">
              <p>
                We implement appropriate technical and organizational measures to safeguard your personal information against unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption for sensitive data handling.
              </p>
              <p>
                <strong>Data Hosting Infrastructure:</strong> All core database records, student enrollment queries, contact details, of-record applications, and authentication data are securely stored and managed on cloud infrastructure hosted on <strong>Google servers</strong>. Multimedia assets, photo galleries, images, and static blog resources may be hosted and served from specific external content distribution network services for optimal performance.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-950/50 text-purple-400 rounded-lg flex items-center justify-center border border-purple-900/50">
                <Shield size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">Your Rights</h2>
            </div>
            <div className="text-[var(--color-text-secondary)]">
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data when it's no longer necessary</li>
                <li>Object to processing or request restriction of processing</li>
                <li>Withdraw consent for marketing communications at any time</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-[var(--color-text-secondary)]">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-[var(--color-surface-alt)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xl">
              <p className="font-bold text-white uppercase tracking-tight">Let Solutions</p>
              <p className="text-[var(--color-text-secondary)]">Email: info@letsolutions.in</p>
              <p className="text-[var(--color-text-tertiary)] text-sm mt-1">Address: 1st Floor, Bus Stand Building, Tirur, Malappuram (Dist), Kerala, India - 676101</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
