"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    }
  };

  return (
    <section id="get-started" className="w-full py-20 lg:py-28 bg-white border-t border-slate-200/80 relative overflow-hidden bg-grid-pattern">
      <div className="site-container">
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 p-8 sm:p-14 lg:p-20 shadow-xl shadow-slate-200/50 text-center space-y-8 w-full mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <ShieldCheck className="h-4 w-4" />
            <span>Deploy ReturnProof Chain of Custody Today</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Stop E-Commerce Return Fraud <br />
              <span className="text-blue-600">With Mathematical Certainty</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Integrate ReturnProof into your fulfillment, customer unboxing, and return logistics.
              Protect genuine customers and eliminate counterfeit swap abuse.
            </p>
          </div>

          {/* Email Input Bar matching reference */}
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email address"
                className="flex-1 h-14 px-5 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
              <Button type="submit" variant="primary" size="lg" className="h-14 px-8 rounded-2xl whitespace-nowrap">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
            {isSuccess && (
              <p className="mt-3 text-xs font-semibold text-emerald-600 animate-fade-in">
                ✓ Registration request received! Our solution architect will reach out shortly.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-500 pt-2">
            <span>Simple API Integration</span>
            <span>•</span>
            <span>Powerful Computer Vision</span>
            <span>•</span>
            <span>Cryptographically Secure</span>
          </div>
        </div>
      </div>
    </section>
  );
}
