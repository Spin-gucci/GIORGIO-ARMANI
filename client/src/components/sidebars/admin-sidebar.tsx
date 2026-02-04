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
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  AlertTriangle,
  ShoppingBag,
  Building2
} from "lucide-react";

const PANEL_PATH = "/ad-panel-4432";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: `${PANEL_PATH}/` },
  { title: "Agents", icon: Users, url: `${PANEL_PATH}/agents` },
  { title: "Members", icon: Users, url: `${PANEL_PATH}/members` },
  { title: "Member Approval", icon: Users, url: `${PANEL_PATH}/member-approval` },
  { title: "Deposit Approval", icon: ArrowDownToLine, url: `${PANEL_PATH}/deposit-approval` },
  { title: "Withdrawal Approval", icon: ArrowUpFromLine, url: `${PANEL_PATH}/withdrawal-approval` },
  { title: "Balance", icon: Wallet, url: `${PANEL_PATH}/balance` },
  { title: "Products", icon: ShoppingBag, url: `${PANEL_PATH}/products` },
  { title: "System Banks", icon: Building2, url: `${PANEL_PATH}/system-banks` },
  { title: "Account Lock", icon: Lock, url: `${PANEL_PATH}/account-lock` },
  { title: "Withdrawal Detection", icon: AlertTriangle, url: `${PANEL_PATH}/withdrawal-detection` },
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img src="/download.png" alt="Logo" className="h-8 w-8" />
          <span className="font-semibold">Admin Panel</span>
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
