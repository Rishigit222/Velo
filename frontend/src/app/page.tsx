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
    <div className="flex flex-col min-h-screen bg-white w-full overflow-x-hidden">
      {/* 1. Full-Width Two-Column Hero Section */}
      <Hero />

      {/* 2. Three-Step Custody Workflow Section */}
      <HowItWorks />

      {/* 3. Six Core Feature Capabilities */}
      <Features />

      {/* 4. Interactive Real-Time Verification Simulator */}
      <CustodySimulator />

      {/* 5. Enterprise Technology Stack */}
      <TechStack />

      {/* 6. Call To Action Banner */}
      <CtaSection />
    </div>
  );
}
