"use client";

import React, { useState, useEffect } from "react";
import { creatorConfig } from "@/config/creator-config";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  X,
  ExternalLink,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Workflow,
  CheckCircle2,
  Compass,
  BookOpen,
  Shield,
} from "lucide-react";

export function CreatorSignature() {
  const [isOpen, setIsOpen] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const journeySteps = [
    { label: "LEARN", subtitle: "Deep concepts" },
    { label: "BUILD", subtitle: "Real systems" },
    { label: "DEBUG", subtitle: "Root cause analysis" },
    { label: "DOCUMENT", subtitle: "Engineering decisions" },
    { label: "PRACTICE", subtitle: "Hands-on labs" },
    { label: "INTERVIEW", subtitle: "Company sets" },
  ];

  const capabilityCards = [
    { title: "Backend Engineering Roadmap", desc: "Structured progression from Java fundamentals to microservices" },
    { title: "Company-wise Interview Bank", desc: "Hierarchy organized by Target Companies and Interview Question Sets" },
    { title: "Bulk Question Import", desc: "Fast text normalization for raw interview content" },
    { title: "GitHub README-style Viewer", desc: "Spacious documentation view for question sets" },
    { title: "Resource Library", desc: "Personal link and file storage with local fallback" },
    { title: "Knowledge Base", desc: "Deep notes and runnable code snippets" },
    { title: "Production System Blueprints", desc: "Real-world architecture designs and trade-off analysis" },
    { title: "Engineering Labs", desc: "Interactive backend implementation challenges" },
    { title: "Database Design Playground", desc: "Schema, indexing, and query optimization notes" },
    { title: "API & Event Design", desc: "RESTful principles, Kafka event streams, and contract design" },
    { title: "Cloud Sync", desc: "User-isolated Supabase persistence with RLS policies" },
    { title: "Local-first Offline Persistence", desc: "Immediate responsiveness backed by tombstones" },
    { title: "Cross-device Workspace", desc: "Seamless workspace state across browser sessions" },
  ];

  const techConstellation = [
    "Java",
    "Spring Boot",
    "Spring MVC",
    "Spring Data JPA",
    "Hibernate",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Kafka",
    "Docker",
    "Kubernetes",
    "Microservices",
    "REST APIs",
    "System Design",
    "CI/CD",
  ];

  return (
    <>
      {/* Developer Tool Signature Trigger (Bottom-Right Fixed) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Learn about the engineer who built this workspace"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/95 border border-primary/30 hover:border-primary/70 text-xs font-mono text-muted-foreground hover:text-foreground shadow-xl backdrop-blur-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
      >
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-primary font-bold text-[11px] group-hover:text-cyan-300 transition-colors">
          &lt;/&gt;
        </span>
        <span className="text-[11px]">
          Built by <strong className="text-foreground font-semibold font-sans">{creatorConfig.name}</strong>
        </span>
      </button>

      {/* Engineer Inspection Panel / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <Card className="w-full max-w-3xl border-primary/40 shadow-2xl bg-card relative max-h-[92vh] overflow-y-auto font-sans p-6 sm:p-8 space-y-8">
            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
              aria-label="Close creator panel"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Header / Inspection Title */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 border-cyan-500/40 bg-cyan-500/10">
                  <Terminal className="h-3 w-3 mr-1" /> Engineer Behind the Workspace
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  System Architect & Lead Engineer
                </Badge>
              </div>

              <div className="space-y-1 border-b border-border/40 pb-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  {creatorConfig.name}
                </h1>
                <p className="text-sm font-semibold text-primary font-mono">{creatorConfig.role}</p>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                {creatorConfig.intro}
              </p>
            </div>

            {/* Why This Exists */}
            <div className="p-4 bg-muted/30 border border-primary/20 rounded-xl space-y-2">
              <span className="text-xs font-bold font-mono text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-cyan-400" /> Why This Exists
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {creatorConfig.whyExists}
              </p>
            </div>

            {/* Engineering Journey Timeline Pipeline */}
            <div className="space-y-3">
              <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider block">
                Engineering Progression Pipeline
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {journeySteps.map((step, idx) => (
                  <div
                    key={step.label}
                    className="p-2.5 bg-card border border-border/60 hover:border-primary/50 rounded-lg space-y-1 text-center group transition-colors"
                  >
                    <span className="text-[10px] font-mono text-primary font-bold block">0{idx + 1}</span>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {step.label}
                    </p>
                    <span className="text-[9px] text-muted-foreground block truncate">{step.subtitle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What I Built — Capability Grid */}
            <div className="space-y-4">
              <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Workspace Capabilities
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {capabilityCards.map((cap) => (
                  <div key={cap.title} className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{cap.title}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Philosophy & Engineering Cycle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <span className="text-xs font-bold font-mono text-primary uppercase tracking-wider block">
                  Creator Philosophy
                </span>
                <p className="text-xs font-medium text-foreground italic leading-relaxed">
                  "{creatorConfig.creatorPhilosophy}"
                </p>
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-2">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider block">
                  Why I Built This
                </span>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  "{creatorConfig.engineeringPhilosophy}"
                </p>
              </div>
            </div>

            {/* Technical Focus Constellation */}
            <div className="space-y-3">
              <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-primary" /> Technical Focus Constellation
              </span>

              <div className="flex flex-wrap gap-1.5">
                {techConstellation.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs font-mono bg-muted/40 hover:bg-primary/20 transition-colors">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Personal Links */}
            {(creatorConfig.github || creatorConfig.linkedin || creatorConfig.portfolio) && (
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                {creatorConfig.github && (
                  <a
                    href={creatorConfig.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border/50"
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {creatorConfig.linkedin && (
                  <a
                    href={creatorConfig.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border/50"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {creatorConfig.portfolio && (
                  <a
                    href={creatorConfig.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Portfolio <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {/* Terminal Signature */}
            <div className="p-3 bg-black/60 border border-border/60 rounded-lg text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary font-bold">$</span>
                <span className="text-foreground">whoami</span>
              </div>
              <p className="text-cyan-400 pl-4 font-semibold">{creatorConfig.name}</p>

              <div className="flex items-center gap-2 text-muted-foreground pt-1">
                <span className="text-primary font-bold">$</span>
                <span className="text-foreground">mission</span>
              </div>
              <p className="text-emerald-400 pl-4 font-mono">Build systems. Understand systems. Become better at engineering.</p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
