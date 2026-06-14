import { supabase } from "@/integrations/supabase/client";
import {
  registerExtraOrgs,
  registerExtraProjects,
  type Project,
  type Organization,
  type Category,
  type BeneficiaryRange,
  type ProjectStatus,
  type ProjectType,
} from "@/lib/fieldmap-data";

type DbOrg = {
  id: string;
  name: string;
  entity_kind: string | null;
  country: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  description: string | null;
};
type DbProject = {
  id: string;
  org_id: string | null;
  title: string;
  category: string;
  project_type: string;
  target_date: string | null;
  location_label: string;
  lat: number;
  lng: number;
  description: string | null;
  beneficiaries: string | null;
  needs: Record<string, unknown> | null;
  status: string;
  partner_org_refs: string[] | null;
};

// Pick a random land-ish point on each load (demo only).
function randomDemoLocation(): { lat: number; lng: number } {
  // Roughly bias toward populated latitudes; lng is fully random.
  const lat = Math.random() * 95 - 40; // -40..55
  const lng = Math.random() * 360 - 180; // -180..180
  return { lat, lng };
}

// Pull just the "Problem:" portion out of an SMS-style submission body so it
// fits the structured "problem" field on the project card. Solution / partner /
// funding details are represented via the needs object + Funding section.
function extractProblem(raw: string): string {
  if (!raw) return "";
  const stripped = raw.replace(/^\s*Problem:\s*/i, "");
  const cutMatch = stripped.match(/\b(Solution|Partner needed|Funding):/i);
  const problem = cutMatch ? stripped.slice(0, cutMatch.index).trim() : stripped.trim();
  return problem;
}

export async function loadUserProjectsForMap() {
  const [{ data: orgs }, { data: projs }, { data: smsRows }] = await Promise.all([
    supabase
      .from("user_orgs")
      .select("id, name, entity_kind, country, region, lat, lng, phone, description"),
    supabase
      .from("user_projects")
      .select(
        "id, org_id, title, category, project_type, target_date, location_label, lat, lng, description, beneficiaries, needs, status, partner_org_refs",
      ),
    supabase
      .from("sms_submissions")
      .select(
        "id, title, category, project_type, location_label, description, beneficiaries, needs, contact_phone",
      )
      .is("claimed_by_user_id", null),
  ]);

  const orgList = (orgs as DbOrg[] | null) ?? [];
  const projList = (projs as DbProject[] | null) ?? [];

  const mappedOrgs: Organization[] = orgList
    .filter((o) => o.lat != null && o.lng != null)
    .map((o) => ({
      id: o.id,
      name: o.name,
      country: o.country ?? "",
      region: o.region ?? "",
      lat: o.lat as number,
      lng: o.lng as number,
      phone: o.phone ?? "",
      description: o.description ?? undefined,
      orgType: "refugee-led",
      brings: [],
      entityKind: (o.entity_kind === "NGO" ? "NGO" : "RLO"),
    }));
  registerExtraOrgs(mappedOrgs);

  const mappedOrgIds = new Set(mappedOrgs.map((o) => o.id));
  const mappedProjects: Project[] = projList
    .filter((p) => p.org_id && mappedOrgIds.has(p.org_id))
    .map((p) => {
      // partner_org_refs may contain "project:<id>" entries — convert to the
      // owner orgs of those projects so the existing map rendering works.
      const partnerOrgIds: string[] = [];
      for (const ref of p.partner_org_refs ?? []) {
        if (ref.startsWith("project:")) {
          const pid = ref.slice("project:".length);
          const refProj = projList.find((x) => x.id === pid);
          if (refProj?.org_id) partnerOrgIds.push(refProj.org_id);
        } else {
          partnerOrgIds.push(ref);
        }
      }
      return {
        id: p.id,
        orgId: p.org_id as string,
        title: p.title,
        category: p.category as Category,
        type: (p.project_type as ProjectType) ?? "ongoing",
        targetDate: p.target_date ?? undefined,
        locationLabel: p.location_label,
        lat: p.lat,
        lng: p.lng,
        description: p.description ?? "",
        beneficiaries: (p.beneficiaries as BeneficiaryRange) ?? "under 100",
        needs: (p.needs as Project["needs"]) ?? {},
        status: (p.status as ProjectStatus) ?? "seeking support",
        partnerOrgIds: partnerOrgIds.length ? partnerOrgIds : undefined,
      };
    });
  registerExtraProjects(mappedProjects);

  // Unclaimed SMS submissions: place at a random location each refresh so they
  // show up on the map for demo purposes. Each gets a synthetic org.
  const smsList = (smsRows as Array<{
    id: string;
    title: string;
    category: string;
    project_type: string | null;
    location_label: string | null;
    description: string | null;
    beneficiaries: string | null;
    needs: Record<string, unknown> | null;
    contact_phone: string | null;
  }> | null) ?? [];

  const smsOrgs: Organization[] = [];
  const smsProjects: Project[] = [];
  for (const s of smsList) {
    const { lat, lng } = randomDemoLocation();
    const orgId = `sms-org-${s.id}`;
    smsOrgs.push({
      id: orgId,
      name: "ExampleName submission",
      country: "",
      region: s.location_label ?? "",
      lat,
      lng,
      phone: s.contact_phone ?? "",
      description: undefined,
      orgType: "refugee-led",
      brings: [],
      entityKind: "RLO",
    });
    smsProjects.push({
      id: `sms-${s.id}`,
      orgId,
      title: s.title,
      category: s.category as Category,
      type: (s.project_type as ProjectType) ?? "ongoing",
      locationLabel: s.location_label ?? "",
      lat,
      lng,
      description: extractProblem(s.description ?? ""),
      beneficiaries: (s.beneficiaries as BeneficiaryRange) ?? "under 100",
      needs: (s.needs as Project["needs"]) ?? {},
      status: "seeking support",
    });
  }
  if (smsOrgs.length) registerExtraOrgs(smsOrgs);
  if (smsProjects.length) registerExtraProjects(smsProjects);
}
