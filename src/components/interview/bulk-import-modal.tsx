"use client";

import React, { useState, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Eye, CheckCircle2, Building2, FileText, Sparkles } from "lucide-react";
import type { Company } from "@/types";
import { parseBulkQuestionsText, type ParsedQuestionItem } from "@/lib/bulk-import-parser";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  selectedCompanyId?: string;
  onAddCompany: (name: string) => Company | null;
  onImport: (data: {
    companyId: string;
    title: string;
    role?: string;
    experience?: string;
    interviewRound?: string;
    source?: string;
    sourceUrl?: string;
    notes?: string;
    rawText: string;
  }) => void;
}

export function BulkImportModal({
  isOpen,
  onClose,
  companies,
  selectedCompanyId,
  onAddCompany,
  onImport,
}: BulkImportModalProps) {
  const [companyId, setCompanyId] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [showAddCompanyInline, setShowAddCompanyInline] = useState(false);

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("Java Backend Developer");
  const [experience, setExperience] = useState("2 YOE");
  const [interviewRound, setInterviewRound] = useState("Technical Round 1");
  const [source, setSource] = useState("LinkedIn");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [rawText, setRawText] = useState("");

  const [previewItems, setPreviewItems] = useState<ParsedQuestionItem[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCompanyId(selectedCompanyId || companies[0]?.id || "");
      setShowAddCompanyInline(false);
      setNewCompanyName("");
      setTitle("");
      setRole("Java Backend Developer");
      setExperience("2 YOE");
      setInterviewRound("Technical Round 1");
      setSource("LinkedIn");
      setSourceUrl("");
      setNotes("");
      setRawText("");
      setPreviewItems([]);
      setIsPreviewing(false);
    }
  }, [isOpen, selectedCompanyId, companies]);

  if (!isOpen) return null;

  const handleCreateCompanyInline = () => {
    if (!newCompanyName.trim()) return;
    const created = onAddCompany(newCompanyName.trim());
    if (created) {
      setCompanyId(created.id);
      setShowAddCompanyInline(false);
      setNewCompanyName("");
    }
  };

  const handlePreview = () => {
    if (!rawText.trim()) return;
    const items = parseBulkQuestionsText(rawText);
    setPreviewItems(items);
    setIsPreviewing(true);
  };

  const handleExecuteImport = () => {
    let finalCompanyId = companyId;
    if (showAddCompanyInline && newCompanyName.trim()) {
      const created = onAddCompany(newCompanyName.trim());
      if (created) finalCompanyId = created.id;
    }

    if (!finalCompanyId) return;
    if (!title.trim()) {
      alert("Please enter a Question Set Title.");
      return;
    }
    if (!rawText.trim()) {
      alert("Please paste your raw interview questions text.");
      return;
    }

    onImport({
      companyId: finalCompanyId,
      title: title.trim(),
      role: role.trim() || undefined,
      experience: experience.trim() || undefined,
      interviewRound: interviewRound.trim() || undefined,
      source: source.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      rawText,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl p-6 border-border/60 space-y-4 shadow-2xl relative bg-card max-h-[90vh] overflow-y-auto">
        <Button size="icon" variant="ghost" className="absolute right-4 top-4 h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary/40 font-mono">
              <Sparkles className="h-3 w-3 mr-1 text-cyan-400" /> Fast Capture
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Bulk Import Interview Question Set
          </CardTitle>
          <CardDescription className="text-xs">
            Paste unformatted question lists from LinkedIn, Telegram, WhatsApp, GitHub, or documents. The system automatically normalizes questions and preserves your original raw text.
          </CardDescription>
        </div>

        <div className="space-y-4 pt-2">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-muted/30 border border-border/50 rounded-lg">
            {/* Company */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">Company <span className="text-rose-400">*</span></label>
                <button
                  type="button"
                  onClick={() => setShowAddCompanyInline(!showAddCompanyInline)}
                  className="text-[11px] text-primary hover:underline"
                >
                  {showAddCompanyInline ? "Select existing" : "+ New company"}
                </button>
              </div>

              {showAddCompanyInline ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="e.g. TCS, Infosys"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button type="button" size="sm" onClick={handleCreateCompanyInline} className="h-7 px-2 text-xs">
                    Add
                  </Button>
                </div>
              ) : (
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>Select Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Set Title */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Question Set Title <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Java Backend Technical Round (2 YOE)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Role */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Role</label>
              <input
                type="text"
                placeholder="e.g. Java Backend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Experience</label>
              <input
                type="text"
                placeholder="e.g. 2 YOE"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Round */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Interview Round</label>
              <input
                type="text"
                placeholder="e.g. Technical Round 1"
                value={interviewRound}
                onChange={(e) => setInterviewRound(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Source */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Source</label>
              <input
                type="text"
                placeholder="e.g. LinkedIn / Telegram"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Source URL */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Source URL (Optional)</label>
              <input
                type="url"
                placeholder="https://linkedin.com/posts/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                Paste Interview Questions Text <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground font-mono">
                Formats: 1. Q1. Q1: - or raw line-by-line
              </span>
            </div>

            <textarea
              rows={8}
              placeholder={`Paste your questions here...\n\nExample:\nHow does a Spring Boot application start internally?\nWhat happens internally when we hit a REST API URL?\nWhat does @ComponentScan do?\nWhat is the scope of a Spring Boot bean?\nHow do you handle exceptions in Spring Boot?\nHow do you handle cascade failures in Spring Boot/microservices?\nIf API latency increases significantly, how would you troubleshoot it?`}
              value={rawText}
              onChange={(e) => {
                const val = e.target.value;
                setRawText(val);
                if (val.trim()) {
                  setPreviewItems(parseBulkQuestionsText(val));
                  setIsPreviewing(true);
                } else {
                  setPreviewItems([]);
                  setIsPreviewing(false);
                }
              }}
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* Preview Panel */}
          {isPreviewing && (
            <div className="p-4 bg-muted/40 border border-primary/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-mono bg-primary/20 text-primary border-primary/40">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {previewItems.length} Questions Detected
                  </Badge>
                  <span className="text-xs text-muted-foreground">Ready for import</span>
                </div>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-2 pr-1 border border-border/40 rounded p-2 bg-background/50">
                {previewItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No questions detected. Try pasting your text block above.</p>
                ) : (
                  previewItems.map((item) => (
                    <div key={item.order} className="text-xs flex gap-2 p-1.5 rounded hover:bg-muted/30">
                      <span className="font-mono text-primary font-bold text-[11px]">{String(item.order).padStart(2, "0")}.</span>
                      <span className="text-foreground">{item.question}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handlePreview}
                disabled={!rawText.trim()}
                className="gap-1 text-xs font-medium"
              >
                <Eye className="h-3.5 w-3.5" /> Preview Questions
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleExecuteImport}
                disabled={!rawText.trim() || !title.trim() || (!companyId && !newCompanyName.trim())}
                className="gap-1.5 text-xs font-semibold"
              >
                <Upload className="h-3.5 w-3.5" /> Import Questions ({parseBulkQuestionsText(rawText).length})
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
