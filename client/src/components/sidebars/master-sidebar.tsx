"use client";

import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Activity, 
  Settings,
  ShoppingBag,
  Building2
} from "lucide-react";

const PANEL_PATH = "/ms-panel-9921";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: `${PANEL_PATH}/` },
  { title: "Admins", icon: UserCog, url: `${PANEL_PATH}/admins` },
  { title: "Agents", icon: Users, url: `${PANEL_PATH}/agents` },
  { title: "Members", icon: Users, url: `${PANEL_PATH}/members` },
  { title: "Products", icon: ShoppingBag, url: `${PANEL_PATH}/products` },
  { title: "System Banks", icon: Building2, url: `${PANEL_PATH}/system-banks` },
  { title: "Activities", icon: Activity, url: `${PANEL_PATH}/activities` },
  { title: "Settings", icon: Settings, url: `${PANEL_PATH}/settings` },
];

export function MasterSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img src="/download.png" alt="Logo" className="h-8 w-8" />
          <span className="font-semibold">Master Panel</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.url)}
                    isActive={location === item.url || (item.url.endsWith('/') && location === item.url.slice(0, -1))}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
