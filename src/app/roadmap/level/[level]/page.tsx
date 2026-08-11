"use client";
import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getMainTopicsForLevel, getLevelByNumber } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Folder } from "lucide-react";
import { notFound } from "next/navigation";
export default function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: value } = use(params); const level = getLevelByNumber(Number(value)); if (!level) notFound();
  const mainTopics = getMainTopicsForLevel(level.level);
  return <div className="space-y-6"><Link href="/roadmap" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Roadmap</Link><motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}><p className="text-sm text-primary">Level {level.level}</p><h1 className="text-3xl font-bold">{level.title}</h1><p className="mt-2 text-muted-foreground">{level.description}</p></motion.div><div><h2 className="mb-3 text-sm font-semibold tracking-wider text-muted-foreground">MAIN TOPICS</h2><div className="grid gap-3 sm:grid-cols-2">{mainTopics.map((topic) => <Link key={topic.id} href={`/roadmap/level/${level.level}/topic/${topic.id}`}><Card className="h-full hover:border-primary/40"><CardContent className="flex items-center gap-3 pt-6"><Folder className="h-5 w-5 text-primary" /><div><p className="font-medium">{topic.title}</p><p className="text-xs text-muted-foreground">{topic.subtopics.length} subtopics</p></div></CardContent></Card></Link>)}</div></div></div>;
}
