import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { orgById, orgKind, type Project } from "@/lib/fieldmap-data";
import { categoryPhotos, orgColor, orgInitials } from "@/lib/category-photos";
import { deriveSubmission } from "@/lib/submissions";
import { SidePanel } from "./SidePanel";
import { InAppMessageButton, logSmsOutreach } from "./InAppMessageButton";
import type { Role } from "./RoleSwitcher";
import { MessageSquare } from "lucide-react";


function buildSmsLink(phone: string, body: string) {
  const cleaned = phone.replace(/\s+/g, "");
  return `sms:${cleaned}?body=${encodeURIComponent(body)}`;
}

function actionFor(role: Role, project: Project, orgName: string) {
  const senderLine =
    "\n\n— Sent via FieldMap. Reply to this number with your contact details.";
  if (role === "seeking_initiatives") {
    const fund = project.needs.funding;
    const amount = fund
      ? ` (${fund.currency} ${fund.amount.toLocaleString()})`
      : "";
    return {
      label: "Express funding interest",
      body: `Hi ${orgName}, I'm interested in supporting "${project.title}"${amount}. Could we discuss next steps?${senderLine}`,
    };
  }
  return {
    label: "Start conversation",
    body: `Hi ${orgName}, I'm reaching out about your initiative "${project.title}". We'd like to explore a partnership or collaboration.${senderLine}`,
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h4>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

export function ProjectCard({
  project,
  perspectiveOrgId,
  open,
  onOpenChange,
  role,
  onOrgClick,
}: {
  project: Project | null;
  perspectiveOrgId?: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  role: Role;
  onOrgClick: (orgId: string) => void;
}) {
  if (!project) return null;
  const leadOrg = orgById(project.orgId);
  if (!leadOrg) return null;
  const perspectiveOrg =
    (perspectiveOrgId && orgById(perspectiveOrgId)) || null;
  const isPartnerView = !!perspectiveOrg && perspectiveOrg.id !== leadOrg.id;
  const org = perspectiveOrg ?? leadOrg;

  // Build "collaborating with" list from the active perspective:
  // include all partner orgs + lead org, minus the org being viewed.
  const collaboratorIds = Array.from(
    new Set<string>([
      project.orgId,
      ...(project.partnerOrgIds ?? []),
    ]),
  ).filter((id) => id !== org.id);

  const submission = deriveSubmission(project)!;
  const action = actionFor(role, project, org.name);
  const sms = buildSmsLink(org.phone, action.body);
  const photo = categoryPhotos[project.category];
  const kind = orgKind(org);
  const submittedDate = new Date(submission.submitted_at).toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  // Funding progress (deterministic fallback if raised isn't set)
  const funding = project.needs.funding;
  let raised = funding?.raised;
  if (funding && raised === undefined) {
    let h = 0;
    for (let i = 0; i < project.id.length; i++)
      h = (h * 33 + project.id.charCodeAt(i)) >>> 0;
    raised = Math.round((funding.amount * ((h % 70) + 5)) / 100);
  }
  const fundingPct = funding
    ? Math.min(100, Math.round(((raised ?? 0) / funding.amount) * 100))
    : 0;


  return (
    <SidePanel open={open} onClose={() => onOpenChange(false)}>
      <div className="w-full">
        <div className="relative h-48 w-full bg-muted">

          <img
            src={photo}
            alt={`${project.category} initiative`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 capitalize"
          >
            {project.category}
          </Badge>
          <Badge
            className={
              "absolute right-3 top-3 " +
              (kind === "NGO"
                ? "bg-[hsl(212_85%_48%)] text-white hover:bg-[hsl(212_85%_44%)]"
                : "bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]")
            }
          >
            {kind}
          </Badge>
          <Badge
            className="absolute right-3 top-11"
            variant={submission.type === "Project" ? "default" : "outline"}
          >
            {submission.type}
          </Badge>
        </div>


        <div className="flex items-center gap-3 border-b px-4 py-3">
          <button
            onClick={() => onOrgClick(org.id)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: orgColor(org.id) }}
            aria-label={`Open ${org.name}`}
          >
            {orgInitials(org.name)}
          </button>
          <div className="min-w-0">
            <button
              onClick={() => onOrgClick(org.id)}
              className="block truncate text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              {org.name}
            </button>
            <p className="truncate text-xs text-muted-foreground">
              {org.region}, {org.country}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 px-4 pb-2 pt-4 border-b bg-muted/20">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-semibold leading-snug flex-1 min-w-[60%]">
              {submission.title}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <InAppMessageButton
                projectRef={`seed:${project.id}`}
                orgRef={`seed:${project.orgId}`}
                ownerUserId={null}
                defaultBody={action.body}
              />
              <Button asChild size="sm" className="shrink-0 self-center">
                <a
                  href={sms}
                  onClick={() => {
                    void logSmsOutreach({
                      projectRef: `seed:${project.id}`,
                      orgRef: `seed:${project.orgId}`,
                      ownerUserId: null,
                    });
                  }}
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  {action.label}
                </a>
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            SMS opens your messaging app. "Message in-app" keeps the conversation on FieldMap.
          </p>
          {isPartnerView && (
            <p className="mt-1 text-[11px] font-medium text-[hsl(212_85%_48%)]">
              You're viewing {org.name}'s role in this initiative.
            </p>
          )}
        </div>


        <div className="space-y-5 px-4 pb-6">
          <Field label="Location">{submission.location}</Field>

          <Field label="The problem this initiative addresses">
            <p className="whitespace-pre-line">
              {submission.description_problem}
            </p>
          </Field>

          <Field label={isPartnerView ? `About ${org.name}` : "About the organisation"}>
            <p className="whitespace-pre-line">
              {isPartnerView
                ? org.description ?? `${org.name} is collaborating on this initiative.`
                : submission.description_org}
            </p>
          </Field>

          {collaboratorIds.length > 0 && (
            <section className="space-y-2 rounded-md border border-[hsl(212_85%_48%)]/30 bg-[hsl(212_85%_48%)]/5 p-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Collaborating with
              </h4>
              <div className="flex flex-col gap-2">
                {collaboratorIds.map((pid) => {
                  const po = orgById(pid);
                  if (!po) return null;
                  const pKind = orgKind(po);
                  return (
                    <button
                      key={pid}
                      onClick={() => onOrgClick(pid)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: orgColor(po.id) }}
                      >
                        {orgInitials(po.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-primary underline-offset-2 hover:underline">
                          {po.name}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {po.region}, {po.country}
                        </span>
                      </span>
                      <Badge
                        className={
                          pKind === "NGO"
                            ? "bg-[hsl(212_85%_48%)] text-white hover:bg-[hsl(212_85%_44%)]"
                            : "bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]"
                        }
                      >
                        {pKind}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <Separator />

          {funding && (
            <section className="space-y-2 rounded-md border border-[hsl(152_65%_36%)]/30 bg-[hsl(152_65%_36%)]/5 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wide text-muted-foreground">
                  Funding
                </span>
                <span className="font-medium">{fundingPct}% raised</span>
              </div>
              <Progress
                value={fundingPct}
                className="h-2 [&>div]:bg-[hsl(152_65%_36%)]"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {funding.currency} {(raised ?? 0).toLocaleString()} raised
                </span>
                <span>
                  of {funding.currency} {funding.amount.toLocaleString()}
                </span>
              </div>
            </section>
          )}

          <section className="space-y-2">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Additional Resource Requirements
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.needs.expertise?.map((e) => (
                <Badge key={e} variant="secondary" className="capitalize">
                  Expertise: {e}
                </Badge>
              ))}
              {project.needs.equipment && (
                <Badge variant="secondary">
                  Equipment: {project.needs.equipment}
                </Badge>
              )}
              {project.needs.training && (
                <Badge variant="secondary">
                  Training: {project.needs.training}
                </Badge>
              )}
              {project.needs.partnership && (
                <Badge variant="secondary">Partnership with NGO</Badge>
              )}
              {!project.needs.expertise?.length &&
                !project.needs.equipment &&
                !project.needs.training &&
                !project.needs.partnership && (
                  <span className="text-xs text-muted-foreground">
                    No additional resource requirements listed.
                  </span>
                )}
            </div>
          </section>


          <section className="space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Beneficiaries
            </h4>
            <p className="text-sm">{project.beneficiaries} people</p>
          </section>

          {submission.additional_info && (
            <Field label="Additional info">
              <p className="whitespace-pre-line">
                {submission.additional_info}
              </p>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/40 p-3 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Contact
              </div>
              <div className="font-medium">{submission.contact}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Preferred language
              </div>
              <div className="font-medium">{submission.preferred_language}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Submitted at
              </div>
              <div className="font-medium">{submittedDate}</div>
            </div>
          </div>

        </div>
      </div>
    </SidePanel>
  );
}
