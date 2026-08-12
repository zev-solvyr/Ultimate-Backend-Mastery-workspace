"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInterviewQuestions } from "@/hooks/use-interview-questions";
import type { Company, QuestionSet, InterviewQuestion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Building2,
  FileText,
  Upload,
  Sparkles,
  Repeat,
  ArrowRight,
  FolderOpen,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CompanyModal } from "@/components/interview/company-modal";
import { QuestionSetModal } from "@/components/interview/question-set-modal";
import { BulkImportModal } from "@/components/interview/bulk-import-modal";
import { ReadmeQuestionViewer } from "@/components/interview/readme-question-viewer";

export default function InterviewQuestionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading interview questions bank...</div>}>
      <InterviewQuestionsContent />
    </Suspense>
  );
}

function InterviewQuestionsContent() {
  const {
    loaded,
    companies,
    questionSets,
    questions,
    getQuestionFrequency,
    addCompany,
    updateCompany,
    deleteCompany,
    addQuestionSet,
    updateQuestionSet,
    deleteQuestionSet,
    duplicateQuestionSet,
    bulkImportQuestionSet,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
  } = useInterviewQuestions();

  // Selection & Navigation State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  // Expand / Collapse State for Target Companies
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<Set<string>>(new Set());

  const toggleCompanyExpand = (companyId: string) => {
    setExpandedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [showQuestionSetModal, setShowQuestionSetModal] = useState(false);
  const [editingQuestionSet, setEditingQuestionSet] = useState<QuestionSet | null>(null);

  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Computed Maps
  const companyMap = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);
  const questionSetMap = useMemo(() => new Map(questionSets.map((s) => [s.id, s])), [questionSets]);

  // Questions grouped by Set ID
  const questionsBySet = useMemo(() => {
    const map = new Map<string, InterviewQuestion[]>();
    questions.forEach((q) => {
      const list = map.get(q.questionSetId) || [];
      list.push(q);
      map.set(q.questionSetId, list);
    });
    return map;
  }, [questions]);

  // Question Sets grouped by Company ID
  const setsByCompany = useMemo(() => {
    const map = new Map<string, QuestionSet[]>();
    questionSets.forEach((s) => {
      const list = map.get(s.companyId) || [];
      list.push(s);
      map.set(s.companyId, list);
    });
    return map;
  }, [questionSets]);

  // Total Repeated Questions Count
  const repeatedQuestionsCount = useMemo(() => {
    const freqSet = new Set<string>();
    questions.forEach((q) => {
      const freq = getQuestionFrequency(q.question);
      if (freq.count > 1) {
        freqSet.add(q.question.toLowerCase().replace(/[^a-z0-9]/g, ""));
      }
    });
    return freqSet.size;
  }, [questions, getQuestionFrequency]);

  // Top Most Repeated Questions
  const mostRepeatedQuestions = useMemo(() => {
    const seenMap = new Map<string, { question: InterviewQuestion; freq: ReturnType<typeof getQuestionFrequency> }>();
    questions.forEach((q) => {
      const freq = getQuestionFrequency(q.question);
      if (freq.count > 1) {
        const norm = q.question.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seenMap.has(norm)) {
          seenMap.set(norm, { question: q, freq });
        }
      }
    });
    return Array.from(seenMap.values())
      .sort((a, b) => b.freq.count - a.freq.count)
      .slice(0, 6);
  }, [questions, getQuestionFrequency]);

  // Global Search Results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const matchedQuestions: { question: InterviewQuestion; set: QuestionSet; company: Company }[] = [];

    questions.forEach((q) => {
      const set = questionSetMap.get(q.questionSetId);
      const company = set ? companyMap.get(set.companyId) : null;
      if (!set || !company) return;

      const matchText = `${company.name} ${set.title} ${set.role || ""} ${set.interviewRound || ""} ${set.source || ""} ${q.question} ${q.answer || ""}`.toLowerCase();

      if (matchText.includes(query)) {
        matchedQuestions.push({ question: q, set, company });
      }
    });

    return matchedQuestions;
  }, [searchQuery, questions, questionSetMap, companyMap]);

  // Active Selected Set for Readme Viewer
  const activeSet = selectedSetId ? questionSetMap.get(selectedSetId) : null;
  const activeCompany = activeSet ? companyMap.get(activeSet.companyId) : null;
  const activeQuestions = selectedSetId ? questionsBySet.get(selectedSetId) || [] : [];

  if (!loaded) {
    return (
      <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Sparkles className="h-5 w-5 animate-spin text-primary" /> Loading interview questions bank...
      </div>
    );
  }

  // --- 1. README QUESTION VIEWER SCREEN ---
  if (activeSet && activeCompany) {
    return (
      <ReadmeQuestionViewer
        company={activeCompany}
        questionSet={activeSet}
        questions={activeQuestions}
        onBack={() => setSelectedSetId(null)}
        onUpdateSet={updateQuestionSet}
        onDeleteSet={(setId) => {
          if (confirm("Delete this entire Question Set?")) {
            deleteQuestionSet(setId);
            setSelectedSetId(null);
          }
        }}
        onAddQuestion={addQuestion}
        onUpdateQuestion={updateQuestion}
        onDeleteQuestion={deleteQuestion}
        onDuplicateQuestion={duplicateQuestion}
        getQuestionFrequency={getQuestionFrequency}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header & Landing Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-primary border-primary/40">
              Company-Wise Collection System
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 text-foreground mt-1">
            <HelpCircle className="h-7 w-7 text-primary" /> Interview Questions Bank
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Capture, organize, and revise company-wise interview question sets.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => {
              setEditingCompany(null);
              setShowCompanyModal(true);
            }}
            variant="outline"
            className="gap-1.5 text-xs font-semibold"
          >
            <Building2 className="h-4 w-4 text-primary" /> Add Company
          </Button>

          <Button
            size="sm"
            onClick={() => setShowBulkImportModal(true)}
            className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" /> Import Question Set
          </Button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search companies, question sets, questions, roles, or interview rounds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-card border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* SEARCH RESULTS VIEW */}
      {searchResults !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" /> Search Results ({searchResults.length})
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")} className="text-xs">
              Clear Search
            </Button>
          </div>

          {searchResults.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-border/60">
              <p className="text-sm text-muted-foreground">No questions found matching "{searchQuery}".</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchResults.map(({ question, set, company }) => (
                <Card
                  key={question.id}
                  onClick={() => setSelectedSetId(set.id)}
                  className="p-4 border-border/60 hover:border-primary/50 transition-all cursor-pointer bg-card space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                        {company.name}
                      </Badge>
                      <span className="font-semibold text-foreground">{set.title}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-foreground leading-snug">{question.question}</p>
                  {question.answer && (
                    <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded">
                      {question.answer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MAIN DASHBOARD LANDING */
        <div className="space-y-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">Companies</span>
              <p className="text-2xl font-extrabold text-foreground">{companies.length}</p>
            </Card>
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">Question Sets</span>
              <p className="text-2xl font-extrabold text-foreground">{questionSets.length}</p>
            </Card>
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">Total Questions</span>
              <p className="text-2xl font-extrabold text-primary">{questions.length}</p>
            </Card>
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">Repeated Questions</span>
              <p className="text-2xl font-extrabold text-amber-400">{repeatedQuestionsCount}</p>
            </Card>
          </div>

          {/* Section: Target Companies Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Target Companies ({companies.length})
              </h2>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingCompany(null);
                  setShowCompanyModal(true);
                }}
                className="text-xs text-primary hover:underline gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Company
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((comp) => {
                const isExpanded = expandedCompanyIds.has(comp.id);
                const companySets = setsByCompany.get(comp.id) || [];
                const totalCompQuestions = companySets.reduce((sum, s) => sum + (questionsBySet.get(s.id)?.length || 0), 0);

                return (
                  <Card
                    key={comp.id}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCompanyExpand(comp.id);
                      }
                    }}
                    onClick={() => toggleCompanyExpand(comp.id)}
                    className={`p-5 border-border/60 hover:border-primary/50 transition-all bg-card shadow-sm flex flex-col justify-between group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                      isExpanded ? "border-primary/60 ring-1 ring-primary/20 bg-card/95" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm font-mono uppercase shrink-0">
                            {comp.name.substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                              {comp.name}
                            </h3>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {companySets.length} Sets · {totalCompQuestions} Questions
                            </span>
                          </div>
                        </div>

                        {/* Company Action Buttons & Expand Chevron */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit Company"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCompany(comp);
                              setShowCompanyModal(true);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-rose-400"
                            title="Delete Company"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete ${comp.name} and all its Question Sets?`)) {
                                deleteCompany(comp.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>

                          <div
                            className={`h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground group-hover:text-primary transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-primary" : ""
                            }`}
                            title={isExpanded ? "Collapse Question Sets" : "Expand Question Sets"}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {comp.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {comp.description}
                        </p>
                      )}
                    </div>

                    {/* Question Sets List Area */}
                    <div className="pt-3 border-t border-border/30 mt-3">
                      {isExpanded ? (
                        /* EXPANDED STATE: Display ALL Question Sets */
                        <div className="space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-primary">
                              Question Sets ({companySets.length})
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCompanyId(comp.id);
                                setShowQuestionSetModal(true);
                              }}
                              className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> Add Set
                            </button>
                          </div>

                          {companySets.length === 0 ? (
                            <div className="p-3 text-center border border-dashed border-border/40 rounded-lg text-xs text-muted-foreground italic">
                              No question sets created yet.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                              {companySets.map((s) => {
                                const qCount = questionsBySet.get(s.id)?.length || 0;
                                return (
                                  <div
                                    key={s.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSetId(s.id);
                                    }}
                                    className="p-2.5 bg-muted/30 hover:bg-primary/10 rounded-lg border border-border/50 hover:border-primary/40 transition-colors cursor-pointer flex items-center justify-between text-xs group/set"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <div className="min-w-0">
                                        <p className="font-semibold text-foreground group-hover/set:text-primary truncate">
                                          {s.title}
                                        </p>
                                        {(s.role || s.interviewRound) && (
                                          <p className="text-[10px] text-muted-foreground truncate font-mono">
                                            {s.role || ""} {s.interviewRound ? `· ${s.interviewRound}` : ""}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <Badge variant="secondary" className="text-[10px] font-mono shrink-0 ml-2">
                                      {qCount} {qCount === 1 ? "Question" : "Questions"}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* COLLAPSED STATE: Compact Bar */
                        <div className="flex items-center justify-between text-xs text-muted-foreground py-0.5 group-hover:text-foreground transition-colors">
                          <span className="text-[11px] font-mono">
                            {companySets.length === 0 ? "No sets created" : `${companySets.length} set${companySets.length === 1 ? "" : "s"} available`}
                          </span>
                          <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                            Expand <ChevronDown className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section: Most Repeated Questions Across Companies */}
          {mostRepeatedQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-amber-400" /> Most Repeated Questions Across Companies
                </h2>
                <span className="text-xs text-muted-foreground font-mono">High Frequency Questions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mostRepeatedQuestions.map(({ question, freq }) => (
                  <Card key={question.id} className="p-4 border-amber-500/30 bg-amber-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Repeat className="h-3 w-3 mr-1" /> Seen {freq.count} Times
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
                        Asked in: {freq.companyNames.join(", ")}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-foreground leading-snug">{question.question}</p>
                    {question.answer && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-background/50 p-2 rounded">
                        {question.answer}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CompanyModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false);
          setEditingCompany(null);
        }}
        onSave={(name, desc) => {
          if (editingCompany) {
            updateCompany(editingCompany.id, { name, description: desc });
          } else {
            addCompany(name, desc);
          }
        }}
        initialCompany={editingCompany}
      />

      <QuestionSetModal
        isOpen={showQuestionSetModal}
        onClose={() => {
          setShowQuestionSetModal(false);
          setEditingQuestionSet(null);
        }}
        companies={companies}
        selectedCompanyId={selectedCompanyId || undefined}
        onSave={(data) => {
          if (editingQuestionSet) {
            updateQuestionSet(editingQuestionSet.id, data);
          } else {
            addQuestionSet(data.companyId, data);
          }
        }}
        initialSet={editingQuestionSet}
      />

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        companies={companies}
        selectedCompanyId={selectedCompanyId || undefined}
        onAddCompany={(name) => addCompany(name)}
        onImport={(data) => {
          const importedSet = bulkImportQuestionSet(data);
          if (importedSet) {
            setSelectedSetId(importedSet.id);
          }
        }}
      />
    </div>
  );
}
