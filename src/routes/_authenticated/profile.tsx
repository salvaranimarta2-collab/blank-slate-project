import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — Waythrough" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role, loading } = useAuth();

  if (loading || !user) return <Shell><p className="text-sm text-muted-foreground">Loading…</p></Shell>;

  return (
    <Shell>
      {role === "donor" ? (
        <>
          <ContactBasics userId={user.id} email={user.email ?? ""} />
          <DonorProfileEditor userId={user.id} />
        </>
      ) : (role === "rlo" || role === "ngo") ? (
        <OrgAccountEditor userId={user.id} email={user.email ?? ""} role={role} />
      ) : (
        <ContactBasics userId={user.id} email={user.email ?? ""} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to map
      </Link>
      <h1 className="text-2xl font-semibold">My profile</h1>
      {children}
    </div>
  );
}

function ContactBasics({ userId, email }: { userId: string; email: string }) {
  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState(email);
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name, contact_email, contact_phone")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? "");
        setContactEmail(data?.contact_email ?? email);
        setContactPhone(data?.contact_phone ?? "");
      });
  }, [userId, email]);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, contact_email: contactEmail, contact_phone: contactPhone })
      .eq("id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  return (
    <Card className="space-y-4 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Display name">
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Contact email">
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={255} />
        </Field>
        <Field label="Contact phone (E.164, optional)">
          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 555 123 4567" maxLength={32} />
        </Field>
      </div>
      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
    </Card>
  );
}

function DonorProfileEditor({ userId }: { userId: string }) {
  const [data, setData] = useState({
    organisation_name: "",
    donor_kind: "",
    hq_country: "",
    website: "",
    blurb: "",
    interests: "",
    regions: "",
    focus_areas: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("donor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data: row }) => {
        if (!row) return;
        setData({
          organisation_name: row.organisation_name ?? "",
          donor_kind: row.donor_kind ?? "",
          hq_country: row.hq_country ?? "",
          website: row.website ?? "",
          blurb: row.blurb ?? "",
          interests: (row.interests ?? []).join(", "),
          regions: (row.regions ?? []).join(", "),
          focus_areas: (row.focus_areas ?? []).join(", "),
        });
      });
  }, [userId]);

  async function save() {
    setSaving(true);
    const payload = {
      id: userId,
      organisation_name: data.organisation_name,
      donor_kind: data.donor_kind,
      hq_country: data.hq_country,
      website: data.website,
      blurb: data.blurb,
      interests: data.interests.split(",").map((s) => s.trim()).filter(Boolean),
      regions: data.regions.split(",").map((s) => s.trim()).filter(Boolean),
      focus_areas: data.focus_areas.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const { error } = await supabase.from("donor_profiles").upsert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Donor profile saved");
  }

  return (
    <Card className="space-y-4 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Donor profile</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Organisation name">
          <Input value={data.organisation_name} onChange={(e) => setData({ ...data, organisation_name: e.target.value })} />
        </Field>
        <Field label="Donor kind (foundation / corporate / individual)">
          <Input value={data.donor_kind} onChange={(e) => setData({ ...data, donor_kind: e.target.value })} />
        </Field>
        <Field label="HQ country">
          <Input value={data.hq_country} onChange={(e) => setData({ ...data, hq_country: e.target.value })} />
        </Field>
        <Field label="Website">
          <Input value={data.website} onChange={(e) => setData({ ...data, website: e.target.value })} />
        </Field>
      </div>
      <Field label="About you">
        <Textarea value={data.blurb} onChange={(e) => setData({ ...data, blurb: e.target.value })} rows={3} maxLength={500} />
      </Field>
      <Field label="Interests (comma separated)">
        <Input value={data.interests} onChange={(e) => setData({ ...data, interests: e.target.value })} />
      </Field>
      <Field label="Regions (comma separated)">
        <Input value={data.regions} onChange={(e) => setData({ ...data, regions: e.target.value })} />
      </Field>
      <Field label="Focus areas (comma separated)">
        <Input value={data.focus_areas} onChange={(e) => setData({ ...data, focus_areas: e.target.value })} />
      </Field>
      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save donor profile"}</Button>
    </Card>
  );
}

type UserOrg = {
  id: string;
  name: string;
  entity_kind: "RLO" | "NGO";
  country: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  phone: string | null;
  claimed_seed_org_id: string | null;
};


function OrgAccountEditor({
  userId,
  email,
  role,
}: {
  userId: string;
  email: string;
  role: "rlo" | "ngo";
}) {
  const [org, setOrg] = useState<UserOrg | null>(null);
  const [contactEmail, setContactEmail] = useState(email);
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(true);

  // Local form state for the single org
  const [form, setForm] = useState({
    name: "",
    country: "",
    region: "",
    lat: "",
    lng: "",
    description: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    const [{ data: orgRow }, { data: profileRow }] = await Promise.all([
      supabase
        .from("user_orgs")
        .select("id, name, entity_kind, country, region, lat, lng, description, phone, claimed_seed_org_id")
        .eq("owner_id", userId)
        .order("created_at")
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("contact_email, contact_phone").eq("id", userId).maybeSingle(),
    ]);
    const o = (orgRow as UserOrg) ?? null;
    setOrg(o);
    setForm({
      name: o?.name ?? "",
      country: o?.country ?? "",
      region: o?.region ?? "",
      lat: o?.lat != null ? String(o.lat) : "",
      lng: o?.lng != null ? String(o.lng) : "",
      description: o?.description ?? "",
      phone: o?.phone ?? "",
    });
    setContactEmail(profileRow?.contact_email ?? email);
    setContactPhone(profileRow?.contact_phone ?? "");
    setLoading(false);
  }
  useEffect(() => { reload(); }, [userId]);

  async function save() {
    if (!form.name.trim()) { toast.error("Organisation name is required"); return; }
    setSaving(true);
    const payload = {
      owner_id: userId,
      name: form.name.trim(),
      entity_kind: role === "rlo" ? "RLO" : "NGO",
      country: form.country || null,
      region: form.region || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      description: form.description || null,
      phone: form.phone || null,
    };
    const orgRes = org
      ? await supabase.from("user_orgs").update(payload).eq("id", org.id)
      : await supabase.from("user_orgs").insert(payload);
    if (orgRes.error) { setSaving(false); toast.error(orgRes.error.message); return; }
    // Account name = org name
    const profRes = await supabase
      .from("profiles")
      .update({ display_name: form.name.trim(), contact_email: contactEmail, contact_phone: contactPhone })
      .eq("id", userId);
    setSaving(false);
    if (profRes.error) { toast.error(profRes.error.message); return; }
    toast.success("Saved");
    reload();
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <>
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Organisation
          </h2>
          <Badge variant="secondary" className="text-[10px] uppercase">{role === "rlo" ? "RLO" : "NGO"}</Badge>
        </div>
          <p className="text-xs text-muted-foreground">
            Your account represents one organisation. This name is shown wherever you appear on Waythrough.
          </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Organisation name (your account name)">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} required />
          </Field>
          <Field label="Phone (E.164)">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+44 7..." maxLength={32} />
          </Field>
          <Field label="Country">
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} maxLength={100} />
          </Field>
          <Field label="Region / city">
            <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} maxLength={120} />
          </Field>
          <Field label="Latitude">
            <Input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="51.5" />
          </Field>
          <Field label="Longitude">
            <Input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="-0.1" />
          </Field>
        </div>
        <Field label="About the organisation">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={1000} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contact email">
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={255} />
          </Field>
          <Field label="Contact phone (optional)">
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 555 123 4567" maxLength={32} />
          </Field>
        </div>

        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : org ? "Save changes" : "Create organisation"}</Button>
      </Card>

      <p className="text-xs text-muted-foreground">
        Manage your initiatives from the{" "}
        <Link to="/dashboard" className="text-primary underline">
          Dashboard
        </Link>
        .
      </p>

    </>
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
