"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, User, X, Cloud, AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { isConfigured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          onClose();
        }
      } else {
        const { error } = await signUp(email.trim(), password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg("Account created! Check your email for confirmation or log in.");
          setMode("signin");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 border-border/60 space-y-4 shadow-2xl relative bg-card">
        <Button size="icon" variant="ghost" className="absolute right-4 top-4 h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-primary border-primary/40">
              <Cloud className="h-3 w-3 mr-1" /> Cloud Sync Account
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {mode === "signin" ? "Sign In to Your Workspace" : "Create Cloud Workspace Account"}
          </CardTitle>
          <CardDescription className="text-xs">
            Sync your notes, interview questions, resources, and engineering labs across laptop and phone.
          </CardDescription>
        </div>

        {!isConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="h-4 w-4 shrink-0" /> Supabase Credentials Required
            </div>
            <p className="text-[11px] leading-relaxed">
              Add your <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to your environment to enable live cloud syncing.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-foreground">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded-md bg-background text-foreground text-xs"
              />
            </div>
          </div>

          <Button type="submit" size="sm" className="w-full text-xs font-semibold gap-2 mt-2" disabled={loading || !isConfigured}>
            {loading ? "Processing..." : mode === "signin" ? "Sign In & Sync" : "Create Workspace Account"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/40">
          {mode === "signin" ? (
            <p>
              Don't have a cloud account?{" "}
              <button onClick={() => setMode("signup")} className="text-primary font-bold hover:underline">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-primary font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
