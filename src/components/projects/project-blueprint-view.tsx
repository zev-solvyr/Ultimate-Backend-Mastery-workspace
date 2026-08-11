"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Layers, ShieldCheck, Database, Server, Cpu, CheckSquare, MessageSquareCode, FileText } from "lucide-react";
import type { Project, ProjectGuide } from "@/types";
import { useProjectGuide } from "@/hooks/use-project-guide";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ProjectOverviewTab } from "./project-overview-tab";
import { ProjectRequirementsTab } from "./project-requirements-tab";
import { ProjectTechTab } from "./project-tech-tab";
import { ProjectArchitectureTab } from "./project-architecture-tab";
import { ProjectServicesTab } from "./project-services-tab";
import { DatabaseDesign } from "./database-design";
import { ProjectApiEventsTab } from "./project-api-events-tab";
import { ProjectSecurityReliabilityTab } from "./project-security-reliability-tab";
import { ProjectBuildPlanTab } from "./project-build-plan-tab";
import { ProjectInterviewTab } from "./project-interview-tab";

interface ProjectBlueprintViewProps {
  project: Project;
}

export function ProjectBlueprintView({ project }: ProjectBlueprintViewProps) {
  const seedGuide = (project.guide ?? {}) as any;
  const { guide, updateProjectGuide, resetProjectGuide, sourceState, loaded } = useProjectGuide(project.id, seedGuide);

  const [activeTab, setActiveTab] = useState("overview");

  if (!loaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading project blueprint...</div>;
  }

  const typedGuide = guide as ProjectGuide;

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold" style={{ borderColor: project.color, color: project.color }}>
              {project.domain}
            </Badge>
            {sourceState !== "seed" && (
              <Badge variant="secondary" className="text-[10px]">
                Source: {sourceState}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">{project.tagline}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => {
              if (confirm("Reset blueprint to default seed? Any custom notes or edits for this project will be reverted.")) {
                resetProjectGuide();
              }
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Blueprint
          </Button>
        </div>
      </div>

      {/* Main 10-Section Navigation Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <TabsList className="h-auto p-1 bg-muted/50 border border-border/40 flex-wrap justify-start gap-1">
            <TabsTrigger value="overview" className="text-xs px-3 py-1.5 gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="requirements" className="text-xs px-3 py-1.5 gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" /> Requirements
            </TabsTrigger>
            <TabsTrigger value="tech" className="text-xs px-3 py-1.5 gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Technology Stack
            </TabsTrigger>
            <TabsTrigger value="architecture" className="text-xs px-3 py-1.5 gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Architecture
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs px-3 py-1.5 gap-1.5">
              <Server className="h-3.5 w-3.5" /> Services / Modules
            </TabsTrigger>
            <TabsTrigger value="database" className="text-xs px-3 py-1.5 gap-1.5">
              <Database className="h-3.5 w-3.5" /> Data & DB Design
            </TabsTrigger>
            <TabsTrigger value="api-events" className="text-xs px-3 py-1.5 gap-1.5">
              <Layers className="h-3.5 w-3.5" /> API & Event Design
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-3 py-1.5 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Security & Reliability
            </TabsTrigger>
            <TabsTrigger value="build-plan" className="text-xs px-3 py-1.5 gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" /> Build Plan
            </TabsTrigger>
            <TabsTrigger value="interview" className="text-xs px-3 py-1.5 gap-1.5">
              <MessageSquareCode className="h-3.5 w-3.5" /> Interview Discussion
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Components */}
        <TabsContent value="overview" className="space-y-4">
          <ProjectOverviewTab project={project} guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <ProjectRequirementsTab guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <ProjectTechTab project={project} guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <ProjectArchitectureTab guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ProjectServicesTab project={project} guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseDesign project={project} />
        </TabsContent>

        <TabsContent value="api-events" className="space-y-4">
          <ProjectApiEventsTab guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <ProjectSecurityReliabilityTab guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="build-plan" className="space-y-4">
          <ProjectBuildPlanTab guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>

        <TabsContent value="interview" className="space-y-4">
          <ProjectInterviewTab guide={typedGuide} onUpdate={updateProjectGuide} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
