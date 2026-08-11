"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { DetailedServiceGuide, Project } from "@/types";
import { useProjectGuide } from "@/hooks/use-project-guide";
import { getSeedServiceGuides } from "@/data/commercex-seed-services";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Code2,
  Cpu,
  Database,
  Edit3,
  FileCode,
  Layers,
  Plus,
  RefreshCw,
  Server,
  Shield,
  Square,
  Terminal,
  Trash2,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function ServiceGuides({ project }: { project: Project }) {
  const seed = useMemo(() => ({
    serviceGuidesDesign: getSeedServiceGuides(project),
  }), [project]);

  const { guide, loaded, updateProjectGuide, resetProjectGuide, sourceState } = useProjectGuide(project.id, seed);

  const services: DetailedServiceGuide[] = useMemo(() => {
    const rawDesign = guide.serviceGuidesDesign as { services?: DetailedServiceGuide[] } | undefined;
    if (rawDesign?.services && Array.isArray(rawDesign.services) && rawDesign.services.length > 0) {
      return rawDesign.services;
    }
    return seed.serviceGuidesDesign.services;
  }, [guide.serviceGuidesDesign, seed]);

  const [activeServiceId, setActiveServiceId] = useState<string>(() => services[0]?.id ?? "");

  const activeService = services.find((s) => s.id === activeServiceId) ?? services[0];

  const saveServices = (nextServices: DetailedServiceGuide[]) => {
    updateProjectGuide({
      serviceGuidesDesign: { services: nextServices },
    });
  };

  const handleUpdateActiveService = (updated: DetailedServiceGuide) => {
    const next = services.map((s) => (s.id === updated.id ? updated : s));
    saveServices(next);
  };

  const handleResetBlueprint = () => {
    if (window.confirm("Reset all Service Implementation Guides to default hands-on blueprints? Custom edits will be lost.")) {
      resetProjectGuide();
    }
  };

  if (!loaded || !activeService) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Service Implementation Guides
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Hands-on Spring Boot 3 implementation blueprints, package structures, transactional boundaries, DTOs, and failure handling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground uppercase">
            Data Source: {sourceState}
          </Badge>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleResetBlueprint}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reset Blueprint
          </Button>
        </div>
      </div>

      {/* TOP SERVICE SELECTOR TABS */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-3">
        {services.map((s) => {
          const isActive = s.id === activeService.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveServiceId(s.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/40 shadow-sm"
                  : "bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              <span>{s.serviceName}</span>
            </button>
          );
        })}
      </div>

      {/* SERVICE DETAILS CONTAINER */}
      <ServiceDetailView
        service={activeService}
        onUpdate={(updated) => handleUpdateActiveService(updated)}
      />
    </div>
  );
}

// Subcomponent: Individual Service Guide View
function ServiceDetailView({
  service,
  onUpdate,
}: {
  service: DetailedServiceGuide;
  onUpdate: (updated: DetailedServiceGuide) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(service.notes || "");
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newWorkspaceFileTitle, setNewWorkspaceFileTitle] = useState("");

  // Step operations
  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= service.implementationSteps.length) return;
    const nextSteps = [...service.implementationSteps];
    const temp = nextSteps[index];
    nextSteps[index] = nextSteps[target];
    nextSteps[target] = temp;
    nextSteps.forEach((st, i) => (st.order = i + 1));
    onUpdate({ ...service, implementationSteps: nextSteps });
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep = {
      id: crypto.randomUUID(),
      order: service.implementationSteps.length + 1,
      title: newStepTitle.trim(),
      description: "Step description...",
    };
    onUpdate({ ...service, implementationSteps: [...service.implementationSteps, newStep] });
    setNewStepTitle("");
  };

  const handleDeleteStep = (id: string) => {
    const nextSteps = service.implementationSteps.filter((s) => s.id !== id);
    nextSteps.forEach((st, i) => (st.order = i + 1));
    onUpdate({ ...service, implementationSteps: nextSteps });
  };

  // Checklist operation
  const toggleChecklist = (id: string) => {
    const nextChecklist = service.checklist.map((c) =>
      c.id === id ? { ...c, completed: !c.completed } : c
    );
    onUpdate({ ...service, checklist: nextChecklist });
  };

  // Add Code Workspace File
  const handleAddWorkspaceFile = () => {
    if (!newWorkspaceFileTitle.trim()) return;
    const newFile = {
      id: crypto.randomUUID(),
      title: newWorkspaceFileTitle.trim(),
      language: "java",
      filename: `${newWorkspaceFileTitle.trim().replace(/[^a-zA-Z0-9]/g, "")}.java`,
      code: `// ${newWorkspaceFileTitle.trim()} implementation\npublic class ${newWorkspaceFileTitle.trim().replace(/[^a-zA-Z0-9]/g, "")} {\n}`,
    };
    onUpdate({ ...service, codeWorkspace: [...service.codeWorkspace, newFile] });
    setNewWorkspaceFileTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Service Header Info */}
      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{service.serviceName}</CardTitle>
                <Badge variant="outline" className="font-mono text-xs">{service.ownedDatabase}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{service.responsibility}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-xs sm:grid-cols-3 pt-4">
          <div>
            <span className="font-semibold text-muted-foreground">Business Purpose:</span>
            <p className="text-foreground mt-1">{service.businessPurpose}</p>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground">Redis Cache Strategy:</span>
            <p className="font-mono text-primary mt-1">{service.redisUsage || "N/A"}</p>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground">Owned Entities:</span>
            <p className="font-mono text-foreground mt-1">{service.ownedEntities.join(", ") || "None"}</p>
          </div>
        </CardContent>
      </Card>

      {/* MULTI-TAB SERVICE IMPLEMENTATION WORKSPACE */}
      <Tabs defaultValue="overview">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="overview">Overview & Specs</TabsTrigger>
          <TabsTrigger value="steps">Implementation Steps ({service.implementationSteps.length})</TabsTrigger>
          <TabsTrigger value="structure">Package & Dependencies</TabsTrigger>
          <TabsTrigger value="config">application.yml</TabsTrigger>
          <TabsTrigger value="code">Controller & Service Layer</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions & Tx</TabsTrigger>
          <TabsTrigger value="failures">Failure Scenarios ({service.failureScenarios.length})</TabsTrigger>
          <TabsTrigger value="checklist">Checklist ({service.checklist.filter((c) => c.completed).length}/{service.checklist.length})</TabsTrigger>
          <TabsTrigger value="workspace">Code Workspace ({service.codeWorkspace.length})</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4 pt-3">
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <Card className="p-4 space-y-2">
              <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Exposed REST APIs</h4>
              <div className="space-y-1 font-mono text-primary">
                {service.exposedApis.length === 0 ? <p className="text-muted-foreground">None</p> : service.exposedApis.map((api) => <div key={api}>{api}</div>)}
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Consumed Downstream APIs</h4>
              <div className="space-y-1 font-mono text-emerald-400">
                {service.consumedApis.length === 0 ? <p className="text-muted-foreground">None</p> : service.consumedApis.map((api) => <div key={api}>{api}</div>)}
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Published Domain Events</h4>
              <div className="space-y-1 font-mono text-amber-400">
                {service.publishedEvents.length === 0 ? <p className="text-muted-foreground">None</p> : service.publishedEvents.map((ev) => <div key={ev}>{ev}</div>)}
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Key Architecture Decisions</h4>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                {service.keyDesignDecisions.map((dec) => <li key={dec}>{dec}</li>)}
              </ul>
            </Card>
          </div>

          {/* Editable Notes */}
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Personal Engineering Notes</h4>
              {!editingNotes && (
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingNotes(true)}>
                  <Edit3 className="mr-1 h-3 w-3" /> Edit Notes
                </Button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  className="w-full rounded border border-border bg-secondary/40 p-2.5 text-xs focus:border-primary focus:outline-none"
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { onUpdate({ ...service, notes: notesText }); setEditingNotes(false); }}>
                    Save Notes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setNotesText(service.notes); setEditingNotes(false); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{service.notes || "No notes added yet."}</p>
            )}
          </Card>
        </TabsContent>

        {/* 2. IMPLEMENTATION STEPS TAB */}
        <TabsContent value="steps" className="space-y-4 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New step title..."
              className="flex-1 rounded border border-border bg-secondary/40 px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
            />
            <Button size="sm" className="text-xs" onClick={handleAddStep}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Step
            </Button>
          </div>

          <div className="space-y-2">
            {service.implementationSteps.map((st, i) => (
              <Card key={st.id} className="p-3 bg-secondary/20 border-border/50 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 font-mono text-xs font-bold text-primary">
                    {st.order}
                  </span>
                  <div>
                    <h5 className="font-semibold text-foreground">{st.title}</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{st.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    disabled={i === 0}
                    onClick={() => handleMoveStep(i, "up")}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    disabled={i === service.implementationSteps.length - 1}
                    onClick={() => handleMoveStep(i, "down")}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-400"
                    onClick={() => handleDeleteStep(st.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 3. PACKAGE & DEPENDENCIES TAB */}
        <TabsContent value="structure" className="space-y-4 pt-3">
          <Card className="p-4 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Recommended Package Structure</h4>
            <div className="space-y-1.5 font-mono text-xs">
              {service.packageStructure.map((pkg) => (
                <div key={pkg.id} className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-primary">{pkg.path}</span>
                  <span className="text-muted-foreground text-[11px]">{pkg.purpose}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Maven Dependencies</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {service.mavenDependencies.map((dep) => (
                <div key={dep.id} className="rounded border border-border/50 p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{dep.name}</span>
                    {dep.required && <Badge variant="outline" className="text-[9px]">Required</Badge>}
                  </div>
                  <p className="text-muted-foreground text-[11px]">{dep.purpose}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 4. CONFIGURATION YML TAB */}
        <TabsContent value="config" className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">application.yml Configuration</span>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <MonacoEditor
              height="280px"
              language="yaml"
              theme="vs-dark"
              value={service.configurationYml}
              onChange={(val) => onUpdate({ ...service, configurationYml: val ?? "" })}
              options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
            />
          </div>
        </TabsContent>

        {/* 5. CODE & SERVICE LAYER TAB */}
        <TabsContent value="code" className="space-y-4 pt-3">
          {service.controllerGuides.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">REST Controller Implementation</h4>
              {service.controllerGuides.map((cg) => (
                <div key={cg.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs text-primary">{cg.apiEndpoint}</Badge>
                  </div>
                  <CodeBlock code={cg.javaCode} language="java" title="Controller.java" />
                </div>
              ))}
            </div>
          )}

          {service.serviceLayerGuides.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border/40">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Service Layer & Transactional Logic</h4>
              {service.serviceLayerGuides.map((sg) => (
                <div key={sg.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{sg.operation}</span>
                    <Badge className="bg-amber-500/20 text-amber-300 font-mono text-[10px]">{sg.transactionBoundary}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{sg.explanation}</p>
                  <CodeBlock code={sg.javaCode} language="java" title="ServiceImpl.java" />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 6. EXCEPTIONS & TRANSACTIONS TAB */}
        <TabsContent value="exceptions" className="space-y-4 pt-3">
          <Card className="p-4 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Transaction Design & Concurrency Control</h4>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground">Isolation Level:</span>
                <p className="font-mono text-primary mt-0.5">{service.transactionDesign.isolation}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Propagation:</span>
                <p className="font-mono text-primary mt-0.5">{service.transactionDesign.propagation}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Concurrency Control:</span>
                <p className="font-mono text-foreground mt-0.5">{service.transactionDesign.concurrencyControl}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Rollback Policy:</span>
                <p className="text-muted-foreground mt-0.5">{service.transactionDesign.rollback}</p>
              </div>
            </div>
          </Card>

          {service.exceptionHandlers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Global Exception Handling</h4>
              {service.exceptionHandlers.map((ex) => (
                <CodeBlock key={ex.id} code={ex.handlerCode} language="java" title={ex.exceptionName} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 7. FAILURE SCENARIOS TAB */}
        <TabsContent value="failures" className="space-y-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {service.failureScenarios.map((fs) => (
              <Card key={fs.id} className="p-3.5 space-y-2 text-xs border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{fs.scenario}</span>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <p><strong>Problem:</strong> {fs.problem}</p>
                  <p><strong>Detection:</strong> {fs.detection}</p>
                  <p><strong>Handling:</strong> {fs.handling}</p>
                  <p><strong>Consistency:</strong> {fs.consistency}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 8. CHECKLIST TAB */}
        <TabsContent value="checklist" className="space-y-3 pt-3">
          <div className="space-y-2">
            {service.checklist.map((chk) => (
              <div
                key={chk.id}
                onClick={() => toggleChecklist(chk.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-xs font-medium cursor-pointer transition-all ${
                  chk.completed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-secondary/20 border-border/50 text-foreground hover:bg-secondary/40"
                }`}
              >
                {chk.completed ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                <span>{chk.label}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 9. CODE WORKSPACE TAB */}
        <TabsContent value="workspace" className="space-y-4 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New class/file name (e.g. OrderValidator.java)..."
              className="flex-1 rounded border border-border bg-secondary/40 px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
              value={newWorkspaceFileTitle}
              onChange={(e) => setNewWorkspaceFileTitle(e.target.value)}
            />
            <Button size="sm" className="text-xs" onClick={handleAddWorkspaceFile}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Code File
            </Button>
          </div>

          <div className="space-y-4">
            {service.codeWorkspace.map((cw, i) => (
              <div key={cw.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-primary">
                  <span>{cw.filename}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-red-400 hover:text-red-300"
                    onClick={() => {
                      const nextCw = service.codeWorkspace.filter((item) => item.id !== cw.id);
                      onUpdate({ ...service, codeWorkspace: nextCw });
                    }}
                  >
                    Delete File
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border border-border">
                  <MonacoEditor
                    height="240px"
                    language={cw.language || "java"}
                    theme="vs-dark"
                    value={cw.code}
                    onChange={(val) => {
                      const nextCw = [...service.codeWorkspace];
                      nextCw[i].code = val ?? "";
                      onUpdate({ ...service, codeWorkspace: nextCw });
                    }}
                    options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
