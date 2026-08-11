"use client";

import React, { useState } from "react";
import type { ProjectGuide } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Server, ArrowRightLeft, Database, Key, Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectArchitectureTabProps {
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectArchitectureTab({ guide, onUpdate }: ProjectArchitectureTabProps) {
  const arch = guide.architectureSpec ?? {
    overview: "Distributed microservices architecture fronted by an API Gateway.",
    components: [
      { name: "API Gateway", responsibility: "Routing & JWT validation", why: "Centralized edge traffic entry", technology: ["Spring Cloud Gateway"] },
      { name: "Order Service", responsibility: "Order checkout coordinator", why: "Core transaction coordinator", technology: ["Spring Boot", "PostgreSQL"] },
    ],
    communication: {
      synchronous: ["Client -> API Gateway -> Services (REST)"],
      asynchronous: ["Order Service -> Kafka (OrderCreatedEvent)"],
    },
    dataOwnership: "Strict Database-per-Service isolation.",
    keyDecisions: [
      { decision: "Database-per-Service Isolation", reason: "Independent scaling and clear domain boundaries", tradeOff: "Eventual consistency across services" },
    ],
  };

  const [isEditing, setIsEditing] = useState(false);
  const [overviewText, setOverviewText] = useState(arch.overview);
  const [syncText, setSyncText] = useState(arch.communication.synchronous.join("\n"));
  const [asyncText, setAsyncText] = useState(arch.communication.asynchronous.join("\n"));
  const [dataOwnershipText, setDataOwnershipText] = useState(arch.dataOwnership);
  const [componentsList, setComponentsList] = useState(arch.components);

  const handleSave = () => {
    onUpdate({
      architectureSpec: {
        overview: overviewText,
        components: componentsList,
        communication: {
          synchronous: syncText.split("\n").map((s: string) => s.trim()).filter(Boolean),
          asynchronous: asyncText.split("\n").map((s: string) => s.trim()).filter(Boolean),
        },
        dataOwnership: dataOwnershipText,
        keyDecisions: arch.keyDecisions,
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Architecture</h2>
          <p className="text-xs text-muted-foreground">High-level components, responsibilities, communication patterns, and trade-off decisions.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) {
              setOverviewText(arch.overview);
              setSyncText(arch.communication.synchronous.join("\n"));
              setAsyncText(arch.communication.asynchronous.join("\n"));
              setDataOwnershipText(arch.dataOwnership);
              setComponentsList(arch.components);
            }
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Architecture"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-6">
          <div>
            <label className="text-xs font-semibold">Architecture Overview</label>
            <textarea
              value={overviewText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOverviewText(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Data Ownership Strategy</label>
            <input
              type="text"
              value={dataOwnershipText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataOwnershipText(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 border rounded-md text-xs bg-background text-foreground"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold">Synchronous Communication (1 per line)</label>
              <textarea
                value={syncText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSyncText(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Asynchronous Communication (1 per line)</label>
              <textarea
                value={asyncText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAsyncText(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Components / Services</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setComponentsList([
                    ...componentsList,
                    { name: "New Component", responsibility: "Responsibility", why: "Why chosen", technology: ["Spring Boot"] },
                  ])
                }
                className="text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Component
              </Button>
            </div>
            {componentsList.map((comp, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-4 items-center bg-muted/30 p-2.5 rounded border border-border/40">
                <input
                  type="text"
                  value={comp.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...componentsList];
                    next[idx].name = e.target.value;
                    setComponentsList(next);
                  }}
                  placeholder="Component Name"
                  className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
                <input
                  type="text"
                  value={comp.responsibility}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...componentsList];
                    next[idx].responsibility = e.target.value;
                    setComponentsList(next);
                  }}
                  placeholder="Responsibility"
                  className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
                <input
                  type="text"
                  value={comp.why}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...componentsList];
                    next[idx].why = e.target.value;
                    setComponentsList(next);
                  }}
                  placeholder="Why it exists"
                  className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={(comp.technology ?? []).join(", ")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...componentsList];
                      next[idx].technology = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                      setComponentsList(next);
                    }}
                    placeholder="Tech stack (comma separated)"
                    className="w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive shrink-0"
                    onClick={() => setComponentsList(componentsList.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Architecture Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{arch.overview}</p>
              <div className="p-3 bg-muted/20 rounded border border-border/40 flex items-start gap-2 text-xs">
                <Database className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Data Ownership Strategy: </span>
                  <span className="text-muted-foreground">{arch.dataOwnership}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components Grid */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-500" /> Architectural Components & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {arch.components.map((comp, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{comp.name}</span>
                    <div className="flex gap-1 flex-wrap">
                      {(comp.technology ?? []).map((t, tIdx) => (
                        <Badge key={tIdx} variant="outline" className="text-[9px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">Responsibility:</span> {comp.responsibility}</p>
                  <p className="text-xs text-primary/90"><span className="font-semibold">Why it exists:</span> {comp.why}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Communication Protocols */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-500">
                  <ArrowRightLeft className="h-4 w-4" /> Synchronous Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {arch.communication.synchronous.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border/30">
                      <span className="font-mono text-blue-500 font-bold">SYNC</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-500">
                  <ArrowRightLeft className="h-4 w-4" /> Asynchronous Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {arch.communication.asynchronous.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border/30">
                      <span className="font-mono text-purple-500 font-bold">ASYNC</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Design Decisions */}
          {arch.keyDecisions.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-500">
                  <Key className="h-4 w-4" /> Key Architectural Design Decisions & Trade-Offs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {arch.keyDecisions.map((dec, idx) => (
                  <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1 text-xs">
                    <p className="font-bold text-foreground">{dec.decision}</p>
                    <p className="text-muted-foreground"><span className="font-semibold text-emerald-500">Reason:</span> {dec.reason}</p>
                    <p className="text-muted-foreground"><span className="font-semibold text-rose-400">Trade-Off:</span> {dec.tradeOff}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
