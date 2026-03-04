import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import Image from "next/image";

export default function Home() {
  return (
   <div>
   
    <Hero />
    <Stats />
    <HowItWorks />
    <Features />
    <Testimonials />
    <Pricing />
    <CTA />
    <Footer />
   </div>
  );
}
