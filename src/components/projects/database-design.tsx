"use client";

import { useMemo, useState } from "react";
import type { DetailedDatabaseTable, Project, ServiceDatabase } from "@/types";
import { useProjectGuide } from "@/hooks/use-project-guide";
import { getSeedDatabaseDesign } from "@/data/commercex-seed-db";
import { TableDesign } from "./table-design";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, RefreshCw, Server, Table as TableIcon, Trash2, Edit } from "lucide-react";

export function DatabaseDesign({ project }: { project: Project }) {
  const seed = useMemo(() => ({
    databaseDesign: getSeedDatabaseDesign(project),
  }), [project]);

  const { guide, loaded, updateDatabaseDesign } = useProjectGuide(project.id, seed);

  // Normalize current database design
  const designDatabases: ServiceDatabase[] = useMemo(() => {
    const rawDesign = guide.databaseDesign as { databases?: ServiceDatabase[] } | undefined;
    if (rawDesign?.databases && Array.isArray(rawDesign.databases) && rawDesign.databases.length > 0) {
      return rawDesign.databases;
    }
    return seed.databaseDesign.databases;
  }, [guide.databaseDesign, seed]);

  const [activeDatabaseId, setActiveDatabaseId] = useState<string>(() => {
    return designDatabases[0]?.id ?? "";
  });

  const [editingDatabase, setEditingDatabase] = useState<ServiceDatabase | null | "NEW">(null);
  const [editingTableModal, setEditingTableModal] = useState<{ databaseId: string; table?: DetailedDatabaseTable } | null>(null);

  // Selected database
  const activeDatabase = designDatabases.find((db) => db.id === activeDatabaseId) ?? designDatabases[0];

  // Helper to commit database changes to localStorage
  const saveDatabases = (nextDatabases: ServiceDatabase[]) => {
    updateDatabaseDesign({ databases: nextDatabases });
  };

  // Database actions
  const handleSaveDatabase = (db: ServiceDatabase) => {
    const exists = designDatabases.some((d) => d.id === db.id);
    let next: ServiceDatabase[];
    if (exists) {
      next = designDatabases.map((d) => (d.id === db.id ? db : d));
    } else {
      next = [...designDatabases, db];
    }
    saveDatabases(next);
    setEditingDatabase(null);
    setActiveDatabaseId(db.id);
  };

  const handleDeleteDatabase = (dbId: string) => {
    if (!window.confirm("Delete this database and all its tables? This action cannot be undone.")) return;
    const next = designDatabases.filter((d) => d.id !== dbId);
    saveDatabases(next);
    if (activeDatabaseId === dbId) {
      setActiveDatabaseId(next[0]?.id ?? "");
    }
  };

  // Table actions
  const handleUpdateTable = (databaseId: string, updatedTable: DetailedDatabaseTable) => {
    const next = designDatabases.map((db) => {
      if (db.id !== databaseId) return db;
      const tables = db.tables ?? [];
      const exists = tables.some((t) => t.id === updatedTable.id);
      const nextTables = exists
        ? tables.map((t) => (t.id === updatedTable.id ? updatedTable : t))
        : [...tables, updatedTable];
      return { ...db, tables: nextTables };
    });
    saveDatabases(next);
  };

  const handleDeleteTable = (databaseId: string, tableId: string) => {
    const next = designDatabases.map((db) => {
      if (db.id !== databaseId) return db;
      return {
        ...db,
        tables: (db.tables ?? []).filter((t) => t.id !== tableId),
      };
    });
    saveDatabases(next);
  };

  const handleResetDesign = () => {
    if (window.confirm("Reset Database Design to initial default blueprint? All custom table edits will be lost.")) {
      const defaultDesign = getSeedDatabaseDesign(project);
      saveDatabases(defaultDesign.databases);
      setActiveDatabaseId(defaultDesign.databases[0]?.id ?? "");
    }
  };

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Top Header & Reset Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Architecture & Schema Design
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Production backend data models with column constraints, foreign keys, indexes, and SQL DDL previews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleResetDesign}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reset Blueprint
          </Button>
          <Button size="sm" className="text-xs" onClick={() => setEditingDatabase("NEW")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Database
          </Button>
        </div>
      </div>

      {/* 1. DATABASE SELECTOR TABS & OVERVIEW */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-border/50 pb-2">
          {designDatabases.map((db) => {
            const isActive = db.id === (activeDatabase?.id ?? "");
            return (
              <button
                key={db.id}
                onClick={() => setActiveDatabaseId(db.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/40 shadow-sm"
                    : "bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                <span>{db.name || "Untitled DB"}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {db.tables?.length ?? 0} tables
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Active Database Summary Card */}
        {activeDatabase && (
          <Card className="premium-card overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{activeDatabase.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs font-mono">{activeDatabase.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activeDatabase.purpose}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setEditingDatabase(activeDatabase)}
                >
                  <Edit className="mr-1 h-3.5 w-3.5" /> Edit DB Info
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-red-400 hover:text-red-300"
                  onClick={() => handleDeleteDatabase(activeDatabase.id)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete DB
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-xs sm:grid-cols-2 border-t border-border/40 pt-3">
              <div>
                <span className="font-semibold text-muted-foreground">Owning Services:</span>
                <p className="font-mono text-primary mt-0.5">
                  {activeDatabase.owningServices?.length ? activeDatabase.owningServices.join(", ") : "Not specified"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Why Chosen:</span>
                <p className="text-muted-foreground mt-0.5">{activeDatabase.whyChosen}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 2. TABLES FOR ACTIVE DATABASE */}
      {activeDatabase && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TableIcon className="h-4 w-4" />
              Tables in {activeDatabase.name} ({activeDatabase.tables?.length ?? 0})
            </h3>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setEditingTableModal({ databaseId: activeDatabase.id })}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Table to {activeDatabase.name}
            </Button>
          </div>

          {(!activeDatabase.tables || activeDatabase.tables.length === 0) ? (
            <Card className="p-8 text-center border-dashed">
              <TableIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm font-medium">No tables in this database yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click <strong>+ Add Table</strong> to create your first database schema table.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeDatabase.tables.map((table) => (
                <TableDesign
                  key={table.id}
                  table={table}
                  databases={designDatabases}
                  onUpdateTable={(updated) => handleUpdateTable(activeDatabase.id, updated)}
                  onDeleteTable={(tableId) => handleDeleteTable(activeDatabase.id, tableId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Database Info Editor */}
      {editingDatabase && (
        <DatabaseEditorModal
          initialDb={editingDatabase === "NEW" ? null : editingDatabase}
          onSave={handleSaveDatabase}
          onCancel={() => setEditingDatabase(null)}
        />
      )}

      {/* MODAL: New Table Creation */}
      {editingTableModal && (
        <NewTableModal
          databaseId={editingTableModal.databaseId}
          onSave={(newTable) => {
            handleUpdateTable(editingTableModal.databaseId, newTable);
            setEditingTableModal(null);
          }}
          onCancel={() => setEditingTableModal(null)}
        />
      )}
    </div>
  );
}

// Submodal for Adding/Editing Database metadata
function DatabaseEditorModal({
  initialDb,
  onSave,
  onCancel,
}: {
  initialDb: ServiceDatabase | null;
  onSave: (db: ServiceDatabase) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initialDb?.id);
  const [db, setDb] = useState<ServiceDatabase>(() => {
    if (initialDb) return { ...initialDb };
    return {
      id: crypto.randomUUID(),
      name: "",
      type: "PostgreSQL",
      purpose: "",
      owningServices: [],
      whyChosen: "",
      tables: [],
    };
  });
  const [servicesInput, setServicesInput] = useState(() => db.owningServices.join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db.name.trim()) return;
    onSave({
      ...db,
      name: db.name.trim(),
      owningServices: servicesInput.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-border bg-card shadow-2xl">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg">{isEdit ? "Edit Database Specs" : "Add New Database"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 pt-4 text-xs">
            <label className="grid gap-1">
              <span className="font-semibold">Database Name *</span>
              <input
                required
                className="rounded border border-border bg-secondary/40 p-2 font-mono"
                placeholder="e.g. Order Service DB"
                value={db.name}
                onChange={(e) => setDb({ ...db, name: e.target.value })}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold">Database Technology Type</span>
              <input
                required
                className="rounded border border-border bg-secondary/40 p-2 font-mono"
                placeholder="e.g. PostgreSQL, Redis, MongoDB"
                value={db.type}
                onChange={(e) => setDb({ ...db, type: e.target.value })}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold">Purpose</span>
              <textarea
                rows={2}
                className="rounded border border-border bg-secondary/40 p-2"
                placeholder="Core domain data ownership..."
                value={db.purpose}
                onChange={(e) => setDb({ ...db, purpose: e.target.value })}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold">Owning Microservices (comma-separated)</span>
              <input
                className="rounded border border-border bg-secondary/40 p-2 font-mono"
                placeholder="order-service, fulfillment-service"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold">Why Chosen</span>
              <textarea
                rows={2}
                className="rounded border border-border bg-secondary/40 p-2"
                placeholder="ACID guarantees, row locking, high read throughput..."
                value={db.whyChosen}
                onChange={(e) => setDb({ ...db, whyChosen: e.target.value })}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Database
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

// Submodal for Adding a New Table to a Database
function NewTableModal({
  databaseId,
  onSave,
  onCancel,
}: {
  databaseId: string;
  onSave: (table: DetailedDatabaseTable) => void;
  onCancel: () => void;
}) {
  const [tableName, setTableName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [pkName, setPkName] = useState("id");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    const cleanName = tableName.trim().toLowerCase();
    const cleanPk = pkName.trim().toLowerCase() || "id";

    const newTable: DetailedDatabaseTable = {
      id: `tbl-${crypto.randomUUID().slice(0, 8)}`,
      name: cleanName,
      purpose: purpose.trim() || `Stores ${cleanName} records`,
      primaryKey: cleanPk,
      notes: "Newly created schema table.",
      columns: [
        {
          id: `col-${crypto.randomUUID().slice(0, 8)}`,
          name: cleanPk,
          type: "UUID",
          nullable: false,
          isPrimaryKey: true,
          isUnique: true,
          autoGenerated: true,
          defaultValue: "gen_random_uuid()",
          description: "Primary key identifier",
        },
      ],
      foreignKeys: [],
      indexes: [],
    };

    onSave(newTable);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-border bg-card shadow-2xl">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg">Add Table</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 pt-4 text-xs">
            <label className="grid gap-1">
              <span className="font-semibold">Table Name *</span>
              <input
                required
                className="rounded border border-border bg-secondary/40 p-2 font-mono"
                placeholder="e.g. order_item"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold">Primary Key Column Name</span>
              <input
                className="rounded border border-border bg-secondary/40 p-2 font-mono"
                placeholder="id"
                value={pkName}
                onChange={(e) => setPkName(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold">Table Purpose</span>
              <textarea
                rows={2}
                className="rounded border border-border bg-secondary/40 p-2"
                placeholder="What this entity represents in the microservice..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create Table
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
