"use client";

import React, { useState } from "react";
import type { ProjectGuide, SecurityReliabilityRequirement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Zap, Activity, Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectSecurityReliabilityTabProps {
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectSecurityReliabilityTab({ guide, onUpdate }: ProjectSecurityReliabilityTabProps) {
  const secList = guide.securityRequirements ?? [];
  const relList = guide.reliabilityRequirements ?? [];
  const obsList = guide.observabilityRequirements ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [sec, setSec] = useState<SecurityReliabilityRequirement[]>(secList);
  const [rel, setRel] = useState<SecurityReliabilityRequirement[]>(relList);
  const [obs, setObs] = useState<SecurityReliabilityRequirement[]>(obsList);

  const handleSave = () => {
    onUpdate({
      securityRequirements: sec,
      reliabilityRequirements: rel,
      observabilityRequirements: obs,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Security, Reliability & Observability Guidelines</h2>
          <p className="text-xs text-muted-foreground">Engineering requirements for authentication, zero dual-write loss, idempotency, retries, and distributed tracing.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) {
              setSec(secList);
              setRel(relList);
              setObs(obsList);
            }
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Guidelines"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-6">
          {/* Security Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-500">Security Requirements</h3>
              <Button size="sm" variant="outline" onClick={() => setSec([...sec, { id: `s-${Date.now()}`, category: "Category", requirement: "Requirement", rationale: "Rationale" }])} className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Security Item
              </Button>
            </div>
            {sec.map((item, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-3 items-center bg-muted/20 p-2 rounded border border-border/40 text-xs">
                <input type="text" value={item.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...sec]; next[idx].category = e.target.value; setSec(next); }} placeholder="Category" className="px-2 py-1 border rounded text-xs bg-background text-foreground" />
                <input type="text" value={item.requirement} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...sec]; next[idx].requirement = e.target.value; setSec(next); }} placeholder="Requirement" className="px-2 py-1 border rounded text-xs bg-background text-foreground" />
                <div className="flex items-center gap-2">
                  <input type="text" value={item.rationale} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...sec]; next[idx].rationale = e.target.value; setSec(next); }} placeholder="Rationale" className="w-full px-2 py-1 border rounded text-xs bg-background text-foreground" />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => setSec(sec.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Reliability Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-500">Reliability & Resiliency Requirements</h3>
              <Button size="sm" variant="outline" onClick={() => setRel([...rel, { id: `r-${Date.now()}`, category: "Category", requirement: "Requirement", rationale: "Rationale" }])} className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Reliability Item
              </Button>
            </div>
            {rel.map((item, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-3 items-center bg-muted/20 p-2 rounded border border-border/40 text-xs">
                <input type="text" value={item.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...rel]; next[idx].category = e.target.value; setRel(next); }} placeholder="Category" className="px-2 py-1 border rounded text-xs bg-background text-foreground" />
                <input type="text" value={item.requirement} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...rel]; next[idx].requirement = e.target.value; setRel(next); }} placeholder="Requirement" className="px-2 py-1 border rounded text-xs bg-background text-foreground" />
                <div className="flex items-center gap-2">
                  <input type="text" value={item.rationale} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...rel]; next[idx].rationale = e.target.value; setRel(next); }} placeholder="Rationale" className="w-full px-2 py-1 border rounded text-xs bg-background text-foreground" />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => setRel(rel.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Observability Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-500">Observability Requirements</h3>
              <Button size="sm" variant="outline" onClick={() => setObs([...obs, { id: `o-${Date.now()}`, category: "Category", requirement: "Requirement", rationale: "Rationale" }])} className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Observability Item
              </Button>
            </div>
            {obs.map((item, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-3 items-center bg-muted/20 p-2 rounded border border-border/40 text-xs">
                <input type="text" value={item.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...obs]; next[idx].category = e.target.value; setObs(next); }} placeholder="Category" className="px-2 py-1 border rounded text-xs bg-background text-foreground" />
                <input type="text" value={item.requirement} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...obs]; next[idx].requirement = e.target.value; setObs(next); }} placeholder="Requirement" className="px-2 py-1 border rounded text-xs bg-background text-foreground" />
                <div className="flex items-center gap-2">
                  <input type="text" value={item.rationale} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...obs]; next[idx].rationale = e.target.value; setObs(next); }} placeholder="Rationale" className="w-full px-2 py-1 border rounded text-xs bg-background text-foreground" />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => setObs(obs.filter((_, i) => i !== idx))}>
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
        <div className="grid gap-6 md:grid-cols-3">
          {/* Security Column */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-500">
                <ShieldCheck className="h-4 w-4" /> Security Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {sec.map((item, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1 text-xs">
                  <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/40 uppercase">
                    {item.category}
                  </Badge>
                  <p className="font-bold text-foreground">{item.requirement}</p>
                  <p className="text-muted-foreground">{item.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reliability Column */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-500">
                <Zap className="h-4 w-4" /> Reliability & Resiliency
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {rel.map((item, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1 text-xs">
                  <Badge variant="outline" className="text-[9px] text-amber-500 border-amber-500/40 uppercase">
                    {item.category}
                  </Badge>
                  <p className="font-bold text-foreground">{item.requirement}</p>
                  <p className="text-muted-foreground">{item.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Observability Column */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-500">
                <Activity className="h-4 w-4" /> Observability & Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {obs.map((item, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-1 text-xs">
                  <Badge variant="outline" className="text-[9px] text-blue-500 border-blue-500/40 uppercase">
                    {item.category}
                  </Badge>
                  <p className="font-bold text-foreground">{item.requirement}</p>
                  <p className="text-muted-foreground">{item.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
