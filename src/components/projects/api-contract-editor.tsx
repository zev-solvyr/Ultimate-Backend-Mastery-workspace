"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type {
  ApiAuthType,
  ApiCommunicationType,
  ApiDependencyItem,
  ApiErrorResponseItem,
  ApiHeader,
  ApiParameter,
  ApiQueryParameter,
  ApiResponseItem,
  ApiValidationRuleItem,
  DetailedApiContract,
  HttpMethod,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, X } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface ApiContractEditorProps {
  initialContract?: DetailedApiContract | null;
  services: string[];
  onSave: (contract: DetailedApiContract) => void;
  onCancel: () => void;
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const AUTH_TYPES: ApiAuthType[] = ["Public", "JWT", "Service-to-Service", "OAuth2", "Internal"];
const COMM_TYPES: ApiCommunicationType[] = ["SYNC REST", "ASYNC EVENT"];

export function ApiContractEditor({
  initialContract,
  services,
  onSave,
  onCancel,
}: ApiContractEditorProps) {
  const isEdit = Boolean(initialContract?.id);

  const [contract, setContract] = useState<DetailedApiContract>(() => {
    if (initialContract) return JSON.parse(JSON.stringify(initialContract));
    return {
      id: crypto.randomUUID(),
      service: services[0] || "Order Service",
      module: "Order Processing",
      method: "POST",
      path: "/api/v1/orders",
      purpose: "Create a new order",
      description: "Handles customer checkout and initiates order fulfillment saga.",
      authentication: "JWT",
      authorization: ["ROLE_CUSTOMER"],
      idempotency: {
        required: true,
        headerName: "Idempotency-Key",
        storageStrategy: "Redis",
        conflictBehavior: "Return previously cached response",
        ttl: "24 hours",
        notes: "Deduplicates checkout requests.",
      },
      requestHeaders: [
        { id: crypto.randomUUID(), name: "Authorization", value: "Bearer <JWT>", required: true, description: "Customer JWT token" },
        { id: crypto.randomUUID(), name: "Idempotency-Key", value: "<UUID>", required: true, description: "Request deduplication key" },
      ],
      pathParameters: [],
      queryParameters: [],
      requestBody: {
        contentType: "application/json",
        jsonExample: JSON.stringify({ items: [{ productId: "prod-101", quantity: 2 }] }, null, 2),
        description: "Order payload",
      },
      responses: [
        {
          id: crypto.randomUUID(),
          statusCode: 201,
          description: "Order created successfully",
          contentType: "application/json",
          jsonExample: JSON.stringify({ orderId: "ord-123", status: "CREATED", totalAmount: 239.98 }, null, 2),
        },
      ],
      errorResponses: [
        {
          id: crypto.randomUUID(),
          statusCode: 400,
          errorCode: "INVALID_REQUEST",
          message: "Invalid order parameters",
          description: "Validation error",
          retryable: false,
          example: JSON.stringify({ timestamp: "2026-08-10T10:00:00Z", status: 400, code: "INVALID_REQUEST", message: "Invalid payload" }, null, 2),
        },
      ],
      validationRules: [
        { id: crypto.randomUUID(), field: "items", rule: "NotEmpty", value: "1", message: "Items cannot be empty" },
      ],
      pagination: {
        enabled: false,
        pageParam: "page",
        sizeParam: "size",
        sortParam: "sort",
        defaultSize: 20,
        maxSize: 100,
      },
      downstreamDependencies: [],
      communicationType: "SYNC REST",
      version: "v1",
      notes: "",
    };
  });

  const [authRolesInput, setAuthRolesInput] = useState(() => contract.authorization.join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract.path.trim() || !contract.service.trim()) return;

    onSave({
      ...contract,
      path: contract.path.trim(),
      authorization: authRolesInput.split(",").map((r) => r.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <Card className="w-full max-w-4xl border-border bg-card shadow-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <CardTitle className="text-lg">
            {isEdit ? `Edit API Contract (${contract.method} ${contract.path})` : "Add API Contract Specification"}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="pt-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <Tabs defaultValue="overview">
              <TabsList className="h-auto flex-wrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="request">Request Spec</TabsTrigger>
                <TabsTrigger value="responses">Responses ({contract.responses.length})</TabsTrigger>
                <TabsTrigger value="errors">Errors ({contract.errorResponses.length})</TabsTrigger>
                <TabsTrigger value="validation">Validation & Auth</TabsTrigger>
                <TabsTrigger value="idempotency">Idempotency & Paging</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies ({contract.downstreamDependencies.length})</TabsTrigger>
              </TabsList>

              {/* 1. OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-3 pt-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1 text-xs font-medium">
                    <span>Owning Service *</span>
                    <select
                      className="rounded border border-border bg-secondary/40 p-2 text-xs font-mono"
                      value={contract.service}
                      onChange={(e) => setContract({ ...contract, service: e.target.value })}
                    >
                      {services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-xs font-medium">
                    <span>Module / Domain</span>
                    <input
                      type="text"
                      className="rounded border border-border bg-secondary/40 p-2 text-xs"
                      value={contract.module}
                      onChange={(e) => setContract({ ...contract, module: e.target.value })}
                      placeholder="e.g. Order Processing"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-medium">
                    <span>HTTP Method *</span>
                    <select
                      className="rounded border border-border bg-secondary/40 p-2 text-xs font-mono"
                      value={contract.method}
                      onChange={(e) => setContract({ ...contract, method: e.target.value as HttpMethod })}
                    >
                      {HTTP_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1 text-xs font-medium sm:col-span-2">
                    <span>Endpoint Path *</span>
                    <input
                      type="text"
                      required
                      className="rounded border border-border bg-secondary/40 p-2 text-xs font-mono"
                      value={contract.path}
                      onChange={(e) => setContract({ ...contract, path: e.target.value })}
                      placeholder="/api/v1/orders"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-medium">
                    <span>API Version</span>
                    <input
                      type="text"
                      className="rounded border border-border bg-secondary/40 p-2 text-xs font-mono"
                      value={contract.version}
                      onChange={(e) => setContract({ ...contract, version: e.target.value })}
                      placeholder="v1"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-medium">
                    <span>Communication Type</span>
                    <select
                      className="rounded border border-border bg-secondary/40 p-2 text-xs"
                      value={contract.communicationType}
                      onChange={(e) =>
                        setContract({ ...contract, communicationType: e.target.value as ApiCommunicationType })
                      }
                    >
                      {COMM_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-xs font-medium">
                    <span>Purpose Summary</span>
                    <input
                      type="text"
                      className="rounded border border-border bg-secondary/40 p-2 text-xs"
                      value={contract.purpose}
                      onChange={(e) => setContract({ ...contract, purpose: e.target.value })}
                      placeholder="Brief one-line summary"
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-xs font-medium">
                  <span>Detailed Description</span>
                  <textarea
                    rows={3}
                    className="rounded border border-border bg-secondary/40 p-2 text-xs"
                    value={contract.description}
                    onChange={(e) => setContract({ ...contract, description: e.target.value })}
                    placeholder="Full explanation of execution behavior..."
                  />
                </label>
              </TabsContent>

              {/* 2. REQUEST SPEC TAB */}
              <TabsContent value="request" className="space-y-4 pt-3">
                {/* Headers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Request Headers</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() =>
                        setContract({
                          ...contract,
                          requestHeaders: [
                            ...contract.requestHeaders,
                            { id: crypto.randomUUID(), name: "", value: "", required: true, description: "" },
                          ],
                        })
                      }
                    >
                      + Add Header
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {contract.requestHeaders.map((h, i) => (
                      <div key={h.id} className="flex flex-wrap items-center gap-2 rounded border border-border/50 bg-secondary/20 p-2 text-xs">
                        <input
                          placeholder="Header Name"
                          className="flex-1 min-w-[120px] rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={h.name}
                          onChange={(e) => {
                            const next = [...contract.requestHeaders];
                            next[i].name = e.target.value;
                            setContract({ ...contract, requestHeaders: next });
                          }}
                        />
                        <input
                          placeholder="Value / Example"
                          className="flex-1 min-w-[120px] rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={h.value}
                          onChange={(e) => {
                            const next = [...contract.requestHeaders];
                            next[i].value = e.target.value;
                            setContract({ ...contract, requestHeaders: next });
                          }}
                        />
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={h.required}
                            onChange={(e) => {
                              const next = [...contract.requestHeaders];
                              next[i].required = e.target.checked;
                              setContract({ ...contract, requestHeaders: next });
                            }}
                          />
                          <span>Required</span>
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400"
                          onClick={() => {
                            setContract({
                              ...contract,
                              requestHeaders: contract.requestHeaders.filter((item) => item.id !== h.id),
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Path Parameters */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Path Parameters</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() =>
                        setContract({
                          ...contract,
                          pathParameters: [
                            ...contract.pathParameters,
                            { id: crypto.randomUUID(), name: "", type: "UUID", required: true, description: "", example: "" },
                          ],
                        })
                      }
                    >
                      + Add Path Parameter
                    </Button>
                  </div>

                  {contract.pathParameters.map((p, i) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-2 rounded border border-border/50 bg-secondary/20 p-2 text-xs">
                      <input
                        placeholder="Parameter Name"
                        className="w-28 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={p.name}
                        onChange={(e) => {
                          const next = [...contract.pathParameters];
                          next[i].name = e.target.value;
                          setContract({ ...contract, pathParameters: next });
                        }}
                      />
                      <input
                        placeholder="Type"
                        className="w-24 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={p.type}
                        onChange={(e) => {
                          const next = [...contract.pathParameters];
                          next[i].type = e.target.value;
                          setContract({ ...contract, pathParameters: next });
                        }}
                      />
                      <input
                        placeholder="Example"
                        className="w-28 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={p.example}
                        onChange={(e) => {
                          const next = [...contract.pathParameters];
                          next[i].example = e.target.value;
                          setContract({ ...contract, pathParameters: next });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400"
                        onClick={() => {
                          setContract({
                            ...contract,
                            pathParameters: contract.pathParameters.filter((item) => item.id !== p.id),
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Query Parameters */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Query Parameters</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() =>
                        setContract({
                          ...contract,
                          queryParameters: [
                            ...contract.queryParameters,
                            { id: crypto.randomUUID(), name: "", type: "String", required: false, description: "", example: "" },
                          ],
                        })
                      }
                    >
                      + Add Query Parameter
                    </Button>
                  </div>

                  {contract.queryParameters.map((q, i) => (
                    <div key={q.id} className="flex flex-wrap items-center gap-2 rounded border border-border/50 bg-secondary/20 p-2 text-xs">
                      <input
                        placeholder="Name"
                        className="w-28 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={q.name}
                        onChange={(e) => {
                          const next = [...contract.queryParameters];
                          next[i].name = e.target.value;
                          setContract({ ...contract, queryParameters: next });
                        }}
                      />
                      <input
                        placeholder="Type"
                        className="w-24 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={q.type}
                        onChange={(e) => {
                          const next = [...contract.queryParameters];
                          next[i].type = e.target.value;
                          setContract({ ...contract, queryParameters: next });
                        }}
                      />
                      <input
                        placeholder="Default Value"
                        className="w-28 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={q.defaultValue ?? ""}
                        onChange={(e) => {
                          const next = [...contract.queryParameters];
                          next[i].defaultValue = e.target.value;
                          setContract({ ...contract, queryParameters: next });
                        }}
                      />
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => {
                            const next = [...contract.queryParameters];
                            next[i].required = e.target.checked;
                            setContract({ ...contract, queryParameters: next });
                          }}
                        />
                        <span>Required</span>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400"
                        onClick={() => {
                          setContract({
                            ...contract,
                            queryParameters: contract.queryParameters.filter((item) => item.id !== q.id),
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Request Body Editor */}
                {contract.method !== "GET" && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <span className="text-xs font-semibold">Request Body (JSON Example)</span>
                    <div className="overflow-hidden rounded-md border border-border">
                      <MonacoEditor
                        height="180px"
                        language="json"
                        theme="vs-dark"
                        value={contract.requestBody.jsonExample}
                        onChange={(val) =>
                          setContract({
                            ...contract,
                            requestBody: { ...contract.requestBody, jsonExample: val ?? "" },
                          })
                        }
                        options={{
                          fontSize: 12,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          lineNumbers: "on",
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* 3. RESPONSES TAB */}
              <TabsContent value="responses" className="space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Success Responses</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() =>
                      setContract({
                        ...contract,
                        responses: [
                          ...contract.responses,
                          {
                            id: crypto.randomUUID(),
                            statusCode: 200,
                            description: "OK",
                            contentType: "application/json",
                            jsonExample: "{\n  \"status\": \"success\"\n}",
                          },
                        ],
                      })
                    }
                  >
                    + Add Response
                  </Button>
                </div>

                {contract.responses.map((res, i) => (
                  <Card key={res.id} className="p-3 bg-secondary/10 border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 rounded border border-border bg-secondary/40 p-1 font-mono text-xs"
                        value={res.statusCode}
                        onChange={(e) => {
                          const next = [...contract.responses];
                          next[i].statusCode = Number(e.target.value);
                          setContract({ ...contract, responses: next });
                        }}
                      />
                      <input
                        placeholder="Description (e.g. Order Created)"
                        className="flex-1 rounded border border-border bg-secondary/40 p-1 text-xs"
                        value={res.description}
                        onChange={(e) => {
                          const next = [...contract.responses];
                          next[i].description = e.target.value;
                          setContract({ ...contract, responses: next });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400"
                        onClick={() => {
                          setContract({
                            ...contract,
                            responses: contract.responses.filter((item) => item.id !== res.id),
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-md border border-border">
                      <MonacoEditor
                        height="140px"
                        language="json"
                        theme="vs-dark"
                        value={res.jsonExample}
                        onChange={(val) => {
                          const next = [...contract.responses];
                          next[i].jsonExample = val ?? "";
                          setContract({ ...contract, responses: next });
                        }}
                        options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
                      />
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* 4. ERRORS TAB */}
              <TabsContent value="errors" className="space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Error Responses & Exceptions</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() =>
                      setContract({
                        ...contract,
                        errorResponses: [
                          ...contract.errorResponses,
                          {
                            id: crypto.randomUUID(),
                            statusCode: 400,
                            errorCode: "BAD_REQUEST",
                            message: "Bad request error",
                            description: "Validation failure",
                            retryable: false,
                            example: "{\n  \"status\": 400,\n  \"code\": \"BAD_REQUEST\",\n  \"message\": \"Invalid input\"\n}",
                          },
                        ],
                      })
                    }
                  >
                    + Add Error Response
                  </Button>
                </div>

                {contract.errorResponses.map((err, i) => (
                  <Card key={err.id} className="p-3 bg-secondary/10 border-border/50 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        className="w-16 rounded border border-border bg-secondary/40 p-1 font-mono text-xs"
                        value={err.statusCode}
                        onChange={(e) => {
                          const next = [...contract.errorResponses];
                          next[i].statusCode = Number(e.target.value);
                          setContract({ ...contract, errorResponses: next });
                        }}
                      />
                      <input
                        placeholder="Error Code (e.g. IDEMPOTENCY_CONFLICT)"
                        className="w-48 rounded border border-border bg-secondary/40 p-1 font-mono text-xs"
                        value={err.errorCode}
                        onChange={(e) => {
                          const next = [...contract.errorResponses];
                          next[i].errorCode = e.target.value;
                          setContract({ ...contract, errorResponses: next });
                        }}
                      />
                      <input
                        placeholder="Message"
                        className="flex-1 min-w-[140px] rounded border border-border bg-secondary/40 p-1 text-xs"
                        value={err.message}
                        onChange={(e) => {
                          const next = [...contract.errorResponses];
                          next[i].message = e.target.value;
                          setContract({ ...contract, errorResponses: next });
                        }}
                      />
                      <label className="flex items-center gap-1 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={err.retryable}
                          onChange={(e) => {
                            const next = [...contract.errorResponses];
                            next[i].retryable = e.target.checked;
                            setContract({ ...contract, errorResponses: next });
                          }}
                        />
                        <span>Retryable</span>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400"
                        onClick={() => {
                          setContract({
                            ...contract,
                            errorResponses: contract.errorResponses.filter((item) => item.id !== err.id),
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-md border border-border">
                      <MonacoEditor
                        height="120px"
                        language="json"
                        theme="vs-dark"
                        value={err.example}
                        onChange={(val) => {
                          const next = [...contract.errorResponses];
                          next[i].example = val ?? "";
                          setContract({ ...contract, errorResponses: next });
                        }}
                        options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
                      />
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* 5. VALIDATION & AUTH TAB */}
              <TabsContent value="validation" className="space-y-4 pt-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-medium">
                    <span>Authentication Scheme</span>
                    <select
                      className="rounded border border-border bg-secondary/40 p-2 text-xs"
                      value={contract.authentication}
                      onChange={(e) =>
                        setContract({ ...contract, authentication: e.target.value as ApiAuthType })
                      }
                    >
                      {AUTH_TYPES.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-xs font-medium">
                    <span>Authorization Roles (comma-separated)</span>
                    <input
                      type="text"
                      className="rounded border border-border bg-secondary/40 p-2 text-xs font-mono"
                      value={authRolesInput}
                      onChange={(e) => setAuthRolesInput(e.target.value)}
                      placeholder="ROLE_CUSTOMER, ROLE_ADMIN"
                    />
                  </label>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Validation Rules</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() =>
                        setContract({
                          ...contract,
                          validationRules: [
                            ...contract.validationRules,
                            { id: crypto.randomUUID(), field: "", rule: "NotEmpty", value: "1", message: "" },
                          ],
                        })
                      }
                    >
                      + Add Validation Rule
                    </Button>
                  </div>

                  {contract.validationRules.map((v, i) => (
                    <div key={v.id} className="flex flex-wrap items-center gap-2 rounded border border-border/50 bg-secondary/20 p-2 text-xs">
                      <input
                        placeholder="Field Name"
                        className="w-28 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={v.field}
                        onChange={(e) => {
                          const next = [...contract.validationRules];
                          next[i].field = e.target.value;
                          setContract({ ...contract, validationRules: next });
                        }}
                      />
                      <input
                        placeholder="Rule (e.g. MinSize)"
                        className="w-28 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={v.rule}
                        onChange={(e) => {
                          const next = [...contract.validationRules];
                          next[i].rule = e.target.value;
                          setContract({ ...contract, validationRules: next });
                        }}
                      />
                      <input
                        placeholder="Value / Constraint"
                        className="w-24 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                        value={v.value}
                        onChange={(e) => {
                          const next = [...contract.validationRules];
                          next[i].value = e.target.value;
                          setContract({ ...contract, validationRules: next });
                        }}
                      />
                      <input
                        placeholder="Error Message"
                        className="flex-1 min-w-[120px] rounded border border-border bg-secondary/40 p-1.5"
                        value={v.message}
                        onChange={(e) => {
                          const next = [...contract.validationRules];
                          next[i].message = e.target.value;
                          setContract({ ...contract, validationRules: next });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400"
                        onClick={() => {
                          setContract({
                            ...contract,
                            validationRules: contract.validationRules.filter((item) => item.id !== v.id),
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* 6. IDEMPOTENCY & PAGINATION TAB */}
              <TabsContent value="idempotency" className="space-y-4 pt-3">
                <Card className="p-3 bg-secondary/10 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contract.idempotency.required}
                      onChange={(e) =>
                        setContract({
                          ...contract,
                          idempotency: { ...contract.idempotency, required: e.target.checked },
                        })
                      }
                    />
                    <span>Idempotency Key Required for this Endpoint</span>
                  </label>

                  {contract.idempotency.required && (
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <label className="grid gap-1">
                        <span>Header Name</span>
                        <input
                          className="rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={contract.idempotency.headerName}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              idempotency: { ...contract.idempotency, headerName: e.target.value },
                            })
                          }
                        />
                      </label>
                      <label className="grid gap-1">
                        <span>Storage Strategy</span>
                        <input
                          className="rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={contract.idempotency.storageStrategy}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              idempotency: { ...contract.idempotency, storageStrategy: e.target.value },
                            })
                          }
                        />
                      </label>
                      <label className="grid gap-1">
                        <span>Conflict Behavior</span>
                        <input
                          className="rounded border border-border bg-secondary/40 p-1.5"
                          value={contract.idempotency.conflictBehavior}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              idempotency: { ...contract.idempotency, conflictBehavior: e.target.value },
                            })
                          }
                        />
                      </label>
                      <label className="grid gap-1">
                        <span>TTL Deadline</span>
                        <input
                          className="rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={contract.idempotency.ttl}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              idempotency: { ...contract.idempotency, ttl: e.target.value },
                            })
                          }
                        />
                      </label>
                    </div>
                  )}
                </Card>

                <Card className="p-3 bg-secondary/10 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contract.pagination.enabled}
                      onChange={(e) =>
                        setContract({
                          ...contract,
                          pagination: { ...contract.pagination, enabled: e.target.checked },
                        })
                      }
                    />
                    <span>Pagination Enabled for Collection Endpoint</span>
                  </label>

                  {contract.pagination.enabled && (
                    <div className="grid gap-3 sm:grid-cols-3 text-xs">
                      <label className="grid gap-1">
                        <span>Page Param</span>
                        <input
                          className="rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={contract.pagination.pageParam}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              pagination: { ...contract.pagination, pageParam: e.target.value },
                            })
                          }
                        />
                      </label>
                      <label className="grid gap-1">
                        <span>Size Param</span>
                        <input
                          className="rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={contract.pagination.sizeParam}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              pagination: { ...contract.pagination, sizeParam: e.target.value },
                            })
                          }
                        />
                      </label>
                      <label className="grid gap-1">
                        <span>Sort Param</span>
                        <input
                          className="rounded border border-border bg-secondary/40 p-1.5 font-mono"
                          value={contract.pagination.sortParam}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              pagination: { ...contract.pagination, sortParam: e.target.value },
                            })
                          }
                        />
                      </label>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* 7. DEPENDENCIES TAB */}
              <TabsContent value="dependencies" className="space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Downstream Microservice Dependencies</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() =>
                      setContract({
                        ...contract,
                        downstreamDependencies: [
                          ...contract.downstreamDependencies,
                          {
                            id: crypto.randomUUID(),
                            service: services[0] || "Inventory Service",
                            communicationType: "SYNC",
                            purpose: "Validation",
                            timeout: "3000ms",
                            retryable: true,
                            notes: "",
                          },
                        ],
                      })
                    }
                  >
                    + Add Dependency
                  </Button>
                </div>

                {contract.downstreamDependencies.map((dep, i) => (
                  <div key={dep.id} className="flex flex-wrap items-center gap-2 rounded border border-border/50 bg-secondary/20 p-2.5 text-xs">
                    <select
                      className="w-36 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                      value={dep.service}
                      onChange={(e) => {
                        const next = [...contract.downstreamDependencies];
                        next[i].service = e.target.value;
                        setContract({ ...contract, downstreamDependencies: next });
                      }}
                    >
                      {services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <select
                      className="w-24 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                      value={dep.communicationType}
                      onChange={(e) => {
                        const next = [...contract.downstreamDependencies];
                        next[i].communicationType = e.target.value as "SYNC" | "ASYNC";
                        setContract({ ...contract, downstreamDependencies: next });
                      }}
                    >
                      <option value="SYNC">SYNC</option>
                      <option value="ASYNC">ASYNC</option>
                    </select>

                    <input
                      placeholder="Purpose"
                      className="flex-1 min-w-[120px] rounded border border-border bg-secondary/40 p-1.5"
                      value={dep.purpose}
                      onChange={(e) => {
                        const next = [...contract.downstreamDependencies];
                        next[i].purpose = e.target.value;
                        setContract({ ...contract, downstreamDependencies: next });
                      }}
                    />

                    <input
                      placeholder="Timeout"
                      className="w-20 rounded border border-border bg-secondary/40 p-1.5 font-mono"
                      value={dep.timeout}
                      onChange={(e) => {
                        const next = [...contract.downstreamDependencies];
                        next[i].timeout = e.target.value;
                        setContract({ ...contract, downstreamDependencies: next });
                      }}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400"
                      onClick={() => {
                        setContract({
                          ...contract,
                          downstreamDependencies: contract.downstreamDependencies.filter((item) => item.id !== dep.id),
                        });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save API Contract
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
