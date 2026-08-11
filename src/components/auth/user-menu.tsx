"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthModal } from "./auth-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, User, LogOut, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export function UserMenu() {
  const { user, loading, isConfigured, syncState, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return <div className="h-8 w-24 bg-muted/40 animate-pulse rounded-md" />;
  }

  const getSyncBadge = () => {
    switch (syncState) {
      case "synced":
        return (
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-500/10 gap-1 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Synced
          </Badge>
        );
      case "syncing":
        return (
          <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/40 bg-amber-500/10 gap-1 font-mono">
            <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Syncing...
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="text-[10px] text-rose-400 border-rose-500/40 bg-rose-500/10 gap-1 font-mono">
            <AlertCircle className="h-2.5 w-2.5" /> Sync Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 gap-1 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" /> Offline Mode
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="relative flex items-center gap-2">
        {getSyncBadge()}

        {user ? (
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs font-semibold border-border/50 bg-card hover:bg-muted/30"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[120px] truncate">{user.email}</span>
            </Button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border/60 bg-card p-1 shadow-xl z-50 text-xs">
                <div className="px-3 py-2 border-b border-border/30">
                  <p className="text-[10px] text-muted-foreground font-mono">Signed in as</p>
                  <p className="font-bold text-foreground truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    signOut();
                  }}
                  className="w-full text-left px-3 py-2 rounded text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors mt-1 font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setShowAuthModal(true)}
          >
            <Cloud className="h-3.5 w-3.5" /> Sign In / Sync
          </Button>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
