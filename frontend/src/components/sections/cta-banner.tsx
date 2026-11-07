import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function CtaBanner() {
  return (
    <section id="cta" className="w-full py-24 sm:py-32 relative overflow-hidden">
      <div className="site-container relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#141418] to-[#0c0c0f] border border-white/[0.12] p-8 sm:p-14 lg:p-20 text-center overflow-hidden shadow-2xl shadow-black/80">
          {/* Radial Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#3867FF]/20 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-[#20C997]/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <Badge
              variant="primary"
              className="uppercase tracking-widest text-[11px] font-semibold py-1 px-4"
            >
              Get Started Today
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Make{" "}
              <span className="font-[family-name:var(--font-serif)] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#507dff] via-[#8bb0ff] to-[#20C997]">
                Every Return Accountable.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Deploy ReturnProof across your fulfillment operations in under 15
              minutes. Protect your margins, eliminate false damage disputes,
              and build unshakeable customer trust.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
                <Button variant="primary" size="lg" className="font-semibold px-8 py-3.5 shadow-xl">
                  Explore API Swagger
                </Button>
              </a>

              <Link href="#verification-engine">
                <Button variant="secondary" size="lg" className="px-8 py-3.5">
                  Try Interactive Demo
                </Button>
              </Link>
            </div>

            {/* Micro Guarantees */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="text-[#20C997]">✓</span>
                <span>Instant Developer Sandbox</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#20C997]">✓</span>
                <span>SHA-256 Tamper Evident</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#20C997]">✓</span>
                <span>FastAPI & REST Compliant</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
