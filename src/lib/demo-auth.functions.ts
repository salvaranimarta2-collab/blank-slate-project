import { createServerFn } from "@tanstack/react-start";
import { organizations, projects } from "./fieldmap-data";
import { donors } from "./donors-data";

export type DemoRole = "rlo" | "rlo2" | "ngo" | "donor";

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
  rlo2: {
    email: "demo-example@fieldmap.demo",
    password: "DemoExample!2026",
    label: "Demo RLO — ExampleName",
    sublabel: "ExampleName — ExampleTown, ExampleCountry",
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

const SEED_ORG: Record<Exclude<DemoRole, "donor" | "rlo2">, string> = {
  rlo: "org-ki4bli",
  ngo: "org-efr",
};
const SEED_DONOR_ID = "d-ikea";

// Mock initiatives for the ExampleName demo RLO (own "my initiatives").
const EXAMPLE_PROJECTS = [
  {
    title: "Community Language Classes for Displaced Adults",
    category: "education" as const,
    project_type: "ongoing" as const,
    location_label: "ExampleTown, ExampleCountry",
    description:
      "Many displaced adults in the area have no access to language classes, limiting their ability to find work or navigate local services. Existing classes are held far away and require transport they cannot afford.\n\nSolution: Run weekly language classes (local language and English) in our tutoring space, led by volunteer teachers from within the community.",
    beneficiaries: "under 100",
    needs: {
      funding: { amount: 600, currency: "EUR", raised: 0 },
      partnership: true,
      expertise: ["education"],
    } as Record<string, unknown>,
    status: "seeking support",
  },
  {
    title: "Tablet Lending Library for Children",
    category: "education" as const,
    project_type: "ongoing" as const,
    location_label: "ExampleTown, ExampleCountry",
    description:
      "Children in our tutoring sessions have no access to devices at home, making it impossible to complete digital homework or access online learning resources outside of sessions.\n\nSolution: Build a small lending library of 15 tablets that children can borrow for a week at a time, with a simple sign-out system managed by community volunteers.",
    beneficiaries: "under 100",
    needs: {
      funding: { amount: 1500, currency: "EUR", raised: 1000 },
      equipment: "Tablets, protective cases, and a charging station",
      partnership: true,
    } as Record<string, unknown>,
    status: "seeking support",
  },
] as const;


// Exact text of the unclaimed SMS submission for the ExampleName demo.
const EXAMPLE_SMS = {
  title: "Solar Power for Evening Tutoring Sessions",
  category: "energy",
  project_type: "ongoing" as const,
  location_label: "ExampleTown, ExampleCountry",
  description:
    "Problem: Their tutoring space has unreliable electricity connection. Sessions are limited to daylight hours, which excludes most children who are only free in the evenings. Generator fuel costs are too high to sustain.\n\nSolution: Install a basic solar panel and battery system to power lighting and device charging points for children's tablets.\n\nPartner needed: Organisation experienced in small-scale solar — system sizing, local component sourcing, and on-site installation.\n\nFunding: €500 raised of €2,800 goal (covering panels, battery, wiring, and installation).",
  beneficiaries: "under 100",
  contact_phone: "SMS",
  needs: {
    funding: { amount: 2800, currency: "EUR", raised: 500 },
    partnership: true,
    expertise: ["engineering"],
  } as Record<string, unknown>,
};


export const ensureDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { role: DemoRole }) => {
    if (
      !d ||
      (d.role !== "rlo" && d.role !== "rlo2" && d.role !== "ngo" && d.role !== "donor")
    ) {
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
      const appRole = data.role === "rlo2" ? "rlo" : data.role;
      const created = await supabaseAdmin.auth.admin.createUser({
        email: cfg.email,
        password: cfg.password,
        email_confirm: true,
        user_metadata: { display_name: cfg.label, role: appRole },
      });
      if (created.error || !created.data.user) {
        throw new Error(created.error?.message ?? "Failed to create demo user");
      }
      userId = created.data.user.id;
    }

    // Ensure role row exists (the new-user trigger handles this on signup; for
    // pre-existing users we make it idempotent).
    const dbRole = data.role === "rlo2" ? "rlo" : data.role;
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: dbRole }, { onConflict: "user_id,role" });

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
    } else if (data.role === "rlo2") {
      // ExampleName demo — no seed org, off-map initiatives.
      const { data: existingOrg } = await supabaseAdmin
        .from("user_orgs")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();

      let orgId = existingOrg?.id as string | undefined;
      if (!orgId) {
        const inserted = await supabaseAdmin
          .from("user_orgs")
          .insert({
            owner_id: userId,
            name: "ExampleName",
            entity_kind: "RLO",
            org_type: "refugee-led",
            country: "ExampleCountry",
            region: "ExampleTown",
            // lat/lng intentionally null so the org/projects don't appear on the map
            description:
              "A refugee-led organisation of displaced parents and young adults, running educational support for displaced children and adults in their local community.",
          })
          .select("id")
          .single();
        if (inserted.error || !inserted.data) {
          throw new Error(inserted.error?.message ?? "Failed to seed ExampleName org");
        }
        orgId = inserted.data.id;
      }

      const { count } = await supabaseAdmin
        .from("user_projects")
        .select("id", { head: true, count: "exact" })
        .eq("owner_id", userId);
      if ((count ?? 0) === 0) {
        await supabaseAdmin.from("user_projects").insert(
          EXAMPLE_PROJECTS.map((p) => ({
            owner_id: userId,
            org_id: orgId,
            title: p.title,
            category: p.category,
            project_type: p.project_type,
            location_label: p.location_label,
            // Off-map placeholder coordinates; filtered out of the map registry
            // by load-user-projects when the owning org has no lat/lng.
            lat: 0,
            lng: 0,
            description: p.description,
            beneficiaries: p.beneficiaries,
            needs: p.needs as unknown as never,
            status: p.status,
          })),
        );
      }

      // Seed the unclaimed SMS submission once (global, visible to any RLO).
      const { data: existingSms } = await supabaseAdmin
        .from("sms_submissions")
        .select("id")
        .eq("title", EXAMPLE_SMS.title)
        .is("claimed_by_user_id", null)
        .maybeSingle();
      if (!existingSms) {
        await supabaseAdmin.from("sms_submissions").insert({
          title: EXAMPLE_SMS.title,
          category: EXAMPLE_SMS.category,
          project_type: EXAMPLE_SMS.project_type,
          location_label: EXAMPLE_SMS.location_label,
          lat: 0,
          lng: 0,
          description: EXAMPLE_SMS.description,
          beneficiaries: EXAMPLE_SMS.beneficiaries,
          contact_phone: EXAMPLE_SMS.contact_phone,
          needs: EXAMPLE_SMS.needs as unknown as never,
        });
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
