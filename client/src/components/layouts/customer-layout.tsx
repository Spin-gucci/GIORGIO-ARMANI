import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Store, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const PANEL_PATH = "/wk-panel-2210";

const navItems = [
  { title: "Beranda", icon: Home, path: `${PANEL_PATH}/` },
  { title: "Mall", icon: Store, path: `${PANEL_PATH}/mall` },
  { title: "Aturan", icon: FileText, path: `${PANEL_PATH}/aturan` },
  { title: "Akun", icon: User, path: `${PANEL_PATH}/akun` },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-16">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors",
                location === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
