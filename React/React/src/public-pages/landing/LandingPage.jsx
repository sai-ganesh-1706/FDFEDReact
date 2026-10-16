import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Problem from "./components/Problem";
import CoreFeatures from "./components/CoreFeatures";
import Roles from "./components/Roles";
import Features from "./components/Features";
import Process from "./components/Process";
import Testimonials from "./components/Testimonals";
import FAQ from "./components/FAQ";
import ContactSection from "./components/ContactSection";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

import { ThemeProvider, useTheme } from "./context/ThemeContext";

import "./Landing.css";

function LandingContent() {
  const { theme } = useTheme();

  return (
    <div className="cn-landing" data-theme={theme}>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Problem />
        <CoreFeatures />
        <Roles />
        <Features />
        <Process />
        <Testimonials />
        <FAQ />
        <ContactSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default function LandingPage() {
  return (
    <ThemeProvider>
      <LandingContent />
    </ThemeProvider>
  );
}