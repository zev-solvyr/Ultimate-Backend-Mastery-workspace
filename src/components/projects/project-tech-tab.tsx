"use client";

import React, { useState } from "react";
import type { Project, ProjectGuide, ProjectTechCard } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Plus, Trash2, Edit, Save, X } from "lucide-react";

interface ProjectTechTabProps {
  project: Project;
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectTechTab({ project, guide, onUpdate }: ProjectTechTabProps) {
  const cards = guide.techStackCards ?? [
    { category: "Backend", technology: "Java 21 + Spring Boot 3", where: "Microservices", why: "Core service runtime" },
    { category: "Database", technology: "PostgreSQL", where: "Relational DBs", why: "ACID transactions per service" },
    { category: "Messaging", technology: "Kafka", where: "Event bus", why: "Decoupled asynchronous events" },
    { category: "Caching", technology: "Redis", where: "Read caching", why: "Low-latency data access" },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [techList, setTechList] = useState<ProjectTechCard[]>(cards);

  const handleSave = () => {
    onUpdate({ techStackCards: techList });
    setIsEditing(false);
  };

  const categories = ["Backend", "Database", "Messaging", "Caching", "Security", "Containerization", "Cloud", "Observability", "Testing", "CI/CD"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Technology Stack</h2>
          <p className="text-xs text-muted-foreground">Categorized choices explaining WHERE each technology is used and WHY it was selected.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) setTechList(cards);
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Tech Stack"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setTechList([
                  ...techList,
                  { category: "Backend", technology: "New Tech", where: "Where used", why: "Why chosen" },
                ])
              }
              className="text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Technology Card
            </Button>
          </div>
          {techList.map((item, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-4 items-center bg-muted/30 p-2.5 rounded border border-border/40">
              <select
                value={item.category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const next = [...techList];
                  next[idx].category = e.target.value as any;
                  setTechList(next);
                }}
                className="h-9 px-2 rounded border border-input bg-background text-xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={item.technology}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = [...techList];
                  next[idx].technology = e.target.value;
                  setTechList(next);
                }}
                placeholder="Technology (e.g. Java 21)"
                className="px-2 py-1 border rounded text-xs bg-background text-foreground"
              />
              <input
                type="text"
                value={item.where}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = [...techList];
                  next[idx].where = e.target.value;
                  setTechList(next);
                }}
                placeholder="Where used"
                className="px-2 py-1 border rounded text-xs bg-background text-foreground"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.why}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...techList];
                    next[idx].why = e.target.value;
                    setTechList(next);
                  }}
                  placeholder="Why chosen"
                  className="w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive shrink-0"
                  onClick={() => setTechList(techList.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techList.map((item, idx) => (
            <Card key={idx} className="border-border/50 hover:border-border transition-colors">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                  {item.category}
                </Badge>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <p className="font-bold text-sm text-foreground">{item.technology}</p>
                <p className="text-xs text-primary font-medium">Where: {item.where}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.why}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
