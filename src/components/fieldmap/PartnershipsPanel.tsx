import { Badge } from "@/components/ui/badge";
import {
  orgById,
  orgKind,
  projects as allProjects,
  type Project,
} from "@/lib/fieldmap-data";
import { orgColor, orgInitials } from "@/lib/category-photos";
import { donations, donorById } from "@/lib/donors-data";
import { SidePanel } from "./SidePanel";

const currencySymbol = (c: "EUR" | "USD" | "GBP") =>
  c === "EUR" ? "€" : c === "GBP" ? "£" : "$";

function formatAmount(amount: number, currency: "EUR" | "USD" | "GBP") {
  return `${currencySymbol(currency)}${amount.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
}

export function PartnershipsPanel({
  open,
  onOpenChange,
  onProjectClick,
  onOrgClick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onProjectClick: (p: Project, perspectiveOrgId?: string) => void;
  onOrgClick: (orgId: string) => void;
}) {
  const partnerships = allProjects.filter(
    (p) => (p.partnerOrgIds?.length ?? 0) > 0,
  );

  const donationItems = donations
    .map((d) => {
      const project = allProjects.find((p) => p.id === d.projectId);
      const donor = donorById(d.donorId);
      if (!project || !donor) return null;
      return { donation: d, project, donor };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.donation.date.localeCompare(a.donation.date));

  return (
    <SidePanel open={open} onClose={() => onOpenChange(false)}>
      <div className="space-y-6 p-4 pt-5">
        <div className="pr-8">
          <h2 className="text-xl font-semibold leading-snug">
            Recent partnerships
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Initiatives delivered through collaborations sparked on FieldMap.
            {" "}
            {partnerships.length} active{" "}
            {partnerships.length === 1 ? "partnership" : "partnerships"} ·{" "}
            {donationItems.length} recent{" "}
            {donationItems.length === 1 ? "donation" : "donations"}.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            NGO ↔ RLO collaborations
          </h3>
          <ul className="space-y-3">
            {partnerships.map((p) => {
              const lead = orgById(p.orgId);
              const partners = (p.partnerOrgIds ?? [])
                .map((id) => orgById(id))
                .filter((o): o is NonNullable<typeof o> => !!o);
              if (!lead) return null;
              return (
                <li
                  key={p.id}
                  className="rounded-md border bg-card p-3 text-left"
                >
                  <button
                    onClick={() => onProjectClick(p)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">
                        {p.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] capitalize"
                      >
                        {p.category}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.locationLabel}
                    </p>
                  </button>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-2">
                    {[lead, ...partners].map((o, i) => {
                      const kind = orgKind(o);
                      return (
                        <div key={o.id} className="flex items-center gap-2">
                          {i > 0 && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(212_85%_48%)]">
                              +
                            </span>
                          )}
                          <button
                            onClick={() => onOrgClick(o.id)}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                              style={{ backgroundColor: orgColor(o.id) }}
                            >
                              {orgInitials(o.name)}
                            </span>
                            <span className="text-[11px] font-medium text-primary underline-offset-2 hover:underline">
                              {o.name}
                            </span>
                            <Badge
                              className={
                                "text-[9px] " +
                                (kind === "NGO"
                                  ? "bg-[hsl(212_85%_48%)] text-white hover:bg-[hsl(212_85%_44%)]"
                                  : "bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]")
                              }
                            >
                              {kind}
                            </Badge>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            DONOR → INITIATIVE FUNDING
          </h3>
          <ul className="space-y-3">
            {donationItems.map(({ donation, project, donor }) => {
              const recipient = orgById(project.orgId);
              const recipientKind = recipient ? orgKind(recipient) : "NGO";
              return (
                <li
                  key={donation.id}
                  className="rounded-md border bg-card p-3 text-left"
                >
                  <button
                    onClick={() => onProjectClick(project)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">
                        {project.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        {formatAmount(donation.amount, donation.currency)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {project.locationLabel} · {formatDate(donation.date)}
                    </p>
                    {donation.note && (
                      <p className="mt-1 text-[11px] italic text-muted-foreground">
                        "{donation.note}"
                      </p>
                    )}
                  </button>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: "hsl(38 92% 50%)" }}
                      >
                        {orgInitials(donor.name)}
                      </span>
                      <span className="text-[11px] font-medium">
                        {donor.name}
                      </span>
                      <Badge className="bg-[hsl(38_92%_50%)] text-[9px] text-white hover:bg-[hsl(38_92%_46%)]">
                        Donor
                      </Badge>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(38_92%_50%)]">
                      →
                    </span>
                    {recipient && (
                      <button
                        onClick={() => onOrgClick(recipient.id)}
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: orgColor(recipient.id) }}
                        >
                          {orgInitials(recipient.name)}
                        </span>
                        <span className="text-[11px] font-medium text-primary underline-offset-2 hover:underline">
                          {recipient.name}
                        </span>
                        <Badge
                          className={
                            "text-[9px] " +
                            (recipientKind === "NGO"
                              ? "bg-[hsl(212_85%_48%)] text-white hover:bg-[hsl(212_85%_44%)]"
                              : "bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]")
                          }
                        >
                          {recipientKind}
                        </Badge>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </SidePanel>
  );
}
