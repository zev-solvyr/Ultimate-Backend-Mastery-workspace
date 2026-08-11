"use client";

import { useMemo } from "react";
import type { DetailedDatabaseTable } from "@/types";
import { CodeBlock } from "@/components/ui/code-block";

interface SqlPreviewProps {
  table: DetailedDatabaseTable;
}

export function SqlPreview({ table }: SqlPreviewProps) {
  const sql = useMemo(() => generateSql(table), [table]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          SQL DDL Preview
        </h4>
        <span className="text-[10px] font-mono text-muted-foreground">PostgreSQL Standard DDL</span>
      </div>
      <CodeBlock code={sql} language="sql" title={`DDL Script: ${table.name || "table"}`} />
    </div>
  );
}

function generateSql(table: DetailedDatabaseTable): string {
  const tableName = table.name.trim() || "untitled_table";
  const lines: string[] = [];

  // Column definitions
  const colLines = table.columns.map((col) => {
    const parts = [
      `  ${padRight(col.name || "column_name", 24)}`,
      padRight(col.type || "VARCHAR(255)", 16),
    ];

    if (col.isPrimaryKey && table.columns.filter((c) => c.isPrimaryKey).length === 1) {
      parts.push("PRIMARY KEY");
    }

    if (!col.nullable) {
      parts.push("NOT NULL");
    }

    if (col.isUnique && !col.isPrimaryKey) {
      parts.push("UNIQUE");
    }

    if (col.defaultValue && col.defaultValue.trim() !== "") {
      parts.push(`DEFAULT ${col.defaultValue}`);
    }

    return parts.join(" ");
  });

  // Composite Primary Key constraint if multiple PK columns
  const pkCols = table.columns.filter((c) => c.isPrimaryKey);
  if (pkCols.length > 1) {
    colLines.push(`  PRIMARY KEY (${pkCols.map((c) => c.name).join(", ")})`);
  }

  lines.push(`CREATE TABLE ${tableName} (`);
  lines.push(colLines.join(",\n"));
  lines.push(`);`);

  // Foreign keys
  if (table.foreignKeys.length > 0) {
    lines.push("");
    table.foreignKeys.forEach((fk) => {
      const cName = fk.constraintName || `fk_${tableName}_${fk.column}`;
      lines.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT ${cName} FOREIGN KEY (${fk.column || "column"}) REFERENCES ${fk.referencedTable || "ref_table"}(${fk.referencedColumn || "id"}) ON DELETE ${fk.onDelete} ON UPDATE ${fk.onUpdate};`
      );
    });
  }

  // Indexes
  if (table.indexes.length > 0) {
    lines.push("");
    table.indexes.forEach((idx) => {
      const idxName = idx.name || `idx_${tableName}_${idx.columns.join("_")}`;
      const unique = idx.isUnique ? "UNIQUE " : "";
      const method = idx.type ? ` USING ${idx.type}` : "";
      const cols = idx.columns.length > 0 ? idx.columns.join(", ") : "column";
      lines.push(`CREATE ${unique}INDEX ${idxName} ON ${tableName}${method} (${cols});`);
    });
  }

  return lines.join("\n");
}

function padRight(str: string, length: number): string {
  return str.length >= length ? str : str + " ".repeat(length - str.length);
}
