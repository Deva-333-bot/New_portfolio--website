import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Timeline from "../components/Timeline";
import BlogSection from "../components/BlogSection";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

async function getInitialData() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    const [profileRes, skillsRes, projectsRes, postsRes] = await Promise.all([
      fetch(`${apiBase}/public/profile`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/public/skills`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/public/projects`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/public/posts`, { next: { revalidate: 60 } }),
    ]);

    const profileData = profileRes.ok ? await profileRes.json() : null;
    const skillsData = skillsRes.ok ? await skillsRes.json() : [];
    const projectsData = projectsRes.ok ? await projectsRes.json() : [];
    const postsData = postsRes.ok ? await postsRes.json() : [];

    return {
      profile: profileData?.profile,
      skills: skillsData,
      projects: projectsData,
      posts: postsData,
    };
  } catch (e) {
    // Graceful fallback for build-time or offline API
    return {
      profile: {
        display_name: "Oduor Daivine Oluoch",
        headline: "Software Engineering Student | AI & ML Enthusiast | Founder",
        short_bio: "Building secure, intelligent software and resilient digital systems for real-world impact across Africa and beyond.",
        full_bio: "Software engineer and founder of Florante Tech Limited, pursuing BSc Software Engineering at Kirinyaga University (expected 2028). Specializing in FastAPI backend architecture, scalable web apps, and applied AI systems.",
        company_name: "Florante Tech Limited",
        location: "Nairobi / Kirinyaga, Kenya",
        public_email: "hello@florante.tech",
         
        
        
      },
      skills: [],
      projects: [],
      posts: [],
    };
  }
}

export default async function HomePage() {
  const data = await getInitialData();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar brandName="Daivine Oluoch" />
      <main className="flex-1">
        <Hero profile={data.profile} />
        <About profile={data.profile} />
        <Skills initialSkills={data.skills} />
        <Projects initialProjects={data.projects} />
        <Timeline />
        <BlogSection initialPosts={data.posts} />
        <Contact publicEmail={data.profile?.public_email} location={data.profile?.location} />
      </main>
      <Footer displayName={data.profile?.display_name} publicEmail={data.profile?.public_email} />
    </div>
  );
}
