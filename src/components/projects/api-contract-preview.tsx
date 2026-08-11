"use client";

import { useMemo, useState } from "react";
import type { DetailedApiContract } from "@/types";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiContractPreviewProps {
  api: DetailedApiContract;
}

export function ApiContractPreview({ api }: ApiContractPreviewProps) {
  const contractText = useMemo(() => generateContractText(api), [api]);
  const openApiYaml = useMemo(() => generateOpenApiYaml(api), [api]);

  return (
    <div className="space-y-3">
      <Tabs defaultValue="contract">
        <div className="flex items-center justify-between">
          <TabsList className="h-8">
            <TabsTrigger value="contract" className="text-xs py-1">HTTP Contract</TabsTrigger>
            <TabsTrigger value="openapi" className="text-xs py-1">OpenAPI 3.0 YAML</TabsTrigger>
          </TabsList>
          <span className="text-[10px] font-mono text-muted-foreground">Auto-generated contract preview</span>
        </div>

        <TabsContent value="contract" className="mt-2">
          <CodeBlock code={contractText} language="sql" title={`${api.method} ${api.path}`} />
        </TabsContent>

        <TabsContent value="openapi" className="mt-2">
          <CodeBlock code={openApiYaml} language="yaml" title={`OpenAPI 3.0: ${api.path}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function generateContractText(api: DetailedApiContract): string {
  const lines: string[] = [];

  lines.push(`==================================================`);
  lines.push(`${api.method} ${api.path} (v${api.version || "1"})`);
  lines.push(`Service: ${api.service} | Module: ${api.module}`);
  lines.push(`Communication: ${api.communicationType} | Auth: ${api.authentication}`);
  if (api.authorization.length > 0) {
    lines.push(`Authorization Roles: ${api.authorization.join(", ")}`);
  }
  lines.push(`Purpose: ${api.purpose}`);
  lines.push(`==================================================\n`);

  // Headers
  lines.push(`--- REQUEST HEADERS ---`);
  if (api.requestHeaders.length === 0) {
    lines.push(`None\n`);
  } else {
    api.requestHeaders.forEach((h) => {
      lines.push(`${h.name}: ${h.value}${h.required ? " (Required)" : ""} - ${h.description}`);
    });
    lines.push(``);
  }

  // Path parameters
  if (api.pathParameters.length > 0) {
    lines.push(`--- PATH PARAMETERS ---`);
    api.pathParameters.forEach((p) => {
      lines.push(`{${p.name}} (${p.type}): ${p.description} (e.g. ${p.example})`);
    });
    lines.push(``);
  }

  // Query parameters
  if (api.queryParameters.length > 0) {
    lines.push(`--- QUERY PARAMETERS ---`);
    api.queryParameters.forEach((q) => {
      lines.push(`${q.name} (${q.type})${q.required ? " [Required]" : ""}: ${q.description} (default: ${q.defaultValue || "none"})`);
    });
    lines.push(``);
  }

  // Idempotency
  if (api.idempotency.required) {
    lines.push(`--- IDEMPOTENCY ---`);
    lines.push(`Header: ${api.idempotency.headerName}`);
    lines.push(`Storage: ${api.idempotency.storageStrategy} (TTL: ${api.idempotency.ttl})`);
    lines.push(`Behavior: ${api.idempotency.conflictBehavior}`);
    lines.push(``);
  }

  // Request body
  if (api.method !== "GET" && api.requestBody.jsonExample) {
    lines.push(`--- REQUEST BODY (${api.requestBody.contentType}) ---`);
    lines.push(api.requestBody.jsonExample);
    lines.push(``);
  }

  // Responses
  lines.push(`--- SUCCESS RESPONSES ---`);
  if (api.responses.length === 0) {
    lines.push(`200 OK\n`);
  } else {
    api.responses.forEach((res) => {
      lines.push(`HTTP ${res.statusCode} (${res.description}):`);
      if (res.jsonExample) {
        lines.push(res.jsonExample);
      }
      lines.push(``);
    });
  }

  // Error responses
  if (api.errorResponses.length > 0) {
    lines.push(`--- ERROR RESPONSES ---`);
    api.errorResponses.forEach((err) => {
      lines.push(`HTTP ${err.statusCode} [${err.errorCode}] - ${err.message}`);
      lines.push(`Retryable: ${err.retryable ? "Yes" : "No"}`);
      if (err.example) {
        lines.push(err.example);
      }
      lines.push(``);
    });
  }

  // Downstream Dependencies
  if (api.downstreamDependencies.length > 0) {
    lines.push(`--- DOWNSTREAM DEPENDENCIES ---`);
    api.downstreamDependencies.forEach((dep) => {
      lines.push(`-> ${dep.service} [${dep.communicationType}] (${dep.purpose}) - Timeout: ${dep.timeout}`);
    });
    lines.push(``);
  }

  return lines.join("\n");
}

function generateOpenApiYaml(api: DetailedApiContract): string {
  const methodLower = api.method.toLowerCase();
  const path = api.path;

  const lines: string[] = [];
  lines.push(`openapi: 3.0.3`);
  lines.push(`info:`);
  lines.push(`  title: ${api.service} API`);
  lines.push(`  version: ${api.version || "1.0.0"}`);
  lines.push(`paths:`);
  lines.push(`  ${path}:`);
  lines.push(`    ${methodLower}:`);
  lines.push(`      summary: ${yamlQuote(api.purpose)}`);
  lines.push(`      description: ${yamlQuote(api.description)}`);
  lines.push(`      operationId: ${methodLower}${path.replace(/[^a-zA-Z0-9]/g, "_")}`);
  lines.push(`      tags:`);
  lines.push(`        - ${yamlQuote(api.module || api.service)}`);

  // Parameters
  const allParams = [
    ...api.pathParameters.map((p) => ({ ...p, in: "path" })),
    ...api.queryParameters.map((q) => ({ ...q, in: "query" })),
  ];

  if (allParams.length > 0) {
    lines.push(`      parameters:`);
    allParams.forEach((p) => {
      lines.push(`        - name: ${p.name}`);
      lines.push(`          in: ${p.in}`);
      lines.push(`          required: ${p.required ? "true" : "false"}`);
      lines.push(`          description: ${yamlQuote(p.description)}`);
      lines.push(`          schema:`);
      lines.push(`            type: ${mapTypeToOpenApi(p.type)}`);
    });
  }

  // Request Body
  if (api.method !== "GET" && api.requestBody.jsonExample) {
    lines.push(`      requestBody:`);
    lines.push(`        required: true`);
    lines.push(`        content:`);
    lines.push(`          ${api.requestBody.contentType || "application/json"}:`);
    lines.push(`            schema:`);
    lines.push(`              type: object`);
  }

  // Responses
  lines.push(`      responses:`);
  if (api.responses.length === 0) {
    lines.push(`        '200':`);
    lines.push(`          description: OK`);
  } else {
    api.responses.forEach((res) => {
      lines.push(`        '${res.statusCode}':`);
      lines.push(`          description: ${yamlQuote(res.description)}`);
    });
  }

  api.errorResponses.forEach((err) => {
    lines.push(`        '${err.statusCode}':`);
    lines.push(`          description: ${yamlQuote(err.message)}`);
  });

  return lines.join("\n");
}

function yamlQuote(str: string): string {
  if (!str) return `""`;
  return `"${str.replace(/"/g, '\\"')}"`;
}

function mapTypeToOpenApi(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("int") || t.includes("number")) return "integer";
  if (t.includes("bool")) return "boolean";
  return "string";
}
