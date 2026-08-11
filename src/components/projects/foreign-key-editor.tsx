"use client";

import { useState } from "react";
import type { DatabaseForeignKey, DetailedDatabaseTable, ForeignKeyAction, ServiceDatabase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface ForeignKeyEditorProps {
  currentTable: DetailedDatabaseTable;
  databases: ServiceDatabase[];
  initialFk?: DatabaseForeignKey | null;
  onSave: (fk: DatabaseForeignKey) => void;
  onCancel: () => void;
}

const FK_ACTIONS: ForeignKeyAction[] = ["CASCADE", "RESTRICT", "SET NULL", "NO ACTION"];

export function ForeignKeyEditor({
  currentTable,
  databases,
  initialFk,
  onSave,
  onCancel,
}: ForeignKeyEditorProps) {
  const isEdit = Boolean(initialFk?.id);

  // All available tables in all project databases
  const allTables = databases.flatMap((db) => db.tables ?? []);

  const [fk, setFk] = useState<DatabaseForeignKey>(() => {
    if (initialFk) return { ...initialFk };

    const firstCol = currentTable.columns[0]?.name ?? "";
    const firstRefTable = allTables.find((t) => t.id !== currentTable.id) ?? allTables[0];
    const firstRefCol = firstRefTable?.columns[0]?.name ?? "id";

    return {
      id: crypto.randomUUID(),
      constraintName: `fk_${currentTable.name}_${firstCol}`,
      column: firstCol,
      referencedTable: firstRefTable?.name ?? "",
      referencedColumn: firstRefCol,
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
      description: "",
    };
  });

  const selectedRefTableObj = allTables.find(
    (t) => t.name.toLowerCase() === fk.referencedTable.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fk.column || !fk.referencedTable || !fk.referencedColumn) return;
    onSave({
      ...fk,
      constraintName:
        fk.constraintName.trim() || `fk_${currentTable.name}_${fk.column}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg overflow-hidden border-border bg-card shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <CardTitle className="text-lg">
            {isEdit ? "Edit Foreign Key" : "Add Foreign Key"}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <label className="grid gap-1.5 text-xs font-medium">
              <span>Constraint Name</span>
              <input
                type="text"
                placeholder={`fk_${currentTable.name}_${fk.column || "col"}`}
                className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
                value={fk.constraintName}
                onChange={(e) => setFk({ ...fk, constraintName: e.target.value })}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium">
                <span>Local Column ({currentTable.name})</span>
                <select
                  className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
                  value={fk.column}
                  onChange={(e) => {
                    const col = e.target.value;
                    setFk({
                      ...fk,
                      column: col,
                      constraintName: fk.constraintName.startsWith("fk_")
                        ? `fk_${currentTable.name}_${col}`
                        : fk.constraintName,
                    });
                  }}
                >
                  {currentTable.columns.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-medium">
                <span>Referenced Table</span>
                <select
                  className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
                  value={fk.referencedTable}
                  onChange={(e) => {
                    const refTName = e.target.value;
                    const refT = allTables.find((t) => t.name === refTName);
                    setFk({
                      ...fk,
                      referencedTable: refTName,
                      referencedColumn: refT?.columns[0]?.name ?? "id",
                    });
                  }}
                >
                  {allTables.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-medium">
              <span>Referenced Column ({fk.referencedTable || "Target Table"})</span>
              <select
                className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
                value={fk.referencedColumn}
                onChange={(e) => setFk({ ...fk, referencedColumn: e.target.value })}
              >
                {selectedRefTableObj ? (
                  selectedRefTableObj.columns.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.type}) {c.isPrimaryKey ? "[PK]" : ""}
                    </option>
                  ))
                ) : (
                  <option value="id">id</option>
                )}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium">
                <span>ON DELETE</span>
                <select
                  className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                  value={fk.onDelete}
                  onChange={(e) =>
                    setFk({ ...fk, onDelete: e.target.value as ForeignKeyAction })
                  }
                >
                  {FK_ACTIONS.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-medium">
                <span>ON UPDATE</span>
                <select
                  className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                  value={fk.onUpdate}
                  onChange={(e) =>
                    setFk({ ...fk, onUpdate: e.target.value as ForeignKeyAction })
                  }
                >
                  {FK_ACTIONS.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-medium">
              <span>Description / Purpose</span>
              <textarea
                rows={2}
                placeholder="Reason for this relationship..."
                className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs focus:border-primary focus:outline-none"
                value={fk.description}
                onChange={(e) => setFk({ ...fk, description: e.target.value })}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Foreign Key
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
