import { supabase } from "@/integrations/supabase/client";

export type AnonymousSms = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  beneficiaries: string | null;
  needs: Record<string, unknown> | null;
  /** Randomised marker position — NOT the real location. */
  lat: number;
  lng: number;
};

// Pick a random point within a broad band that covers plausible regions
// so the marker doesn't land in open ocean. The point is intentionally NOT
// derived from the submission so the true location cannot be recovered.
function randomObfuscatedPoint(): { lat: number; lng: number } {
  const lat = -10 + Math.random() * 45; // -10° .. 35°
  const lng = -15 + Math.random() * 75; //  -15° .. 60°
  return { lat, lng };
}

export async function loadAnonymousSms(): Promise<AnonymousSms[]> {
  const { data } = await supabase
    .from("sms_submissions")
    .select("id, title, category, description, beneficiaries, needs")
    .is("claimed_by_user_id", null);
  const rows = (data ?? []) as Array<{
    id: string;
    title: string;
    category: string;
    description: string | null;
    beneficiaries: string | null;
    needs: Record<string, unknown> | null;
  }>;
  return rows.map((r) => {
    const { lat, lng } = randomObfuscatedPoint();
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description,
      beneficiaries: r.beneficiaries,
      needs: r.needs,
      lat,
      lng,
    };
  });
}

