"use client";

import React, { useState } from "react";
import type { Project, ProjectGuide, ProjectGuideOverview } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, Lightbulb, Award, CheckCircle2, Edit, Save, X } from "lucide-react";

interface ProjectOverviewTabProps {
  project: Project;
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectOverviewTab({ project, guide, onUpdate }: ProjectOverviewTabProps) {
  const overview: ProjectGuideOverview = guide.overviewSpec ?? {
    projectName: project.name,
    shortDescription: project.tagline,
    goal: project.description,
    businessProblem: "High concurrency and reliability bottlenecks in production systems.",
    whyItExists: "Demonstrates microservices design patterns, distributed data consistency, and production resilience.",
    learningOutcomes: [
      "Microservices Bounded Context design",
      "Event-driven architecture with Kafka",
      "Caching strategies with Redis",
      "Production deployment and observability",
    ],
    targetExperience: "3+ YOE Java Backend Engineer",
    expectedOutcome: "A complete runnable microservices architecture with integration test coverage.",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(overview);
  const [learningOutcomesText, setLearningOutcomesText] = useState((overview.learningOutcomes ?? []).join("\n"));

  const handleSave = () => {
    const updatedOverview: ProjectGuideOverview = {
      ...formData,
      learningOutcomes: learningOutcomesText.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    onUpdate({ overviewSpec: updatedOverview });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Project Blueprint Overview</h2>
          <p className="text-xs text-muted-foreground">High-level goals, business domain motivation, and target experience outcomes.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) {
              setFormData(overview);
              setLearningOutcomesText((overview.learningOutcomes ?? []).join("\n"));
            }
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Overview"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold">Project Name</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, projectName: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 border rounded-md text-xs bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Target Experience Level</label>
              <input
                type="text"
                value={formData.targetExperience}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, targetExperience: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 border rounded-md text-xs bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold">Short Description</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="mt-1 w-full px-3 py-1.5 border rounded-md text-xs bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Project Goal (What To Build)</label>
            <textarea
              value={formData.goal}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, goal: e.target.value })}
              className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Business Problem Solved</label>
            <textarea
              value={formData.businessProblem}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, businessProblem: e.target.value })}
              className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Why This Project Exists</label>
            <textarea
              value={formData.whyItExists}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, whyItExists: e.target.value })}
              className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">What You Will Learn (1 point per line)</label>
            <textarea
              value={learningOutcomesText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLearningOutcomesText(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md text-xs bg-background text-foreground min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Expected Final Outcome</label>
            <input
              type="text"
              value={formData.expectedOutcome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expectedOutcome: e.target.value })}
              className="mt-1 w-full px-3 py-1.5 border rounded-md text-xs bg-background text-foreground"
            />
          </div>

          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Target className="h-4 w-4" /> Project Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm leading-relaxed">{overview.goal}</p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  Target: {overview.targetExperience}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" /> Business Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{overview.businessProblem}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-500">
                <Lightbulb className="h-4 w-4" /> Why This Project Exists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{overview.whyItExists}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-500">
                <Award className="h-4 w-4" /> Expected Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{overview.expectedOutcome}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Key Engineering Learning Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                {(overview.learningOutcomes ?? []).map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-muted/30 p-2.5 rounded border border-border/30">
                    <span className="font-semibold text-primary">{idx + 1}.</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
