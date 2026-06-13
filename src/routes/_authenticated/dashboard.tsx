import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  MapPin,
  Users,
  Briefcase,
  HandCoins,
  Globe2,
  Target,
  Pencil,
  Trash2,
  Share2,
  MessageSquare,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  organizations,
  projects as seedProjects,
  type Project,
  orgById,
  orgKind,
} from "@/lib/fieldmap-data";
import { donors as seedDonors } from "@/lib/donors-data";
import { categoryPhotos, orgColor, orgInitials } from "@/lib/category-photos";
import { ProjectCard } from "@/components/fieldmap/ProjectCard";
import { NewProjectDialog } from "@/components/NewProjectDialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FieldMap" }] }),
  component: DashboardPage,
});

type OutreachRow = {
  id: string;
  from_user_id: string;
  to_user_id: string | null;
  to_org_ref: string;
  to_project_ref: string | null;
  channel: "sms" | "in_app";
  message: string | null;
  created_at: string;
};

type ThreadRow = {
  id: string;
  participant_a: string;
  participant_b: string;
  project_ref: string | null;
  updated_at: string;
};

function DashboardPage() {
  const { user, role, loading } = useAuth();
  const [tab, setTab] = useState<"overview" | "sent" | "received" | "threads">(
    "overview",
  );

  if (loading || !user)
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Shell>
    );

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "sent", label: "I contacted" },
    { id: "received", label: "Contacted me" },
    { id: "threads", label: "Messages" },
  ];

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
          >
            <ArrowLeft className="h-3 w-3" /> Back to map
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Signed in as {role ?? "account"}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border bg-card p-1 text-xs shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <Overview userId={user.id} role={role} />}
      {tab === "sent" && <OutreachList userId={user.id} direction="sent" />}
      {tab === "received" && (
        <OutreachList userId={user.id} direction="received" />
      )}
      {tab === "threads" && <ThreadsList userId={user.id} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">{children}</div>
  );
}

type UserOrg = {
  id: string;
  name: string;
  entity_kind: "RLO" | "NGO";
  country: string | null;
  region: string | null;
  description: string | null;
  claimed_seed_org_id: string | null;
};

type DonorProfile = {
  organisation_name: string | null;
  donor_kind: string | null;
  hq_country: string | null;
  blurb: string | null;
  interests: string[];
  regions: string[];
  recently_funded: number;
};

type SmsRow = {
  id: string;
  title: string;
  category: string;
  project_type: "time-bound" | "ongoing";
  target_date: string | null;
  location_label: string;
  lat: number;
  lng: number;
  description: string | null;
  beneficiaries: string | null;
  contact_phone: string | null;
  needs: Record<string, unknown>;
  suggested_seed_org_id: string | null;
  claimed_by_user_id: string | null;
};

// ---------- Overview ----------

function Overview({ userId, role }: { userId: string; role: string | null }) {
  const [org, setOrg] = useState<UserOrg | null>(null);
  const [donor, setDonor] = useState<DonorProfile | null>(null);
  const [sms, setSms] = useState<SmsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Project | null>(null);

  async function refresh() {
    setLoading(true);
    if (role === "donor") {
      const { data } = await supabase
        .from("donor_profiles")
        .select(
          "organisation_name, donor_kind, hq_country, blurb, interests, regions, recently_funded",
        )
        .eq("id", userId)
        .maybeSingle();
      setDonor((data as DonorProfile) ?? null);
    } else {
      const { data: orgRow } = await supabase
        .from("user_orgs")
        .select(
          "id, name, entity_kind, country, region, description, claimed_seed_org_id",
        )
        .eq("owner_id", userId)
        .maybeSingle();
      setOrg((orgRow as UserOrg) ?? null);
      if (role === "rlo") {
        const { data: smsRows } = await supabase
          .from("sms_submissions")
          .select("*")
          .is("claimed_by_user_id", null)
          .order("submitted_at", { ascending: false });
        setSms((smsRows as SmsRow[]) ?? []);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [userId, role]);

  // Resolve "what initiatives belong to this account?"
  const initiatives = useMemo<Project[]>(() => {
    if (role === "donor") {
      if (!donor) return [];
      const interests = new Set(donor.interests ?? []);
      return seedProjects.filter((p) => interests.has(p.category));
    }
    if (!org?.claimed_seed_org_id) return [];
    const sid = org.claimed_seed_org_id;
    if (role === "ngo") {
      return seedProjects.filter(
        (p) => p.orgId === sid || (p.partnerOrgIds ?? []).includes(sid),
      );
    }
    return seedProjects.filter((p) => p.orgId === sid);
  }, [role, org, donor]);

  if (loading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      {role === "donor" ? (
        <DonorOverview
          donor={donor}
          initiatives={initiatives}
          onOpen={setActive}
        />
      ) : (
        <OrgOverview
          org={org}
          role={role}
          initiatives={initiatives}
          onOpen={setActive}
          sms={sms}
          userId={userId}
          onChanged={refresh}
        />
      )}

      <ProjectModal
        project={active}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        perspectiveOrgId={org?.claimed_seed_org_id ?? null}
      />
    </div>
  );
}

// ---------- Generic KPI ----------

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "blue" | "green" | "amber";
}) {
  const toneClass = {
    default: "from-muted/50 to-muted/10 text-foreground",
    blue: "from-[hsl(212_85%_48%)]/15 to-[hsl(212_85%_48%)]/0 text-[hsl(212_85%_38%)]",
    green:
      "from-[hsl(152_65%_36%)]/15 to-[hsl(152_65%_36%)]/0 text-[hsl(152_65%_28%)]",
    amber: "from-amber-500/15 to-amber-500/0 text-amber-700",
  }[tone];
  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br ${toneClass} border-0 p-4`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {value}
          </div>
          {hint && (
            <div className="mt-0.5 text-[11px] opacity-60">{hint}</div>
          )}
        </div>
        <Icon className="h-5 w-5 opacity-50" />
      </div>
    </Card>
  );
}

// ---------- Org overview (RLO / NGO) ----------

function OrgOverview({
  org,
  role,
  initiatives,
  onOpen,
  sms,
  userId,
  onChanged,
}: {
  org: UserOrg | null;
  role: string | null;
  initiatives: Project[];
  onOpen: (p: Project) => void;
  sms: SmsRow[];
  userId: string;
  onChanged: () => void;
}) {
  const seedOrg = org?.claimed_seed_org_id
    ? orgById(org.claimed_seed_org_id)
    : null;
  const totalBeneficiariesText = useMemo(() => {
    // sum the lower bound of each range bucket as a rough indicator
    const ranges: Record<string, number> = {
      "under 100": 50,
      "100–500": 300,
      "500–2,000": 1250,
      "2,000+": 2500,
    };
    const sum = initiatives.reduce(
      (acc, p) => acc + (ranges[p.beneficiaries] ?? 0),
      0,
    );
    if (sum >= 1000) return `${(sum / 1000).toFixed(1)}k`;
    return String(sum);
  }, [initiatives]);

  const collaborators = useMemo(() => {
    const set = new Set<string>();
    initiatives.forEach((p) => {
      set.add(p.orgId);
      (p.partnerOrgIds ?? []).forEach((id) => set.add(id));
    });
    if (org?.claimed_seed_org_id) set.delete(org.claimed_seed_org_id);
    return Array.from(set);
  }, [initiatives, org]);

  const fundingRaised = useMemo(() => {
    let total = 0;
    initiatives.forEach((p) => {
      const f = p.needs.funding;
      if (!f) return;
      if (f.raised !== undefined) total += f.raised;
      else {
        let h = 0;
        for (let i = 0; i < p.id.length; i++)
          h = (h * 33 + p.id.charCodeAt(i)) >>> 0;
        total += Math.round((f.amount * ((h % 70) + 5)) / 100);
      }
    });
    if (total >= 1000) return `$${(total / 1000).toFixed(0)}k`;
    return `$${total}`;
  }, [initiatives]);

  return (
    <>
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          label="Initiatives"
          value={initiatives.length}
          icon={Briefcase}
          tone="blue"
        />
        <Kpi
          label="Beneficiaries reached"
          value={totalBeneficiariesText}
          icon={Users}
          tone="green"
        />
        <Kpi
          label="Collaborators"
          value={collaborators.length}
          icon={Share2}
          tone="amber"
        />
        <Kpi
          label="Funding raised"
          value={fundingRaised}
          icon={HandCoins}
        />
      </div>

      {/* Hero org card */}
      {org ? (
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white shadow-md"
              style={{ backgroundColor: orgColor(org.id) }}
            >
              {orgInitials(org.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{org.name}</h2>
                <Badge
                  className={
                    org.entity_kind === "NGO"
                      ? "bg-[hsl(212_85%_48%)] text-white hover:bg-[hsl(212_85%_44%)]"
                      : "bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]"
                  }
                >
                  {org.entity_kind}
                </Badge>
                {seedOrg && (
                  <Badge variant="outline" className="text-[10px]">
                    Verified on map
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {[org.region, org.country].filter(Boolean).join(", ") ||
                  "Location not set"}
              </p>
              {org.description && (
                <p className="mt-2 text-sm text-foreground/80">
                  {org.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/profile">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit profile
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/">
                  <Globe2 className="mr-1.5 h-3.5 w-3.5" /> View on map
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          No organisation yet.{" "}
          <Link to="/profile" className="text-primary underline">
            Create one
          </Link>
          .
        </Card>
      )}

      {/* Initiatives grid */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold">Initiatives you support</h3>
            <p className="text-xs text-muted-foreground">
              Click an initiative to see full details and manage it.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {initiatives.length} total
            </Badge>
            <NewProjectDialog
              userId={userId}
              orgId={org?.id ?? null}
              onCreated={onChanged}
            />
          </div>
        </div>
        {initiatives.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No initiatives yet. Click <span className="font-medium">Add initiative</span> above to create your first one.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((p) => (
              <InitiativeCard
                key={p.id}
                project={p}
                onOpen={() => onOpen(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* SMS submissions for RLOs */}
      {role === "rlo" && (
        <section className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold">
              Unclaimed SMS submissions ({sms.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Submissions sent to FieldMap by SMS (without an account). Claim
              one to add it to your org's initiatives.
            </p>
          </div>
          {sms.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">
              Nothing pending.
            </Card>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {sms.map((s) => (
                <SmsClaimCard
                  key={s.id}
                  sms={s}
                  orgId={org?.id ?? null}
                  userId={userId}
                  suggested={
                    org?.claimed_seed_org_id === s.suggested_seed_org_id
                  }
                  onClaimed={onChanged}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}

// ---------- Donor overview ----------

function DonorOverview({
  donor,
  initiatives,
  onOpen,
}: {
  donor: DonorProfile | null;
  initiatives: Project[];
  onOpen: (p: Project) => void;
}) {
  if (!donor)
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No donor profile yet.{" "}
        <Link to="/profile" className="text-primary underline">
          Set it up
        </Link>
        .
      </Card>
    );
  const seedDonor = seedDonors.find(
    (d) => d.name === donor.organisation_name,
  );
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          label="Initiatives funded"
          value={donor.recently_funded}
          hint="last 12 months"
          icon={HandCoins}
          tone="green"
        />
        <Kpi
          label="Matching on map"
          value={initiatives.length}
          icon={Target}
          tone="blue"
        />
        <Kpi
          label="Focus areas"
          value={donor.interests?.length ?? 0}
          icon={Sparkles}
          tone="amber"
        />
        <Kpi
          label="Active regions"
          value={donor.regions?.length ?? 0}
          icon={Globe2}
        />
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[hsl(152_65%_36%)]/15 via-[hsl(152_65%_36%)]/5 to-transparent" />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white shadow-md"
            style={{
              backgroundColor: orgColor(donor.organisation_name ?? "donor"),
            }}
          >
            {orgInitials(donor.organisation_name ?? "??")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">
                {donor.organisation_name}
              </h2>
              <Badge variant="secondary" className="text-[10px] uppercase">
                {donor.donor_kind}
              </Badge>
              {seedDonor && (
                <Badge variant="outline" className="text-[10px]">
                  {seedDonor.ticketSize}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {donor.hq_country}
            </p>
            {donor.blurb && (
              <p className="mt-2 text-sm text-foreground/80">{donor.blurb}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {donor.interests?.map((i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {i}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Active in: {donor.regions?.join(", ")}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/profile">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit profile
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/">
                <Globe2 className="mr-1.5 h-3.5 w-3.5" /> Explore map
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold">
              Initiatives in your focus areas
            </h3>
            <p className="text-xs text-muted-foreground">
              Matched on your interests. Click any to see details and reach
              out.
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            <TrendingUp className="mr-1 h-3 w-3" />
            {initiatives.length} matches
          </Badge>
        </div>
        {initiatives.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No matching initiatives.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.slice(0, 9).map((p) => (
              <InitiativeCard
                key={p.id}
                project={p}
                onOpen={() => onOpen(p)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ---------- Initiative card ----------

function InitiativeCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const org = orgById(project.orgId);
  const kind = org ? orgKind(org) : "RLO";
  const photo = categoryPhotos[project.category];
  const funding = project.needs.funding;
  let raised = funding?.raised;
  if (funding && raised === undefined) {
    let h = 0;
    for (let i = 0; i < project.id.length; i++)
      h = (h * 33 + project.id.charCodeAt(i)) >>> 0;
    raised = Math.round((funding.amount * ((h % 70) + 5)) / 100);
  }
  const pct = funding
    ? Math.min(100, Math.round(((raised ?? 0) / funding.amount) * 100))
    : 0;

  return (
    <Card
      className="group overflow-hidden p-0 transition hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        <img
          src={photo}
          alt={project.category}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 capitalize text-[10px]"
        >
          {project.category}
        </Badge>
        <Badge
          className={
            "absolute right-2 top-2 text-[10px] " +
            (kind === "NGO"
              ? "bg-[hsl(212_85%_48%)] text-white"
              : "bg-[hsl(152_65%_36%)] text-white")
          }
        >
          {kind}
        </Badge>
        <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
          <h4 className="line-clamp-2 text-sm font-semibold leading-tight">
            {project.title}
          </h4>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{project.locationLabel}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">{project.beneficiaries} ppl</span>
          <Badge
            variant="outline"
            className="text-[10px] capitalize"
          >
            {project.status}
          </Badge>
        </div>
        {funding && (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-[hsl(152_65%_36%)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>
                {funding.currency} {(raised ?? 0).toLocaleString()}
              </span>
              <span>of {funding.currency} {funding.amount.toLocaleString()}</span>
            </div>
          </div>
        )}
        <div className="flex gap-1.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <MessageSquare className="mr-1 h-3 w-3" /> Message
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Edit coming soon");
            }}
            aria-label="Edit"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Remove coming soon");
            }}
            aria-label="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------- Project modal (wraps ProjectCard) ----------

function ProjectModal({
  project,
  open,
  onOpenChange,
  perspectiveOrgId,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  perspectiveOrgId: string | null;
}) {
  if (!project) return null;
  return (
    <div
      className={`fixed inset-0 z-[1500] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close overlay"
      />
      <ProjectCard
        project={project}
        perspectiveOrgId={perspectiveOrgId}
        open={open}
        onOpenChange={onOpenChange}
        role="seeking_donors"
        onOrgClick={() => {}}
      />
    </div>
  );
}

// ---------- SMS claim ----------

function SmsClaimCard({
  sms,
  orgId,
  userId,
  suggested,
  onClaimed,
}: {
  sms: SmsRow;
  orgId: string | null;
  userId: string;
  suggested: boolean;
  onClaimed: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function claim() {
    if (!orgId) {
      toast.error("Create your org first before claiming submissions.");
      return;
    }
    setBusy(true);
    const inserted = await supabase
      .from("user_projects")
      .insert({
        owner_id: userId,
        org_id: orgId,
        title: sms.title,
        category: sms.category,
        project_type: sms.project_type,
        target_date: sms.target_date,
        location_label: sms.location_label,
        lat: sms.lat,
        lng: sms.lng,
        description: sms.description,
        beneficiaries: sms.beneficiaries,
        needs: sms.needs as never,
        status: "seeking support",
      })
      .select("id")
      .single();
    if (inserted.error || !inserted.data) {
      setBusy(false);
      toast.error(inserted.error?.message ?? "Could not claim submission");
      return;
    }
    const updated = await supabase
      .from("sms_submissions")
      .update({
        claimed_by_user_id: userId,
        claimed_project_id: inserted.data.id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", sms.id);
    setBusy(false);
    if (updated.error) {
      toast.error(updated.error.message);
      return;
    }
    toast.success("Submission claimed and added to your initiatives.");
    onClaimed();
  }

  return (
    <li>
      <Card className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{sms.title}</p>
            <p className="text-xs text-muted-foreground">
              {sms.location_label}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-[10px] uppercase">
              SMS
            </Badge>
            {suggested && (
              <Badge className="text-[10px] uppercase">Matches your org</Badge>
            )}
          </div>
        </div>
        {sms.description && (
          <p className="text-xs text-muted-foreground">{sms.description}</p>
        )}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground">
            {sms.category} · {sms.project_type}
            {sms.beneficiaries ? ` · ${sms.beneficiaries}` : ""}
          </span>
          <Button size="sm" onClick={claim} disabled={busy}>
            {busy ? "…" : "Claim"}
          </Button>
        </div>
      </Card>
    </li>
  );
}

// ---------- Outreach / Threads (unchanged) ----------

function OutreachList({
  userId,
  direction,
}: {
  userId: string;
  direction: "sent" | "received";
}) {
  const [rows, setRows] = useState<OutreachRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const col = direction === "sent" ? "from_user_id" : "to_user_id";
    supabase
      .from("outreach_log")
      .select("*")
      .eq(col, userId)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setRows((data as OutreachRow[]) ?? []);
        setLoading(false);
      });
  }, [userId, direction]);

  if (loading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (rows.length === 0)
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        {direction === "sent"
          ? "You haven't reached out yet. Click any project on the map to start a conversation."
          : "Nobody has reached out yet."}
      </Card>
    );

  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id}>
          <Card className="space-y-1 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </span>
              <Badge
                variant={r.channel === "in_app" ? "default" : "secondary"}
                className="text-[10px] uppercase"
              >
                {r.channel === "in_app" ? "In-app" : "SMS"}
              </Badge>
            </div>
            <div className="text-sm">
              {direction === "sent" ? "→ " : "← "}
              <span className="font-medium">{r.to_org_ref}</span>
              {r.to_project_ref ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {r.to_project_ref}
                </span>
              ) : null}
            </div>
            {r.message && (
              <p className="text-xs text-muted-foreground">"{r.message}"</p>
            )}
          </Card>
        </li>
      ))}
    </ul>
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
      <Card className="p-6 text-center text-sm text-muted-foreground">
        No in-app conversations yet.
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
                className={`w-full rounded-md border bg-card p-3 text-left text-sm ${
                  active?.id === t.id ? "border-primary" : ""
                }`}
              >
                <div className="truncate font-medium">{other.slice(0, 8)}…</div>
                {t.project_ref && (
                  <div className="truncate text-xs text-muted-foreground">
                    {t.project_ref}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {active ? (
        <ThreadView userId={userId} thread={active} />
      ) : (
        <Card className="p-6 text-center text-sm text-muted-foreground">
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
    <Card className="flex h-[420px] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m) => (
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
            </div>
          </div>
        ))}
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
