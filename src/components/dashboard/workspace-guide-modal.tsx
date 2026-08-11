"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  Compass,
  Bookmark,
  FolderKanban,
  FlaskConical,
  BookOpen,
  Code2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Terminal,
  FileText,
  Boxes,
  Workflow,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkspaceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceGuideModal({ isOpen, onClose }: WorkspaceGuideModalProps) {
  const [activeTab, setActiveTab] = useState("welcome");

  if (!isOpen) return null;

  const tabs = [
    { id: "welcome", label: "1. Welcome", icon: Sparkles },
    { id: "understand", label: "2. Workspace Map", icon: Boxes },
    { id: "roadmap", label: "3. Roadmap", icon: Compass },
    { id: "interview", label: "4. Interview Bank", icon: HelpCircle },
    { id: "resources", label: "5. Resources Vault", icon: Bookmark },
    { id: "projects", label: "6. Production Projects", icon: FolderKanban },
    { id: "labs", label: "7. Engineering Labs", icon: FlaskConical },
    { id: "workflow", label: "8. Recommended Workflow", icon: Workflow },
    { id: "customization", label: "9. Customization", icon: Zap },
    { id: "example", label: "10. Learning Journey", icon: BookOpen },
    { id: "cheatsheet", label: "Quick Reference", icon: Terminal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border/60 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/30">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">How Backend Interview Mastery Works</h2>
              <p className="text-xs text-muted-foreground">Comprehensive guide to navigating and getting the most out of your workspace.</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Body: Sidebar + Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-r border-border/40 bg-muted/10 p-3 space-y-1 overflow-y-auto shrink-0 border-b md:border-b-0">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary font-bold border border-primary/30"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <TabIcon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* SECTION 1: WELCOME */}
            {activeTab === "welcome" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px] uppercase tracking-wider font-mono">
                    Product Manual
                  </Badge>
                  <h3 className="text-2xl font-extrabold text-foreground">Welcome to Backend Interview Mastery</h3>
                  <p className="text-xs text-primary font-mono">Your Personal Engineering Command Center</p>
                </div>

                <div className="bg-muted/20 p-4 rounded-xl border border-border/40 text-xs leading-relaxed space-y-3">
                  <p>
                    Backend Interview Mastery is a personal engineering workspace designed to organize learning, interview preparation, engineering resources, system-design thinking, and hands-on backend practice in one unified command center.
                  </p>
                  <p>
                    This application is intentionally <strong>customizable</strong>. The application provides the structure and storage architecture; <strong>you build and own the knowledge base</strong>.
                  </p>
                </div>

                <Card className="border-border/50 bg-gradient-to-r from-card to-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-foreground">What You Build & Maintain:</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Personal topic notes & insights</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Code2 className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Code references & Java experiments</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      <span>Interview question bank & self-testing</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Bookmark className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>Saved articles, documentation & files</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <FolderKanban className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>Production system blueprints</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <FlaskConical className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>Hands-on 3+ YOE engineering labs</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SECTION 2: UNDERSTAND THE WORKSPACE */}
            {activeTab === "understand" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Understand the Workspace</h3>
                  <p className="text-xs text-muted-foreground">Quick mapping of goals to the appropriate section.</p>
                </div>

                <div className="border border-border/50 rounded-xl overflow-hidden text-xs">
                  <div className="bg-muted/40 p-3 font-bold border-b border-border/40 grid grid-cols-12 gap-2">
                    <span className="col-span-6 text-foreground">I want to...</span>
                    <span className="col-span-6 text-primary">Use this section</span>
                  </div>

                  <div className="divide-y divide-border/30">
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-muted/20">
                      <span className="col-span-6 font-medium text-foreground">Learn or revise a backend concept</span>
                      <span className="col-span-6 text-primary font-mono">Roadmap</span>
                    </div>
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-muted/20">
                      <span className="col-span-6 font-medium text-foreground">Write my own explanations & insights</span>
                      <span className="col-span-6 text-emerald-400 font-mono">Roadmap → Subtopic → My Notes</span>
                    </div>
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-muted/20">
                      <span className="col-span-6 font-medium text-foreground">Save Java implementations & experiments</span>
                      <span className="col-span-6 text-amber-400 font-mono">Roadmap → Subtopic → Code</span>
                    </div>
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-muted/20">
                      <span className="col-span-6 font-medium text-foreground">Collect & practice interview questions</span>
                      <span className="col-span-6 text-primary font-mono">Interview Questions</span>
                    </div>
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-muted/20">
                      <span className="col-span-6 font-medium text-foreground">Save articles, documentation, GitHub repos or files</span>
                      <span className="col-span-6 text-cyan-400 font-mono">Resources</span>
                    </div>
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-muted/20">
                      <span className="col-span-6 font-medium text-foreground">Design a complete distributed backend system</span>
                      <span className="col-span-6 text-purple-400 font-mono">Projects → Production Projects</span>
                    </div>
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-muted/20">
                      <span className="col-span-6 font-medium text-foreground">Master one focused backend engineering problem</span>
                      <span className="col-span-6 text-rose-400 font-mono">Projects → Engineering Labs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: ROADMAP */}
            {activeTab === "roadmap" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Knowledge Roadmap</h3>
                  <p className="text-xs text-muted-foreground">Structured hierarchy for core backend engineering concepts.</p>
                </div>

                <div className="bg-muted/20 p-4 rounded-xl border border-border/40 space-y-2 text-xs">
                  <p className="font-bold text-primary font-mono">Hierarchy: Level → Main Topic → Subtopic</p>
                  <p className="text-muted-foreground">Example: Level 1 — Java Fundamentals → Collections → HashMap</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-emerald-400">1. My Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Write your own explanations, interview insights, edge cases, mistakes, and mental models.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-amber-400">2. Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Store your own Java implementations, data structure experiments, and code snippets in Monaco editor.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-primary">3. Topic Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Store questions related specifically to that individual subtopic for quick revision.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-xs italic text-center text-primary font-semibold">
                  "The Roadmap is your structured personal knowledge base."
                </p>
              </div>
            )}

            {/* SECTION 4: INTERVIEW QUESTIONS */}
            {activeTab === "interview" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Interview Questions Bank</h3>
                  <p className="text-xs text-muted-foreground">Centralized personal question repository and self-interview mode.</p>
                </div>

                <div className="bg-muted/20 p-4 rounded-xl border border-border/40 space-y-2 text-xs">
                  <p className="font-bold text-primary">Editable Seed Categories:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Core Java, Advanced Java, Java 8/17/21, Collections, Concurrency, JVM, Spring Core, Spring Boot, Security, JPA, SQL, Kafka, Redis, Docker, Kubernetes, Microservices, System Design, and custom topics.
                  </p>
                </div>

                <div className="bg-card p-4 rounded-xl border border-border/50 space-y-2 text-xs">
                  <h4 className="font-bold text-foreground">Key Distinction:</h4>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>
                      <strong className="text-foreground">Roadmap Topic Questions:</strong> Tied strictly to a specific subtopic.
                    </li>
                    <li>
                      <strong className="text-foreground">Interview Questions Section:</strong> Centralized question bank with search, tags, company tags, and <strong>Interview Practice Mode</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* SECTION 5: RESOURCES */}
            {activeTab === "resources" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Personal Resource Vault</h3>
                  <p className="text-xs text-muted-foreground">Never lose a bookmark, documentation link, or study PDF again.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1">
                    <span className="font-bold text-cyan-400 block">Web Links & URLs</span>
                    <p className="text-muted-foreground text-[11px]">Articles, official documentation, GitHub repositories, YouTube tutorials, and online courses.</p>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1">
                    <span className="font-bold text-rose-400 block">Uploaded Files (IndexedDB)</span>
                    <p className="text-muted-foreground text-[11px]">PDFs, Word documents, spreadsheets, presentations, and images stored directly in browser IndexedDB.</p>
                  </div>
                </div>

                <p className="text-xs text-center font-bold text-primary font-mono py-2">
                  "Save it once. Find it later."
                </p>
              </div>
            )}

            {/* SECTION 6: PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Production System Blueprints</h3>
                  <p className="text-xs text-muted-foreground">Full architecture designs for production-grade distributed systems.</p>
                </div>

                <div className="bg-muted/20 p-4 rounded-xl border border-border/40 space-y-2 text-xs">
                  <p className="font-bold text-purple-400">Not source-code tutorials — System Blueprints.</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Blueprints explain WHAT to build, WHY architectural decisions were made, database schemas, REST APIs, Kafka events, security, reliability, and ordered build plans. You implement the actual code in your local IDE.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold">CommerceX</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[11px] text-muted-foreground">Multi-service e-commerce platform with inventory holds and outbox events.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold">FinFlow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[11px] text-muted-foreground">Ledger and payment processing system with strict ACID idempotency.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold">Event Logistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[11px] text-muted-foreground">Real-time driver tracking and dispatch system powered by Kafka.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* SECTION 7: ENGINEERING LABS */}
            {activeTab === "labs" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Engineering Labs</h3>
                  <p className="text-xs text-muted-foreground">Focused backend engineering problems for 3+ YOE hands-on practice.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="bg-card p-3 rounded-lg border border-border/50 space-y-1">
                    <span className="font-bold text-purple-400 block">Production Project</span>
                    <p className="text-muted-foreground italic">"Build an entire distributed system."</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50 space-y-1">
                    <span className="font-bold text-rose-400 block">Engineering Lab</span>
                    <p className="text-muted-foreground italic">"Master one difficult engineering problem."</p>
                  </div>
                </div>

                <div className="grid gap-2 grid-cols-2 text-xs">
                  <div className="bg-muted/20 p-2 rounded border border-border/30">
                    <strong className="text-foreground block">Distributed Rate Limiter</strong>
                    <span className="text-[10px] text-muted-foreground">Redis + Atomic Lua + Fail-Open</span>
                  </div>
                  <div className="bg-muted/20 p-2 rounded border border-border/30">
                    <strong className="text-foreground block">Inventory Reservation</strong>
                    <span className="text-[10px] text-muted-foreground">PostgreSQL Optimistic Lock + Holds</span>
                  </div>
                  <div className="bg-muted/20 p-2 rounded border border-border/30">
                    <strong className="text-foreground block">Payment Workflow</strong>
                    <span className="text-[10px] text-muted-foreground">State Machine + Outbox + Webhooks</span>
                  </div>
                  <div className="bg-muted/20 p-2 rounded border border-border/30">
                    <strong className="text-foreground block">Notification Platform</strong>
                    <span className="text-[10px] text-muted-foreground">Kafka Consumer Groups + DLT</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 8: RECOMMENDED WORKFLOW */}
            {activeTab === "workflow" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Recommended Learning Workflow</h3>
                  <p className="text-xs text-muted-foreground">A suggested path from concept to system design and interview discussion.</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded bg-muted/20 border border-border/40">
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0">1. ROADMAP</Badge>
                    <span className="font-medium text-foreground">Understand the core concept</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded bg-muted/20 border border-border/40">
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0 text-emerald-400">2. MY NOTES</Badge>
                    <span className="font-medium text-foreground">Write your own understanding & takeaways</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded bg-muted/20 border border-border/40">
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0 text-amber-400">3. CODE</Badge>
                    <span className="font-medium text-foreground">Practice and experiment with Java implementations</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded bg-muted/20 border border-border/40">
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0 text-primary">4. INTERVIEW BANK</Badge>
                    <span className="font-medium text-foreground">Collect and test yourself in Interview Mode</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded bg-muted/20 border border-border/40">
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0 text-rose-400">5. ENGINEERING LAB</Badge>
                    <span className="font-medium text-foreground">Apply one engineering concept deeply</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded bg-muted/20 border border-border/40">
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0 text-purple-400">6. PRODUCTION PROJECT</Badge>
                    <span className="font-medium text-foreground">Design and build a complete backend system in your IDE</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center italic">
                  Save useful articles, documentation, and videos in <strong>Resources</strong> whenever you discover them.
                </p>
              </div>
            )}

            {/* SECTION 9: CUSTOMIZATION */}
            {activeTab === "customization" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Full Customization</h3>
                  <p className="text-xs text-muted-foreground">Every section is fully persistent and user-editable.</p>
                </div>

                <div className="bg-muted/20 p-4 rounded-xl border border-border/40 text-xs space-y-2">
                  <p className="font-bold text-primary">Default content is a starting point.</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Over time, as you add your own notes, interview questions, resources, custom engineering labs, and design decisions, your own engineering knowledge will become the most valuable content in this workspace.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 10: EXAMPLE LEARNING JOURNEY */}
            {activeTab === "example" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Example Learning Journey: Apache Kafka</h3>
                  <p className="text-xs text-muted-foreground">A concrete step-by-step example of using the workspace together.</p>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30">Step 1: Open Roadmap → Level 12 (Event Streaming & Kafka)</div>
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30">Step 2: Study Consumer Groups, Offsets, and Partition Rebalancing</div>
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30 text-emerald-400">Step 3: Write personal notes on consumer offset commit strategies</div>
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30 text-amber-400">Step 4: Store a sample Spring Kafka Consumer listener in Code tab</div>
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30 text-primary">Step 5: Add difficult Kafka rebalance interview questions to Question Bank</div>
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30 text-cyan-400">Step 6: Save official Kafka documentation and Confluent blog posts in Resources</div>
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30 text-rose-400">Step 7: Open Notification Platform Engineering Lab & build consumer retry/DLT logic</div>
                  <div className="p-2.5 rounded bg-muted/20 border border-border/30 text-purple-400">Step 8: Apply Kafka outbox pattern inside CommerceX inventory reservation events</div>
                </div>
              </div>
            )}

            {/* QUICK REFERENCE CHEAT SHEET */}
            {activeTab === "cheatsheet" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-amber-400" /> Quick Reference Cheat Sheet
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <span className="font-bold text-primary block font-mono">ROADMAP</span>
                    <p className="text-muted-foreground text-[11px]">Learn and organize backend concepts & personal notes.</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <span className="font-bold text-primary block font-mono">INTERVIEW QUESTIONS</span>
                    <p className="text-muted-foreground text-[11px]">Build your central interview question bank & practice self-interviews.</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <span className="font-bold text-cyan-400 block font-mono">RESOURCES</span>
                    <p className="text-muted-foreground text-[11px]">Save useful external articles, documentation, GitHub repos, and PDFs.</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <span className="font-bold text-purple-400 block font-mono">PRODUCTION PROJECTS</span>
                    <p className="text-muted-foreground text-[11px]">Design complete distributed backend system blueprints.</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <span className="font-bold text-rose-400 block font-mono">ENGINEERING LABS</span>
                    <p className="text-muted-foreground text-[11px]">Practice focused 3+ YOE backend engineering problems.</p>
                  </div>
                  <div className="bg-card p-3 rounded-lg border border-border/50">
                    <span className="font-bold text-foreground block font-mono">DASHBOARD</span>
                    <p className="text-muted-foreground text-[11px]">Your daily workspace command center and starting point.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border/40 bg-muted/20 flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground">Navigate sections using the left menu.</span>
          <Button size="sm" onClick={onClose} className="text-xs">
            Got it, Close Guide
          </Button>
        </div>
      </div>
    </div>
  );
}
