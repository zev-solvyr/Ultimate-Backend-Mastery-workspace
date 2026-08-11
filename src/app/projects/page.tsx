"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { projects } from "@/lib/data";
import { useEngineeringLabs } from "@/hooks/use-engineering-labs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  FlaskConical,
  Plus,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  X,
  Layers,
} from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const { loaded, labsList, addLab } = useEngineeringLabs();

  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [labTitleInput, setLabTitleInput] = useState("");
  const [labDescInput, setLabDescInput] = useState("");
  const [labProblemInput, setLabProblemInput] = useState("");
  const [labDifficultyInput, setLabDifficultyInput] = useState<"Intermediate" | "Advanced" | "Expert">("Advanced");
  const [labScopeInput, setLabScopeInput] = useState("2 - 3 Days");
  const [labSkillsInput, setLabSkillsInput] = useState("Java, Spring Boot, Redis, Kafka");

  const handleCreateLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labTitleInput.trim()) return;

    const created = addLab({
      title: labTitleInput.trim(),
      shortDescription: labDescInput.trim() || "Custom hands-on engineering lab.",
      problemStatement: labProblemInput.trim() || "Define problem statement.",
      difficulty: labDifficultyInput,
      estimatedScope: labScopeInput.trim() || "2 - 3 Days",
      primarySkills: labSkillsInput.split(",").map((s) => s.trim()).filter(Boolean),
    });

    setShowAddLabModal(false);
    setLabTitleInput("");
    setLabDescInput("");
    setLabProblemInput("");
    router.push(`/projects/lab/${created.id}`);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <FolderKanban className="h-7 w-7 text-primary" /> Engineering Projects & Labs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Production system blueprints and hands-on 3+ YOE engineering problem labs.
        </p>
      </div>

      {/* SECTION 1: PRODUCTION PROJECTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" /> Production Systems
            </h2>
            <p className="text-xs text-muted-foreground">Full end-to-end distributed system blueprints.</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {projects.length} System Blueprints
          </Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="border-border/50 hover:border-border transition-colors flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {project.difficulty}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{project.domain}</span>
                </div>
                <CardTitle className="text-base font-bold mt-2">{project.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed line-clamp-2">{project.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 5).map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[9px] font-mono">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button size="sm" className="w-full text-xs gap-1.5 mt-2">
                    <FolderKanban className="h-3.5 w-3.5" /> View System Blueprint
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 2: ENGINEERING LABS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-2">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-cyan-400" /> Engineering Labs (Hands-On Problems)
            </h2>
            <p className="text-xs text-muted-foreground">
              Focused backend engineering challenges designed for 3+ YOE practice and system design discussion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => setShowAddLabModal(true)}>
              <Plus className="h-4 w-4" /> Add Engineering Lab
            </Button>
          </div>
        </div>

        {!loaded ? (
          <div className="p-8 text-center text-muted-foreground text-xs">Loading Engineering Labs...</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {labsList.map((lab) => (
              <Card
                key={lab.id}
                className="border-border/50 hover:border-cyan-500/40 transition-all bg-gradient-to-b from-card to-muted/10 flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[9px] font-mono uppercase tracking-wider flex items-center gap-1">
                      <FlaskConical className="h-2.5 w-2.5" /> ENGINEERING LAB
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" /> {lab.estimatedScope}
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-2">{lab.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed line-clamp-2">{lab.shortDescription}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs">
                  {/* Primary Skills */}
                  <div className="flex flex-wrap gap-1">
                    {lab.primarySkills.slice(0, 5).map((skill, sIdx) => (
                      <Badge key={sIdx} variant="secondary" className="text-[9px] font-mono">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Interview Relevance Rating */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[11px]">
                    <span className="text-muted-foreground font-medium">Interview Relevance:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">{lab.interviewRelevance}</span>
                  </div>

                  {/* Open Lab Action */}
                  <Link href={`/projects/lab/${lab.id}`}>
                    <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 mt-1">
                      <FlaskConical className="h-3.5 w-3.5" /> View Lab Blueprint
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Modal: Add Custom Engineering Lab */}
      {showAddLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-cyan-400" /> Create Custom Engineering Lab
              </h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowAddLabModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateLabSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Lab Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Audit Logging System"
                  value={labTitleInput}
                  onChange={(e) => setLabTitleInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold">Short Description</label>
                <input
                  type="text"
                  placeholder="One sentence summary of the engineering problem"
                  value={labDescInput}
                  onChange={(e) => setLabDescInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold">Problem Statement</label>
                <textarea
                  placeholder="Detailed background problem statement..."
                  value={labProblemInput}
                  onChange={(e) => setLabProblemInput(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-background text-foreground text-xs min-h-[80px]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-semibold">Difficulty</label>
                  <select
                    value={labDifficultyInput}
                    onChange={(e) => setLabDifficultyInput(e.target.value as any)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Estimated Scope</label>
                  <input
                    type="text"
                    value={labScopeInput}
                    onChange={(e) => setLabScopeInput(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Primary Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Java, Spring Boot, Redis, Kafka"
                  value={labSkillsInput}
                  onChange={(e) => setLabSkillsInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddLabModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create & Open Lab Blueprint
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
