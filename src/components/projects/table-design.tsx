"use client";

import { useState } from "react";
import type {
  DatabaseColumn,
  DatabaseForeignKey,
  DatabaseIndex,
  DetailedDatabaseTable,
  ServiceDatabase,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColumnEditor } from "./column-editor";
import { ForeignKeyEditor } from "./foreign-key-editor";
import { IndexEditor } from "./index-editor";
import { SqlPreview } from "./sql-preview";
import { ArrowDown, ArrowUp, Edit, Key, Link2, Plus, Search, Trash2 } from "lucide-react";

interface TableDesignProps {
  table: DetailedDatabaseTable;
  databases: ServiceDatabase[];
  onUpdateTable: (updatedTable: DetailedDatabaseTable) => void;
  onDeleteTable: (tableId: string) => void;
}

export function TableDesign({
  table,
  databases,
  onUpdateTable,
  onDeleteTable,
}: TableDesignProps) {
  const [editingColumn, setEditingColumn] = useState<DatabaseColumn | null | "NEW">(null);
  const [editingFk, setEditingFk] = useState<DatabaseForeignKey | null | "NEW">(null);
  const [editingIndex, setEditingIndex] = useState<DatabaseIndex | null | "NEW">(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(table.notes || "");

  // Column operations
  const handleSaveColumn = (column: DatabaseColumn) => {
    const exists = table.columns.some((c) => c.id === column.id);
    let nextCols: DatabaseColumn[];
    if (exists) {
      nextCols = table.columns.map((c) => (c.id === column.id ? column : c));
    } else {
      nextCols = [...table.columns, column];
    }

    // Auto update primaryKey property if PK changed
    const pkNames = nextCols.filter((c) => c.isPrimaryKey).map((c) => c.name);
    const updatedTable: DetailedDatabaseTable = {
      ...table,
      columns: nextCols,
      primaryKey: pkNames.length > 0 ? pkNames.join(", ") : table.primaryKey,
    };
    onUpdateTable(updatedTable);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (colId: string) => {
    if (!window.confirm("Delete this column? This action cannot be undone.")) return;
    const nextCols = table.columns.filter((c) => c.id !== colId);
    onUpdateTable({ ...table, columns: nextCols });
  };

  const handleMoveColumn = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= table.columns.length) return;
    const nextCols = [...table.columns];
    const temp = nextCols[index];
    nextCols[index] = nextCols[targetIndex];
    nextCols[targetIndex] = temp;
    onUpdateTable({ ...table, columns: nextCols });
  };

  // Foreign Key operations
  const handleSaveFk = (fk: DatabaseForeignKey) => {
    const exists = table.foreignKeys.some((f) => f.id === fk.id);
    let nextFks: DatabaseForeignKey[];
    if (exists) {
      nextFks = table.foreignKeys.map((f) => (f.id === fk.id ? fk : f));
    } else {
      nextFks = [...table.foreignKeys, fk];
    }
    onUpdateTable({ ...table, foreignKeys: nextFks });
    setEditingFk(null);
  };

  const handleDeleteFk = (fkId: string) => {
    if (!window.confirm("Delete this foreign key constraint? This action cannot be undone.")) return;
    const nextFks = table.foreignKeys.filter((f) => f.id !== fkId);
    onUpdateTable({ ...table, foreignKeys: nextFks });
  };

  // Index operations
  const handleSaveIndex = (idx: DatabaseIndex) => {
    const exists = table.indexes.some((i) => i.id === idx.id);
    let nextIndexes: DatabaseIndex[];
    if (exists) {
      nextIndexes = table.indexes.map((i) => (i.id === idx.id ? idx : i));
    } else {
      nextIndexes = [...table.indexes, idx];
    }
    onUpdateTable({ ...table, indexes: nextIndexes });
    setEditingIndex(null);
  };

  const handleDeleteIndex = (idxId: string) => {
    if (!window.confirm("Delete this index? This action cannot be undone.")) return;
    const nextIndexes = table.indexes.filter((i) => i.id !== idxId);
    onUpdateTable({ ...table, indexes: nextIndexes });
  };

  // Notes save
  const handleSaveNotes = () => {
    onUpdateTable({ ...table, notes: notesText });
    setIsEditingNotes(false);
  };

  return (
    <Card className="premium-card overflow-hidden border-border/80 shadow-md">
      {/* Table Header */}
      <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-foreground">{table.name}</span>
              <Badge variant="outline" className="font-mono text-[10px]">
                PK: {table.primaryKey || "None"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{table.purpose}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                if (window.confirm(`Delete table '${table.name}'? This cannot be undone.`)) {
                  onDeleteTable(table.id);
                }
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete Table
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {/* 1. COLUMNS SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Columns</h4>
              <Badge variant="secondary" className="text-[10px]">
                {table.columns.length}
              </Badge>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingColumn("NEW")}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Column
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/50 bg-secondary/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">PK</th>
                  <th className="py-2.5 px-3 text-center">Nullable</th>
                  <th className="py-2.5 px-3 text-center">Unique</th>
                  <th className="py-2.5 px-3">Default</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {table.columns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground">
                      No columns defined yet. Click <strong>+ Add Column</strong> to add your first field.
                    </td>
                  </tr>
                ) : (
                  table.columns.map((col, idx) => (
                    <tr key={col.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                        {col.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-primary text-[11px]">
                        {col.type}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {col.isPrimaryKey ? (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">PK</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {!col.nullable ? (
                          <Badge variant="outline" className="text-[9px] text-slate-300">NOT NULL</Badge>
                        ) : (
                          <span className="text-muted-foreground">NULL</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {col.isUnique ? (
                          <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-400/30">UNIQUE</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                        {col.defaultValue || "-"}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate">
                        {col.description || "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            disabled={idx === 0}
                            onClick={() => handleMoveColumn(idx, "up")}
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            disabled={idx === table.columns.length - 1}
                            onClick={() => handleMoveColumn(idx, "down")}
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingColumn(col)}
                            title="Edit column"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDeleteColumn(col.id)}
                            title="Delete column"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. FOREIGN KEYS SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-semibold">Foreign Keys</h4>
              <Badge variant="secondary" className="text-[10px]">
                {table.foreignKeys.length}
              </Badge>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingFk("NEW")}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Foreign Key
            </Button>
          </div>

          {table.foreignKeys.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-4 text-center text-xs text-muted-foreground">
              No foreign keys defined for this table.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {table.foreignKeys.map((fk) => (
                <div
                  key={fk.id}
                  className="rounded-lg border border-border/50 bg-secondary/20 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono font-medium text-foreground">
                    <span>{fk.constraintName}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingFk(fk)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-400"
                        onClick={() => handleDeleteFk(fk.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-mono text-emerald-400 text-[11px]">
                    {table.name}.{fk.column} → {fk.referencedTable}.{fk.referencedColumn}
                  </div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground font-mono">
                    <span>ON DELETE {fk.onDelete}</span>
                    <span>·</span>
                    <span>ON UPDATE {fk.onUpdate}</span>
                  </div>
                  {fk.description && (
                    <p className="text-muted-foreground text-[11px]">{fk.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. INDEXES SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-semibold">Indexes</h4>
              <Badge variant="secondary" className="text-[10px]">
                {table.indexes.length}
              </Badge>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingIndex("NEW")}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Index
            </Button>
          </div>

          {table.indexes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-4 text-center text-xs text-muted-foreground">
              No custom indexes defined for this table.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {table.indexes.map((idx) => (
                <div
                  key={idx.id}
                  className="rounded-lg border border-border/50 bg-secondary/20 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{idx.name}</span>
                      {idx.isUnique && (
                        <Badge variant="outline" className="text-[9px] text-cyan-400">UNIQUE</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingIndex(idx)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-400"
                        onClick={() => handleDeleteIndex(idx.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-foreground">
                    Columns: <span className="text-primary">{idx.columns.join(", ")}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Type: {idx.type}
                  </div>
                  {idx.purpose && (
                    <p className="text-muted-foreground text-[11px]">{idx.purpose}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. EDITABLE NOTES SECTION */}
        <section className="space-y-2 rounded-lg border border-border/50 bg-secondary/10 p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Engineering Notes
            </h4>
            {!isEditingNotes && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setIsEditingNotes(true)}>
                Edit Notes
              </Button>
            )}
          </div>
          {isEditingNotes ? (
            <div className="space-y-2">
              <textarea
                rows={3}
                className="w-full rounded-md border border-border bg-secondary/40 p-2.5 text-xs focus:border-primary focus:outline-none"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Document design decisions, scaling caveats, partition keys..."
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setNotesText(table.notes || "");
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {table.notes || "No notes recorded yet."}
            </p>
          )}
        </section>

        {/* 5. GENERATED SQL PREVIEW */}
        <section className="pt-2 border-t border-border/50">
          <SqlPreview table={table} />
        </section>
      </CardContent>

      {/* Modal Dialogs */}
      {editingColumn && (
        <ColumnEditor
          initialColumn={editingColumn === "NEW" ? null : editingColumn}
          onSave={handleSaveColumn}
          onCancel={() => setEditingColumn(null)}
        />
      )}

      {editingFk && (
        <ForeignKeyEditor
          currentTable={table}
          databases={databases}
          initialFk={editingFk === "NEW" ? null : editingFk}
          onSave={handleSaveFk}
          onCancel={() => setEditingFk(null)}
        />
      )}

      {editingIndex && (
        <IndexEditor
          currentTable={table}
          initialIndex={editingIndex === "NEW" ? null : editingIndex}
          onSave={handleSaveIndex}
          onCancel={() => setEditingIndex(null)}
        />
      )}
    </Card>
  );
}
