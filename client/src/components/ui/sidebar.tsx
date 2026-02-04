import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Menu } from "lucide-react";

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = React.useState(true);
  const toggle = () => setOpen(!open);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle }}>
      <div style={style}>{children}</div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggle } = useSidebar();
  return (
    <Button variant="ghost" size="icon" className={className} onClick={toggle} {...props}>
      <Menu className="h-4 w-4" />
    </Button>
  );
}

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSidebar();
  return (
    <aside
      className={cn(
        "h-screen border-r bg-card transition-all duration-300",
        open ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]",
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 border-b", className)}>{children}</div>;
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-auto p-2", className)}>{children}</div>;
}

export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 border-t mt-auto", className)}>{children}</div>;
}

export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("py-2", className)}>{children}</div>;
}

export function SidebarGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSidebar();
  if (!open) return null;
  return <div className={cn("px-3 py-1 text-xs font-semibold text-muted-foreground uppercase", className)}>{children}</div>;
}

export function SidebarGroupContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1", className)}>{children}</div>;
}

export function SidebarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return <nav className={cn("space-y-1", className)}>{children}</nav>;
}

export function SidebarMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>;
}

export function SidebarMenuButton({
  children,
  className,
  isActive,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open } = useSidebar();
  const Comp = asChild ? React.Fragment : "button";
  
  const content = (
    <span
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        !open && "justify-center px-0",
        className
      )}
    >
      {children}
    </span>
  );

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        !open && "justify-center px-0",
        className
      ),
    });
  }

  return (
    <button className="w-full" {...props}>
      {content}
    </button>
  );
}

export function SidebarMenuSub({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSidebar();
  if (!open) return null;
  return <div className={cn("ml-4 pl-3 border-l space-y-1", className)}>{children}</div>;
}

export function SidebarMenuSubItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>;
}

export function SidebarMenuSubButton({
  children,
  className,
  isActive,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className
      ),
    });
  }

  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
