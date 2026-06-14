import { lazy, Suspense, useEffect, useState } from "react";
import type { Project } from "@/lib/fieldmap-data";

const InnerMap = lazy(() =>
  import("./FieldMapInner").then((m) => ({ default: m.FieldMapInner })),
);

export function FieldMap(props: {
  projects: Project[];
  onSelect: (p: Project, perspectiveOrgId?: string) => void;
  focused: { project: Project; perspectiveOrgId?: string | null } | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fallback = (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  );

  if (!mounted) return fallback;

  return (
    <Suspense fallback={fallback}>
      <InnerMap {...props} />
    </Suspense>
  );
}
