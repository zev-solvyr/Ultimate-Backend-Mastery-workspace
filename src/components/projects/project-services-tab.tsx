"use client";

import React, { useState } from "react";
import type { Project, ProjectGuide, ProjectServiceSpec } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, ShieldAlert, Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectServicesTabProps {
  project: Project;
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectServicesTab({ project, guide, onUpdate }: ProjectServicesTabProps) {
  const services = guide.serviceSpecs ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [servicesList, setServicesList] = useState<ProjectServiceSpec[]>(services);

  const handleSave = () => {
    onUpdate({ serviceSpecs: servicesList });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Services & Modules Guidance</h2>
          <p className="text-xs text-muted-foreground">Service responsibilities, owned entities, databases, exposed APIs, events, and key design concerns.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) setServicesList(services);
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Services"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setServicesList([
                  ...servicesList,
                  {
                    id: `ss-${Date.now()}`,
                    name: "New Service",
                    purpose: "Service purpose",
                    responsibilities: ["Task 1"],
                    ownedEntities: ["Entity1"],
                    database: "PostgreSQL",
                    apis: ["GET /api/v1/resource"],
                    publishedEvents: ["EventPublished"],
                    consumedEvents: [],
                    dependencies: [],
                    designConcerns: ["Concurrency"],
                  },
                ])
              }
              className="text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Service Module
            </Button>
          </div>

          {servicesList.map((svc, idx) => (
            <Card key={idx} className="p-4 space-y-3 border-border/60 bg-muted/20">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={svc.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...servicesList];
                    next[idx].name = e.target.value;
                    setServicesList(next);
                  }}
                  className="font-bold text-sm max-w-xs px-2 py-1 border rounded text-xs bg-background text-foreground"
                  placeholder="Service Name"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setServicesList(servicesList.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="text-xs font-semibold">Purpose</label>
                <input
                  type="text"
                  value={svc.purpose}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...servicesList];
                    next[idx].purpose = e.target.value;
                    setServicesList(next);
                  }}
                  className="mt-1 w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold">Responsibilities (1 per line)</label>
                  <textarea
                    value={svc.responsibilities.join("\n")}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      const next = [...servicesList];
                      next[idx].responsibilities = e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean);
                      setServicesList(next);
                    }}
                    className="mt-1 w-full p-2 border rounded text-xs bg-background text-foreground min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Design Concerns (1 per line)</label>
                  <textarea
                    value={svc.designConcerns.join("\n")}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      const next = [...servicesList];
                      next[idx].designConcerns = e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean);
                      setServicesList(next);
                    }}
                    className="mt-1 w-full p-2 border rounded text-xs bg-background text-foreground min-h-[80px]"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold">Database</label>
                  <input
                    type="text"
                    value={svc.database}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...servicesList];
                      next[idx].database = e.target.value;
                      setServicesList(next);
                    }}
                    className="mt-1 w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Owned Entities (comma separated)</label>
                  <input
                    type="text"
                    value={svc.ownedEntities.join(", ")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...servicesList];
                      next[idx].ownedEntities = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                      setServicesList(next);
                    }}
                    className="mt-1 w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Exposed APIs (comma separated)</label>
                  <input
                    type="text"
                    value={svc.apis.join(", ")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...servicesList];
                      next[idx].apis = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                      setServicesList(next);
                    }}
                    className="mt-1 w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {servicesList.map((svc, idx) => (
            <Card key={idx} className="border-border/50 hover:border-border transition-colors">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" /> {svc.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {svc.database}
                  </Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed">{svc.purpose}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 space-y-3 text-xs">
                <div>
                  <p className="font-semibold text-foreground mb-1">Key Responsibilities:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                    {svc.responsibilities.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 pt-1 border-t border-border/30">
                  <div>
                    <span className="font-semibold text-foreground">Owned Entities: </span>
                    <span className="text-primary font-mono">{svc.ownedEntities.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Exposed APIs: </span>
                    <span className="text-muted-foreground font-mono">{svc.apis.join(", ")}</span>
                  </div>
                </div>

                {(svc.publishedEvents.length > 0 || svc.consumedEvents.length > 0) && (
                  <div className="pt-1 border-t border-border/30 space-y-1">
                    {svc.publishedEvents.length > 0 && (
                      <p>
                        <span className="font-semibold text-emerald-500">Publishes: </span>
                        <span className="font-mono text-muted-foreground">{svc.publishedEvents.join(", ")}</span>
                      </p>
                    )}
                    {svc.consumedEvents.length > 0 && (
                      <p>
                        <span className="font-semibold text-purple-400">Consumes: </span>
                        <span className="font-mono text-muted-foreground">{svc.consumedEvents.join(", ")}</span>
                      </p>
                    )}
                  </div>
                )}

                {svc.designConcerns.length > 0 && (
                  <div className="pt-1 border-t border-border/30">
                    <p className="font-semibold text-amber-500 flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> Design Concerns:
                    </p>
                    <p className="text-muted-foreground mt-0.5">{svc.designConcerns.join(" • ")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
