import Navbar from "@/components/cura/Navbar";
import Hero from "@/components/cura/Hero";
import Features from "@/components/cura/Features";
import HowItWorks from "@/components/cura/HowItWorks";
import Privacy from "@/components/cura/Privacy";
import CTA from "@/components/cura/CTA";
import Footer from "@/components/cura/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Privacy />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
