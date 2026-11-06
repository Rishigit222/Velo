"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Package,
  Camera,
  FileCheck2,
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { healthService } from "@/services/healthService";
import { HealthCheckResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthService.checkHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach FastAPI backend");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Next.js 16 + FastAPI Enterprise Architecture</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-50">
          ReturnProof Digital Chain of Custody
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          AI-assisted verification platform preventing e-commerce return fraud through
          cryptographic evidence hashing, tamper-evident audit chains, and automated inspection.
        </p>
      </section>

      {/* Backend Integration Live Probe */}
      <Card className="border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/50 via-white to-zinc-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/40">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Backend Connectivity & Health Probe</span>
            </CardTitle>
            <CardDescription>
              Real-time API handshake with FastAPI running on{" "}
              <code className="rounded bg-zinc-200/70 px-1 py-0.5 text-xs font-mono dark:bg-zinc-800">
                http://localhost:8000/api/v1/health
              </code>
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchHealth}
            isLoading={loading}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Ping Backend
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500 py-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Pinging FastAPI server and SQLite connection...</span>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">API Status</div>
                  <div className="text-sm font-semibold capitalize text-emerald-900 dark:text-emerald-200">{health.status}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">Database</div>
                  <div className="text-sm font-semibold capitalize text-blue-900 dark:text-blue-200">{health.database || "Connected"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Lock className="h-5 w-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Environment</div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{health.environment || "Development"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">Backend Unreachable: </span>
                {error || "Make sure uvicorn is running on port 8000"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Core Workflow Pillars */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Chain-of-Custody Pipeline
          </h2>
          <Badge variant="purple">Architecture V1</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold">
                1
              </div>
              <CardTitle className="text-base flex items-center gap-2 pt-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span>Orders & Products</span>
              </CardTitle>
              <CardDescription>
                Catalog management, order generation with role isolation for Buyers, Sellers, and Admins.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold">
                2
              </div>
              <CardTitle className="text-base flex items-center gap-2 pt-2">
                <Camera className="h-4 w-4 text-indigo-600" />
                <span>Evidence Capture</span>
              </CardTitle>
              <CardDescription>
                Multipart unboxing videos and packaging photos secured with SHA-256 cryptographic hashes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <CardTitle className="text-base flex items-center gap-2 pt-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>AI Verification</span>
              </CardTitle>
              <CardDescription>
                Automated condition reporting, accessories integrity matching, and return session comparison.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center font-bold">
                4
              </div>
              <CardTitle className="text-base flex items-center gap-2 pt-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>Disputes & Audit</span>
              </CardTitle>
              <CardDescription>
                Tamper-evident SHA-256 hash chaining of every state mutation with immutable dispute logs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Developer Resource Footer */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-100/60 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Frontend Architecture Initialized
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            TypeScript interfaces, API services, custom hooks, and Tailwind UI components are ready.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-medium dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            <span>OpenAPI Docs</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </section>
    </div>
  );
}
