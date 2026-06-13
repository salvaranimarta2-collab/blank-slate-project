import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { draftDonorMessage, type DonorInput } from "@/lib/draft-donor-message.functions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorInput;
};

export function ContactDonorDialog({ open, onOpenChange, donor }: Props) {
  const draft = useServerFn(draftDonorMessage);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setSubject("");
    setBody("");
    draft({ data: { donor } })
      .then((res) => {
        if (cancelled) return;
        setSubject(res.subject);
        setBody(res.body);
      })
      .catch((e) => {
        if (cancelled) return;
        toast.error("Couldn't draft message", { description: String(e?.message ?? e) });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, donor.id]);

  async function handleSend() {
    setSending(true);
    // In-app send (no email). Simulate delivery — wire to a messages table later.
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    onOpenChange(false);
    toast.success(`Message sent to ${donor.name}`, {
      description: "They'll see it in their Waythrough inbox.",
    });
  }

  function regenerate() {
    let cancelled = false;
    setLoading(true);
    draft({ data: { donor } })
      .then((res) => {
        if (cancelled) return;
        setSubject(res.subject);
        setBody(res.body);
      })
      .catch((e) =>
        toast.error("Couldn't draft message", { description: String(e?.message ?? e) }),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Contact {donor.name}</DialogTitle>
          <DialogDescription>
            We drafted a personalised message using your initiatives and what we know
            about this donor. Edit anything before sending.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Drafting a personalised message…
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                className="font-normal"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={regenerate}
            disabled={loading || sending}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Regenerate
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={loading || sending || !subject.trim() || !body.trim()}
          >
            {sending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-4 w-4" />
            )}
            Send message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
