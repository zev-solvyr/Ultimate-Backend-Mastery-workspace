"use client";

import React, { useState } from "react";
import type { ProjectGuide, ProjectInterviewPrompt } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquareCode, HelpCircle, Lightbulb, Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectInterviewTabProps {
  guide: ProjectGuide;
  onUpdate: (data: Partial<ProjectGuide>) => void;
}

export function ProjectInterviewTab({ guide, onUpdate }: ProjectInterviewTabProps) {
  const interview = guide.interviewDiscussion ?? {
    elevatorPitch: "Project elevator pitch.",
    architectureExplanation: "Architecture explanation.",
    prompts: [
      {
        id: "ip-1",
        topic: "Architecture Trade-Offs",
        question: "Why microservices instead of a monolith?",
        discussionPoints: ["Independent scaling", "Domain boundary isolation"],
      },
    ],
  };

  const [isEditing, setIsEditing] = useState(false);
  const [pitch, setPitch] = useState(interview.elevatorPitch);
  const [archExp, setArchExp] = useState(interview.architectureExplanation);
  const [promptsList, setPromptsList] = useState<ProjectInterviewPrompt[]>(interview.prompts);

  const handleSave = () => {
    onUpdate({
      interviewDiscussion: {
        elevatorPitch: pitch,
        architectureExplanation: archExp,
        prompts: promptsList,
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Interview & Technical Discussion Prompts</h2>
          <p className="text-xs text-muted-foreground">Elevator pitch, architecture explanations, and discussion prompts to prepare for backend engineering interviews.</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) {
              setPitch(interview.elevatorPitch);
              setArchExp(interview.architectureExplanation);
              setPromptsList(interview.prompts);
            }
            setIsEditing(!isEditing);
          }}
          className="gap-1.5 text-xs"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {isEditing ? "Cancel" : "Edit Interview Prep"}
        </Button>
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold">Elevator Pitch (30-second summary)</label>
            <textarea
              value={pitch}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPitch(e.target.value)}
              className="mt-1 w-full p-2 border rounded text-xs bg-background text-foreground min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Architecture Explanation</label>
            <textarea
              value={archExp}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setArchExp(e.target.value)}
              className="mt-1 w-full p-2 border rounded text-xs bg-background text-foreground min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Discussion Prompts & Questions</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setPromptsList([
                    ...promptsList,
                    {
                      id: `ip-${Date.now()}`,
                      topic: "Topic Name",
                      question: "Interview Question?",
                      discussionPoints: ["Talking point 1"],
                    },
                  ])
                }
                className="text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Prompt
              </Button>
            </div>

            {promptsList.map((prompt, idx) => (
              <Card key={idx} className="p-3 space-y-2 bg-muted/20 border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={prompt.topic}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...promptsList];
                      next[idx].topic = e.target.value;
                      setPromptsList(next);
                    }}
                    placeholder="Topic (e.g. Concurrency)"
                    className="font-bold text-xs max-w-xs px-2 py-1 border rounded bg-background text-foreground"
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => setPromptsList(promptsList.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  type="text"
                  value={prompt.question}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = [...promptsList];
                    next[idx].question = e.target.value;
                    setPromptsList(next);
                  }}
                  placeholder="Interview Question"
                  className="w-full px-2 py-1 border rounded text-xs bg-background text-foreground"
                />
                <textarea
                  value={prompt.discussionPoints.join("\n")}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const next = [...promptsList];
                    next[idx].discussionPoints = e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean);
                    setPromptsList(next);
                  }}
                  placeholder="Discussion points (1 per line)"
                  className="w-full p-2 border rounded text-xs bg-background text-foreground min-h-[60px]"
                />
              </Card>
            ))}
          </div>

          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                <MessageSquareCode className="h-4 w-4" /> 30-Second Elevator Pitch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90 bg-muted/20 p-3 rounded border border-border/30">{pitch}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-500">
                <Lightbulb className="h-4 w-4" /> High-Level Architecture Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground bg-muted/20 p-3 rounded border border-border/30">{archExp}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-500" /> Key Technical Discussion Prompts
              </CardTitle>
              <CardDescription className="text-xs">Interview questions and key architectural talking points to discuss during technical screens.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {promptsList.map((prompt, idx) => (
                <div key={idx} className="bg-muted/20 p-3.5 rounded-lg border border-border/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-400/40">
                      {prompt.topic}
                    </Badge>
                  </div>
                  <p className="font-bold text-sm text-foreground">Q: {prompt.question}</p>
                  <div className="pt-1">
                    <p className="font-semibold text-primary mb-1">Key Discussion Talking Points:</p>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      {prompt.discussionPoints.map((point, pIdx) => (
                        <li key={pIdx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
