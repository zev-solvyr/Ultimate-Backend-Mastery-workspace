"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInterviewQuestions } from "@/hooks/use-interview-questions";
import type { InterviewQuestion, InterviewTopic } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  ArrowRightLeft,
  ExternalLink,
  Save,
  X,
  Tag,
  Building,
  Check,
  Eye,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from "lucide-react";

export default function InterviewQuestionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading interview questions...</div>}>
      <InterviewQuestionsContent />
    </Suspense>
  );
}

function InterviewQuestionsContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "interview";

  const {
    loaded,
    topics,
    questions,
    addTopic,
    renameTopic,
    deleteTopic,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    duplicateQuestion,
  } = useInterviewQuestions();

  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Interview Mode state
  const [isInterviewMode, setIsInterviewMode] = useState(initialMode);
  const [interviewTopicId, setInterviewTopicId] = useState<string>("all");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Modals / Dialog states
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [topicNameInput, setTopicNameInput] = useState("");
  const [topicDescInput, setTopicDescInput] = useState("");
  const [editingTopic, setEditingTopic] = useState<InterviewTopic | null>(null);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [difficultyInput, setDifficultyInput] = useState<"Easy" | "Medium" | "Hard" | "">("");
  const [companyInput, setCompanyInput] = useState("");
  const [refUrlInput, setRefUrlInput] = useState("");
  const [targetTopicForNew, setTargetTopicForNew] = useState("");

  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [moveQuestionId, setMoveQuestionId] = useState<string | null>(null);
  const [moveTargetTopicId, setMoveTargetTopicId] = useState<string>("");

  const [inlineEditingAnswerId, setInlineEditingAnswerId] = useState<string | null>(null);
  const [inlineAnswerText, setInlineAnswerText] = useState<string>("");

  useEffect(() => {
    if (searchParams.get("mode") === "interview") {
      setIsInterviewMode(true);
    }
  }, [searchParams]);

  // All unique tags across questions
  const allTags = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  // Filtered questions for bank view
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchTopic = selectedTopicId === "all" || q.topicId === selectedTopicId;
      const matchTag = !selectedTag || q.tags.includes(selectedTag);
      const query = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        (q.company && q.company.toLowerCase().includes(query)) ||
        q.tags.some((t) => t.toLowerCase().includes(query));

      return matchTopic && matchTag && matchQuery;
    });
  }, [questions, selectedTopicId, selectedTag, searchQuery]);

  // Filtered questions for Interview Mode
  const interviewQuestionsList = useMemo(() => {
    if (interviewTopicId === "all") return questions;
    return questions.filter((q) => q.topicId === interviewTopicId);
  }, [questions, interviewTopicId]);

  const currentInterviewQuestion = useMemo(() => {
    if (interviewQuestionsList.length === 0) return null;
    return interviewQuestionsList[currentQuestionIdx % interviewQuestionsList.length] || interviewQuestionsList[0];
  }, [interviewQuestionsList, currentQuestionIdx]);

  const handleNextInterviewQuestion = () => {
    setIsAnswerRevealed(false);
    if (interviewQuestionsList.length > 1) {
      setCurrentQuestionIdx((prev) => (prev + 1) % interviewQuestionsList.length);
    }
  };

  const selectedTopic = useMemo(() => {
    return topics.find((t) => t.id === selectedTopicId);
  }, [topics, selectedTopicId]);

  if (!loaded) {
    return <div className="p-8 text-center text-muted-foreground">Loading interview questions...</div>;
  }

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicNameInput.trim()) return;
    addTopic(topicNameInput, topicDescInput);
    setTopicNameInput("");
    setTopicDescInput("");
    setShowAddTopic(false);
  };

  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !topicNameInput.trim()) return;
    renameTopic(editingTopic.id, topicNameInput, topicDescInput);
    setEditingTopic(null);
    setTopicNameInput("");
    setTopicDescInput("");
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    const topicId = targetTopicForNew || (selectedTopicId !== "all" ? selectedTopicId : topics[0]?.id || "core-java");
    addQuestion({
      topicId,
      question: questionInput.trim(),
      answer: answerInput.trim(),
      tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      difficulty: difficultyInput || undefined,
      company: companyInput.trim() || undefined,
      referenceUrl: refUrlInput.trim() || undefined,
    });
    setQuestionInput("");
    setAnswerInput("");
    setTagsInput("");
    setDifficultyInput("");
    setCompanyInput("");
    setRefUrlInput("");
    setShowAddQuestion(false);
  };

  const handleSaveEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !questionInput.trim()) return;
    updateQuestion(editingQuestion.id, {
      question: questionInput.trim(),
      answer: answerInput.trim(),
      tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      difficulty: difficultyInput || undefined,
      company: companyInput.trim() || undefined,
      referenceUrl: refUrlInput.trim() || undefined,
      topicId: targetTopicForNew || editingQuestion.topicId,
    });
    setEditingQuestion(null);
    setQuestionInput("");
    setAnswerInput("");
    setTagsInput("");
    setDifficultyInput("");
    setCompanyInput("");
    setRefUrlInput("");
  };

  const handleInlineSaveAnswer = (qId: string) => {
    updateQuestion(qId, { answer: inlineAnswerText });
    setInlineEditingAnswerId(null);
  };

  const handleExecuteMove = (qId: string) => {
    if (!moveTargetTopicId) return;
    moveQuestion(qId, moveTargetTopicId);
    setMoveQuestionId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> Interview Question Bank
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Personal interview questions, model answers, and revision notes. Completely editable and isolated per topic.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={isInterviewMode ? "secondary" : "default"}
            onClick={() => {
              setIsInterviewMode(!isInterviewMode);
              setIsAnswerRevealed(false);
            }}
            className="gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" /> {isInterviewMode ? "Exit Interview Mode" : "Interview Mode"}
          </Button>

          {!isInterviewMode && (
            <>
              <Button
                size="sm"
                onClick={() => {
                  setTargetTopicForNew(selectedTopicId !== "all" ? selectedTopicId : topics[0]?.id || "core-java");
                  setQuestionInput("");
                  setAnswerInput("");
                  setTagsInput("");
                  setDifficultyInput("");
                  setCompanyInput("");
                  setRefUrlInput("");
                  setShowAddQuestion(true);
                }}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-4 w-4" /> Add Question
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTopicNameInput("");
                  setTopicDescInput("");
                  setShowAddTopic(true);
                }}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Topic
              </Button>
            </>
          )}
        </div>
      </div>

      {/* INTERVIEW MODE VIEW */}
      {isInterviewMode ? (
        <Card className="border-border/60 bg-gradient-to-b from-card to-muted/20 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" /> Self-Interview Practice Mode
              </h2>
              <p className="text-xs text-muted-foreground">Practice answering questions from your personal question bank.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold">Filter Topic:</label>
              <select
                value={interviewTopicId}
                onChange={(e) => {
                  setInterviewTopicId(e.target.value);
                  setCurrentQuestionIdx(0);
                  setIsAnswerRevealed(false);
                }}
                className="h-8 px-2 rounded border bg-background text-xs"
              >
                <option value="all">All Topics ({questions.length})</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({questions.filter((q) => q.topicId === t.id).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!currentInterviewQuestion ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">No questions available yet for this topic.</p>
              <Button
                size="sm"
                onClick={() => {
                  setIsInterviewMode(false);
                  setShowAddQuestion(true);
                }}
                className="text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Questions To Start
              </Button>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">
                  Topic: {topics.find((t) => t.id === currentInterviewQuestion.topicId)?.name}
                </Badge>
                <span>
                  Question {(currentQuestionIdx % interviewQuestionsList.length) + 1} of {interviewQuestionsList.length}
                </span>
              </div>

              {/* Question Box */}
              <div className="bg-card p-5 rounded-xl border border-border/60 shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-foreground leading-relaxed">{currentInterviewQuestion.question}</h3>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {currentInterviewQuestion.difficulty && (
                    <Badge variant="secondary" className="text-[10px]">
                      {currentInterviewQuestion.difficulty}
                    </Badge>
                  )}
                  {currentInterviewQuestion.company && (
                    <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
                      <Building className="h-2.5 w-2.5 mr-1" /> {currentInterviewQuestion.company}
                    </Badge>
                  )}
                  {currentInterviewQuestion.tags.map((t, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] font-mono">
                      #{t}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Answer Box */}
              {isAnswerRevealed ? (
                <div className="bg-muted/30 p-5 rounded-xl border border-border/60 space-y-2 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Model Answer & Notes:</h4>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {currentInterviewQuestion.answer ? currentInterviewQuestion.answer : <span className="italic text-muted-foreground">No notes written for this question yet.</span>}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button size="default" variant="outline" onClick={() => setIsAnswerRevealed(true)} className="gap-2 text-xs font-bold">
                    <Eye className="h-4 w-4 text-primary" /> Reveal Answer
                  </Button>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
                <Button size="sm" variant="ghost" onClick={handleNextInterviewQuestion} className="text-xs gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Skip / Next
                </Button>

                {isAnswerRevealed && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={handleNextInterviewQuestion}>
                      Need Revision
                    </Button>
                    <Button size="sm" className="text-xs gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" variant="outline" onClick={handleNextInterviewQuestion}>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> I Know It
                    </Button>
                  </div>
                )}

                <Button size="sm" onClick={handleNextInterviewQuestion} className="gap-1.5 text-xs">
                  Next Question <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* STANDARD QUESTION BANK VIEW */
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Topic Sidebar */}
          <Card className="lg:col-span-1 border-border/50 h-fit">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Topics ({topics.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-2 space-y-1 max-h-[600px] overflow-y-auto">
              <button
                onClick={() => setSelectedTopicId("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                  selectedTopicId === "all" ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span>All Topics</span>
                <Badge variant="secondary" className="text-[10px]">
                  {questions.length}
                </Badge>
              </button>

              {topics.map((t) => {
                const qCount = questions.filter((q) => q.topicId === t.id).length;
                const isSelected = selectedTopicId === t.id;
                return (
                  <div key={t.id} className="group relative flex items-center justify-between">
                    <button
                      onClick={() => setSelectedTopicId(t.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors pr-12 ${
                        isSelected ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="truncate">{t.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {qCount}
                      </Badge>
                    </button>
                    <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-card px-1">
                      <button
                        onClick={() => {
                          setEditingTopic(t);
                          setTopicNameInput(t.name);
                          setTopicDescInput(t.description || "");
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        title="Rename Topic"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete topic "${t.name}" and all its questions?`)) {
                            deleteTopic(t.id);
                            if (selectedTopicId === t.id) setSelectedTopicId("all");
                          }
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive"
                        title="Delete Topic"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Right Questions Workspace */}
          <div className="lg:col-span-3 space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-lg border border-border/50">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search questions, answers, tags, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {selectedTag && (
                <Button size="sm" variant="ghost" onClick={() => setSelectedTag(null)} className="text-xs text-muted-foreground gap-1">
                  Clear Tag: {selectedTag} <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Tags Pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Tag className="h-3 w-3" /> Filter Tag:
                </span>
                {allTags.slice(0, 15).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Selected Topic Title */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {selectedTopicId === "all" ? "All Questions" : selectedTopic?.name}
                </h2>
                {selectedTopic?.description && <p className="text-xs text-muted-foreground">{selectedTopic.description}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{filteredQuestions.length} questions</span>
            </div>

            {/* Question List */}
            {filteredQuestions.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm text-muted-foreground">No interview questions found.</p>
                <Button
                  size="sm"
                  className="mt-3 text-xs gap-1"
                  onClick={() => {
                    setTargetTopicForNew(selectedTopicId !== "all" ? selectedTopicId : topics[0]?.id || "");
                    setShowAddQuestion(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add First Question
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => {
                  const topicObj = topics.find((t) => t.id === q.topicId);
                  const isEditingAnswer = inlineEditingAnswerId === q.id;

                  return (
                    <Card key={q.id} className="border-border/50 hover:border-border transition-colors">
                      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-primary font-mono">Q{idx + 1}.</span>
                            <h3 className="font-bold text-sm text-foreground">{q.question}</h3>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Topic: {topicObj?.name || q.topicId}
                            </Badge>
                            {q.difficulty && (
                              <Badge
                                variant="secondary"
                                className={`text-[10px] ${
                                  q.difficulty === "Easy"
                                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                                    : q.difficulty === "Medium"
                                    ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
                                    : "text-rose-500 bg-rose-500/10 border-rose-500/30"
                                }`}
                              >
                                {q.difficulty}
                              </Badge>
                            )}
                            {q.company && (
                              <Badge variant="outline" className="text-[10px] flex items-center gap-1 text-cyan-400 border-cyan-500/40">
                                <Building className="h-2.5 w-2.5" /> {q.company}
                              </Badge>
                            )}
                            {q.referenceUrl && (
                              <a
                                href={q.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                              >
                                Ref <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Question Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Duplicate Question"
                            onClick={() => duplicateQuestion(q.id)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Move Question to Topic"
                            onClick={() => {
                              setMoveQuestionId(q.id);
                              setMoveTargetTopicId(q.topicId);
                            }}
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit Full Question"
                            onClick={() => {
                              setEditingQuestion(q);
                              setQuestionInput(q.question);
                              setAnswerInput(q.answer);
                              setTagsInput(q.tags.join(", "));
                              setDifficultyInput(q.difficulty || "");
                              setCompanyInput(q.company || "");
                              setRefUrlInput(q.referenceUrl || "");
                              setTargetTopicForNew(q.topicId);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Delete Question"
                            onClick={() => {
                              if (confirm("Delete this question?")) deleteQuestion(q.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-2 space-y-3">
                        {/* My Answer / Notes Section */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">My Answer & Notes:</span>
                            {!isEditingAnswer ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[11px] px-2 text-primary"
                                onClick={() => {
                                  setInlineEditingAnswerId(q.id);
                                  setInlineAnswerText(q.answer);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" /> Quick Edit Answer
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-emerald-500" onClick={() => handleInlineSaveAnswer(q.id)}>
                                  <Save className="h-3 w-3 mr-1" /> Save
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-muted-foreground" onClick={() => setInlineEditingAnswerId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>

                          {isEditingAnswer ? (
                            <textarea
                              value={inlineAnswerText}
                              onChange={(e) => setInlineAnswerText(e.target.value)}
                              className="w-full p-2.5 text-xs bg-background border rounded-md text-foreground min-h-[120px] focus:outline-none focus:ring-1 focus:ring-ring font-sans"
                              placeholder="Write your answer or notes here..."
                            />
                          ) : (
                            <div className="bg-muted/20 p-3 rounded-md border border-border/30 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                              {q.answer ? q.answer : <span className="italic text-muted-foreground">No answer added yet. Click 'Quick Edit Answer' to write your notes.</span>}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {q.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {q.tags.map((tag, tIdx) => (
                              <Badge key={tIdx} variant="secondary" className="text-[10px] font-mono">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal / Overlay: Add/Edit Topic */}
      {(showAddTopic || editingTopic) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingTopic ? "Edit Topic" : "Add New Topic"}</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setShowAddTopic(false); setEditingTopic(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={editingTopic ? handleSaveEditTopic : handleCreateTopic} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring Boot, Kafka, System Design"
                  value={topicNameInput}
                  onChange={(e) => setTopicNameInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>
              <div>
                <label className="font-semibold">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short description of this topic"
                  value={topicDescInput}
                  onChange={(e) => setTopicDescInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddTopic(false); setEditingTopic(null); }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingTopic ? "Save Changes" : "Create Topic"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal / Overlay: Add/Edit Question */}
      {(showAddQuestion || editingQuestion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingQuestion ? "Edit Question" : "Add New Interview Question"}</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setShowAddQuestion(false); setEditingQuestion(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={editingQuestion ? handleSaveEditQuestion : handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Target Topic</label>
                <select
                  value={targetTopicForNew}
                  onChange={(e) => setTargetTopicForNew(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the difference between HashMap and ConcurrentHashMap?"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold">My Answer / Notes</label>
                <textarea
                  placeholder="Write your explanation, notes, or key talking points..."
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  className="mt-1 w-full p-2.5 border rounded-md bg-background text-foreground text-xs min-h-[120px]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-semibold">Difficulty (Optional)</label>
                  <select
                    value={difficultyInput}
                    onChange={(e) => setDifficultyInput(e.target.value as any)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  >
                    <option value="">None</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Interview Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon, Google, Uber"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. collections, hashmap, concurrency"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="font-semibold">Reference Link / URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://docs.oracle.com/..."
                  value={refUrlInput}
                  onChange={(e) => setRefUrlInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddQuestion(false); setEditingQuestion(null); }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingQuestion ? "Save Question" : "Add Question"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal / Overlay: Move Question to Topic */}
      {moveQuestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Move Question to Topic</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setMoveQuestionId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="font-semibold">Select Destination Topic</label>
              <select
                value={moveTargetTopicId}
                onChange={(e) => setMoveTargetTopicId(e.target.value)}
                className="w-full px-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setMoveQuestionId(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleExecuteMove(moveQuestionId)}>
                  Move Question
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
