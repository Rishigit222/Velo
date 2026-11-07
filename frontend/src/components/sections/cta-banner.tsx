import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section id="cta" className="w-full py-20 sm:py-28 bg-[#06060a]">
      <div className="pw">
        {/* Wide horizontal layout panel */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-gradient-to-br from-[#131318] to-[#0d0d12]">
          {/* Ambient glows */}
          <div className="absolute top-0 left-1/4 w-96 h-64 bg-[#3867FF]/18 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-48 bg-[#20C997]/12 blur-[80px] rounded-full pointer-events-none" />

          {/* Horizontal layout */}
          <div className="relative z-10 p-10 sm:p-14 xl:p-16 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">

            {/* LEFT: Headline */}
            <div className="max-w-2xl">
              <div className="eyebrow mb-5 inline-flex">Get Started Today</div>
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Make Every Return
                <br />
                <span className="serif-accent gradient-text-blue">Accountable.</span>
              </h2>
              <p className="text-base xl:text-lg text-zinc-400 leading-relaxed mt-5 max-w-lg">
                Deploy ReturnProof across your fulfillment operations in under 15 minutes.
                Protect margins, eliminate false damage disputes, and build unshakeable
                customer trust with cryptographic evidence.
              </p>

              {/* Guarantees row */}
              <div className="flex flex-wrap gap-5 mt-6 text-xs font-mono text-zinc-400">
                {[
                  "Instant Developer Sandbox",
                  "SHA-256 Tamper Evident",
                  "FastAPI & REST Compliant",
                  "41 Automated Tests Passing",
                ].map((g) => (
                  <span key={g} className="flex items-center gap-1.5">
                    <span className="text-[#20C997]">✓</span> {g}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Action box */}
            <div className="flex flex-col gap-4 xl:items-end shrink-0">
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
                <Button
                  variant="primary"
                  size="lg"
                  className="font-semibold text-[15px] px-10 h-13 shadow-[0_0_30px_rgba(56,103,255,0.4)] w-full xl:w-auto"
                >
                  Explore API Swagger ↗
                </Button>
              </a>
              <Link href="#verification-engine">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-[15px] px-10 h-13 w-full xl:w-auto"
                >
                  Try Interactive Demo
                </Button>
              </Link>
              <div className="text-center xl:text-right mt-1">
                <span className="text-xs text-zinc-500">
                  No credit card · Developer-ready · Open API spec
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
