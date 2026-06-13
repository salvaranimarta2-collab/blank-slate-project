import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Messages — FieldMap" }] }),
  component: MessagesPage,
});

type ThreadRow = {
  id: string;
  participant_a: string;
  participant_b: string;
  project_ref: string | null;
  updated_at: string;
};

function MessagesPage() {
  const { user, loading } = useAuth();

  if (loading || !user)
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Shell>
    );

  return (
    <Shell>
      <ThreadsList userId={user.id} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </Link>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <MessageSquare className="h-6 w-6" /> Messages
        </h1>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          In-app conversations with donors, NGOs and RLOs
        </p>
      </div>
      {children}
    </div>
  );
}

function ThreadsList({ userId }: { userId: string }) {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [active, setActive] = useState<ThreadRow | null>(null);

  useEffect(() => {
    supabase
      .from("threads")
      .select("*")
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order("updated_at", { ascending: false })
      .then(({ data }) => setThreads((data as ThreadRow[]) ?? []));
  }, [userId]);

  if (threads.length === 0)
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        No in-app conversations yet. Click any project on the map and use
        "Message in-app" to start one.
      </Card>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
      <ul className="space-y-2">
        {threads.map((t) => {
          const other =
            t.participant_a === userId ? t.participant_b : t.participant_a;
          return (
            <li key={t.id}>
              <button
                onClick={() => setActive(t)}
                className={`w-full rounded-md border bg-card p-3 text-left text-sm transition-colors ${
                  active?.id === t.id
                    ? "border-primary bg-muted/40"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="truncate font-medium">{other.slice(0, 8)}…</div>
                {t.project_ref && (
                  <div className="truncate text-xs text-muted-foreground">
                    {t.project_ref}
                  </div>
                )}
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(t.updated_at).toLocaleString()}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {active ? (
        <ThreadView userId={userId} thread={active} />
      ) : (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Pick a thread to read.
        </Card>
      )}
    </div>
  );
}

function ThreadView({ userId, thread }: { userId: string; thread: ThreadRow }) {
  const [messages, setMessages] = useState<
    { id: string; from_user_id: string; body: string; created_at: string }[]
  >([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("messages")
      .select("id, from_user_id, body, created_at")
      .eq("thread_id", thread.id)
      .order("created_at");
    setMessages(data ?? []);
  }
  useEffect(() => {
    load();
  }, [thread.id]);

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      thread_id: thread.id,
      from_user_id: userId,
      body: body.trim(),
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBody("");
    load();
  }

  return (
    <Card className="flex h-[520px] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from_user_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-md px-3 py-1.5 text-sm ${
                  m.from_user_id === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {m.body}
                <div className="mt-0.5 text-[10px] opacity-60">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 border-t p-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={1000}
        />
        <Button size="sm" onClick={send} disabled={sending}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
