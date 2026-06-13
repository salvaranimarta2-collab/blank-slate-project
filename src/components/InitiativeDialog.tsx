import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X, Handshake } from "lucide-react";
import {
  getAllProjects,
  type Project,
  type Expertise,
} from "@/lib/fieldmap-data";

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

const EXPERTISE_OPTIONS: Expertise[] = [
  "engineering",
  "medical",
  "legal",
  "agricultural",
  "IT",
  "project management",
];

export type InitiativeRecord = {
  id?: string;
  title: string;
  category: string;
  project_type: string;
  location_label: string;
  lat: number | null;
  lng: number | null;
  description: string | null;
  beneficiaries: string | null;
  status?: string;
  needs: {
    funding?: { amount: number; currency: "USD" | "EUR"; raised?: number };
    equipment?: string;
    expertise?: Expertise[];
    training?: string;
    partnership?: boolean;
  };
  partner_org_refs?: string[];
};

export function InitiativeDialog({
  open,
  onClose,
  userId,
  orgId,
  initial,
  onSaved,
  triggerLabel,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  orgId: string | null;
  initial?: InitiativeRecord | null;
  onSaved: () => void;
  triggerLabel?: string;
}) {
  const editing = !!initial?.id;
  const [collabMode, setCollabMode] = useState(false);
  const [collabProjectId, setCollabProjectId] = useState<string>("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("education");
  const [projectType, setProjectType] = useState("ongoing");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("100–500");
  const [status, setStatus] = useState("seeking support");
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingCurrency, setFundingCurrency] = useState<"USD" | "EUR">("USD");
  const [fundingRaised, setFundingRaised] = useState("");
  const [equipment, setEquipment] = useState("");
  const [training, setTraining] = useState("");
  const [partnership, setPartnership] = useState(false);
  const [expertise, setExpertise] = useState<Expertise[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title ?? "");
      setCategory(initial.category ?? "education");
      setProjectType(initial.project_type ?? "ongoing");
      setLocation(initial.location_label ?? "");
      setLat(initial.lat != null ? String(initial.lat) : "");
      setLng(initial.lng != null ? String(initial.lng) : "");
      setDescription(initial.description ?? "");
      setBeneficiaries(initial.beneficiaries ?? "100–500");
      setStatus(initial.status ?? "seeking support");
      const n = initial.needs ?? {};
      setFundingAmount(n.funding ? String(n.funding.amount) : "");
      setFundingCurrency((n.funding?.currency as "USD" | "EUR") ?? "USD");
      setFundingRaised(n.funding?.raised != null ? String(n.funding.raised) : "");
      setEquipment(n.equipment ?? "");
      setTraining(n.training ?? "");
      setPartnership(!!n.partnership);
      setExpertise(n.expertise ?? []);
      setCollabMode((initial.partner_org_refs?.length ?? 0) > 0);
      setCollabProjectId("");
    } else {
      setTitle("");
      setCategory("education");
      setProjectType("ongoing");
      setLocation("");
      setLat("");
      setLng("");
      setDescription("");
      setBeneficiaries("100–500");
      setStatus("seeking support");
      setFundingAmount("");
      setFundingCurrency("USD");
      setFundingRaised("");
      setEquipment("");
      setTraining("");
      setPartnership(false);
      setExpertise([]);
      setCollabMode(false);
      setCollabProjectId("");
    }
  }, [open, initial]);

  // Project list available for collaboration (all visible projects).
  const collabOptions = useMemo<Project[]>(() => {
    return getAllProjects().filter((p) => p.id !== initial?.id);
  }, [initial?.id, open]);

  const [collabSearch, setCollabSearch] = useState("");
  const filteredCollabOptions = useMemo(() => {
    const q = collabSearch.trim().toLowerCase();
    if (!q) return collabOptions.slice(0, 50);
    return collabOptions
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.locationLabel.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [collabOptions, collabSearch]);

  function onPickCollab(id: string) {
    setCollabProjectId(id);
    const p = collabOptions.find((x) => x.id === id);
    if (!p) return;
    // Auto-fill location to match the collaborator's project
    setLocation(p.locationLabel);
    setLat(String(p.lat));
    setLng(String(p.lng));
    if (!category || category === "education") setCategory(p.category);
  }

  const selectedCollab = collabOptions.find((p) => p.id === collabProjectId);

  async function save() {
    if (!orgId) {
      toast.error("Save your organisation first on the profile page");
      return;
    }
    if (!title || !location || !lat || !lng) {
      toast.error("Title, location, latitude and longitude are required");
      return;
    }
    if (collabMode && !collabProjectId && !(initial?.partner_org_refs?.length)) {
      toast.error("Pick the initiative you're collaborating on");
      return;
    }
    setSaving(true);
    const needs: InitiativeRecord["needs"] = {};
    if (fundingAmount) {
      needs.funding = {
        amount: Number(fundingAmount),
        currency: fundingCurrency,
        ...(fundingRaised ? { raised: Number(fundingRaised) } : {}),
      };
    }
    if (equipment.trim()) needs.equipment = equipment.trim();
    if (training.trim()) needs.training = training.trim();
    if (partnership) needs.partnership = true;
    if (expertise.length) needs.expertise = expertise;

    // partner_org_refs stores the referenced project id with a "project:" prefix
    // when we're collaborating on someone else's initiative.
    const partnerRefs = collabMode
      ? collabProjectId
        ? [`project:${collabProjectId}`]
        : initial?.partner_org_refs ?? []
      : [];

    const payload = {
      title,
      category,
      project_type: projectType,
      location_label: location,
      lat: Number(lat),
      lng: Number(lng),
      description,
      beneficiaries,
      status,
      needs: needs as never,
      partner_org_refs: partnerRefs,
    };

    const res = editing
      ? await supabase.from("user_projects").update(payload).eq("id", initial!.id!)
      : await supabase.from("user_projects").insert({
          ...payload,
          owner_id: userId,
          org_id: orgId,
        });
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(editing ? "Initiative updated" : "Initiative added");
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-lg border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">
              {editing ? "Edit initiative" : triggerLabel ?? "Add a new initiative"}
            </h3>
            {collabMode && (
              <p className="mt-0.5 text-xs text-[hsl(212_85%_48%)]">
                Collaboration mode — this will appear on the map as a partnership.
              </p>
            )}
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!editing && (
          <div className="mb-4 flex gap-2 rounded-md border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setCollabMode(false)}
              className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition ${
                !collabMode ? "bg-background shadow" : "text-muted-foreground"
              }`}
            >
              <Plus className="mr-1 inline h-3 w-3" /> New initiative
            </button>
            <button
              type="button"
              onClick={() => setCollabMode(true)}
              className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition ${
                collabMode ? "bg-background shadow" : "text-muted-foreground"
              }`}
            >
              <Handshake className="mr-1 inline h-3 w-3" /> Add collaboration
            </button>
          </div>
        )}

        {collabMode && !editing && (
          <div className="mb-4 space-y-2 rounded-md border border-[hsl(212_85%_48%)]/40 bg-[hsl(212_85%_48%)]/5 p-3">
            <Label className="text-xs">Collaborating on</Label>
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={collabProjectId}
              onChange={(e) => onPickCollab(e.target.value)}
            >
              <option value="">Select an initiative…</option>
              {collabOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.locationLabel}
                </option>
              ))}
            </select>
            {collabProjectId && (
              <p className="text-[11px] text-muted-foreground">
                Location auto-filled from the chosen initiative. Fill in the
                rest with your own contribution to the collaboration.
              </p>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </Field>
          <Field label="Category">
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            >
              <option value="ongoing">Ongoing</option>
              <option value="time-bound">Time-bound</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="seeking support">seeking support</option>
              <option value="partially supported">partially supported</option>
              <option value="fully supported">fully supported</option>
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
              disabled={collabMode && !!collabProjectId}
            />
          </Field>
          <Field label="Latitude">
            <Input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="37.97"
              disabled={collabMode && !!collabProjectId}
            />
          </Field>
          <Field label="Longitude">
            <Input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="23.72"
              disabled={collabMode && !!collabProjectId}
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

        <div className="mt-4 space-y-3 rounded-md border bg-muted/20 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Needs (all optional)
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Funding amount">
              <Input
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                placeholder="25000"
                inputMode="numeric"
              />
            </Field>
            <Field label="Currency">
              <select
                className="w-full rounded-md border bg-background p-2 text-sm"
                value={fundingCurrency}
                onChange={(e) => setFundingCurrency(e.target.value as "USD" | "EUR")}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </Field>
            <Field label="Already raised">
              <Input
                value={fundingRaised}
                onChange={(e) => setFundingRaised(e.target.value)}
                placeholder="0"
                inputMode="numeric"
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Equipment needed">
              <Input
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="e.g. 20 solar panels"
              />
            </Field>
            <Field label="Training needed">
              <Input
                value={training}
                onChange={(e) => setTraining(e.target.value)}
                placeholder="e.g. teacher training"
              />
            </Field>
          </div>
          <div>
            <Label className="text-xs">Expertise needed</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {EXPERTISE_OPTIONS.map((e) => {
                const on = expertise.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() =>
                      setExpertise((cur) =>
                        on ? cur.filter((x) => x !== e) : [...cur, e],
                      )
                    }
                    className="focus:outline-none"
                  >
                    <Badge variant={on ? "default" : "outline"} className="capitalize cursor-pointer">
                      {e}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={partnership}
              onChange={(e) => setPartnership(e.target.checked)}
            />
            Open to NGO partnership
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Save initiative"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
