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

      <div className="bg-[var(--color-primary-600)] text-white py-16">
        <div className="container-wide px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your privacy is important to us. We are committed to protecting your personal information at Let Solutions.
          </p>
        </div>
      </div>

      <div className="container-narrow py-16 px-4">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 italic mb-8">Last Updated: May 14, 2026</p>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Eye size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Information We Collect</h2>
            </div>
            <p>
              We collect information that you provide directly to us when you register for courses, subscribe to our newsletter, or contact us through our website. This may include:
            </p>
            <ul>
              <li>Contact information (Name, Email, Phone Number, Address)</li>
              <li>Academic background and employment details</li>
              <li>Inquiry details regarding specific courses</li>
              <li>Feedback and testimonials you provide</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">How We Use Your Information</h2>
            </div>
            <p>The information we collect is used to:</p>
            <ul>
              <li>Process your admissions and enrollment requests</li>
              <li>Provide support and respond to your inquiries</li>
              <li>Send you updates about our courses, events, and offers</li>
              <li>Improve our website and educational services</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Data Security</h2>
            </div>
            <p>
              We implement appropriate technical and organizational measures to safeguard your personal information against unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption for sensitive data handling.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Shield size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Your Rights</h2>
            </div>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data when it's no longer necessary</li>
              <li>Object to processing or request restriction of processing</li>
              <li>Withdraw consent for marketing communications at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <p className="font-bold text-slate-900">Let Solutions</p>
              <p className="text-slate-600">Email: info@letsolutions.in</p>
              <p className="text-slate-600">Address: 1st Floor, Bus Stand Building, Tirur, Malappuram (Dist), Kerala, India - 676101</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
