"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Braces,
  Cloud,
  Database,
  FolderKanban,
  MessageSquareCode,
  Route,
  Server,
  Shield,
  TestTube,
  HelpCircle,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Container,
  Cpu,
  FileText,
  Code,
  Activity,
  Box,
  Terminal,
  Compass,
} from "lucide-react";
import { projects, roadmap } from "@/lib/data";
import { useInterviewQuestions } from "@/hooks/use-interview-questions";
import { useResources } from "@/hooks/use-resources";
import { useActivity } from "@/hooks/use-activity";
import { WorkspaceGuideModal } from "@/components/dashboard/workspace-guide-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GUIDE_SEEN_KEY = "backend-interview-guide-seen";

export default function DashboardPage() {
  const { loaded: iqLoaded, topics: iqTopics, questions: iqQuestions } = useInterviewQuestions();
  const { loaded: resLoaded, categories: resCategories, resources } = useResources();
  const { loaded: actLoaded, activities } = useActivity();

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  // Knowledge base counts calculated from localStorage
  const [kbNotesCount, setKbNotesCount] = useState(0);
  const [kbCodeCount, setKbCodeCount] = useState(0);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(GUIDE_SEEN_KEY) === "true";
      setHasSeenGuide(seen);
    } catch {}
  }, []);

  const handleOpenGuide = () => {
    setIsGuideOpen(true);
    if (!hasSeenGuide) {
      setHasSeenGuide(true);
      try {
        window.localStorage.setItem(GUIDE_SEEN_KEY, "true");
      } catch {}
    }
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("backend-interview-knowledge-base");
      if (raw) {
        const parsed = JSON.parse(raw);
        let notes = 0;
        let code = 0;
        Object.values(parsed).forEach((item: any) => {
          if (item?.notes && item.notes.trim().length > 0) notes++;
          if (item?.code && item.code.trim().length > 0) code++;
        });
        setKbNotesCount(notes);
        setKbCodeCount(code);
      }
    } catch {
      setKbNotesCount(0);
      setKbCodeCount(0);
    }
  }, []);

  const totalQuestions = iqQuestions.length;
  const totalTopics = iqTopics.length;
  const totalResources = resources.length;
  const urlResourcesCount = resources.filter((r) => r.type === "Link").length;
  const fileResourcesCount = resources.filter((r) => r.type !== "Link").length;
  const favoriteResourcesCount = resources.filter((r) => r.isFavorite).length;

  const technologyMapSteps = [
    { title: "Java & JVM", level: 1, icon: Braces },
    { title: "Spring Ecosystem", level: 6, icon: Server },
    { title: "Databases & ORM", level: 8, icon: Database },
    { title: "REST & API Design", level: 7, icon: Route },
    { title: "Microservices Architecture", level: 11, icon: Layers },
    { title: "Kafka Event Streaming", level: 12, icon: MessageSquareCode },
    { title: "Redis Caching", level: 13, icon: Database },
    { title: "Docker & Containerization", level: 14, icon: Container },
    { title: "Kubernetes Orchestration", level: 15, icon: Cpu },
    { title: "System Design", level: 19, icon: BookOpen },
    { title: "Production Engineering", level: 20, icon: Shield },
  ];

  const toolboxCategories = [
    {
      category: "JAVA",
      items: [
        { label: "Core Java", level: 1 },
        { label: "Collections", level: 1 },
        { label: "Concurrency", level: 5 },
        { label: "JVM Internals", level: 4 },
        { label: "Java 8 Streams", level: 2 },
        { label: "Java 17 Records", level: 3 },
        { label: "Java 21 Loom", level: 3 },
      ],
    },
    {
      category: "SPRING",
      items: [
        { label: "Spring Core", level: 6 },
        { label: "Spring Boot 3", level: 6 },
        { label: "Spring MVC", level: 7 },
        { label: "Spring Security", level: 9 },
        { label: "Spring Data JPA", level: 8 },
      ],
    },
    {
      category: "DATABASES",
      items: [
        { label: "SQL & ACIDs", level: 8 },
        { label: "PostgreSQL", level: 8 },
        { label: "MongoDB", level: 10 },
        { label: "Redis Caching", level: 13 },
      ],
    },
    {
      category: "DISTRIBUTED SYSTEMS",
      items: [
        { label: "Microservices", level: 11 },
        { label: "Apache Kafka", level: 12 },
        { label: "RabbitMQ", level: 12 },
        { label: "Distributed Sagas", level: 11 },
        { label: "System Design", level: 19 },
      ],
    },
    {
      category: "DEVOPS & CLOUD",
      items: [
        { label: "Docker", level: 14 },
        { label: "Kubernetes", level: 15 },
        { label: "CI/CD Pipelines", level: 17 },
        { label: "AWS Cloud", level: 16 },
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION A — HERO / WORKSPACE HEADER */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-card via-card/80 to-primary/10 p-6 sm:p-8">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest text-primary border-primary/40">
              Personal Engineering Command Center
            </Badge>

            {/* Top-Right Prominent Workspace Guide Button */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 transition-colors shrink-0"
              onClick={handleOpenGuide}
              title="Workspace Guide"
            >
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Workspace Guide</span>
              <span className="sm:hidden">Guide</span>
            </Button>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Backend Engineering Workspace
          </h1>
          <p className="text-sm font-semibold text-primary font-mono">
            Learn. Build. Document. Prepare.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Your personal workspace for Java backend engineering, system design, microservices projects, and interview preparation.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Link href="/roadmap">
              <Button size="sm" className="gap-2 text-xs font-semibold">
                <Compass className="h-4 w-4" /> Continue Learning
              </Button>
            </Link>
            <Link href="/interview-questions?mode=interview">
              <Button size="sm" variant="outline" className="gap-2 text-xs font-semibold border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10">
                <Sparkles className="h-4 w-4" /> Interview Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION B — CONTINUE WHERE YOU LEFT OFF */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Continue Where You Left Off
            </CardTitle>
          </div>
          <CardDescription className="text-xs">Your recently accessed roadmap topics, project sections, and resources.</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="py-6 text-center space-y-2 bg-muted/20 rounded-lg border border-dashed border-border/40">
              <p className="text-xs text-muted-foreground">No recent activity yet.</p>
              <Link href="/roadmap">
                <Button size="sm" variant="outline" className="text-xs gap-1 mt-1">
                  <Compass className="h-3.5 w-3.5" /> Explore Roadmap
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {activities.slice(0, 4).map((act) => (
                <Link key={act.id} href={act.href}>
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/40 hover:border-primary/40 transition-colors space-y-1 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] uppercase font-mono">
                          {act.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-foreground mt-1.5 line-clamp-1">{act.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{act.subtitle}</p>
                    </div>
                    <div className="pt-2 flex items-center text-[11px] text-primary font-medium">
                      Open <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION H — KNOWLEDGE BASE SNAPSHOT */}
      <section className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Knowledge Base Snapshot
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Questions</span>
              <p className="text-2xl font-extrabold text-primary font-mono">{totalQuestions}</p>
              <span className="text-[10px] text-muted-foreground">In Question Bank</span>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Resources</span>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono">{totalResources}</p>
              <span className="text-[10px] text-muted-foreground">Saved Items</span>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Topic Notes</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">{kbNotesCount}</p>
              <span className="text-[10px] text-muted-foreground">Roadmap Notes</span>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Code References</span>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">{kbCodeCount}</p>
              <span className="text-[10px] text-muted-foreground">Saved Snippets</span>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Projects</span>
              <p className="text-2xl font-extrabold text-purple-400 font-mono">3</p>
              <span className="text-[10px] text-muted-foreground">System Blueprints</span>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Topics</span>
              <p className="text-2xl font-extrabold text-foreground font-mono">{totalTopics}</p>
              <span className="text-[10px] text-muted-foreground">Question Topics</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION C & D GRID: INTERVIEW WORKSPACE & RESOURCE LIBRARY */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* SECTION C — INTERVIEW WORKSPACE CARD */}
        <Card className="border-border/50 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> Interview Workspace
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {totalQuestions} Saved Questions
              </Badge>
            </div>
            <CardDescription className="text-xs">Personal interview question bank and self-interview practice mode.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-2 grid-cols-3 bg-muted/20 p-3 rounded-lg border border-border/40 text-center">
              <div>
                <span className="text-lg font-bold text-foreground font-mono">{totalQuestions}</span>
                <span className="text-[10px] text-muted-foreground block">Questions</span>
              </div>
              <div>
                <span className="text-lg font-bold text-foreground font-mono">{totalTopics}</span>
                <span className="text-[10px] text-muted-foreground block">Topics</span>
              </div>
              <div>
                <span className="text-lg font-bold text-cyan-400 font-mono">{iqQuestions.slice(0, 5).length}</span>
                <span className="text-[10px] text-muted-foreground block">Recent</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Major Topics:</p>
              <div className="flex flex-wrap gap-1.5">
                {iqTopics.slice(0, 8).map((t) => (
                  <Link key={t.id} href={`/interview-questions`}>
                    <Badge variant="secondary" className="text-[10px] hover:bg-primary/20 transition-colors">
                      {t.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <Link href="/interview-questions" className="flex-1">
                <Button size="sm" className="w-full text-xs gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" /> Open Question Bank
                </Button>
              </Link>
              <Link href="/interview-questions?mode=interview" className="flex-1">
                <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 text-cyan-400 border-cyan-500/40">
                  <Sparkles className="h-3.5 w-3.5" /> Interview Mode
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* SECTION D — RESOURCE LIBRARY CARD */}
        <Card className="border-border/50 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-cyan-400" /> Resource Library
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {totalResources} Items
              </Badge>
            </div>
            <CardDescription className="text-xs">Personal library of articles, documentation, GitHub repos, and PDFs.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-2 grid-cols-4 bg-muted/20 p-3 rounded-lg border border-border/40 text-center">
              <div>
                <span className="text-lg font-bold text-foreground font-mono">{totalResources}</span>
                <span className="text-[10px] text-muted-foreground block">Total</span>
              </div>
              <div>
                <span className="text-lg font-bold text-cyan-400 font-mono">{urlResourcesCount}</span>
                <span className="text-[10px] text-muted-foreground block">Links</span>
              </div>
              <div>
                <span className="text-lg font-bold text-rose-400 font-mono">{fileResourcesCount}</span>
                <span className="text-[10px] text-muted-foreground block">Files</span>
              </div>
              <div>
                <span className="text-lg font-bold text-amber-400 font-mono">{favoriteResourcesCount}</span>
                <span className="text-[10px] text-muted-foreground block">Starred</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Recent Resources:</p>
              <div className="space-y-1.5">
                {resources.slice(0, 3).map((r) => (
                  <div key={r.id} className="bg-muted/20 p-2 rounded border border-border/30 flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground line-clamp-1">{r.title}</span>
                    <Badge variant="outline" className="text-[9px] shrink-0 font-mono">
                      {r.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link href="/resources">
                <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-cyan-400" /> Open Resource Library
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION E — ENGINEERING LABS (PROJECTS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Box className="h-5 w-5 text-purple-400" /> Engineering Labs (Projects)
            </h2>
            <p className="text-xs text-muted-foreground">Production-style project blueprints detailing architecture, APIs, events, and build plans.</p>
          </div>
          <Link href="/projects">
            <Button size="sm" variant="ghost" className="text-xs gap-1 text-primary">
              View All Projects <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="border-border/50 hover:border-border transition-colors flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">{project.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{project.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 5).map((tech, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] font-mono">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button size="sm" className="w-full text-xs gap-1.5 mt-2">
                    <FolderKanban className="h-3.5 w-3.5" /> View Project Blueprint
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION F — BACKEND TECHNOLOGY MAP */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" /> Backend Technology Map
          </h2>
          <p className="text-xs text-muted-foreground">High-level progression of backend technologies covered across the Roadmap.</p>
        </div>

        <Card className="border-border/50 p-4">
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {technologyMapSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <Link key={idx} href={`/roadmap/level/${step.level}`}>
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/40 hover:border-primary/50 transition-colors text-center space-y-1.5 h-full flex flex-col justify-center items-center">
                    <StepIcon className="h-5 w-5 text-primary" />
                    <p className="font-bold text-xs text-foreground leading-tight">{step.title}</p>
                    <span className="text-[9px] text-muted-foreground font-mono">Level {step.level}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </section>

      {/* SECTION G — BACKEND TOOLBOX */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Terminal className="h-5 w-5 text-amber-400" /> Backend Technology Toolbox
          </h2>
          <p className="text-xs text-muted-foreground">Direct navigation to specific backend topics across Java, Spring, Databases, Systems, and DevOps.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {toolboxCategories.map((group, idx) => (
            <Card key={idx} className="border-border/50">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-xs font-bold font-mono tracking-wider text-primary uppercase">{group.category}</CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-1.5">
                {group.items.map((item, iIdx) => (
                  <Link key={iIdx} href={`/roadmap/level/${item.level}`}>
                    <div className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 px-2 py-1 rounded transition-colors flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-[9px] font-mono text-muted-foreground/60">L{item.level}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* WORKSPACE GUIDE MODAL */}
      <WorkspaceGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
