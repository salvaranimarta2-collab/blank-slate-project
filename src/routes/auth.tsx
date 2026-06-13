import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { AppRole } from "@/lib/use-auth";
import { DEMO_ACCOUNTS, ensureDemoAccount, type DemoRole } from "@/lib/demo-auth.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FieldMap" },
      { name: "description", content: "Create an account or sign in to FieldMap." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AppRole>("donor");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName, role },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function loginAsDemo(role: DemoRole) {
    setLoading(true);
    try {
      const creds = await ensureDemoAccount({ data: { role } });
      const { error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });
      if (error) throw error;
      toast.success(`Signed in as ${DEMO_ACCOUNTS[role].label}`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Demo sign-in failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-5 rounded-md border border-dashed bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Try a demo account
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pre-loaded with real map data so you can explore the dashboard.
          </p>
          <div className="mt-3 grid gap-2">
            {(Object.keys(DEMO_ACCOUNTS) as DemoRole[]).map((r) => (
              <button
                key={r}
                type="button"
                disabled={loading}
                onClick={() => loginAsDemo(r)}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-xs transition hover:bg-accent disabled:opacity-50"
              >
                <span className="font-semibold">{DEMO_ACCOUNTS[r].label}</span>
                <span className="text-muted-foreground">{DEMO_ACCOUNTS[r].sublabel}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <h1 className="text-xl font-semibold">
            {mode === "signup" ? "Create your FieldMap account" : "Sign in to FieldMap"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Pick your account type to get started."
              : "Welcome back."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="display_name">Your name or organisation</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Account type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["rlo", "ngo", "donor"] as AppRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={
                        "rounded-md border px-2 py-2 text-xs font-medium uppercase transition " +
                        (role === r
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-accent")
                      }
                    >
                      {r === "rlo" ? "RLO" : r === "ngo" ? "NGO" : "Donor"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
          <Link to="/" className="hover:underline">
            ← Back to map
          </Link>
        </div>
      </Card>
    </div>
  );
}
