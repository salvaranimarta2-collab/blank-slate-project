import { orgById, type Project } from "./fieldmap-data";

export interface ProjectSubmission {
  title: string;
  type: "Mission" | "Project";
  org_name: string;
  location: string;
  description_problem: string;
  description_org: string;
  contact: string;
  additional_info: string | null;
  preferred_language: string;
  submitted_at: string; // ISO 8601
}

const languageByCountry: Record<string, string> = {
  Kenya: "Swahili",
  Uganda: "English",
  Lebanon: "Arabic",
  Bangladesh: "Rohingya",
  Greece: "Dari",
  "DR Congo": "French",
  Jordan: "Arabic",
  Colombia: "Spanish",
  Ethiopia: "Amharic",
  Türkiye: "Turkish",
  Sudan: "Arabic",
  Mexico: "Spanish",
  Pakistan: "Urdu",
  Chad: "French",
  Iraq: "Arabic",
};

// Deterministic ISO timestamp from project id (so demo data is stable).
function submittedAtFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  const start = Date.UTC(2026, 0, 1);
  const end = Date.UTC(2026, 5, 13);
  const t = start + (h % (end - start));
  return new Date(t).toISOString();
}

function additionalInfoFor(p: Project): string | null {
  const bits: string[] = [];
  if (p.needs.funding)
    bits.push(
      `Indicative budget: ${p.needs.funding.currency} ${p.needs.funding.amount.toLocaleString()}.`,
    );
  if (p.needs.equipment) bits.push(`In-kind needed: ${p.needs.equipment}.`);
  if (p.needs.training) bits.push(`Training requested: ${p.needs.training}.`);
  if (p.type === "time-bound" && p.targetDate)
    bits.push(
      `Target completion: ${new Date(p.targetDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })}.`,
    );
  if (p.needs.partnership)
    bits.push("Open to co-implementing partners on the ground.");
  return bits.length ? bits.join(" ") : null;
}

export function deriveSubmission(p: Project): ProjectSubmission | null {
  const org = orgById(p.orgId);
  if (!org) return null;
  return {
    title: p.title,
    type: p.type === "time-bound" ? "Project" : "Mission",
    org_name: org.name,
    location: p.locationLabel,
    description_problem: p.description,
    description_org:
      org.description ??
      `${org.name} is a ${org.orgType} group based in ${org.region}, ${org.country}.`,
    contact: org.phone,
    additional_info: additionalInfoFor(p),
    preferred_language: languageByCountry[org.country] ?? "English",
    submitted_at: submittedAtFor(p.id),
  };
}
