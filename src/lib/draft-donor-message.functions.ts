import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, Output } from "ai";
import { z } from "zod";

export type DonorInput = {
  id: string;
  name: string;
  type: string;
  location?: string;
  about?: string;
  interests?: string[];
  regions?: string[];
  ticketSize?: string;
  recentlyFunded?: number;
};

export const draftDonorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { donor: DonorInput }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Pull the requester's org + initiatives for context
    const { data: orgRow } = await supabase
      .from("user_orgs")
      .select("name, entity_kind, country, region, description")
      .eq("owner_id", userId)
      .maybeSingle();

    const { data: projRows } = await supabase
      .from("user_projects")
      .select(
        "title, category, project_type, status, location_label, description, beneficiaries, needs",
      )
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    const senderName = profile?.display_name ?? "";
    const org = orgRow ?? null;
    const projects = projRows ?? [];

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": apiKey },
    });

    const donor = data.donor;
    const orgSummary = org
      ? `${org.name} (${org.entity_kind ?? "RLO"}) based in ${org.region ?? org.country ?? "unspecified region"}. ${org.description ?? ""}`
      : "An organisation on FieldMap.";
    const projectSummary = projects.length
      ? projects
          .map(
            (p, i) =>
              `${i + 1}. "${p.title}" — ${p.category} ${p.project_type ?? ""} in ${p.location_label}, serving ${p.beneficiaries ?? "communities"}. ${p.description ?? ""}`,
          )
          .join("\n")
      : "No initiatives listed yet.";

    const system = `You draft concise, warm, persuasive partnership outreach messages from refugee-led organisations (RLOs) and humanitarian NGOs to donors. The message must:
- Be specific (reference donor's interests, regions, ticket size, recent funding).
- Connect explicit overlaps between the sender's initiatives and the donor's priorities.
- Sound like a real human, not a form letter. No filler, no buzzwords.
- 150-220 words. End with a clear, low-friction ask (intro call).
- Subject line: under 70 chars, specific, no clickbait.`;

    const prompt = `DONOR
Name: ${donor.name}
Type: ${donor.type}
Location: ${donor.location ?? "—"}
About: ${donor.about ?? "—"}
Interests: ${(donor.interests ?? []).join(", ") || "—"}
Regions funded: ${(donor.regions ?? []).join(", ") || "—"}
Typical ticket size: ${donor.ticketSize ?? "—"}
Recently funded initiatives: ${donor.recentlyFunded ?? "—"}

SENDER
${senderName ? `Contact: ${senderName}` : ""}
Organisation: ${orgSummary}

SENDER'S INITIATIVES
${projectSummary}

Write a personalised outreach message from the sender to the donor.`;

    const { experimental_output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system,
      prompt,
      experimental_output: Output.object({
        schema: z.object({
          subject: z.string(),
          body: z.string(),
        }),
      }),
    });

    return experimental_output as { subject: string; body: string };
  });
