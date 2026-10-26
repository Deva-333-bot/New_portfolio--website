import type { Metadata } from "next";
import "./globals.css";
import ClientAnalyticsTracker from "./ClientAnalyticsTracker";

export const metadata: Metadata = {
  title: "Oduor Daivine Oluoch | Founder, Software Engineer & Technology Innovator",
  description: "Official portfolio of Oduor Daivine Oluoch. Founder of Florante Tech Limited, software engineer specializing in FastAPI backend architecture, scalable web apps, and applied AI systems.",
  keywords: ["Software Engineer", "Kenya", "FastAPI", "Python", "React", "Next.js", "Florante Tech", "Cybersecurity", "Oduor Daivine"],
  authors: [{ name: "Oduor Daivine Oluoch" }],
  openGraph: {
    title: "Oduor Daivine Oluoch | Founder & Software Engineer",
    description: "Building Secure, Intelligent Software for Real-World Problems.",
    type: "website",
    locale: "en_US",
    siteName: "Oduor Daivine Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oduor Daivine Oluoch | Founder & Software Engineer",
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
    "jobTitle": "Founder & Software Engineer",
    "worksFor": {
      "@type": "Organization",
      "name": "Florante Tech Limited"
    },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Kirinyaga University"
    },
    "url": "https://florante.tech",
    "sameAs": [
      "https://github.com/florantetech",
      "https://linkedin.com/in/oduor-daivine",
      "https://x.com/florantetech"
    ]
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
        {children}
      </body>
    </html>
  );
}
