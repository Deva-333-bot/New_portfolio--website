import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-8 text-slate-300">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <div className="border-b border-navy-600/60 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/40 text-brand-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4" /> Data Protection & Privacy Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: October 2026 &bull; Compliant with Kenya Data Protection Act, 2019
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Principles & Purpose</h2>
            <p>
              This website is operated by Oduor Daivine Oluoch / Florante Tech Limited in Kenya. We believe in privacy by design. We do not sell, rent, or trade your personal information to third parties or advertising networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. First-Party Analytics</h2>
            <p>
              Our website uses privacy-conscious, first-party telemetry solely to measure aggregate site performance, popular case studies, and CV downloads. Telemetry sessions are pseudonymized using salted daily hashes. We do not use persistent cross-site tracking cookies or fingerprinting.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Contact Form Submissions</h2>
            <p>
              When you submit an inquiry through our contact form, we collect your name, email address, organization (if supplied), and message content strictly for the purpose of communicating with you regarding your inquiry.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Data Retention & Your Rights</h2>
            <p>
              In accordance with the Kenya Data Protection Act, 2019, you have the right to request access to, rectification of, or erasure of any personal records you have submitted. To exercise these rights, please email us directly at <span className="text-brand-400 font-mono">hello@florante.tech</span>.
            </p>
          </section>
        </div>

      </main>
      <Footer />
    </div>
  );
}
