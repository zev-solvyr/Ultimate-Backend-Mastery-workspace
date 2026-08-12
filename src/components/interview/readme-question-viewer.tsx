"use client";

import React, { useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Copy,
  Check,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  ExternalLink,
  Code2,
  Repeat,
  Info,
  Sparkles,
  X,
  Save,
} from "lucide-react";
import type { Company, QuestionSet, InterviewQuestion, QuestionSetViewMode } from "@/types";

interface ReadmeQuestionViewerProps {
  company: Company;
  questionSet: QuestionSet;
  questions: InterviewQuestion[];
  onBack: () => void;
  onUpdateSet: (setId: string, updates: Partial<QuestionSet>) => void;
  onDeleteSet: (setId: string) => void;
  onAddQuestion: (questionSetId: string, question: string, answer?: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Pick<InterviewQuestion, "question" | "answer">>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  getQuestionFrequency: (questionText: string) => { count: number; companyNames: string[]; setTitles: string[] };
}

export function ReadmeQuestionViewer({
  company,
  questionSet,
  questions,
  onBack,
  onUpdateSet,
  onDeleteSet,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  getQuestionFrequency,
}: ReadmeQuestionViewerProps) {
  const [viewMode, setViewMode] = useState<QuestionSetViewMode>("read");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual Add Question State
  const [showAddManual, setShowAddManual] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newAnswerText, setNewAnswerText] = useState("");

  // Inline Question Editing State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editAnswerText, setEditAnswerText] = useState("");

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    onAddQuestion(questionSet.id, newQuestionText.trim(), newAnswerText.trim() || undefined);
    setNewQuestionText("");
    setNewAnswerText("");
    setShowAddManual(false);
  };

  const handleSaveEditInline = (id: string) => {
    if (!editQuestionText.trim()) return;
    onUpdateQuestion(id, { question: editQuestionText.trim(), answer: editAnswerText.trim() || undefined });
    setEditingQuestionId(null);
  };

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Question Sets
        </Button>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
          <Button
            size="sm"
            variant={viewMode === "read" ? "default" : "ghost"}
            onClick={() => setViewMode("read")}
            className="text-xs h-7 px-3 font-semibold"
          >
            <FileText className="h-3.5 w-3.5 mr-1" /> Read Mode
          </Button>
          <Button
            size="sm"
            variant={viewMode === "edit" ? "default" : "ghost"}
            onClick={() => setViewMode("edit")}
            className="text-xs h-7 px-3 font-semibold"
          >
            <Edit className="h-3.5 w-3.5 mr-1" /> Edit Mode ({questions.length})
          </Button>
          <Button
            size="sm"
            variant={viewMode === "raw" ? "default" : "ghost"}
            onClick={() => setViewMode("raw")}
            className="text-xs h-7 px-3 font-semibold"
          >
            <Code2 className="h-3.5 w-3.5 mr-1" /> Raw Source
          </Button>
        </div>
      </div>

      {/* READ MODE: GitHub README Markdown View */}
      {viewMode === "read" && (
        <Card className="p-6 sm:p-10 border-border/60 shadow-xl bg-card space-y-8 font-sans">
          {/* Document Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-mono font-bold text-primary border-primary/40 uppercase tracking-wider">
                {company.name}
              </Badge>
              {questionSet.interviewRound && (
                <Badge variant="secondary" className="text-xs">
                  {questionSet.interviewRound}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground border-b border-border/40 pb-3">
              {company.name} — {questionSet.title}
            </h1>

            {/* Blockquote Metadata */}
            <div className="border-l-4 border-primary/70 bg-muted/30 pl-4 py-2.5 rounded-r-lg space-y-1 text-xs sm:text-sm text-muted-foreground font-mono">
              {(questionSet.role || questionSet.experience) && (
                <p className="font-semibold text-foreground">
                  {questionSet.role || "Backend Developer"} {questionSet.experience ? `· ${questionSet.experience}` : ""}
                </p>
              )}

              {questionSet.source && (
                <p className="flex items-center gap-1.5">
                  Source: <span className="text-primary font-medium">{questionSet.source}</span>
                  {questionSet.sourceUrl && (
                    <a href={questionSet.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">
                      (Link <ExternalLink className="h-3 w-3" />)
                    </a>
                  )}
                </p>
              )}

              {questionSet.notes && (
                <p className="text-xs italic text-muted-foreground/90 pt-0.5">
                  Notes: {questionSet.notes}
                </p>
              )}
            </div>
          </div>

          <hr className="border-border/40" />

          {/* Section: Interview Questions */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Interview Questions ({sortedQuestions.length})
              </h2>

              <Button size="sm" variant="outline" onClick={() => setShowAddManual(true)} className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Question
              </Button>
            </div>

            {/* Manual Add Inline Form */}
            {showAddManual && (
              <form onSubmit={handleSaveManualQuestion} className="p-4 bg-muted/40 border border-primary/40 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Add Individual Question</span>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowAddManual(false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Question text..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border/60 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <textarea
                  rows={2}
                  placeholder="Optional answer or explanation..."
                  value={newAnswerText}
                  onChange={(e) => setNewAnswerText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border/60 rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddManual(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="text-xs">
                    Save Question
                  </Button>
                </div>
              </form>
            )}

            {/* Questions List — Clean Engineering Documentation Blocks */}
            {sortedQuestions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border/60 rounded-xl space-y-3">
                <Info className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium text-muted-foreground">No questions in this set yet.</p>
                <Button size="sm" onClick={() => setShowAddManual(true)} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedQuestions.map((q, index) => {
                  const freq = getQuestionFrequency(q.question);
                  const isRepeated = freq.count > 1;

                  return (
                    <div
                      key={q.id}
                      className="p-5 bg-card/80 border border-border/50 rounded-xl shadow-sm space-y-3 group hover:border-primary/40 transition-all"
                    >
                      {/* Question Subheader & Actions */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-primary px-2.5 py-1 bg-primary/10 rounded-md border border-primary/20">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {/* Repeated Question Badge */}
                          {isRepeated && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 cursor-help"
                              title={`Asked in ${freq.count} places: ${freq.companyNames.join(", ")}`}
                            >
                              <Repeat className="h-3 w-3" /> Seen {freq.count} times ({freq.companyNames.join(", ")})
                            </Badge>
                          )}
                        </div>

                        {/* Question Action Bar */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyQuestion(q.id, q.question)}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                          >
                            {copiedId === q.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedId === q.id ? "Copied" : "Copy"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDuplicateQuestion(q.id)}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                            title="Duplicate Question"
                          >
                            <Copy className="h-3.5 w-3.5 text-cyan-400" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              setEditQuestionText(q.question);
                              setEditAnswerText(q.answer || "");
                            }}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteQuestion(q.id)}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Editing Question Form Inline */}
                      {editingQuestionId === q.id ? (
                        <div className="p-3 bg-muted/40 border border-primary/40 rounded-lg space-y-2">
                          <input
                            type="text"
                            value={editQuestionText}
                            onChange={(e) => setEditQuestionText(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-background border border-border/60 rounded focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                          />
                          <textarea
                            rows={3}
                            placeholder="Answer notes..."
                            value={editAnswerText}
                            onChange={(e) => setEditAnswerText(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-background border border-border/60 rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingQuestionId(null)} className="text-xs">
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleSaveEditInline(q.id)} className="text-xs">
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Question Text Rendered */
                        <div className="space-y-2 pt-1">
                          <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                            {q.question}
                          </p>

                          {q.answer && (
                            <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40 leading-relaxed font-sans whitespace-pre-wrap">
                              <span className="font-semibold text-primary block text-[11px] uppercase tracking-wider mb-1 font-mono">
                                Answer / Explanation
                              </span>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* EDIT MODE: Separate Editable Cards for Every Question */}
      {viewMode === "edit" && (
        <Card className="p-6 border-border/60 shadow-lg bg-card space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Edit Question Set ({sortedQuestions.length} Questions)</h2>
              <p className="text-xs text-muted-foreground">Modify, duplicate, or reorder individual question records.</p>
            </div>
            <Button size="sm" onClick={() => setShowAddManual(true)} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Question
            </Button>
          </div>

          <div className="space-y-4">
            {sortedQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                    Question {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] gap-1"
                      onClick={() => handleCopyQuestion(q.id, q.question)}
                    >
                      {copiedId === q.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] gap-1 text-cyan-400"
                      onClick={() => onDuplicateQuestion(q.id)}
                      title="Duplicate Question"
                    >
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-rose-400 gap-1"
                      onClick={() => onDeleteQuestion(q.id)}
                      title="Delete Question"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted-foreground">Question Text</label>
                  <textarea
                    rows={2}
                    value={q.question}
                    onChange={(e) => onUpdateQuestion(q.id, { question: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Answer / Explanation (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Add answer notes..."
                    value={q.answer || ""}
                    onChange={(e) => onUpdateQuestion(q.id, { answer: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-background border border-border/60 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* RAW MODE: Original Pasted Content */}
      {viewMode === "raw" && (
        <Card className="p-6 border-border/60 shadow-lg bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" /> Raw Source Material
              </h2>
              <p className="text-xs text-muted-foreground">
                Original unformatted text block preserved during bulk import.
              </p>
            </div>
            {questionSet.rawContent && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyQuestion("raw", questionSet.rawContent || "")}
                className="gap-1 text-xs"
              >
                {copiedId === "raw" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedId === "raw" ? "Copied" : "Copy Raw Text"}
              </Button>
            )}
          </div>

          <pre className="p-4 bg-muted/40 border border-border/50 rounded-lg text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
            {questionSet.rawContent || "No raw source text was saved for this question set."}
          </pre>
        </Card>
      )}
    </div>
  );
}
