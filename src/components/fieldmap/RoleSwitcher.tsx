import { HeartHandshake, Sprout } from "lucide-react";

export type Role = "seeking_donors" | "seeking_initiatives";

export function RoleSwitcher({
  role,
  onChange,
}: {
  role: Role;
  onChange: (r: Role) => void;
}) {
  const roles: {
    id: Role;
    label: string;
    sublabel: string;
    icon: typeof HeartHandshake;
    activeBg: string;
    activeRing: string;
    iconColor: string;
  }[] = [
    {
      id: "seeking_donors",
      label: "I'm looking for",
      sublabel: "Donors",
      icon: HeartHandshake,
      activeBg: "bg-[hsl(14_55%_53%)]",
      activeRing: "ring-[hsl(14_55%_53%)]/30",
      iconColor: "text-[hsl(14_55%_53%)]",
    },
    {
      id: "seeking_initiatives",
      label: "I'm looking for",
      sublabel: "Initiatives",
      icon: Sprout,
      activeBg: "bg-[hsl(108_18%_35%)]",
      activeRing: "ring-[hsl(108_18%_35%)]/30",
      iconColor: "text-[hsl(108_18%_35%)]",
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Role switcher"
      className="relative inline-flex items-center gap-1 rounded-full border border-border/60 bg-gradient-to-b from-background to-muted/40 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_1px_2px_0_rgba(0,0,0,0.04)]"
    >
      {roles.map((r) => {
        const active = role === r.id;
        const Icon = r.icon;
        return (
          <button
            key={r.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r.id)}
            className={[
              "group relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium",
              "transition-all duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? `${r.activeBg} text-white shadow-sm ring-2 ${r.activeRing} scale-[1.02]`
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                active ? "bg-white/20" : "bg-transparent",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-3.5 w-3.5 transition-transform duration-300",
                  active ? "text-white scale-110" : `${r.iconColor} group-hover:scale-110`,
                ].join(" ")}
                strokeWidth={2.25}
              />
            </span>
            <span className="flex items-baseline gap-1 leading-none">
              <span
                className={[
                  "hidden sm:inline text-[10.5px] font-normal tracking-wide",
                  active ? "text-white/75" : "text-muted-foreground/70",
                ].join(" ")}
              >
                {r.label}
              </span>
              <span className="text-xs font-semibold tracking-tight">
                {r.sublabel}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
