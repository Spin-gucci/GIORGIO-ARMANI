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
  Percent,
  Package,
  Building2,
  UserCheck,
} from "lucide-react";

const PANEL_PATH = "/ag-panel-7781";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: `${PANEL_PATH}/` },
  { title: "Customers", icon: Users, path: `${PANEL_PATH}/customers` },
  { title: "Member Approval", icon: UserCheck, path: `${PANEL_PATH}/member-approval` },
  { title: "Deposit Approval", icon: ArrowDownCircle, path: `${PANEL_PATH}/deposit-approval` },
  { title: "Withdrawal Approval", icon: ArrowUpCircle, path: `${PANEL_PATH}/withdrawal-approval` },
  { title: "Balance", icon: Wallet, path: `${PANEL_PATH}/balance` },
  { title: "Deposits", icon: ArrowDownCircle, path: `${PANEL_PATH}/deposits` },
  { title: "Commission", icon: Percent, path: `${PANEL_PATH}/commission` },
  { title: "Products", icon: Package, path: `${PANEL_PATH}/products` },
  { title: "System Banks", icon: Building2, path: `${PANEL_PATH}/system-banks` },
];

export function AgentSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">Agent Panel</h2>
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
