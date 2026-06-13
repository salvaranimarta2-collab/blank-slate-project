import { createServerFn } from "@tanstack/react-start";
import { organizations, projects } from "./fieldmap-data";
import { donors } from "./donors-data";

export type DemoRole = "rlo" | "ngo" | "donor";

export const DEMO_ACCOUNTS: Record<
  DemoRole,
  {
    email: string;
    password: string;
    label: string;
    sublabel: string;
  }
> = {
  rlo: {
    email: "demo-rlo@fieldmap.demo",
    password: "DemoRlo!2026",
    label: "Demo RLO",
    sublabel: "Ki4Bli — Kakuma, Kenya",
  },
  ngo: {
    email: "demo-ngo@fieldmap.demo",
    password: "DemoNgo!2026",
    label: "Demo NGO",
    sublabel: "Energy for Refugees — Delft, NL",
  },
  donor: {
    email: "demo-donor@fieldmap.demo",
    password: "DemoDonor!2026",
    label: "Demo Donor",
    sublabel: "IKEA Foundation",
  },
};

const SEED_ORG: Record<Exclude<DemoRole, "donor">, string> = {
  rlo: "org-ki4bli",
  ngo: "org-efr",
};
const SEED_DONOR_ID = "d-ikea";

export const ensureDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { role: DemoRole }) => {
    if (!d || (d.role !== "rlo" && d.role !== "ngo" && d.role !== "donor")) {
      throw new Error("Invalid demo role");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const cfg = DEMO_ACCOUNTS[data.role];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Find or create user
    let userId: string | undefined;
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list.data?.users.find((u) => u.email === cfg.email);
    if (existing) {
      userId = existing.id;
    } else {
      const created = await supabaseAdmin.auth.admin.createUser({
        email: cfg.email,
        password: cfg.password,
        email_confirm: true,
        user_metadata: { display_name: cfg.label, role: data.role },
      });
      if (created.error || !created.data.user) {
        throw new Error(created.error?.message ?? "Failed to create demo user");
      }
      userId = created.data.user.id;
    }

    // Ensure role row exists (the new-user trigger handles this on signup; for
    // pre-existing users we make it idempotent).
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id,role" });

    // 2) Seed linked app data
    if (data.role === "donor") {
      const seed = donors.find((d) => d.id === SEED_DONOR_ID);
      if (seed) {
        await supabaseAdmin.from("donor_profiles").upsert(
          {
            id: userId,
            organisation_name: seed.name,
            donor_kind: seed.type,
            hq_country: seed.location,
            blurb: seed.about,
            interests: seed.interests as unknown as string[],
            regions: seed.regions,
            recently_funded: seed.recentlyFunded,
          },
          { onConflict: "id" },
        );
      }
    } else {
      const seedId = SEED_ORG[data.role];
      const seed = organizations.find((o) => o.id === seedId);
      if (seed) {
        // Find or create the org row owned by this demo user
        const { data: existingOrg } = await supabaseAdmin
          .from("user_orgs")
          .select("id")
          .eq("owner_id", userId)
          .eq("claimed_seed_org_id", seedId)
          .maybeSingle();

        let orgId = existingOrg?.id as string | undefined;
        if (!orgId) {
          const inserted = await supabaseAdmin
            .from("user_orgs")
            .insert({
              owner_id: userId,
              name: seed.name,
              entity_kind: seed.entityKind ?? "RLO",
              org_type: seed.orgType,
              country: seed.country,
              region: seed.region,
              lat: seed.lat,
              lng: seed.lng,
              year_founded: seed.yearFounded ?? null,
              description: seed.description,
              brings: seed.brings,
              phone: seed.phone,
              claimed_seed_org_id: seedId,
            })
            .select("id")
            .single();
          if (inserted.error || !inserted.data) {
            throw new Error(inserted.error?.message ?? "Failed to seed org");
          }
          orgId = inserted.data.id;
        }

        // Seed their projects: for an NGO, include both directly-owned seed
        // projects and ones where they are a partner (EFR is a partner on
        // every installation). For an RLO, just include projects whose seed
        // orgId matches.
        const matching = projects.filter((p) =>
          data.role === "ngo"
            ? p.orgId === seedId || (p.partnerOrgIds ?? []).includes(seedId)
            : p.orgId === seedId,
        );
        const { count } = await supabaseAdmin
          .from("user_projects")
          .select("id", { head: true, count: "exact" })
          .eq("owner_id", userId);
        if ((count ?? 0) === 0 && matching.length > 0) {
          await supabaseAdmin.from("user_projects").insert(
            matching.map((p) => ({
              owner_id: userId,
              org_id: orgId,
              seed_org_id: seedId,
              title: p.title,
              category: p.category,
              project_type: p.type,
              target_date: p.targetDate ?? null,
              location_label: p.locationLabel,
              lat: p.lat,
              lng: p.lng,
              description: p.description,
              beneficiaries: p.beneficiaries ?? null,
              needs: p.needs as unknown as never,
              status: p.status ?? "seeking support",
            })),
          );
        }
      }
    }

    return { email: cfg.email, password: cfg.password };
  });
