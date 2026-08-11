"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EngineeringLab } from "@/types";
import { useEngineeringLabs } from "@/hooks/use-engineering-labs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FlaskConical,
  Star,
  Clock,
  Wrench,
  Shield,
  Layers,
  Database,
  Route,
  MessageSquareCode,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Copy,
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  Sparkles,
} from "lucide-react";

export function EngineeringLabView({ lab: initialLab }: { lab: EngineeringLab }) {
  const router = useRouter();
  const { updateLab, deleteLab, duplicateLab, resetLab } = useEngineeringLabs();
  const [lab, setLab] = useState<EngineeringLab>(initialLab);
  const [activeTab, setActiveTab] = useState("overview");

  // Local inline editing modal/form states
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editTitle, setEditTitle] = useState(lab.title);
  const [editShortDesc, setEditShortDesc] = useState(lab.shortDescription);
  const [editProblemStatement, setEditProblemStatement] = useState(lab.problemStatement);
  const [editScope, setEditScope] = useState(lab.estimatedScope);
  const [editDifficulty, setEditDifficulty] = useState(lab.difficulty);
  const [editPrimarySkills, setEditPrimarySkills] = useState(lab.primarySkills.join(", "));

  // Save Header edits
  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<EngineeringLab> = {
      title: editTitle.trim(),
      shortDescription: editShortDesc.trim(),
      problemStatement: editProblemStatement.trim(),
      estimatedScope: editScope.trim(),
      difficulty: editDifficulty,
      primarySkills: editPrimarySkills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    updateLab(lab.id, updated);
    setLab((prev) => ({ ...prev, ...updated }));
    setIsEditingHeader(false);
  };

  const handleReset = () => {
    if (confirm(`Reset "${lab.title}" back to its original seed blueprint? Any local edits will be cleared.`)) {
      resetLab(lab.id);
      window.location.reload();
    }
  };

  const handleDuplicate = () => {
    const dup = duplicateLab(lab.id);
    if (dup) {
      router.push(`/projects/lab/${dup.id}`);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete lab "${lab.title}"?`)) {
      deleteLab(lab.id);
      router.push("/projects");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Engineering Labs & Projects
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleReset} title="Reset to original seed blueprint">
            <RotateCcw className="h-3 w-3" /> Reset Seed
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleDuplicate} title="Duplicate this lab">
            <Copy className="h-3 w-3" /> Duplicate
          </Button>
          {lab.isCustom && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-rose-400 hover:bg-rose-500/10" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <Card className="border-border/60 bg-gradient-to-r from-card via-card/90 to-primary/10 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                <FlaskConical className="h-3 w-3" /> ENGINEERING LAB
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {lab.difficulty}
              </Badge>
              <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> {lab.estimatedScope}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{lab.title}</h1>
            <p className="text-sm text-primary font-medium">{lab.shortDescription}</p>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1 self-start shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setEditTitle(lab.title);
              setEditShortDesc(lab.shortDescription);
              setEditProblemStatement(lab.problemStatement);
              setEditScope(lab.estimatedScope);
              setEditDifficulty(lab.difficulty);
              setEditPrimarySkills(lab.primarySkills.join(", "));
              setIsEditingHeader(true);
            }}
          >
            <Edit className="h-3.5 w-3.5" /> Edit Header
          </Button>
        </div>

        {/* Problem Statement Box */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40 text-xs space-y-1.5">
          <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-cyan-400">Problem Statement:</span>
          <p className="text-foreground/90 leading-relaxed">{lab.problemStatement}</p>
        </div>

        {/* Key Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Primary Skills:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {lab.primarySkills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">3+ YOE Interview Relevance:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">{lab.interviewRelevance}</span>
          </div>
        </div>
      </Card>

      {/* Standardized 11 Blueprint Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-10 bg-card border border-border/50 text-xs gap-1 p-1">
            <TabsTrigger value="overview" className="text-xs">1. Overview</TabsTrigger>
            <TabsTrigger value="requirements" className="text-xs">2. Requirements</TabsTrigger>
            <TabsTrigger value="technologies" className="text-xs">3. Tech Stack</TabsTrigger>
            <TabsTrigger value="architecture" className="text-xs">4. Architecture</TabsTrigger>
            <TabsTrigger value="modules" className="text-xs">5. Modules</TabsTrigger>
            <TabsTrigger value="data" className="text-xs">6. Data Design</TabsTrigger>
            <TabsTrigger value="apis" className="text-xs">7. API & Events</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">8. Security</TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs text-rose-400">9. Challenges</TabsTrigger>
            <TabsTrigger value="build" className="text-xs text-emerald-400">10. Build Plan</TabsTrigger>
            <TabsTrigger value="interview" className="text-xs text-cyan-400">11. Interview</TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold">Lab Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed text-foreground">
              <p className="whitespace-pre-wrap">{lab.overview}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: REQUIREMENTS */}
        <TabsContent value="requirements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary">Business Objectives</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-xs">
                  {lab.requirements.business.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-400">Functional Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-xs">
                  {lab.requirements.functional.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-400">Non-Functional Engineering</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-xs">
                  {lab.requirements.nonFunctional.map((nf, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{nf}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: TECHNOLOGIES */}
        <TabsContent value="technologies" className="space-y-4">
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base font-bold">Technology Stack & Architectural Rationale</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {lab.technologies.map((t, idx) => (
                  <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{t.technology}</span>
                      <Badge variant="outline" className="text-[9px] font-mono uppercase">
                        {t.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      <strong className="text-foreground">Where:</strong> {t.where}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      <strong className="text-foreground">Why Chosen:</strong> {t.why}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ARCHITECTURE */}
        <TabsContent value="architecture" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold">System Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="bg-muted/20 p-3 rounded border border-border/30 leading-relaxed">{lab.architecture.overview}</div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Core Components & Responsibilities</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {lab.architecture.components.map((c, idx) => (
                    <div key={idx} className="bg-card p-3 rounded border border-border/40 space-y-1">
                      <p className="font-bold text-foreground">{c.name}</p>
                      <p className="text-muted-foreground">{c.responsibility}</p>
                      <p className="text-[11px] text-primary italic">Why: {c.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {lab.architecture.keyDecisions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">Key Architectural Trade-Offs</h4>
                  <div className="space-y-2">
                    {lab.architecture.keyDecisions.map((kd, idx) => (
                      <div key={idx} className="bg-muted/20 p-3 rounded border border-border/30 space-y-1">
                        <p className="font-bold text-foreground">{kd.decision}</p>
                        <p className="text-muted-foreground">Reason: {kd.reason}</p>
                        <p className="text-[11px] text-amber-400">Trade-Off: {kd.tradeOff}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: MODULES */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {lab.modules.map((m, idx) => (
              <Card key={idx} className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">{m.name}</CardTitle>
                  <CardDescription className="text-xs">{m.purpose}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">Responsibilities:</span>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5 mt-1">
                      {m.responsibilities.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Design Concerns:</span>
                    <ul className="list-disc list-inside text-rose-400/90 space-y-0.5 mt-1">
                      {m.designConcerns.map((dc, dcIdx) => (
                        <li key={dcIdx}>{dc}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 6: DATA DESIGN */}
        <TabsContent value="data" className="space-y-4">
          {lab.dataDesign.databases.map((db, idx) => (
            <Card key={idx} className="border-border/50 space-y-3">
              <CardHeader className="pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" /> {db.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {db.type}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{db.purpose}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {db.tables.map((table, tIdx) => (
                  <div key={tIdx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>Table: {table.name}</span>
                      <span className="text-[10px] text-muted-foreground font-sans">PK: {table.primaryKey}</span>
                    </div>
                    <p className="text-[11px] font-sans text-muted-foreground">{table.purpose}</p>

                    <div>
                      <span className="font-semibold text-foreground font-sans text-[11px]">Columns:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {table.columns.map((col, cIdx) => (
                          <Badge key={cIdx} variant="secondary" className="text-[9px] font-mono">
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-foreground font-sans text-[11px]">Indexes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {table.indexes.map((idxName, iIdx) => (
                          <Badge key={iIdx} variant="outline" className="text-[9px] font-mono">
                            {idxName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB 7: API & EVENT DESIGN */}
        <TabsContent value="apis" className="space-y-6">
          {/* REST APIs */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Route className="h-4 w-4 text-emerald-400" /> REST API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {lab.apiDesign.apis.map((api, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {api.method}
                    </Badge>
                    <span className="font-bold font-mono text-foreground">{api.path}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">{api.purpose}</span>
                  </div>

                  {api.requestFields.length > 0 && (
                    <div>
                      <span className="font-semibold text-[11px]">Request Payload / Params:</span>
                      <div className="flex flex-wrap gap-1 mt-1 font-mono">
                        {api.requestFields.map((rf, rIdx) => (
                          <Badge key={rIdx} variant="secondary" className="text-[9px]">
                            {rf}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px]">
                    <strong className="text-foreground">Response:</strong> <code className="font-mono">{api.response}</code>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Events */}
          {lab.eventDesign.events.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MessageSquareCode className="h-4 w-4 text-cyan-400" /> Kafka Messaging Events
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                {lab.eventDesign.events.map((evt, idx) => (
                  <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>Event: {evt.name}</span>
                      <span className="text-[11px] text-muted-foreground">Producer: {evt.producer}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 font-mono">
                      {evt.payload.map((p, pIdx) => (
                        <Badge key={pIdx} variant="secondary" className="text-[9px]">
                          {p}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-[11px] text-primary italic">Impact: {evt.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 8: SECURITY & RELIABILITY */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-primary">Security Engineering</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-xs">
                  {lab.securityReliability.security.map((sec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-400">Reliability & Resiliency</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-xs">
                  {lab.securityReliability.reliability.map((rel, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rel}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-400">Observability & Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-xs">
                  {lab.securityReliability.observability.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 9: ENGINEERING CHALLENGES */}
        <TabsContent value="challenges" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Edge Cases & Engineering Challenges
              </CardTitle>
              <CardDescription className="text-xs">Concrete failure scenarios and expected design mitigations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {lab.engineeringChallenges.map((ec, idx) => (
                <div key={idx} className="bg-muted/20 p-4 rounded-xl border border-border/40 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-rose-400 font-mono text-xs">CHALLENGE {idx + 1}:</span>
                    <p className="font-bold text-foreground text-sm leading-tight">{ec.challenge}</p>
                  </div>

                  <div className="pl-6 space-y-1">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Expected Design Concern:</strong> {ec.expectedDesignConcern}
                    </p>
                    <p className="text-emerald-400">
                      <strong className="text-foreground">Mitigation Strategy:</strong> {ec.mitigationStrategy}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 10: BUILD PLAN */}
        <TabsContent value="build" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Ordered Step-by-Step Build Plan
              </CardTitle>
              <CardDescription className="text-xs">Sequential phases for hands-on execution in your local IDE.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {lab.buildPlan.map((bp) => (
                <div key={bp.phaseNumber} className="bg-card p-4 rounded-xl border border-border/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-border/30 pb-2">
                    <span className="font-bold text-primary font-mono">PHASE {bp.phaseNumber} — {bp.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      Goal: {bp.goal}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-foreground">What to build:</span>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                      {bp.whatToBuild.map((wtb, idx) => (
                        <li key={idx}>{wtb}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 pt-1">
                    <div className="bg-muted/20 p-2 rounded text-[11px]">
                      <span className="font-bold text-foreground block">Engineering Decision:</span>
                      <span className="text-muted-foreground">{bp.engineeringDecision}</span>
                    </div>
                    <div className="bg-muted/20 p-2 rounded text-[11px]">
                      <span className="font-bold text-emerald-400 block">Expected Outcome:</span>
                      <span className="text-muted-foreground">{bp.expectedOutcome}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 11: INTERVIEW DISCUSSION */}
        <TabsContent value="interview" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base font-bold text-cyan-400 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" /> 3+ YOE Backend Interview Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/30 space-y-1">
                <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">60-Second Elevator Pitch:</span>
                <p className="text-foreground leading-relaxed italic">"{lab.interviewDiscussion.elevatorPitch}"</p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Deep-Dive Interview Prompts</h4>
                {lab.interviewDiscussion.prompts.map((p, idx) => (
                  <div key={idx} className="bg-muted/20 p-4 rounded-xl border border-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{p.question}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {p.topic}
                      </Badge>
                    </div>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                      {p.discussionPoints.map((dp, dpIdx) => (
                        <li key={dpIdx}>{dp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Header Modal / Overlay */}
      {isEditingHeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Engineering Lab Header</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditingHeader(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveHeader} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Lab Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold">Short Description</label>
                <input
                  type="text"
                  required
                  value={editShortDesc}
                  onChange={(e) => setEditShortDesc(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold">Problem Statement</label>
                <textarea
                  required
                  value={editProblemStatement}
                  onChange={(e) => setEditProblemStatement(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-background text-foreground text-xs min-h-[90px]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-semibold">Difficulty</label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value as any)}
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
                    value={editScope}
                    onChange={(e) => setEditScope(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Primary Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editPrimarySkills}
                  onChange={(e) => setEditPrimarySkills(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingHeader(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
