import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import JoinSection from "@/components/home/JoinSection";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import FuelingAmbition from "@/components/home/FuelingAmbition";
import StatsBar from "@/components/home/StatsBar";
import EmpoweringSuccess from "@/components/home/EmpoweringSuccess";
import Partners from "@/components/home/Partners";
import Testimonials from "@/components/home/Testimonials";
import BlogSection from "@/components/home/BlogSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <Header />
      <Hero />
      <JoinSection />
      <FeaturesGrid />
      <FuelingAmbition />
      <StatsBar />
      <EmpoweringSuccess />
      <Partners />
      <Testimonials />
      <BlogSection />
      <Footer />
    </main>
  );
}
