"use client";

import React, { useState, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, X } from "lucide-react";
import type { Company } from "@/types";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  initialCompany?: Company | null;
}

export function CompanyModal({ isOpen, onClose, onSave, initialCompany }: CompanyModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialCompany) {
      setName(initialCompany.name || "");
      setDescription(initialCompany.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialCompany, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 border-border/60 space-y-4 shadow-2xl relative bg-card">
        <Button size="icon" variant="ghost" className="absolute right-4 top-4 h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-5 w-5" />
            <CardTitle className="text-lg font-bold text-foreground">
              {initialCompany ? "Edit Company" : "Add Target Company"}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Organize interview question sets by company (e.g. TCS, Infosys, Accenture, Amazon).
          </CardDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Company Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TCS, Infosys, Accenture"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Java Backend Developer hiring process & technical rounds"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold">
              {initialCompany ? "Save Changes" : "Create Company"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
