import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  orgById,
  orgKind,
  projects as allProjects,
  projectsByOrg,
  type Project,
} from "@/lib/fieldmap-data";
import { orgColor, orgInitials } from "@/lib/category-photos";
import { SidePanel } from "./SidePanel";


export function OrgPanel({
  orgId,
  open,
  onOpenChange,
  onProjectClick,
}: {
  orgId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onProjectClick: (p: Project) => void;
}) {
  if (!orgId) return null;
  const org = orgById(orgId);
  if (!org) return null;
  const orgProjects = projectsByOrg(orgId);
  const collaborations = allProjects.filter(
    (p) => p.orgId !== orgId && (p.partnerOrgIds ?? []).includes(orgId),
  );

  return (
    <SidePanel open={open} onClose={() => onOpenChange(false)}>
      <div className="space-y-5 p-4 pt-5">
        <div className="flex items-center gap-3 pr-8">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
            style={{ backgroundColor: orgColor(org.id) }}
          >
            {orgInitials(org.name)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                className={
                  orgKind(org) === "NGO"
                    ? "bg-[hsl(212_85%_48%)] text-white hover:bg-[hsl(212_85%_44%)]"
                    : "bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]"
                }
              >
                {orgKind(org)}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {org.orgType}
              </Badge>
            </div>
            <h2 className="mt-1 text-xl font-semibold leading-snug">
              {org.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {org.region}, {org.country}
              {org.yearFounded ? ` · est. ${org.yearFounded}` : ""}
            </p>
          </div>
        </div>

        {org.description && (
          <p className="text-sm leading-relaxed">{org.description}</p>
        )}

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What this organisation brings
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {org.brings.map((b) => (
              <Badge key={b} variant="outline" className="capitalize">
                {b}
              </Badge>
            ))}
          </div>
        </section>


        <Separator />

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Initiatives ({orgProjects.length})
          </h4>
          <ul className="space-y-2">
            {orgProjects.map((p) => {
              const partners = (p.partnerOrgIds ?? [])
                .map((id) => orgById(id))
                .filter((o): o is NonNullable<typeof o> => !!o);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onProjectClick(p)}
                    className="block w-full rounded-md border bg-card p-3 text-left transition-colors hover:bg-accent"
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
                    {partners.length > 0 && (
                      <p className="mt-1 text-[11px] font-medium text-[hsl(212_85%_48%)]">
                        Collaborating with {partners.map((o) => o.name).join(", ")}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {collaborations.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Collaborating on ({collaborations.length})
            </h4>
            <ul className="space-y-2">
              {collaborations.map((p) => {
                const lead = orgById(p.orgId);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => onProjectClick(p)}
                      className="block w-full rounded-md border bg-card p-3 text-left transition-colors hover:bg-accent"
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
                      {lead && (
                        <p className="mt-1 text-[11px] font-medium text-[hsl(212_85%_48%)]">
                          Collaborating with {lead.name}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </SidePanel>
  );
}
