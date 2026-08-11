"use client";

import { useState } from "react";
import type { DatabaseIndex, DetailedDatabaseTable, IndexType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface IndexEditorProps {
  currentTable: DetailedDatabaseTable;
  initialIndex?: DatabaseIndex | null;
  onSave: (index: DatabaseIndex) => void;
  onCancel: () => void;
}

const INDEX_TYPES: IndexType[] = ["BTREE", "HASH", "GIN", "GIST"];

export function IndexEditor({ currentTable, initialIndex, onSave, onCancel }: IndexEditorProps) {
  const isEdit = Boolean(initialIndex?.id);

  const [index, setIndex] = useState<DatabaseIndex>(() => {
    if (initialIndex) return { ...initialIndex, columns: [...initialIndex.columns] };

    const firstCol = currentTable.columns[0]?.name ?? "id";

    return {
      id: crypto.randomUUID(),
      name: `idx_${currentTable.name}_${firstCol}`,
      columns: [firstCol],
      isUnique: false,
      type: "BTREE",
      purpose: "",
    };
  });

  const toggleColumn = (colName: string) => {
    const exists = index.columns.includes(colName);
    let nextCols: string[];
    if (exists) {
      nextCols = index.columns.filter((c) => c !== colName);
    } else {
      nextCols = [...index.columns, colName];
    }
    const autoName = `idx_${currentTable.name}_${nextCols.join("_")}`;
    setIndex({
      ...index,
      columns: nextCols,
      name: index.name.startsWith("idx_") ? autoName : index.name,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (index.columns.length === 0) return;
    onSave({
      ...index,
      name: index.name.trim() || `idx_${currentTable.name}_${index.columns.join("_")}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg overflow-hidden border-border bg-card shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <CardTitle className="text-lg">{isEdit ? "Edit Index" : "Add New Index"}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <label className="grid gap-1.5 text-xs font-medium">
              <span>Index Name</span>
              <input
                type="text"
                required
                placeholder={`idx_${currentTable.name}_column`}
                className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
                value={index.name}
                onChange={(e) => setIndex({ ...index, name: e.target.value })}
              />
            </label>

            <div className="grid gap-2">
              <span className="text-xs font-medium">
                Indexed Columns (Select one or more for composite index)
              </span>
              <div className="max-h-36 overflow-y-auto rounded-md border border-border/50 bg-secondary/20 p-2.5 space-y-1.5">
                {currentTable.columns.length === 0 && (
                  <p className="text-xs text-muted-foreground">No columns available in this table yet.</p>
                )}
                {currentTable.columns.map((c) => {
                  const checked = index.columns.includes(c.name);
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-xs font-mono cursor-pointer hover:text-primary">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleColumn(c.name)}
                        className="rounded border-border bg-secondary"
                      />
                      <span>{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">({c.type})</span>
                    </label>
                  );
                })}
              </div>
              {index.columns.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Order: <span className="font-mono text-foreground">{index.columns.join(", ")}</span>
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium">
                <span>Index Type</span>
                <select
                  className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                  value={index.type}
                  onChange={(e) => setIndex({ ...index, type: e.target.value as IndexType })}
                >
                  {INDEX_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-6">
                <input
                  type="checkbox"
                  className="rounded border-border bg-secondary"
                  checked={index.isUnique}
                  onChange={(e) => setIndex({ ...index, isUnique: e.target.checked })}
                />
                <span>Unique Index</span>
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-medium">
              <span>Purpose / Query Optimization</span>
              <textarea
                rows={2}
                placeholder="e.g. Fast customer order filtering by status and creation date."
                className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs focus:border-primary focus:outline-none"
                value={index.purpose}
                onChange={(e) => setIndex({ ...index, purpose: e.target.value })}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={index.columns.length === 0}>
                Save Index
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
