import React from "react";
import {
  PackageCheck,
  Video,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, VerificationIndicator } from "@/components/ui/badge";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Delivery Handover & Sealing",
      subtitle: "Pre-Shipment Custody Seal",
      icon: PackageCheck,
      badge: "Step 1: Origin",
      description:
        "The merchant scans the product's unique serial number and generates a cryptographic tamper-evident seal before dispatch. The courier validates handoff with geolocation and time-stamped proof.",
      highlights: [
        "Cryptographic dispatch manifest",
        "Unique SKU & barcode OCR verification",
        "Courier handover timestamp token",
      ],
      indicator: "Tamper Seal Active",
    },
    {
      step: "02",
      title: "AI-Assisted Unboxing Capture",
      subtitle: "Customer Arrival Inspection",
      icon: Video,
      badge: "Step 2: Custody",
      description:
        "Upon delivery, the customer records the unboxing using our guided camera interface. The AI model checks seal integrity, scans the serial number in real time, and logs accessory counts.",
      highlights: [
        "Real-time video framing guidance",
        "Automated packaging damage detection",
        "Zero-knowledge serial comparison",
      ],
      indicator: "Unboxing Hash Logged",
    },
    {
      step: "03",
      title: "Verified Return & Handover",
      subtitle: "Automated Dispute Resolution",
      icon: FileCheck2,
      badge: "Step 3: Verification",
      description:
        "If a return is requested, the system compares pre-dispatch and unboxing artifacts against the returned parcel. Discrepancies are flagged immediately with mathematical certainty.",
      highlights: [
        "Computer vision condition differential",
        "Instant counterfeit swap detection",
        "Tamper-proof audit dossier generated",
      ],
      indicator: "Instant Verdict: Approved",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 lg:py-28 bg-white border-t border-slate-200/80">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-16 lg:space-y-20">
        <SectionHeading
          badge="Three-Step Workflow"
          badgeVariant="info"
          title="Digital Chain-of-Custody from Dispatch to Return"
          description="A continuous, cryptographically sealed record guaranteeing transparency and eliminating fraudulent chargebacks for merchants and consumers alike."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10 2xl:gap-12">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.step}
                variant="light-gray"
                className="relative flex flex-col justify-between overflow-hidden border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group p-2"
              >
                {/* Decorative Step Number Accent */}
                <div className="absolute top-4 right-5 text-6xl font-black text-slate-200/50 select-none group-hover:text-blue-100 transition-colors pointer-events-none">
                  {item.step}
                </div>

                <CardHeader className="space-y-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <Badge variant="purple" size="sm">
                        {item.badge}
                      </Badge>
                      <h4 className="text-xs font-bold text-slate-500 mt-1">
                        {item.subtitle}
                      </h4>
                    </div>
                  </div>

                  <CardTitle className="text-xl sm:text-2xl pt-2 text-slate-900 leading-snug">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-0">
                  <div className="rounded-xl bg-white border border-slate-200/90 p-4 space-y-2.5 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      Verification Points:
                    </span>
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/70">
                    <VerificationIndicator label={item.indicator} />
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Protocol {item.step}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
