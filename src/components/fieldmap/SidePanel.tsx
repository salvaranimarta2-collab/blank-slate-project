import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SidePanel({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 top-0 z-[1000] flex h-full w-full max-w-md p-2 transition-transform duration-300 sm:p-3",
        open ? "translate-x-0" : "translate-x-full",
        className,
      )}
      aria-hidden={!open}
    >
      <div className="pointer-events-auto relative flex h-full w-full flex-col overflow-hidden rounded-lg border bg-background shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur hover:bg-background"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
