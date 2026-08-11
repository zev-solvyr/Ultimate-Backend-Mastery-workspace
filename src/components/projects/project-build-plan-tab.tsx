"use client";

import React, { useState } from "react";
import type { ProjectGuide, BuildPlanPhase } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectBuildPlanTabProps {
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectBuildPlanTab({ guide, onUpdate }: ProjectBuildPlanTabProps) {
  const phases = guide.buildPlanPhases ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [phasesList, setPhasesList] = useState<BuildPlanPhase[]>(phases);

  const handleSave = () => {
    onUpdate({ buildPlanPhases: phasesList });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Project Build Plan</h2>
          <p className="text-xs text-muted-foreground">Ordered phase-by-phase execution guide telling WHAT to build in what sequence in your IDE.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) setPhasesList(phases);
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Build Plan"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPhasesList([
                  ...phasesList,
                  {
                    id: `bp-${Date.now()}`,
                    phaseNumber: phasesList.length + 1,
                    title: `Phase ${phasesList.length + 1} — New Phase`,
                    description: "Phase description",
                    tasks: ["Task 1"],
                  },
                ])
              }
              className="text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Build Phase
            </Button>
          </div>

          {phasesList.map((phase, idx) => (
            <Card key={idx} className="p-4 space-y-3 border-border/60 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Phase Number:</span>
                  <input
                    type="number"
                    value={phase.phaseNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...phasesList];
                      next[idx].phaseNumber = Number(e.target.value);
                      setPhasesList(next);
                    }}
                    className="w-20 px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setPhasesList(phasesList.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="text-xs font-semibold">Phase Title</label>
                <input
                  type="text"
                  value={phase.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...phasesList];
                    next[idx].title = e.target.value;
                    setPhasesList(next);
                  }}
                  className="mt-1 w-full px-2 py-1 border rounded font-bold text-xs bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Phase Description</label>
                <input
                  type="text"
                  value={phase.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...phasesList];
                    next[idx].description = e.target.value;
                    setPhasesList(next);
                  }}
                  className="mt-1 w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Tasks To Complete (1 task per line)</label>
                <textarea
                  value={phase.tasks.join("\n")}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const next = [...phasesList];
                    next[idx].tasks = e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean);
                    setPhasesList(next);
                  }}
                  className="mt-1 w-full p-2 border rounded text-xs bg-background text-foreground min-h-[100px]"
                />
              </div>
            </Card>
          ))}

          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {phasesList.map((phase, idx) => (
            <Card key={idx} className="border-border/50 hover:border-border transition-colors">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Badge variant="default" className="text-xs font-mono">
                      Phase {phase.phaseNumber}
                    </Badge>
                    <span>{phase.title}</span>
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">{phase.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs font-semibold text-foreground mb-2">Build Tasks:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {phase.tasks.map((task, tIdx) => (
                    <div key={tIdx} className="bg-muted/20 p-2.5 rounded border border-border/30 flex items-start gap-2 text-xs">
                      <CheckSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{task}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
