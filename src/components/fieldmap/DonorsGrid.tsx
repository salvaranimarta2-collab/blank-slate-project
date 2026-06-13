import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { donors, type Donor, type DonorType } from "@/lib/donors-data";
import { categories, type Category } from "@/lib/fieldmap-data";
import { orgColor, orgInitials } from "@/lib/category-photos";
import { MessageSquare, MapPin, Target, Globe2, Search, X } from "lucide-react";
import { ContactDonorDialog } from "@/components/fieldmap/ContactDonorDialog";
import { useAuth } from "@/lib/use-auth";

const typeColor: Record<string, string> = {
  Foundation: "bg-[hsl(212_85%_48%)] text-white hover:bg-[hsl(212_85%_44%)]",
  Government: "bg-[hsl(262_60%_50%)] text-white hover:bg-[hsl(262_60%_46%)]",
  Corporate: "bg-[hsl(28_85%_50%)] text-white hover:bg-[hsl(28_85%_46%)]",
  Individual: "bg-[hsl(152_65%_36%)] text-white hover:bg-[hsl(152_65%_32%)]",
};

const donorTypes: DonorType[] = [
  "Foundation",
  "Government",
  "Corporate",
  "Individual",
];

export function DonorsGrid() {
  // Shuffle donor order once per mount (each page open).
  const [shuffledDonors] = useState(() => {
    const arr = [...donors];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const allRegions = useMemo(
    () => Array.from(new Set(donors.flatMap((d) => d.regions))).sort(),
    [],
  );


  const [query, setQuery] = useState("");
  const [type, setType] = useState<DonorType | "all">("all");
  const [interests, setInterests] = useState<Category[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [contactDonor, setContactDonor] = useState<Donor | null>(null);
  const { role } = useAuth();
  const canContact = role === "rlo" || role === "ngo";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shuffledDonors.filter((d) => {
      if (type !== "all" && d.type !== type) return false;
      if (interests.length && !interests.some((i) => d.interests.includes(i)))
        return false;
      if (
        regions.length &&
        !regions.some(
          (r) => d.regions.includes(r) || d.regions.includes("Global"),
        )
      )
        return false;
      if (q) {
        const hay = `${d.name} ${d.about} ${d.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, type, interests, regions, shuffledDonors]);

  const hasActive =
    type !== "all" ||
    interests.length > 0 ||
    regions.length > 0 ||
    query.trim() !== "";

  function clearAll() {
    setQuery("");
    setType("all");
    setInterests([]);
    setRegions([]);
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-[hsl(40_40%_98%)] via-background to-[hsl(152_30%_97%)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Filter bar */}
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border bg-card/80 p-2.5 shadow-sm backdrop-blur">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search donors…"
              className="h-8 w-56 pl-8 text-xs"
            />
          </div>

          <Select value={type} onValueChange={(v) => setType(v as DonorType | "all")}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <span className="mr-1 text-muted-foreground">Type:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              <SelectItem value="all">All types</SelectItem>
              {donorTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Interests
                {interests.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                    {interests.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[2000] w-56" align="start">
              <div className="space-y-2">
                {categories.map((c) => {
                  const checked = interests.includes(c);
                  return (
                    <label
                      key={c}
                      className="flex cursor-pointer items-center gap-2 text-sm capitalize"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          setInterests((prev) =>
                            v ? [...prev, c] : prev.filter((x) => x !== c),
                          )
                        }
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Regions
                {regions.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                    {regions.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[2000] w-56" align="start">
              <div className="space-y-2">
                {allRegions.map((r) => {
                  const checked = regions.includes(r);
                  return (
                    <label
                      key={r}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          setRegions((prev) =>
                            v ? [...prev, r] : prev.filter((x) => x !== r),
                          )
                        }
                      />
                      {r}
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {hasActive && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearAll}>
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          )}

          <div className="ml-auto text-xs font-medium text-muted-foreground">
            <span className="tabular-nums text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "donor" : "donors"}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card/60 p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No donors match these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try removing one or two filters to widen the search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <Card
                key={d.id}
                className="group relative flex flex-col overflow-hidden border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(152_65%_36%)]/40 hover:shadow-lg"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: orgColor(d.id) }}
                />
                <CardHeader className="space-y-3 pb-3 pt-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ring-2 ring-background"
                      style={{ backgroundColor: orgColor(d.id) }}
                    >
                      {orgInitials(d.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold leading-tight">
                          {d.name}
                        </h3>
                        <Badge className={typeColor[d.type] + " shrink-0 text-[10px]"}>
                          {d.type}
                        </Badge>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {d.location}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3.5 pt-0">
                  <p className="text-xs leading-relaxed text-foreground/75">{d.about}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Target className="h-3 w-3" /> Interests
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.interests.map((i) => (
                        <Badge
                          key={i}
                          variant={interests.includes(i) ? "default" : "secondary"}
                          className="capitalize text-[10px] font-normal"
                        >
                          {i}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Globe2 className="h-3 w-3" /> Regions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.regions.map((r) => (
                        <Badge
                          key={r}
                          variant={regions.includes(r) ? "default" : "outline"}
                          className="text-[10px] font-normal"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[hsl(152_65%_36%)]/15 bg-[hsl(152_40%_97%)] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Recently funded
                      </span>
                      <span className="text-xs font-semibold text-[hsl(152_65%_28%)] tabular-nums">
                        {d.recentlyFunded} initiatives
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="mt-auto w-full transition-shadow group-hover:shadow-md"
                    onClick={() => setContactDonor(d)}
                    disabled={!canContact}
                    title={
                      canContact
                        ? undefined
                        : "Sign in as an RLO or NGO to contact donors"
                    }
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Contact donor
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {contactDonor && (
        <ContactDonorDialog
          open={!!contactDonor}
          onOpenChange={(o) => !o && setContactDonor(null)}
          donor={{
            id: contactDonor.id,
            name: contactDonor.name,
            type: contactDonor.type,
            location: contactDonor.location,
            about: contactDonor.about,
            interests: contactDonor.interests,
            regions: contactDonor.regions,
            ticketSize: contactDonor.ticketSize,
            recentlyFunded: contactDonor.recentlyFunded,
          }}
        />
      )}
    </div>
  );
}
