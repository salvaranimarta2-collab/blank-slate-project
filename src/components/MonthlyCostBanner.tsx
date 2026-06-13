import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, X } from "lucide-react";

// Demo figures — purely illustrative of the site's running costs.
const MONTHLY_GOAL = 850; // USD
const RAISED = 412; // USD

export function MonthlyCostBanner() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Reopen on every first visit of a page (per browser session).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `monthly-cost-dismissed:${pathname}`;
    if (sessionStorage.getItem(key) !== "1") setOpen(true);
  }, [pathname]);

  function close() {
    setOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`monthly-cost-dismissed:${pathname}`, "1");
    }
  }

  if (!open) return null;

  const pct = Math.min(100, Math.round((RAISED / MONTHLY_GOAL) * 100));

  return (
    <div className="border-b bg-gradient-to-r from-[hsl(152_65%_36%)]/10 via-[hsl(212_85%_48%)]/5 to-transparent px-4 py-2">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Heart className="h-4 w-4 shrink-0 text-[hsl(152_65%_36%)]" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-xs font-medium">
                Help keep FieldMap running — this month's costs
              </p>
              <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                ${RAISED} / ${MONTHLY_GOAL} ({pct}%)
              </p>
            </div>
            <Progress value={pct} className="mt-1 h-1.5" />
          </div>
        </div>
        <Button
          size="sm"
          className="h-7 gap-1.5 bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]"
          onClick={() =>
            window.open("https://opencollective.com/", "_blank", "noopener,noreferrer")
          }
        >
          <Heart className="h-3 w-3" />
          Donate
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={close}
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
        <span className="w-full text-[10px] text-muted-foreground sm:w-auto">
          Optional
        </span>
      </div>
    </div>
  );
}
