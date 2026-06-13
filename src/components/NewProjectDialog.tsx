import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const CATEGORIES = [
  "energy",
  "water/WASH",
  "education",
  "healthcare",
  "livelihoods",
  "shelter",
  "legal aid",
  "protection",
  "food security",
] as const;

export function NewProjectDialog({
  userId,
  orgId,
  onCreated,
  triggerLabel = "Add initiative",
  triggerSize = "sm",
  triggerVariant = "default",
}: {
  userId: string;
  orgId: string | null;
  onCreated?: () => void;
  triggerLabel?: string;
  triggerSize?: "sm" | "default" | "lg";
  triggerVariant?: "default" | "outline" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("education");
  const [projectType, setProjectType] = useState<"ongoing" | "time-bound">(
    "ongoing",
  );
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("100–500");
  const [fundingAmount, setFundingAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!orgId) {
      toast.error("Save your organisation first on the profile page");
      return;
    }
    if (!title || !location || !lat || !lng) {
      toast.error("Title, location, lat and lng are required");
      return;
    }
    setSaving(true);
    const needs: Record<string, unknown> = {};
    if (fundingAmount)
      needs.funding = { amount: Number(fundingAmount), currency: "USD" };
    const { error } = await supabase.from("user_projects").insert({
      owner_id: userId,
      org_id: orgId,
      title,
      category,
      project_type: projectType,
      location_label: location,
      lat: Number(lat),
      lng: Number(lng),
      description,
      beneficiaries,
      status: "seeking support",
      needs: needs as never,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Initiative added");
    setOpen(false);
    setTitle("");
    setLocation("");
    setLat("");
    setLng("");
    setDescription("");
    setFundingAmount("");
    onCreated?.();
  }

  return (
    <>
      <Button
        size={triggerSize}
        variant={triggerVariant}
        onClick={() => setOpen(true)}
        className="gap-1.5"
        disabled={!orgId}
        title={!orgId ? "Save your organisation first on the profile page" : undefined}
      >
        <Plus className="h-3.5 w-3.5" /> {triggerLabel}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[1500] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg border bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Add a new initiative</h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => !saving && setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
              </Field>
              <Field label="Category">
                <select
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as (typeof CATEGORIES)[number])
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  value={projectType}
                  onChange={(e) =>
                    setProjectType(e.target.value as "ongoing" | "time-bound")
                  }
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="time-bound">Time-bound</option>
                </select>
              </Field>
              <Field label="Beneficiaries">
                <select
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  value={beneficiaries}
                  onChange={(e) => setBeneficiaries(e.target.value)}
                >
                  <option value="under 100">under 100</option>
                  <option value="100–500">100–500</option>
                  <option value="500–2,000">500–2,000</option>
                  <option value="2,000+">2,000+</option>
                </select>
              </Field>
              <Field label="Location label">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Athens, Greece"
                />
              </Field>
              <Field label="Funding target (USD, optional)">
                <Input
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  placeholder="25000"
                />
              </Field>
              <Field label="Latitude">
                <Input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="37.97"
                />
              </Field>
              <Field label="Longitude">
                <Input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="23.72"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={1500}
                  />
                </Field>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save initiative"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
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
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
