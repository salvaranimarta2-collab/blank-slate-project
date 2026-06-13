import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, UserRound } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

function initials(s: string) {
  return s
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function HeaderUserMenu() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="h-9 w-9" />;

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline" className="gap-1.5">
        <Link to="/auth">
          <LogIn className="h-3.5 w-3.5" />
          Sign in
        </Link>
      </Button>
    );
  }

  const label = user.email ?? "";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(152_65%_36%)] text-xs font-semibold text-white"
          aria-label="Account menu"
        >
          {initials(label) || <UserRound className="h-4 w-4" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[2000] w-56">
        <DropdownMenuLabel>
          <div className="truncate text-xs font-medium">{label}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {role ?? "account"}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/messages">Messages</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile">My profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
