"use client";

import React, { useState, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import type { Company, QuestionSet } from "@/types";

interface QuestionSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  selectedCompanyId?: string;
  onSave: (data: {
    companyId: string;
    title: string;
    role?: string;
    experience?: string;
    interviewRound?: string;
    source?: string;
    sourceUrl?: string;
    notes?: string;
  }) => void;
  initialSet?: QuestionSet | null;
}

export function QuestionSetModal({
  isOpen,
  onClose,
  companies,
  selectedCompanyId,
  onSave,
  initialSet,
}: QuestionSetModalProps) {
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [interviewRound, setInterviewRound] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialSet) {
      setCompanyId(initialSet.companyId);
      setTitle(initialSet.title || "");
      setRole(initialSet.role || "");
      setExperience(initialSet.experience || "");
      setInterviewRound(initialSet.interviewRound || "");
      setSource(initialSet.source || "");
      setSourceUrl(initialSet.sourceUrl || "");
      setNotes(initialSet.notes || "");
    } else {
      setCompanyId(selectedCompanyId || companies[0]?.id || "");
      setTitle("");
      setRole("Java Backend Developer");
      setExperience("2 YOE");
      setInterviewRound("Technical Round 1");
      setSource("LinkedIn");
      setSourceUrl("");
      setNotes("");
    }
  }, [initialSet, selectedCompanyId, companies, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyId) return;
    onSave({
      companyId,
      title: title.trim(),
      role: role.trim() || undefined,
      experience: experience.trim() || undefined,
      interviewRound: interviewRound.trim() || undefined,
      source: source.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-6 border-border/60 space-y-4 shadow-2xl relative bg-card max-h-[90vh] overflow-y-auto">
        <Button size="icon" variant="ghost" className="absolute right-4 top-4 h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg font-bold text-foreground">
              {initialSet ? "Edit Question Set Metadata" : "Add New Question Set"}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Create an interview experience container for a target company.
          </CardDescription>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Target Company <span className="text-rose-400">*</span></label>
              <select
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="" disabled>Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Set Title <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Java Backend Technical Round"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Role (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Senior Java Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Experience (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 2 YOE, 3-5 YOE"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Interview Round (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Technical Round 1, Managerial"
                value={interviewRound}
                onChange={(e) => setInterviewRound(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Source (Optional)</label>
              <input
                type="text"
                placeholder="e.g. LinkedIn, Telegram, WhatsApp"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Source URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Notes / Context (Optional)</label>
              <textarea
                rows={2}
                placeholder="Additional notes about this interview set..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold">
              {initialSet ? "Save Changes" : "Create Question Set"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
