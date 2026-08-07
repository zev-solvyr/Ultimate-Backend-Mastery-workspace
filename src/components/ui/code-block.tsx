"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({ code, language = "java", title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-lg border border-border/50 overflow-hidden", className)}>
      {(title || language) && (
        <div className="flex items-center justify-between bg-secondary/80 px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            {title && <span className="text-xs text-muted-foreground ml-2">{title}</span>}
          </div>
          <div className="flex items-center gap-2">
            <BadgeLang language={language} />
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}
      <pre className="bg-[#0d1117] p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-[13px] text-slate-300">{code}</code>
      </pre>
    </div>
  );
}

function BadgeLang({ language }: { language: string }) {
  const colors: Record<string, string> = {
    java: "text-orange-400 bg-orange-400/10",
    yaml: "text-purple-400 bg-purple-400/10",
    sql: "text-blue-400 bg-blue-400/10",
    dockerfile: "text-cyan-400 bg-cyan-400/10",
    json: "text-yellow-400 bg-yellow-400/10",
  };
  return (
    <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium uppercase", colors[language] ?? "text-muted-foreground bg-muted")}>
      {language}
    </span>
  );
}
