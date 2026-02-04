import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function RoleSwitcher() {
  const { currentUser, logout } = useRole();

  if (!currentUser) return <ThemeToggle />;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">{currentUser.username}</span>
        <span className="text-muted-foreground capitalize">({currentUser.role})</span>
      </div>
      <ThemeToggle />
      <Button variant="ghost" size="icon" onClick={logout}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
