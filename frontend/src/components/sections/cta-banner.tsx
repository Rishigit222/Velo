import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section id="cta" className="w-full py-20 sm:py-28 bg-[#080808] relative">
      <div className="pw">
        {/* Large cinematic charcoal gradient panel with soft silver ambient light */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-gradient-to-br from-[#1A1A1E] via-[#141416] to-[#0D0D0E] shadow-2xl">
          {/* Soft silver diffused light source */}
          <div className="absolute top-0 right-1/4 w-96 h-64 bg-white/[0.04] blur-[100px] rounded-full pointer-events-none" />

          {/* Horizontal layout */}
          <div className="relative z-10 p-10 sm:p-14 xl:p-16 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">

            {/* LEFT: Headline */}
            <div className="max-w-2xl">
              <div className="eyebrow mb-5 inline-flex">Get Started Today</div>
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Make Every Return
                <br />
                <span className="serif-accent silver-gradient-text">Accountable.</span>
              </h2>
              <p className="text-base xl:text-lg text-[#A3A3A3] leading-relaxed mt-5 max-w-lg font-normal">
                Deploy ReturnProof across your fulfillment operations in under 15 minutes.
                Protect margins, eliminate false damage claims, and build unshakeable
                customer trust with cryptographic evidence.
              </p>

              {/* Guarantees row */}
              <div className="flex flex-wrap gap-5 mt-6 text-xs font-mono text-[#A3A3A3]">
                {[
                  "Developer Sandbox Ready",
                  "SHA-256 Tamper Evident",
                  "FastAPI & REST Compliant",
                  "41 Automated Tests Passing",
                ].map((g) => (
                  <span key={g} className="flex items-center gap-1.5">
                    <span className="text-[#49B99A]">✓</span> {g}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Action box */}
            <div className="flex flex-col gap-3.5 xl:items-end shrink-0">
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-10 w-full xl:w-auto"
                >
                  Explore API Swagger ↗
                </Button>
              </a>
              <Link href="#verification-engine">
                <Button
                  variant="secondary"
                  size="lg"
                  className="px-10 w-full xl:w-auto"
                >
                  Try Interactive Demo
                </Button>
              </Link>
              <div className="text-center xl:text-right mt-1">
                <span className="text-xs text-[#777777]">
                  No credit card required · Open API specifications
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
