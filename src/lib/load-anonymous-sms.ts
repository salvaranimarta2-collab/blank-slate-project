import { supabase } from "@/integrations/supabase/client";

export type AnonymousSms = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  beneficiaries: string | null;
  needs: Record<string, unknown> | null;
  /** Randomized centre point — NOT the real location. */
  lat: number;
  lng: number;
  /** Radius (metres) of the obfuscation circle drawn on the map. */
  radiusMeters: number;
};

// Pick a random point within a broad band that covers plausible regions
// (roughly the Africa / Middle East / South Asia belt) so the marker doesn't
// land in the middle of the Pacific. The point is intentionally NOT derived
// from the submission so the true location cannot be recovered.
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
      // ~600 km obfuscation circle — wide enough that no town can be inferred.
      radiusMeters: 600_000,
    };
  });
}
