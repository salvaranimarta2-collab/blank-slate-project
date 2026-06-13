import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

// Sends an in-app message to the owner of a user-created project, or just logs
// outreach when the project is a seed-data project (no owning user account).
export function InAppMessageButton({
  projectRef,
  orgRef,
  ownerUserId,
  defaultBody,
}: {
  projectRef: string;
  orgRef: string;
  ownerUserId?: string | null;
  defaultBody: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline" className="shrink-0">
        <Link to="/auth">
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          Sign in to message
        </Link>
      </Button>
    );
  }

  async function send() {
    if (!user) return;
    setSending(true);
    try {
      if (ownerUserId && ownerUserId !== user.id) {
        // Create or fetch thread, then post a message
        const a = user.id < ownerUserId ? user.id : ownerUserId;
        const b = user.id < ownerUserId ? ownerUserId : user.id;
        const { data: existing } = await supabase
          .from("threads")
          .select("id")
          .eq("participant_a", a)
          .eq("participant_b", b)
          .eq("project_ref", projectRef)
          .maybeSingle();
        let threadId = existing?.id as string | undefined;
        if (!threadId) {
          const { data: created, error } = await supabase
            .from("threads")
            .insert({ participant_a: a, participant_b: b, project_ref: projectRef })
            .select("id")
            .single();
          if (error) throw error;
          threadId = created.id;
        }
        const { error: msgErr } = await supabase
          .from("messages")
          .insert({ thread_id: threadId, from_user_id: user.id, body: body.trim() });
        if (msgErr) throw msgErr;
        await supabase.from("outreach_log").insert({
          from_user_id: user.id,
          to_user_id: ownerUserId,
          to_org_ref: orgRef,
          to_project_ref: projectRef,
          channel: "in_app",
          message: body.trim().slice(0, 200),
        });
      } else {
        // Seed-data project — log outreach only
        await supabase.from("outreach_log").insert({
          from_user_id: user.id,
          to_user_id: null,
          to_org_ref: orgRef,
          to_project_ref: projectRef,
          channel: "in_app",
          message: body.trim().slice(0, 200),
        });
      }
      toast.success(ownerUserId ? "Message sent" : "Logged in your dashboard");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="shrink-0">
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          Message in-app
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send an in-app message</DialogTitle>
          <DialogDescription>
            {ownerUserId
              ? "They'll see this in their dashboard and can reply to start a thread."
              : "This contact doesn't have an account yet — we'll log it in your dashboard so you can follow up."}
          </DialogDescription>
        </DialogHeader>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={1000} />
        <Button onClick={send} disabled={sending || !body.trim()}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Helper for the SMS button: log the click in outreach_log when signed in.
export async function logSmsOutreach(args: {
  projectRef: string;
  orgRef: string;
  ownerUserId?: string | null;
}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("outreach_log").insert({
    from_user_id: data.user.id,
    to_user_id: args.ownerUserId ?? null,
    to_org_ref: args.orgRef,
    to_project_ref: args.projectRef,
    channel: "sms",
  });
}

