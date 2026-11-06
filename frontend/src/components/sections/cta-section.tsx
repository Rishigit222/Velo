"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
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
    <section id="get-started" className="py-24 bg-white border-t border-slate-200/80 relative overflow-hidden bg-grid-pattern">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          <ShieldCheck className="h-4 w-4" />
          <span>Deploy ReturnProof Chain of Custody Today</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Stop E-Commerce Return Fraud <br />
            <span className="text-blue-600">With Mathematical Certainty</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Integrate ReturnProof into your fulfillment, customer unboxing, and return logistics.
            Protect genuine customers and eliminate counterfeit swap abuse.
          </p>
        </div>

        {/* Email Input Bar matching screenshot */}
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email address"
              className="flex-1 h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
            <Button type="submit" variant="primary" size="md" className="h-12 whitespace-nowrap">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
          {isSuccess && (
            <p className="mt-2 text-xs font-semibold text-emerald-600 animate-fade-in">
              ✓ Registration request received! Our solution architect will reach out shortly.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-xs font-medium text-slate-500 pt-2">
          <span>Simple API Integration</span>
          <span>•</span>
          <span>Powerful Computer Vision</span>
          <span>•</span>
          <span>Cryptographically Secure</span>
        </div>
      </div>
    </section>
  );
}
