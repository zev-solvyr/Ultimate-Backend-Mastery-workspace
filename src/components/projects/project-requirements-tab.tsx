"use client";

import React, { useState } from "react";
import type { ProjectGuide, NonFunctionalRequirement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Zap, Server, Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectRequirementsTabProps {
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectRequirementsTab({ guide, onUpdate }: ProjectRequirementsTabProps) {
  const bizReqs = guide.businessRequirements ?? [];
  const funcReqs = guide.functionalRequirements ?? [];
  const nonFuncReqs = guide.nonFunctionalRequirements ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [bizText, setBizText] = useState(bizReqs.join("\n"));
  const [nonFuncList, setNonFuncList] = useState<NonFunctionalRequirement[]>(nonFuncReqs);

  const handleSave = () => {
    onUpdate({
      businessRequirements: bizText.split("\n").map((s) => s.trim()).filter(Boolean),
      nonFunctionalRequirements: nonFuncList,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Project Requirements</h2>
          <p className="text-xs text-muted-foreground">Define WHAT the system must satisfy without cluttering with implementation code.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) {
              setBizText(bizReqs.join("\n"));
              setNonFuncList(nonFuncReqs);
            }
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Requirements"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-6">
          <div>
            <label className="text-xs font-semibold">Business Requirements (1 item per line)</label>
            <textarea
              value={bizText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBizText(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[120px]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Non-Functional Requirements</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setNonFuncList([
                    ...nonFuncList,
                    { area: "Scalability", target: "Target metric", rationale: "Why this target is required" },
                  ])
                }
                className="text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add NFR
              </Button>
            </div>
            {nonFuncList.map((nfr, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-3 items-center bg-muted/30 p-2.5 rounded border border-border/40">
                <input
                  type="text"
                  value={nfr.area}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...nonFuncList];
                    next[idx].area = e.target.value;
                    setNonFuncList(next);
                  }}
                  placeholder="Area (e.g. Availability)"
                  className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
                <input
                  type="text"
                  value={nfr.target}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...nonFuncList];
                    next[idx].target = e.target.value;
                    setNonFuncList(next);
                  }}
                  placeholder="Target SLA / Metric"
                  className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nfr.rationale}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...nonFuncList];
                      next[idx].rationale = e.target.value;
                      setNonFuncList(next);
                    }}
                    placeholder="Rationale"
                    className="w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setNonFuncList(nonFuncList.filter((_, i) => i !== idx))}
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
          {/* Business Requirements */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" /> Business Capabilities
              </CardTitle>
              <CardDescription className="text-xs">High-level business expectations and domain capabilities.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs">
                {bizReqs.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-muted/20 p-2.5 rounded border border-border/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span className="text-foreground/90">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Functional Requirements */}
          {funcReqs.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-500" /> Functional Domain Requirements
                </CardTitle>
                <CardDescription className="text-xs">Domain-specific functional capabilities to implement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {funcReqs.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">{group.domain}</p>
                    <ul className="grid gap-2 sm:grid-cols-2 text-xs">
                      {group.requirements.map((req, rIdx) => (
                        <li key={rIdx} className="bg-muted/30 p-2.5 rounded border border-border/30 flex items-start gap-2">
                          <span className="font-semibold text-muted-foreground">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Non-Functional Requirements */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Non-Functional Engineering Requirements (NFRs)
              </CardTitle>
              <CardDescription className="text-xs">SLA targets for availability, latency, consistency, and durability.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {nonFuncReqs.map((nfr, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{nfr.area}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {nfr.target}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{nfr.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
