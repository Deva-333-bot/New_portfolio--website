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
            Last Updated: October 2026 &bull; Privacy notice for users in Kenya and elsewhere
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
              Optional first-party analytics run only after you select “Accept analytics” in the site banner. Events include page views, project interactions, and CV-download clicks so the owner can review aggregate usage. You may decline and still use the website. Your choice is stored in this browser's local storage and can be changed using “Manage Analytics” in the footer. The server derives a truncated, daily keyed pseudonymous reference from the request IP address; it does not store the raw IP address in the analytics event. This is pseudonymization, not a guarantee of anonymity. The site does not use persistent cross-site tracking cookies or browser fingerprinting.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Contact Form Submissions</h2>
            <p>
              When you submit an inquiry through our contact form, we store your name, email address, organization (if supplied), inquiry details, and message in the website database so the owner can respond and manage the inquiry. If production email delivery is configured, a notification may also be sent to the site owner. Contact submissions are retained in the CMS until deleted; no automatic retention period is currently configured.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Data Retention & Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of personal information you submitted, subject to applicable law. To make a request, please email <span className="text-brand-400 font-mono">hello@florante.tech</span>.
            </p>
          </section>
        </div>

      </main>
      <Footer />
    </div>
  );
}
