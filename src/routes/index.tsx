import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FieldMap } from "@/components/fieldmap/FieldMap";
import {
  defaultFilters,
  Filters,
  type FilterState,
} from "@/components/fieldmap/Filters";
import { ProjectCard } from "@/components/fieldmap/ProjectCard";
import { OrgPanel } from "@/components/fieldmap/OrgPanel";
import { PartnershipsPanel } from "@/components/fieldmap/PartnershipsPanel";
import { DonorsGrid } from "@/components/fieldmap/DonorsGrid";
import { RoleSwitcher, type Role } from "@/components/fieldmap/RoleSwitcher";
import {
  getAllProjects,
  type Project,
  orgById,
  orgKind,
  subscribeExtras,
} from "@/lib/fieldmap-data";
import { loadUserProjectsForMap } from "@/lib/load-user-projects";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";
import { HeaderUserMenu } from "@/components/HeaderUserMenu";
import { NotificationsBell } from "@/components/NotificationsBell";
import { AggregateStats } from "@/components/AggregateStats";
import { MonthlyCostBanner } from "@/components/MonthlyCostBanner";
import { useAuth } from "@/lib/use-auth";
import logo from "@/assets/waythrough-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Waythrough — Connecting grassroots RLOs, NGOs and donors" },
      {
        name: "description",
        content:
          "Waythrough connects grassroots RLOs, NGOs and donors. One map, one set of pins, identical treatment for every project.",
      },
      { property: "og:title", content: "Waythrough" },
      {
        property: "og:description",
        content:
          "Waythrough connects grassroots RLOs, NGOs and donors. One map, identical pins, SMS-first contact.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [role, setRole] = useState<Role>("seeking_initiatives");
  const { role: accountRole } = useAuth();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selected, setSelected] = useState<Project | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const [perspectiveOrgId, setPerspectiveOrgId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgOpen, setOrgOpen] = useState(false);
  const [partnershipsOpen, setPartnershipsOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    loadUserProjectsForMap();
    const unsub = subscribeExtras(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  // Discreet demo helper: press Shift+L to fly to the first SMS submission
  // on the map (its pin is placed at a random location on each refresh).
  function locateSmsDemo() {
    const smsProj = getAllProjects().find((p) => p.id.startsWith("sms-"));
    if (smsProj) openProject(smsProj);
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && (e.key === "L" || e.key === "l")) {
        const target = e.target as HTMLElement | null;
        if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        locateSmsDemo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);


  const visible = useMemo(() => {
    return getAllProjects().filter((p: Project) => {
      if (filters.category !== "all" && p.category !== filters.category)
        return false;
      if (filters.type !== "both" && p.type !== filters.type) return false;
      if (filters.entityKind !== "all") {
        const org = orgById(p.orgId);
        if (!org || orgKind(org) !== filters.entityKind) return false;
      }
      if (filters.country !== "all") {
        if (!p.locationLabel.endsWith(filters.country)) return false;
      }
      if (filters.needs.length > 0) {
        const has = {
          funding: !!p.needs.funding,
          expertise: (p.needs.expertise?.length ?? 0) > 0,
          equipment: !!p.needs.equipment,
          partnership: !!p.needs.partnership,
        };
        if (!filters.needs.every((n) => has[n])) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, tick]);

  function openProject(p: Project, perspective?: string) {
    setSelected(p);
    setPerspectiveOrgId(perspective ?? null);
    setProjectOpen(true);
    setOrgOpen(false);
  }
  function openOrg(id: string) {
    setOrgId(id);
    setOrgOpen(true);
    setProjectOpen(false);
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-b-[hsl(152_65%_36%)]/30 bg-card px-4 py-2.5 shadow-[inset_0_-2px_0_0_hsl(152_65%_36%)]">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Waythrough logo"
            className="h-8 w-8 rounded-md object-contain ring-2 ring-[hsl(152_65%_36%)]/40"
          />
          <div>
            <h1 className="text-sm font-semibold leading-none">
              Waythrough
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Connecting grassroots RLOs, NGOs and donors
            </p>

          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPartnershipsOpen(true)}
            className="gap-1.5 border-[hsl(152_65%_36%)]/40 text-[hsl(152_65%_36%)] hover:bg-[hsl(152_65%_36%)]/10 hover:text-[hsl(152_65%_36%)]"
          >
            <Handshake className="h-3.5 w-3.5" />
            Recent activity
          </Button>
          <RoleSwitcher role={role} onChange={setRole} />
          <NotificationsBell />
          <HeaderUserMenu />

        </div>
      </header>

      {accountRole === "donor" && <MonthlyCostBanner />}


      <AggregateStats />

      {role === "seeking_donors" ? (
        <div className="relative flex-1 overflow-hidden">
          <DonorsGrid />
        </div>
      ) : (
        <>
          <Filters
            value={filters}
            onChange={setFilters}
            resultCount={visible.length}
          />

          <div className="relative flex-1 overflow-hidden">
            <FieldMap
              projects={visible}
              onSelect={openProject}
              focused={projectOpen && selected ? { project: selected, perspectiveOrgId } : null}
            />
            <ProjectCard
              project={selected}
              perspectiveOrgId={perspectiveOrgId}
              open={projectOpen}
              onOpenChange={setProjectOpen}
              role={role}
              onOrgClick={openOrg}
            />
            <OrgPanel
              orgId={orgId}
              open={orgOpen}
              onOpenChange={setOrgOpen}
              onProjectClick={openProject}
            />
          </div>
        </>
      )}
      <PartnershipsPanel
        open={partnershipsOpen}
        onOpenChange={setPartnershipsOpen}
        onProjectClick={(p, persp) => {
          setPartnershipsOpen(false);
          openProject(p, persp);
        }}
        onOrgClick={(id) => {
          setPartnershipsOpen(false);
          openOrg(id);
        }}
      />
    </div>
  );
}
