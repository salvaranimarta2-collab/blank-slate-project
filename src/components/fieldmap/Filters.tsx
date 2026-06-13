import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  categories,
  countries,
  needsOptions,
  type Category,
  type NeedFilter,
} from "@/lib/fieldmap-data";
import { X } from "lucide-react";

export interface FilterState {
  category: Category | "all";
  needs: NeedFilter[];
  type: "time-bound" | "ongoing" | "both";
  country: string | "all";
  entityKind: "RLO" | "NGO" | "all";
}

export const defaultFilters: FilterState = {
  category: "all",
  needs: [],
  type: "both",
  country: "all",
  entityKind: "all",
};

export function Filters({
  value,
  onChange,
  resultCount,
}: {
  value: FilterState;
  onChange: (f: FilterState) => void;
  resultCount: number;
}) {
  const hasActive =
    value.category !== "all" ||
    value.needs.length > 0 ||
    value.type !== "both" ||
    value.country !== "all" ||
    value.entityKind !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card/80 p-3 backdrop-blur">
      <Select
        value={value.category}
        onValueChange={(v) =>
          onChange({ ...value, category: v as Category | "all" })
        }
      >
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="z-[2000]">
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c} className="capitalize">
              {c}
            </SelectItem>
          ))}
        </SelectContent>

      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Resource Needs
            {value.needs.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px]">
                {value.needs.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-[2000] w-48" align="start">
          <div className="space-y-2">
            {needsOptions.map((n) => {
              const checked = value.needs.includes(n);
              return (
                <label
                  key={n}
                  className="flex cursor-pointer items-center gap-2 text-sm capitalize"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => {
                      const next = c
                        ? [...value.needs, n]
                        : value.needs.filter((x) => x !== n);
                      onChange({ ...value, needs: next });
                    }}
                  />
                  {n}
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Select
        value={value.type}
        onValueChange={(v) =>
          onChange({ ...value, type: v as FilterState["type"] })
        }
      >
        <SelectTrigger className="h-8 w-fit min-w-[100px] text-xs">
          <span className="text-muted-foreground mr-1">Type:</span>
          <SelectValue placeholder="Both" />
        </SelectTrigger>
        <SelectContent className="z-[2000]">
          <SelectItem value="both">Both</SelectItem>
          <SelectItem value="time-bound">Project</SelectItem>
          <SelectItem value="ongoing">Mission</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.entityKind || "all"}
        onValueChange={(v) =>
          onChange({ ...value, entityKind: (v || "all") as FilterState["entityKind"] })
        }
      >
        <SelectTrigger className="h-8 w-fit min-w-[100px] text-xs">
          <span className="text-muted-foreground mr-1">Org:</span>
          <SelectValue placeholder="Both" />
        </SelectTrigger>
        <SelectContent className="z-[2000]">
          <SelectItem value="all">Both</SelectItem>
          <SelectItem value="RLO">RLO</SelectItem>
          <SelectItem value="NGO">NGO</SelectItem>
        </SelectContent>
      </Select>


      <Select
        value={value.country}
        onValueChange={(v) => onChange({ ...value, country: v })}
      >
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent className="z-[2000]">
          <SelectItem value="all">All countries</SelectItem>
          {countries.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>

      </Select>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onChange(defaultFilters)}
        >
          <X className="mr-1 h-3 w-3" /> Clear
        </Button>
      )}

      <div className="ml-auto flex items-center gap-4 text-xs">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[hsl(152_65%_36%)]" />
            RLO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[hsl(212_85%_48%)]" />
            NGO
          </span>
        </div>
        <div className="text-muted-foreground border-l border-muted pl-4 h-4 flex items-center">
          {resultCount} {resultCount === 1 ? "project" : "projects"}
        </div>
      </div>
    </div>
  );
}
