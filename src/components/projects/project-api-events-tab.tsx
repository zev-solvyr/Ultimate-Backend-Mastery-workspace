"use client";

import React, { useState } from "react";
import type { ProjectGuide, ProjectApiSpec, ProjectEventSpec } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Radio, Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectApiEventsTabProps {
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectApiEventsTab({ guide, onUpdate }: ProjectApiEventsTabProps) {
  const apis = guide.apiSpecs ?? [];
  const events = guide.eventSpecs ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [apiList, setApiList] = useState<ProjectApiSpec[]>(apis);
  const [eventList, setEventList] = useState<ProjectEventSpec[]>(events);

  const handleSave = () => {
    onUpdate({ apiSpecs: apiList, eventSpecs: eventList });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">API & Event Design Specifications</h2>
          <p className="text-xs text-muted-foreground">High-level REST API contracts and Kafka event schemas without controller/consumer implementation code.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) {
              setApiList(apis);
              setEventList(events);
            }
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit APIs & Events"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-6">
          {/* APIs Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">REST API Specifications</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setApiList([
                    ...apiList,
                    {
                      id: `api-${Date.now()}`,
                      method: "POST",
                      path: "/api/v1/resource",
                      purpose: "API purpose",
                      owner: "Service Name",
                      authentication: "JWT",
                      requestFields: ["field1"],
                      response: "{ status: 'OK' }",
                      importantErrors: ["BAD_REQUEST (400)"],
                      idempotencyRequired: true,
                      pagination: false,
                      downstreamDependencies: [],
                    },
                  ])
                }
                className="text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add API Spec
              </Button>
            </div>
            {apiList.map((api, idx) => (
              <Card key={idx} className="p-3 space-y-2 bg-muted/20 border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={api.method}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const next = [...apiList];
                      next[idx].method = e.target.value as any;
                      setApiList(next);
                    }}
                    className="h-8 px-2 border rounded text-xs bg-background text-foreground"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input
                    type="text"
                    value={api.path}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...apiList];
                      next[idx].path = e.target.value;
                      setApiList(next);
                    }}
                    placeholder="/api/v1/resource"
                    className="w-full px-2 py-1 border rounded font-mono text-xs bg-background text-foreground"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive shrink-0"
                    onClick={() => setApiList(apiList.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <input
                    type="text"
                    value={api.purpose}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...apiList];
                      next[idx].purpose = e.target.value;
                      setApiList(next);
                    }}
                    placeholder="Purpose"
                    className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                  <input
                    type="text"
                    value={api.owner}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...apiList];
                      next[idx].owner = e.target.value;
                      setApiList(next);
                    }}
                    placeholder="Owning Service"
                    className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                  <input
                    type="text"
                    value={api.authentication}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...apiList];
                      next[idx].authentication = e.target.value;
                      setApiList(next);
                    }}
                    placeholder="Auth (e.g. JWT)"
                    className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Events Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Kafka Event Specifications</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setEventList([
                    ...eventList,
                    {
                      id: `evt-${Date.now()}`,
                      name: "NewDomainEvent",
                      producer: "Producer Service",
                      consumers: ["Consumer Service"],
                      purpose: "Event purpose",
                      payloadFields: ["id", "timestamp"],
                      partitionKey: "id",
                      deliveryExpectations: "At-least-once",
                      businessImpact: "Impact explanation",
                    },
                  ])
                }
                className="text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Event Spec
              </Button>
            </div>
            {eventList.map((evt, idx) => (
              <Card key={idx} className="p-3 space-y-2 bg-muted/20 border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={evt.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...eventList];
                      next[idx].name = e.target.value;
                      setEventList(next);
                    }}
                    placeholder="Event Name"
                    className="w-full px-2 py-1 border rounded font-bold text-xs bg-background text-foreground"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive shrink-0"
                    onClick={() => setEventList(eventList.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <input
                    type="text"
                    value={evt.producer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...eventList];
                      next[idx].producer = e.target.value;
                      setEventList(next);
                    }}
                    placeholder="Producer Service"
                    className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                  <input
                    type="text"
                    value={evt.consumers.join(", ")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...eventList];
                      next[idx].consumers = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                      setEventList(next);
                    }}
                    placeholder="Consumers (comma separated)"
                    className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                  <input
                    type="text"
                    value={evt.purpose}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...eventList];
                      next[idx].purpose = e.target.value;
                      setEventList(next);
                    }}
                    placeholder="Purpose"
                    className="px-2 py-1 border rounded text-xs bg-background text-foreground"
                  />
                </div>
              </Card>
            ))}
          </div>

          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* REST APIs Card List */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> REST API Endpoint Specifications
              </CardTitle>
              <CardDescription className="text-xs">Exposed service REST endpoints, authentication requirements, and idempotency guarantees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiList.map((api, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="font-mono text-[10px] uppercase font-bold" variant={api.method === "GET" ? "secondary" : "default"}>
                        {api.method}
                      </Badge>
                      <span className="font-mono font-bold text-foreground text-sm">{api.path}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        Owner: {api.owner}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-500">
                        Auth: {api.authentication}
                      </Badge>
                      {api.idempotencyRequired && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          Idempotency Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{api.purpose}</p>
                  <div className="grid gap-2 sm:grid-cols-2 pt-1 border-t border-border/30 text-[11px]">
                    <div>
                      <span className="font-semibold text-foreground">Request Fields: </span>
                      <span className="font-mono text-muted-foreground">{api.requestFields.join(", ")}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Response Schema: </span>
                      <span className="font-mono text-muted-foreground">{api.response}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kafka Events Card List */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Radio className="h-4 w-4 text-purple-500" /> Kafka Domain Event Specifications
              </CardTitle>
              <CardDescription className="text-xs">Asynchronous domain event schemas, producers, consumers, and partition keys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventList.map((evt, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-purple-400" /> {evt.name}
                    </span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/40">
                        Producer: {evt.producer}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-400/40">
                        Consumers: {evt.consumers.join(", ")}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{evt.purpose}</p>
                  <div className="grid gap-2 sm:grid-cols-3 pt-1 border-t border-border/30 text-[11px]">
                    <div>
                      <span className="font-semibold text-foreground">Payload Fields: </span>
                      <span className="font-mono text-muted-foreground">{evt.payloadFields.join(", ")}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Partition Key: </span>
                      <span className="font-mono text-muted-foreground">{evt.partitionKey}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Business Impact: </span>
                      <span className="text-muted-foreground">{evt.businessImpact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
