import { useEffect, useRef, useState } from "react";
import {
  getAllProjects,
  orgById,
  type Project,
} from "@/lib/fieldmap-data";
import { subscribeExtras } from "@/lib/fieldmap-data";
import { HandCoins, Users, Globe2, Sprout } from "lucide-react";

function useAnimatedNumber(target: number, duration = 1500) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let raf: number;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = fromRef.current + (target - fromRef.current) * eased;
      setDisplay(value);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

function computeStats(projects: Project[]) {
  const usdToEur = 0.92;
  let totalEur = 0;
  const orgIds = new Set<string>();
  const countries = new Set<string>();

  for (const p of projects) {
    const funding = p.needs.funding;
    if (funding) {
      if (funding.currency === "EUR") totalEur += funding.amount;
      else totalEur += funding.amount * usdToEur;
    }
    orgIds.add(p.orgId);
    const org = orgById(p.orgId);
    if (org) countries.add(org.country);
  }

  return {
    totalEur: Math.round(totalEur),
    orgCount: orgIds.size,
    countryCount: countries.size,
    projectCount: projects.length,
  };
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${n}`;
}

export function AggregateStats() {
  const [projects, setProjects] = useState<Project[]>(getAllProjects());

  useEffect(() => {
    const unsub = subscribeExtras(() => setProjects(getAllProjects()));
    return () => unsub();
  }, []);

  const stats = computeStats(projects);

  const animatedTotal = useAnimatedNumber(stats.totalEur);
  const animatedOrgs = useAnimatedNumber(stats.orgCount);
  const animatedCountries = useAnimatedNumber(stats.countryCount);
  const animatedProjects = useAnimatedNumber(stats.projectCount);

  const items = [
    {
      icon: HandCoins,
      label: "Raised",
      value: formatCurrency(animatedTotal),
    },
    {
      icon: Users,
      label: "Organizations",
      value: String(Math.round(animatedOrgs)),
    },
    {
      icon: Globe2,
      label: "Countries",
      value: String(Math.round(animatedCountries)),
    },
    {
      icon: Sprout,
      label: "Initiatives",
      value: String(Math.round(animatedProjects)),
    },
  ];

  return (
    <div className="border-b bg-gradient-to-b from-[hsl(152_40%_97%)] to-background px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 divide-x divide-border/60">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={
                "flex items-center gap-2.5 " + (idx === 0 ? "" : "pl-8")
              }
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(152_65%_36%)]/10 text-[hsl(152_65%_30%)]">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-lg font-bold leading-none tabular-nums text-[hsl(152_65%_28%)]">
                {item.value}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
