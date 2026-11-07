import React from "react";
import {
  Hero,
  HowItWorks,
  Features,
  VerificationEngine,
  SecurityTrust,
  UserRoles,
  CtaBanner,
} from "@/components";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <HowItWorks />
      <Features />
      <VerificationEngine />
      <SecurityTrust />
      <UserRoles />
      <CtaBanner />
    </div>
  );
}
