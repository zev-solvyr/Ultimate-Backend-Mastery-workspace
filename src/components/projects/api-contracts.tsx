"use client";

import { useMemo, useState } from "react";
import type { DetailedApiContract, HttpMethod, Project } from "@/types";
import { useProjectGuide } from "@/hooks/use-project-guide";
import { getSeedApiContracts } from "@/data/commercex-seed-api";
import { ApiContractEditor } from "./api-contract-editor";
import { ApiContractPreview } from "./api-contract-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  FileCode2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
} from "lucide-react";

export function ApiContracts({ project }: { project: Project }) {
  const seed = useMemo(() => ({
    apiContractsDesign: getSeedApiContracts(project),
  }), [project]);

  const { guide, loaded, updateProjectGuide } = useProjectGuide(project.id, seed);

  // Normalize contracts list
  const contracts: DetailedApiContract[] = useMemo(() => {
    const rawDesign = guide.apiContractsDesign as { contracts?: DetailedApiContract[] } | undefined;
    if (rawDesign?.contracts && Array.isArray(rawDesign.contracts) && rawDesign.contracts.length > 0) {
      return rawDesign.contracts;
    }
    return seed.apiContractsDesign.contracts;
  }, [guide.apiContractsDesign, seed]);

  // List of CommerceX services for dropdown filter & editor
  const availableServices = useMemo(() => {
    const fromProject = project.microservices.map((m) => m.name);
    const defaults = [
      "API Gateway",
      "Auth Service",
      "Catalog Service",
      "Cart Service",
      "Inventory Service",
      "Order Service",
      "Payment Service",
      "Notification Service",
      "Fulfillment/Shipping Service",
    ];
    return Array.from(new Set([...fromProject, ...defaults]));
  }, [project]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [authFilter, setAuthFilter] = useState("ALL");
  const [commTypeFilter, setCommTypeFilter] = useState("ALL");

  // Modal / Expanded state
  const [editingContract, setEditingContract] = useState<DetailedApiContract | null | "NEW">(null);
  const [expandedContractIds, setExpandedContractIds] = useState<Record<string, boolean>>({});

  const saveContracts = (nextContracts: DetailedApiContract[]) => {
    updateProjectGuide({
      apiContractsDesign: { contracts: nextContracts },
    });
  };

  const handleSaveContract = (contract: DetailedApiContract) => {
    const exists = contracts.some((c) => c.id === contract.id);
    let next: DetailedApiContract[];
    if (exists) {
      next = contracts.map((c) => (c.id === contract.id ? contract : c));
    } else {
      next = [...contracts, contract];
    }
    saveContracts(next);
    setEditingContract(null);
  };

  const handleDeleteContract = (id: string) => {
    if (!window.confirm("Delete this API contract specification? This cannot be undone.")) return;
    const next = contracts.filter((c) => c.id !== id);
    saveContracts(next);
  };

  const handleDuplicateContract = (source: DetailedApiContract) => {
    const duplicated: DetailedApiContract = {
      ...JSON.parse(JSON.stringify(source)),
      id: crypto.randomUUID(),
      path: `${source.path}-copy`,
      purpose: `${source.purpose} (Copy)`,
    };
    saveContracts([...contracts, duplicated]);
  };

  const handleResetBlueprint = () => {
    if (window.confirm("Reset API Contracts to initial default specs? All custom API modifications will be lost.")) {
      const defaultDesign = getSeedApiContracts(project);
      saveContracts(defaultDesign.contracts);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedContractIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesSearch =
        searchTerm === "" ||
        c.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.module.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesService = serviceFilter === "ALL" || c.service === serviceFilter;
      const matchesMethod = methodFilter === "ALL" || c.method === methodFilter;
      const matchesAuth = authFilter === "ALL" || c.authentication === authFilter;
      const matchesComm = commTypeFilter === "ALL" || c.communicationType === commTypeFilter;

      return matchesSearch && matchesService && matchesMethod && matchesAuth && matchesComm;
    });
  }, [contracts, searchTerm, serviceFilter, methodFilter, authFilter, commTypeFilter]);

  // Group filtered contracts by service
  const groupedContracts = useMemo(() => {
    const groups: Record<string, DetailedApiContract[]> = {};
    filteredContracts.forEach((c) => {
      if (!groups[c.service]) groups[c.service] = [];
      groups[c.service].push(c);
    });
    return groups;
  }, [filteredContracts]);

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-primary" />
            API Contracts & Interface Specifications
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Production REST & Event API specifications, headers, DTO payloads, error status codes, and OpenAPI DDL previews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleResetBlueprint}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reset Blueprint
          </Button>
          <Button size="sm" className="text-xs" onClick={() => setEditingContract("NEW")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add API Contract
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <Card className="premium-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by path, purpose, service..."
              className="w-full rounded-md border border-border bg-secondary/40 pl-9 pr-3 py-2 text-xs focus:border-primary focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {/* Service Filter */}
            <select
              className="rounded border border-border bg-secondary/40 px-2 py-1.5 text-xs font-mono"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="ALL">All Services ({contracts.length})</option>
              {availableServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Method Filter */}
            <select
              className="rounded border border-border bg-secondary/40 px-2 py-1.5 text-xs font-mono"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            {/* Auth Filter */}
            <select
              className="rounded border border-border bg-secondary/40 px-2 py-1.5 text-xs"
              value={authFilter}
              onChange={(e) => setAuthFilter(e.target.value)}
            >
              <option value="ALL">All Auth</option>
              <option value="Public">Public</option>
              <option value="JWT">JWT</option>
              <option value="Service-to-Service">Service-to-Service</option>
            </select>
          </div>
        </div>
      </Card>

      {/* API LIST BY SERVICE GROUPS */}
      {Object.keys(groupedContracts).length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <FileCode2 className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
          <p className="text-sm font-medium">No matching API contracts found.</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting search filters or click <strong>+ Add API Contract</strong>.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedContracts).map(([serviceName, serviceApis]) => (
            <div key={serviceName} className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {serviceName}
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {serviceApis.length} APIs
                  </Badge>
                </h3>
              </div>

              <div className="space-y-3">
                {serviceApis.map((api) => {
                  const isExpanded = Boolean(expandedContractIds[api.id]);
                  return (
                    <Card
                      key={api.id}
                      className="premium-card overflow-hidden border-border/80 transition-all hover:border-primary/40"
                    >
                      <CardHeader
                        className="cursor-pointer p-4 hover:bg-secondary/20 transition-colors"
                        onClick={() => toggleExpand(api.id)}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <MethodBadge method={api.method} />
                            <span className="font-mono text-sm font-bold text-foreground">
                              {api.path}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">
                              {api.module}
                            </Badge>
                            {api.idempotency?.required && (
                              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                                IDEMPOTENT
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" /> {api.authentication}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleDuplicateContract(api)}
                              title="Duplicate API Contract"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => setEditingContract(api)}
                              title="Edit API Contract"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-400"
                              onClick={() => handleDeleteContract(api.id)}
                              title="Delete API Contract"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground"
                              onClick={() => toggleExpand(api.id)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">{api.purpose}</p>
                      </CardHeader>

                      {/* EXPANDABLE DETAILS */}
                      {isExpanded && (
                        <CardContent className="border-t border-border/50 bg-secondary/10 p-4 space-y-5 text-xs">
                          {/* Overview Details */}
                          <div className="grid gap-3 sm:grid-cols-3 bg-secondary/20 p-3 rounded-lg border border-border/40">
                            <div>
                              <span className="font-semibold text-muted-foreground">Auth Roles:</span>
                              <p className="font-mono text-primary mt-0.5">
                                {api.authorization.length > 0 ? api.authorization.join(", ") : "None required"}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-muted-foreground">Communication Type:</span>
                              <p className="font-mono text-foreground mt-0.5">{api.communicationType}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-muted-foreground">Version:</span>
                              <p className="font-mono text-foreground mt-0.5">{api.version || "v1"}</p>
                            </div>
                          </div>

                          {/* Headers & Parameters */}
                          {(api.requestHeaders.length > 0 || api.pathParameters.length > 0 || api.queryParameters.length > 0) && (
                            <div className="grid gap-4 sm:grid-cols-2">
                              {api.requestHeaders.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-muted-foreground mb-1.5">Headers</h4>
                                  <div className="space-y-1 font-mono text-[11px]">
                                    {api.requestHeaders.map((h) => (
                                      <div key={h.id} className="flex justify-between border-b border-border/30 pb-1">
                                        <span>{h.name}: <span className="text-primary">{h.value}</span></span>
                                        <span className="text-[10px] text-muted-foreground">{h.required ? "Required" : "Optional"}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {(api.pathParameters.length > 0 || api.queryParameters.length > 0) && (
                                <div>
                                  <h4 className="font-semibold text-muted-foreground mb-1.5">Parameters</h4>
                                  <div className="space-y-1 font-mono text-[11px]">
                                    {api.pathParameters.map((p) => (
                                      <div key={p.id} className="flex justify-between border-b border-border/30 pb-1">
                                        <span>{`{${p.name}}`} ({p.type})</span>
                                        <span className="text-emerald-400">Path</span>
                                      </div>
                                    ))}
                                    {api.queryParameters.map((q) => (
                                      <div key={q.id} className="flex justify-between border-b border-border/30 pb-1">
                                        <span>{q.name} ({q.type})</span>
                                        <span className="text-cyan-400">Query</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Downstream Dependencies */}
                          {api.downstreamDependencies.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-muted-foreground flex items-center gap-1.5">
                                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                                Downstream Service Dependencies
                              </h4>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {api.downstreamDependencies.map((dep) => (
                                  <div key={dep.id} className="rounded border border-border/50 bg-secondary/30 p-2.5 font-mono text-[11px]">
                                    <div className="flex justify-between text-foreground font-bold">
                                      <span>→ {dep.service}</span>
                                      <Badge variant="outline" className="text-[9px]">{dep.communicationType}</Badge>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">{dep.purpose}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Live Generated Contract & OpenAPI Preview */}
                          <div className="pt-2">
                            <ApiContractPreview api={api} />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Add/Edit Contract Editor */}
      {editingContract && (
        <ApiContractEditor
          initialContract={editingContract === "NEW" ? null : editingContract}
          services={availableServices}
          onSave={handleSaveContract}
          onCancel={() => setEditingContract(null)}
        />
      )}
    </div>
  );
}

// Method Badge visual helper
function MethodBadge({ method }: { method: HttpMethod }) {
  const styles: Record<HttpMethod, string> = {
    GET: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    POST: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    PATCH: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    DELETE: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  return (
    <span
      className={`inline-block w-16 text-center rounded border px-2 py-0.5 font-mono text-[11px] font-bold ${
        styles[method] ?? "bg-secondary text-foreground"
      }`}
    >
      {method}
    </span>
  );
}
