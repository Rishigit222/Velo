"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Server, ExternalLink } from "lucide-react";
import { healthService } from "@/services/healthService";
import { Badge } from "./badge";

export function Navbar() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let mounted = true;
    healthService
      .checkHealth()
      .then((res) => {
        if (mounted && res && res.status === "healthy") {
          setBackendStatus("online");
        } else if (mounted) {
          setBackendStatus("offline");
        }
      })
      .catch(() => {
        if (mounted) {
          setBackendStatus("offline");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
              ReturnProof
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Chain of Custody
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">
            <Server className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-zinc-600 dark:text-zinc-300">FastAPI:</span>
            {backendStatus === "checking" ? (
              <Badge variant="outline">Checking...</Badge>
            ) : backendStatus === "online" ? (
              <Badge variant="success">Online (v1)</Badge>
            ) : (
              <Badge variant="danger">Offline</Badge>
            )}
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
          >
            <span>Swagger API</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </nav>
      </div>
    </header>
  );
}
