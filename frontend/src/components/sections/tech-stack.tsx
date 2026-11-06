import React from "react";
import {
  Server,
  Layout,
  Database,
  Lock,
  FileCode2,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TechStack() {
  const stackItems = [
    {
      name: "FastAPI Backend",
      category: "High-Performance REST API",
      icon: Server,
      version: "Python 3.11+",
      description:
        "Asynchronous Python web framework delivering sub-millisecond response latency with native OpenAPI & Swagger specifications.",
      features: ["Async Event Loop", "Auto OpenAPI Docs", "Pydantic Schema Validation"],
    },
    {
      name: "Next.js 16 & React 19",
      category: "Frontend Architecture",
      icon: Layout,
      version: "App Router & Turbopack",
      description:
        "Modern server-driven frontend built with React 19 server components, Turbopack bundling, and Tailwind CSS v4 design tokens.",
      features: ["Server Components", "Turbopack 2.0", "Tailwind CSS v4"],
    },
    {
      name: "Relational Ledger",
      category: "Database & Migrations",
      icon: Database,
      version: "SQLAlchemy + SQLite / Azure SQL",
      description:
        "Strong relational integrity with foreign-key cascades, Alembic batch migrations, and cloud database portability.",
      features: ["Alembic Migrations", "Strict FK Integrity", "Azure SQL Ready"],
    },
    {
      name: "Cryptographic Security",
      category: "Trust & Identity",
      icon: Lock,
      version: "Argon2id + JWT + SHA-256",
      description:
        "Industry-standard password hashing, stateless JSON Web Tokens with RBAC, and chained SHA-256 evidence digests.",
      features: ["Argon2 Password Hashing", "Role-Based Access Control", "SHA-256 Hash Chaining"],
    },
  ];

  return (
    <section id="tech-stack" className="py-24 bg-slate-50/60 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <SectionHeading
          badge="Enterprise Engineering"
          badgeVariant="info"
          title="Architected for Security, Speed, and Compliance"
          description="Built on a robust, audited open-source foundation designed to scale from local testing to high-throughput enterprise clouds."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stackItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                variant="light-gray"
                className="bg-white border-slate-200/90 hover:border-blue-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                      {item.version}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                    <CardTitle className="text-base text-slate-900 mt-0.5">
                      {item.name}
                    </CardTitle>
                  </div>

                  <CardDescription className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-1.5 border-t border-slate-100 mt-3 pt-3">
                  {item.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
