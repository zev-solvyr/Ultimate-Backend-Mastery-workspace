"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { migrateLocalDataToCloud } from "@/lib/supabase/sync-engine";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, X, CheckCircle2, AlertCircle, Database } from "lucide-react";

export function ImportModal() {
  const { user, isConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!user || !isConfigured || typeof window === "undefined") return;

    const migrationKey = `cloud_migrated_${user.id}`;
    const alreadyMigrated = window.localStorage.getItem(migrationKey) === "true";
    if (alreadyMigrated) return;

    // Check if user has local data in localStorage
    const hasQuestions = Boolean(window.localStorage.getItem("backend-interview-question-bank"));
    const hasResources = Boolean(window.localStorage.getItem("backend-interview-resources"));
    const hasLabs = Boolean(window.localStorage.getItem("backend-interview-engineering-labs"));
    const hasKB = Boolean(window.localStorage.getItem("backend-interview-knowledge-base"));

    if (hasQuestions || hasResources || hasLabs || hasKB) {
      setIsOpen(true);
    }
  }, [user, isConfigured]);

  if (!isOpen || !user) return null;

  const handleImport = async () => {
    setLoading(true);
    const success = await migrateLocalDataToCloud(user.id);
    setLoading(false);
    if (success) {
      setCompleted(true);
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 1500);
    } else {
      alert("Failed to migrate some data to cloud. Check console logs.");
    }
  };

  const handleSkip = () => {
    if (user) {
      window.localStorage.setItem(`cloud_migrated_${user.id}`, "skipped");
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 border-border/60 space-y-4 shadow-2xl bg-card">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 border-cyan-500/40">
            <Database className="h-3 w-3 mr-1" /> Existing Data Found
          </Badge>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={handleSkip}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg font-bold text-foreground">Import Local Workspace to Cloud?</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            We detected existing notes, questions, resources, or engineering labs saved in your browser. Would you like to upload and associate them with your cloud account ({user.email})?
          </CardDescription>
        </div>

        {completed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Workspace successfully imported to your cloud account! Reloading...</span>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="ghost" className="text-xs" onClick={handleSkip} disabled={loading}>
              Skip for Now
            </Button>
            <Button size="sm" className="text-xs gap-1.5 font-semibold" onClick={handleImport} disabled={loading}>
              <CloudUpload className="h-3.5 w-3.5" />
              {loading ? "Importing Data..." : "Import Local Workspace"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
