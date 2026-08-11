"use client";
import Link from "next/link";
import { roadmap } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
export default function RoadmapPage() { return <div className="space-y-6"><div><h1 className="text-3xl font-bold gradient-text">{roadmap.title}</h1><p className="mt-2 text-muted-foreground">{roadmap.description}</p></div><div className="grid gap-4 sm:grid-cols-2">{roadmap.levels.map((level) => <Link key={level.level} href={`/roadmap/level/${level.level}`}><Card className="h-full hover:border-primary/40"><CardContent className="pt-6"><p className="text-sm text-primary">Level {level.level}</p><h2 className="mt-1 text-lg font-semibold">{level.title}</h2><p className="mt-2 text-sm text-muted-foreground">{level.description}</p></CardContent></Card></Link>)}</div></div>; }
