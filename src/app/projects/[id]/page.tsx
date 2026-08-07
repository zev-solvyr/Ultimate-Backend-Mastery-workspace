"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProjectById } from "@/lib/data";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Server, Database, Radio, Shield, Cloud, Workflow, Activity, TestTube } from "lucide-react";
import { ArchitectureDiagram } from "@/components/projects/architecture-diagram";
import { notFound } from "next/navigation";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = getProjectById(id);
  const { state, completeMilestone } = useProgress();

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold" style={{ color: project.color }}>{project.name}</h1>
        <p className="text-muted-foreground mt-1">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge>{project.difficulty}</Badge>
          <Badge variant="outline">{project.estimatedDuration}</Badge>
          {project.techStack.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
        </div>
      </motion.div>

      <Tabs defaultValue="architecture" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="microservices">Microservices</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="events">Events & Kafka</TabsTrigger>
          <TabsTrigger value="apis">API Contracts</TabsTrigger>
          <TabsTrigger value="redis">Redis</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-4">
          <ArchitectureDiagram project={project} />
          <Card>
            <CardHeader><CardTitle>Folder Structure</CardTitle></CardHeader>
            <CardContent>
              <div className="font-mono text-sm space-y-1">
                {project.folderStructure.map((f) => (
                  <div key={f.path} className="flex gap-4 py-1 border-b border-border/30 last:border-0">
                    <span className="text-primary shrink-0">{f.path}</span>
                    <span className="text-muted-foreground">{f.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Event Flows</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {project.eventFlows.map((flow) => (
                <div key={flow.name}>
                  <h4 className="font-semibold text-sm">{flow.name}</h4>
                  <ol className="mt-2 space-y-1">
                    {flow.steps.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary font-mono text-xs">{i + 1}.</span>{step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="microservices">
          <div className="grid gap-4 sm:grid-cols-2">
            {project.microservices.map((ms) => (
              <Card key={ms.name}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="h-4 w-4" /> {ms.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{ms.description}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-1">{ms.tech.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                  <p className="text-xs text-muted-foreground">Ports: {ms.ports.join(", ")}</p>
                  <ul className="text-xs space-y-0.5">{ms.responsibilities.map((r) => <li key={r}>• {r}</li>)}</ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database">
          <div className="grid gap-4">
            {project.databases.map((db) => (
              <Card key={db.name}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> {db.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{db.description}</p>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-2">Column</th><th>Type</th><th>Constraints</th></tr></thead>
                    <tbody>
                      {db.columns.map((col) => (
                        <tr key={col.name} className="border-t border-border/30">
                          <td className="py-1.5 font-mono text-primary">{col.name}</td>
                          <td className="py-1.5">{col.type}</td>
                          <td className="py-1.5 text-muted-foreground">{col.constraints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {db.indexes && db.indexes.length > 0 && (
                    <div className="mt-2 flex gap-1">{db.indexes.map((idx) => <Badge key={idx} variant="outline" className="text-[10px] font-mono">{idx}</Badge>)}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="grid gap-4 sm:grid-cols-2">
            {project.kafkaTopics.map((topic) => (
              <Card key={topic.name}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Radio className="h-4 w-4" /> {topic.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div><span className="text-muted-foreground">Producers:</span> {topic.producers.join(", ")}</div>
                  <div><span className="text-muted-foreground">Consumers:</span> {topic.consumers.join(", ")}</div>
                  <pre className="rounded bg-secondary/50 p-2 font-mono overflow-x-auto">{topic.schema}</pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apis">
          <div className="space-y-4">
            {project.apiContracts.map((api) => (
              <Card key={`${api.service}-${api.endpoint}`}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge>{api.method}</Badge>
                    <CardTitle className="text-base font-mono">{api.endpoint}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">{api.service} — {api.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2 text-xs">
                  {api.request && <div><p className="text-muted-foreground mb-1">Request</p><pre className="rounded bg-secondary/50 p-2 font-mono">{api.request}</pre></div>}
                  {api.response && <div><p className="text-muted-foreground mb-1">Response</p><pre className="rounded bg-secondary/50 p-2 font-mono">{api.response}</pre></div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="redis">
          <div className="grid gap-4 sm:grid-cols-2">
            {project.redisUsage.map((r) => (
              <Card key={r.key}>
                <CardContent className="pt-6 space-y-1">
                  <p className="font-mono text-sm text-primary">{r.key}</p>
                  <div className="flex gap-2"><Badge variant="secondary">{r.pattern}</Badge><Badge variant="outline">TTL: {r.ttl}</Badge></div>
                  <p className="text-xs text-muted-foreground">{r.purpose}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-3">
            {project.securityArchitecture.map((s) => (
              <Card key={s.layer}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{s.layer}</p>
                    <p className="text-sm text-muted-foreground">{s.implementation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deployment">
          <div className="space-y-3">
            {project.deploymentArchitecture.map((d) => (
              <Card key={d.component}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <Cloud className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{d.component}</p>
                    <p className="text-sm text-muted-foreground">{d.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cicd">
          <div className="space-y-3">
            {project.cicdPipeline.map((stage, i) => (
              <Card key={stage.stage}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">{i + 1}</div>
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-2"><Workflow className="h-4 w-4" /> {stage.stage}</p>
                    <div className="flex gap-1 mt-1">{stage.tools.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid gap-4 sm:grid-cols-2">
            {project.monitoringStack.map((m) => (
              <Card key={m.tool}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> {m.tool}</CardTitle>
                  <p className="text-xs text-muted-foreground">{m.purpose}</p>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-0.5">{m.metrics.map((metric) => <li key={metric}>• {metric}</li>)}</ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing">
          <div className="space-y-3">
            {project.testingStrategy.map((t) => (
              <Card key={t.type}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <TestTube className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{t.type}</p>
                    <div className="flex gap-1 mt-1">{t.tools.map((tool) => <Badge key={tool} variant="secondary" className="text-[10px]">{tool}</Badge>)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Coverage: {t.coverage}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="space-y-4">
            {project.milestones.map((m) => {
              const done = state.completedMilestones.includes(m.id);
              return (
                <Card key={m.id} className={done ? "border-success/30" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {done && <CheckCircle2 className="h-4 w-4 text-success" />}
                          Milestone {m.order}: {m.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                      </div>
                      <Badge variant="outline">{m.estimatedWeeks}w</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                      <p className="text-xs text-muted-foreground">Resume Line</p>
                      <p className="text-sm italic">&ldquo;{m.resumeLine}&rdquo;</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deliverables</p>
                      <div className="flex flex-wrap gap-1">{m.deliverables.map((d) => <Badge key={d} variant="secondary">{d}</Badge>)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Unlocks Topics</p>
                      <div className="flex flex-wrap gap-1">{m.unlockedTopics.map((t) => (
                        <Link key={t} href={`/roadmap/topic/${t}`}><Badge variant="outline" className="hover:bg-primary/10">{t}</Badge></Link>
                      ))}</div>
                    </div>
                    {!done && (
                      <Button size="sm" onClick={() => completeMilestone(m.id)}>Complete Milestone (+100 XP)</Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
