"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/use-progress";
import { UserMenu } from "@/components/auth/user-menu";

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { state, getOverallProgress } = useProgress();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-border/50 bg-card/90 backdrop-blur-xl px-4 py-3 lg:hidden">
      <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="text-center">
        <p className="text-sm font-bold gradient-text">Backend Interview Mastery</p>
        <p className="text-[10px] text-muted-foreground">{Math.round(getOverallProgress())}% · Lv.{state.stats.level}</p>
      </div>
      <UserMenu />
    </header>
  );
}
