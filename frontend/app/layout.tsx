import type { Metadata } from "next";
import "./globals.css";
import ClientAnalyticsTracker from "./ClientAnalyticsTracker";
import AnalyticsConsentBanner from "../components/AnalyticsConsentBanner";

export const metadata: Metadata = {
  title: "Oduor Daivine Oluoch | Software Engineering Student, AI & ML Enthusiast",
  description: "Portfolio of Oduor Daivine Oluoch, software engineering student, AI and machine-learning enthusiast, and founder of Florante Tech Limited.",
  keywords: ["Software Engineer", "Kenya", "FastAPI", "Python", "React", "Next.js", "Florante Tech", "Cybersecurity", "Oduor Daivine"],
  authors: [{ name: "Oduor Daivine Oluoch" }],
  openGraph: {
    title: "Oduor Daivine Oluoch | Software Engineering Student & Founder",
    description: "Building Secure, Intelligent Software for Real-World Problems.",
    type: "website",
    locale: "en_US",
    siteName: "Oduor Daivine Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oduor Daivine Oluoch | Software Engineering Student & Founder",
    description: "Building Secure, Intelligent Software for Real-World Problems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Oduor Daivine Oluoch",
    "jobTitle": "Software Engineering Student and Founder",
    "worksFor": {
      "@type": "Organization",
      "name": "Florante Tech Limited"
    },

    "url": "https://florante.tech",
    "sameAs": ["https://github.com/Deva-333-bot"]
  };

  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-navy-900 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <ClientAnalyticsTracker />
        <AnalyticsConsentBanner />
        {children}
      </body>
    </html>
  );
}
