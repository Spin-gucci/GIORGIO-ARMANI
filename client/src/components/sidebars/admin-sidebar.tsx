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
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  AlertTriangle,
  Package,
  Building2,
  UserCheck,
} from "lucide-react";

const PANEL_PATH = "/ad-panel-4432";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: `${PANEL_PATH}/` },
  { title: "Agents", icon: Users, path: `${PANEL_PATH}/agents` },
  { title: "Members", icon: Users, path: `${PANEL_PATH}/members` },
  { title: "Member Approval", icon: UserCheck, path: `${PANEL_PATH}/member-approval` },
  { title: "Deposit Approval", icon: ArrowDownCircle, path: `${PANEL_PATH}/deposit-approval` },
  { title: "Withdrawal Approval", icon: ArrowUpCircle, path: `${PANEL_PATH}/withdrawal-approval` },
  { title: "Balance", icon: Wallet, path: `${PANEL_PATH}/balance` },
  { title: "Deposits", icon: ArrowDownCircle, path: `${PANEL_PATH}/deposits` },
  { title: "Account Lock", icon: Lock, path: `${PANEL_PATH}/account-lock` },
  { title: "Withdrawal Detection", icon: AlertTriangle, path: `${PANEL_PATH}/withdrawal-detection` },
  { title: "Products", icon: Package, path: `${PANEL_PATH}/products` },
  { title: "System Banks", icon: Building2, path: `${PANEL_PATH}/system-banks` },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">Admin Panel</h2>
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
