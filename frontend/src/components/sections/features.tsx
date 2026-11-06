import React from "react";
import {
  Camera,
  Lock,
  ScanBarcode,
  GitCompare,
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, VerificationIndicator } from "@/components/ui/badge";

export function Features() {
  const featuresList = [
    {
      title: "AI-Assisted Evidence Capture",
      icon: Camera,
      badge: "Vision AI",
      description:
        "Intelligent camera framing guides the user to capture packaging integrity, labels, and product serials with automated lighting and sharpness checks.",
      metric: "60 FPS Neural Tracking",
      tag: "Automated Framing",
    },
    {
      title: "Tamper-Evident Records",
      icon: Lock,
      badge: "Cryptographic Trust",
      description:
        "Every video frame, inspection report, and custody transfer is hashed with SHA-256 and chained into a tamper-evident immutable ledger.",
      metric: "SHA-256 Chained Hashes",
      tag: "Immutable Ledger",
    },
    {
      title: "Product Identity Verification",
      icon: ScanBarcode,
      badge: "Anti-Counterfeit",
      description:
        "Automated OCR extracts barcode, SKU, and micro-engraved serial identifiers to confirm the exact item sent matches the item received.",
      metric: "99.9% OCR Accuracy",
      tag: "Zero Swap Fraud",
    },
    {
      title: "Damage Comparison Engine",
      icon: GitCompare,
      badge: "Computer Vision",
      description:
        "Side-by-side pixel and edge analysis compares pre-dispatch condition against unboxing evidence to identify transit damage versus wear-and-tear.",
      metric: "Pixel-Level Diff Analysis",
      tag: "Automated Grading",
    },
    {
      title: "Evidence Timeline",
      icon: Clock,
      badge: "Auditable Trail",
      description:
        "Interactive chronological custody logs track every transition from seller fulfillment, carrier dispatch, doorstep arrival to return inspection.",
      metric: "Sub-Second Timestamps",
      tag: "Complete Transparency",
    },
    {
      title: "Dispute Reports",
      icon: FileSpreadsheet,
      badge: "Legal Ready",
      description:
        "One-click generation of verifiable dispute packets containing raw media hashes, AI condition scores, and carrier manifests for rapid resolution.",
      metric: "Automated Resolution",
      tag: "Exportable PDF/JSON",
    },
  ];

  return (
    <section id="features" className="w-full py-20 lg:py-28 bg-slate-50/60 border-t border-slate-200/80">
      <div className="site-container space-y-16 lg:space-y-20">
        <SectionHeading
          badge="Core Capabilities"
          badgeVariant="purple"
          title="Engineered to Eliminate E-Commerce Return Fraud"
          description="A complete suite of computer vision, cryptographic verification, and custody tools built specifically for high-value merchandise, electronics, and luxury goods."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
          {featuresList.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                variant="light-gray"
                className="bg-white border-slate-200/90 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-2"
              >
                <CardHeader className="space-y-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" size="sm" className="font-semibold text-slate-700">
                      {item.badge}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-900 pt-1">
                    {item.title}
                  </CardTitle>

                  <CardDescription className="text-slate-600 text-sm leading-relaxed font-normal">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between py-2.5 border-t border-slate-100 text-xs">
                    <span className="font-medium text-slate-500">Benchmark:</span>
                    <span className="font-bold text-slate-900">{item.metric}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <VerificationIndicator label={item.tag} />
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Active</span>
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
