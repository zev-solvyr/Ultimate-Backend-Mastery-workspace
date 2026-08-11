"use client";
import { use } from "react";
import Link from "next/link";
import { getMainTopic, getLevelByNumber } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { notFound } from "next/navigation";
export default function MainTopicPage({ params }: { params: Promise<{ level: string; topicId: string }> }) {
  const { level: value, topicId } = use(params); const level = getLevelByNumber(Number(value)); const topic = getMainTopic(Number(value), topicId); if (!level || !topic) notFound();
  return <div className="space-y-6"><Link href={`/roadmap/level/${level.level}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Level</Link><div><p className="text-sm text-primary">{level.title}</p><h1 className="text-3xl font-bold">{topic.title}</h1></div><div><h2 className="mb-3 text-sm font-semibold tracking-wider text-muted-foreground">SUBTOPICS</h2><div className="grid gap-2 sm:grid-cols-2">{topic.subtopics.map((subtopic) => <Link key={subtopic.id} href={`/roadmap/topic/${subtopic.id}`}><Card className="hover:border-primary/40"><CardContent className="flex items-center gap-3 py-4"><FileText className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{subtopic.title}</span></CardContent></Card></Link>)}</div></div></div>;
}
