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
import { donors, type DonorType } from "@/lib/donors-data";
import { categories, type Category } from "@/lib/fieldmap-data";
import { orgColor, orgInitials } from "@/lib/category-photos";
import { Mail, MapPin, Target, Globe2, Search, X } from "lucide-react";

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
  const allRegions = useMemo(
    () => Array.from(new Set(donors.flatMap((d) => d.regions))).sort(),
    [],
  );

  const [query, setQuery] = useState("");
  const [type, setType] = useState<DonorType | "all">("all");
  const [interests, setInterests] = useState<Category[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return donors.filter((d) => {
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
  }, [query, type, interests, regions]);

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
    <div className="h-full w-full overflow-y-auto bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Top donors</h2>
          <p className="text-sm text-muted-foreground">
            A curated list of funders actively supporting refugee-led and humanitarian
            initiatives. Filter by interest or region to find the right fit.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card/80 p-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search donors…"
              className="h-8 w-56 pl-7 text-xs"
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

          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "donor" : "donors"}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card/60 p-10 text-center text-sm text-muted-foreground">
            No donors match these filters. Try removing one or two to widen the search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <Card key={d.id} className="flex flex-col">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: orgColor(d.id) }}
                    >
                      {orgInitials(d.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold leading-tight">
                          {d.name}
                        </h3>
                        <Badge className={typeColor[d.type]}>{d.type}</Badge>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {d.location}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                  <p className="text-xs leading-relaxed text-foreground/80">{d.about}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Target className="h-3 w-3" /> Interests
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.interests.map((i) => (
                        <Badge
                          key={i}
                          variant={interests.includes(i) ? "default" : "secondary"}
                          className="capitalize text-[10px]"
                        >
                          {i}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Globe2 className="h-3 w-3" /> Regions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.regions.map((r) => (
                        <Badge
                          key={r}
                          variant={regions.includes(r) ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border bg-muted/40 p-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Recently funded
                      </span>
                      <span className="font-medium">{d.recentlyFunded} initiatives</span>
                    </div>
                  </div>

                  <Button asChild size="sm" className="mt-auto w-full">
                    <a
                      href={
                        d.contact.includes("@")
                          ? `mailto:${d.contact}?subject=${encodeURIComponent(
                              "Partnership enquiry via FieldMap",
                            )}`
                          : "#"
                      }
                    >
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      Contact donor
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
