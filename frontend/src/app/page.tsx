import React from "react";
import {
  Hero,
  HowItWorks,
  Features,
  CustodySimulator,
  TechStack,
  CtaSection,
} from "@/components";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. How It Works Section (3-Step Workflow) */}
      <HowItWorks />

      {/* 3. Core Features Section (6 Capabilities) */}
      <Features />

      {/* 4. Interactive Verification Engine Simulator */}
      <CustodySimulator />

      {/* 5. Technology Stack Section */}
      <TechStack />

      {/* 6. Call To Action & Deployment Section */}
      <CtaSection />
    </div>
  );
}
