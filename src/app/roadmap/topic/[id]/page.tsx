"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTopicById, getMappingForTopic } from "@/lib/data";
import { getDifficultyColor } from "@/lib/utils";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, HelpCircle, Dumbbell, Link2 } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { notFound } from "next/navigation";

export default function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topic = getTopicById(id);
  const mapping = getMappingForTopic(id);
  const { state, updateTopicProgress, updatePersonalNotes, addStudyTime } = useProgress();
  const [notes, setNotes] = useState(state.personalNotes[id] ?? "");

  if (!topic) notFound();

  const progress = state.topicProgress[id] ?? 0;

  const handleSaveNotes = () => {
    updatePersonalNotes(id, notes);
    addStudyTime(id, 15);
    updateTopicProgress(id, Math.min(100, progress + 10));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href={`/roadmap/level/${id.match(/level-(\d+)/)?.[1]}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Level
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">{topic.title}</h1>
        <div className="flex gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(topic.difficulty)}`}>{topic.difficulty}</span>
          <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{topic.estimatedLearningTime}</Badge>
        </div>
        <Progress value={progress} className="mt-4" />
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={() => updateTopicProgress(id, Math.min(100, progress + 25))}>Mark Progress +25%</Button>
          <Button size="sm" variant="outline" onClick={() => updateTopicProgress(id, 100)}>Mark Complete</Button>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="code">Code Examples</TabsTrigger>
          <TabsTrigger value="practices">Best Practices</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Section title="Overview" content={topic.overview} />
          <Section title="Why It Exists" content={topic.whyItExists} />
          <Section title="Internal Working" content={topic.internalWorking} />
          <Section title="Real-World Usage" content={topic.realWorldUsage} />
          {topic.prerequisites.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Prerequisites</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {topic.prerequisites.map((p) => (
                  <Link key={p} href={`/roadmap/topic/${p}`}><Badge variant="outline">{p}</Badge></Link>
                ))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">Resources</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topic.links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Link2 className="h-3 w-3" /> {link.title} <Badge variant="secondary" className="text-[10px]">{link.type}</Badge>
                </a>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          {topic.codeExamples.map((ex, i) => (
            <CodeBlock key={i} title={ex.title} language={ex.language} code={ex.code} />
          ))}
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <ListSection title="Best Practices" items={topic.bestPractices} icon={CheckCircle2} color="text-emerald-400" />
          <ListSection title="Common Mistakes" items={topic.commonMistakes} icon={AlertTriangle} color="text-amber-400" />
        </TabsContent>

        <TabsContent value="interview" className="space-y-4">
          {topic.interviewQuestions.map((q, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" /> Q{i + 1}: {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{q.answer}</p></CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          {topic.practiceExercises.map((ex, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" /> {ex.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{ex.description}</p>
                <Badge className="mt-2" variant="outline">{ex.difficulty}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {mapping?.projects.map((p) => (
            <Card key={p.projectId}>
              <CardHeader>
                <CardTitle className="text-base">
                  <Link href={`/projects/${p.projectId}`} className="hover:text-primary">{p.projectName}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{p.implementation}</p>
                <Badge variant="secondary">Phase: {p.phase}</Badge>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.files.map((f) => <Badge key={f} variant="outline" className="text-[10px] font-mono">{f}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )) ?? <p className="text-muted-foreground">No project mappings yet.</p>}
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Notes</CardTitle></CardHeader>
            <CardContent>
              <textarea
                className="w-full h-40 rounded-lg bg-secondary/50 border border-border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button size="sm" className="mt-2" onClick={handleSaveNotes}>Save Notes (+10% progress)</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{content}</p></CardContent>
    </Card>
  );
}

function ListSection({ title, items, icon: Icon, color }: { title: string; items: string[]; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
