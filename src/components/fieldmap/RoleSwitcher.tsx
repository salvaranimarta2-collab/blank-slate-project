import { Button } from "@/components/ui/button";

export type Role = "seeking_donors" | "seeking_initiatives";

export function RoleSwitcher({
  role,
  onChange,
}: {
  role: Role;
  onChange: (r: Role) => void;
}) {
  const roles: { id: Role; label: string }[] = [
    { id: "seeking_donors", label: "I'm looking for Donors" },
    { id: "seeking_initiatives", label: "I'm looking for Initiatives" },
  ];
  return (
    <div className="flex gap-1 rounded-md border bg-card p-1">
      {roles.map((r) => (
        <Button
          key={r.id}
          size="sm"
          variant={role === r.id ? "default" : "ghost"}
          onClick={() => onChange(r.id)}
          className="h-7 text-xs"
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}
