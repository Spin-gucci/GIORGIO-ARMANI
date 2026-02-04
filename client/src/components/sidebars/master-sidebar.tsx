import { Link, useLocation } from "wouter";
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
  Package,
  Building2,
} from "lucide-react";

const PANEL_PATH = "/ms-panel-9921";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: `${PANEL_PATH}/` },
  { title: "Admins", icon: UserCog, path: `${PANEL_PATH}/admins` },
  { title: "Agents", icon: Users, path: `${PANEL_PATH}/agents` },
  { title: "Members", icon: Users, path: `${PANEL_PATH}/members` },
  { title: "Activities", icon: Activity, path: `${PANEL_PATH}/activities` },
  { title: "Products", icon: Package, path: `${PANEL_PATH}/products` },
  { title: "System Banks", icon: Building2, path: `${PANEL_PATH}/system-banks` },
  { title: "Settings", icon: Settings, path: `${PANEL_PATH}/settings` },
];

export function MasterSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">Master Panel</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.path}>
                    <Link href={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
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
