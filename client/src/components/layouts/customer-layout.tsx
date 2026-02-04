"use client";

import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Home, ShoppingBag, FileText, User } from "lucide-react";

const PANEL_PATH = "/wk-panel-2210";

const navItems = [
  { title: "Home", icon: Home, url: `${PANEL_PATH}/` },
  { title: "Mall", icon: ShoppingBag, url: `${PANEL_PATH}/mall` },
  { title: "Aturan", icon: FileText, url: `${PANEL_PATH}/aturan` },
  { title: "Akun", icon: User, url: `${PANEL_PATH}/akun` },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 overflow-auto pb-16">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.url || (item.url.endsWith('/') && location === item.url.slice(0, -1));
            return (
              <button
                key={item.title}
                onClick={() => setLocation(item.url)}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.title}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
