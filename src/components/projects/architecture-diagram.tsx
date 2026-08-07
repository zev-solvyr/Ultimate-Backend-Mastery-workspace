"use client";

import { motion } from "framer-motion";
import type { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Radio, Server } from "lucide-react";

interface ArchitectureDiagramProps {
  project: Project;
}

export function ArchitectureDiagram({ project }: ArchitectureDiagramProps) {
  const gateway = project.microservices.find((s) => s.name.includes("gateway"));
  const services = project.microservices.filter((s) => !s.name.includes("gateway"));
  const hasKafka = project.kafkaTopics.length > 0;
  const hasRedis = project.redisUsage.length > 0;

  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Microservice Architecture</CardTitle>
        <p className="text-xs text-muted-foreground">{project.microservices.length} services · {project.kafkaTopics.length} Kafka topics · {project.databases.length} databases</p>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-xl bg-secondary/30 border border-border/50 p-6 min-h-[320px]">
          {/* Client */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium">
              Client / Frontend
            </div>
          </motion.div>

          {/* Gateway */}
          {gateway && (
            <>
              <div className="flex justify-center mb-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <ServiceNode name={gateway.name} ports={gateway.ports} highlight />
              </motion.div>
            </>
          )}

          {/* Services grid */}
          <div className="flex justify-center mb-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {services.map((ms, i) => (
              <motion.div
                key={ms.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <ServiceNode name={ms.name} ports={ms.ports} />
              </motion.div>
            ))}
          </div>

          {/* Infrastructure layer */}
          <div className="flex justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border self-center" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Infrastructure</span>
            <div className="h-px flex-1 bg-border self-center" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {project.databases.slice(0, 3).map((db) => (
              <InfraNode key={db.name} icon={Database} label={db.name} sublabel="PostgreSQL" />
            ))}
            {hasRedis && <InfraNode icon={Server} label="Redis Cluster" sublabel="Cache / Sessions" />}
            {hasKafka && <InfraNode icon={Radio} label="Kafka" sublabel={`${project.kafkaTopics.length} topics`} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceNode({ name, ports, highlight }: { name: string; ports: number[]; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-3 text-center transition-all ${
        highlight
          ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/10"
          : "border-border/50 bg-card/80 hover:border-primary/20"
      }`}
    >
      <Server className={`h-4 w-4 mx-auto mb-1 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <p className="text-xs font-mono font-medium truncate">{name}</p>
      <Badge variant="outline" className="text-[9px] mt-1">{ports[0]}</Badge>
    </div>
  );
}

function InfraNode({ icon: Icon, label, sublabel }: { icon: React.ComponentType<{ className?: string }>; label: string; sublabel: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/60 px-4 py-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-emerald-400" />
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}
