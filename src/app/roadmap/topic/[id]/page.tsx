"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getTopicById } from "@/lib/data";
import { useKnowledgeBase, type InterviewQuestion } from "@/hooks/use-knowledge-base";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { logUserActivity } from "@/hooks/use-activity";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const question = (): InterviewQuestion => ({ id: crypto.randomUUID(), question: "", answer: "" });

export default function SubtopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topic = getTopicById(id);
  if (!topic) notFound();

  useEffect(() => {
    logUserActivity({
      type: "roadmap",
      title: topic.title,
      subtitle: `Roadmap: ${topic.module}`,
      href: `/roadmap/topic/${id}`,
    });
  }, [id, topic]);

  const { content, loaded, saveNotes, saveCode, saveQuestions } = useKnowledgeBase(id);
  const [notes, setNotes] = useState(""); const [code, setCode] = useState(""); const [questions, setQuestions] = useState<InterviewQuestion[]>([]); const [saved, setSaved] = useState("");
  useEffect(() => { if (loaded) { setNotes(content.notes); setCode(content.code); setQuestions(content.interviewQuestions); } }, [loaded, content]);
  const confirm = (message: string) => { setSaved(message); window.setTimeout(() => setSaved(""), 1800); };
  const removeQuestion = (questionId: string) => { const next = questions.filter((value) => value.id !== questionId); setQuestions(next); saveQuestions(next); confirm("Question deleted"); };
  return <div className="max-w-4xl space-y-6"><Link href={`/roadmap/level/${id.match(/level-(\d+)/)?.[1]}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Level</Link><div><p className="text-sm text-primary">{topic.module}</p><h1 className="text-3xl font-bold">{topic.title}</h1>{saved && <p className="mt-2 text-sm text-emerald-400">{saved}</p>}</div><Tabs defaultValue="notes"><TabsList><TabsTrigger value="notes">My Notes</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger><TabsTrigger value="questions">Interview Questions</TabsTrigger></TabsList><TabsContent value="notes"><Editor title="My Notes" value={notes} onChange={setNotes} onSave={() => { saveNotes(notes); confirm("Notes saved"); }} placeholder="Write your notes..." /></TabsContent><TabsContent value="code"><Card><CardHeader><CardTitle>Code</CardTitle><p className="text-xs text-muted-foreground">Java</p></CardHeader><CardContent><div className="overflow-hidden rounded-lg border border-border"><MonacoEditor height="420px" language="java" theme="vs-dark" value={code} onChange={(value) => setCode(value ?? "")} options={{ fontSize: 14, fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace", lineNumbers: "on", minimap: { enabled: false }, wordWrap: "off", automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4, insertSpaces: true, renderWhitespace: "selection", padding: { top: 12, bottom: 12 } }} /></div>{!code && <p className="mt-2 text-xs text-muted-foreground">Write your Java code here...</p>}<Button className="mt-3" onClick={() => { saveCode(code); confirm("Code saved"); }}>Save Code</Button></CardContent></Card></TabsContent><TabsContent value="questions"><Card><CardHeader><CardTitle>Interview Questions</CardTitle></CardHeader><CardContent className="space-y-4">{questions.map((item, index) => <div key={item.id} className="space-y-2 border-b border-border/50 pb-4"><input className="w-full rounded border border-border bg-secondary/40 p-2 text-sm" placeholder={`Question ${index + 1}`} value={item.question} onChange={(event) => setQuestions(questions.map((value) => value.id === item.id ? { ...value, question: event.target.value } : value))} /><textarea className="h-28 w-full rounded border border-border bg-secondary/40 p-2 text-sm" placeholder="Answer" value={item.answer} onChange={(event) => setQuestions(questions.map((value) => value.id === item.id ? { ...value, answer: event.target.value } : value))} /><Button variant="ghost" size="sm" onClick={() => removeQuestion(item.id)}><Trash2 className="h-4 w-4" /> Delete</Button></div>)}<div className="flex gap-2"><Button variant="outline" onClick={() => setQuestions([...questions, question()])}>Add Interview Question</Button><Button onClick={() => { saveQuestions(questions); confirm("Questions saved"); }}>Save Questions</Button></div></CardContent></Card></TabsContent></Tabs></div>;
}
function Editor({ title, value, onChange, onSave, placeholder, mono = false }: { title: string; value: string; onChange: (value: string) => void; onSave: () => void; placeholder: string; mono?: boolean }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><textarea className={`h-64 w-full resize-y rounded border border-border bg-secondary/40 p-3 text-sm ${mono ? "font-mono" : ""}`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><Button className="mt-3" onClick={onSave}>Save {title}</Button></CardContent></Card>; }
