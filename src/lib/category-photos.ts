import energy from "@/assets/categories/energy.jpg";
import water from "@/assets/categories/water.jpg";
import education from "@/assets/categories/education.jpg";
import healthcare from "@/assets/categories/healthcare.jpg";
import livelihoods from "@/assets/categories/livelihoods.jpg";
import shelter from "@/assets/categories/shelter.jpg";
import legal from "@/assets/categories/legal.jpg";
import protection from "@/assets/categories/protection.jpg";
import food from "@/assets/categories/food.jpg";
import type { Category } from "./fieldmap-data";

export const categoryPhotos: Record<Category, string> = {
  energy,
  "water/WASH": water,
  education,
  healthcare,
  livelihoods,
  shelter,
  "legal aid": legal,
  protection,
  "food security": food,
};

// Deterministic pleasant color from a string (for org logo background).
export function orgColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 55% 38%)`;
}

export function orgInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}
