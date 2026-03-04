import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  ListOrdered,
  Plus,
  QrCode,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavChild = { label: string; href: string; icon: React.ElementType };

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    iconColor: "text-foreground",
  },
  {
    label: "Menu Manager",
    href: "/menu",
    icon: UtensilsCrossed,
    iconColor: "text-foreground",
    children: [
      { label: "Menu Items", href: "/menu", icon: ListOrdered },
      { label: "Add Item", href: "/menu/add", icon: Plus },
      { label: "Categories", href: "/menu/categories", icon: FolderOpen },
    ],
  },
  {
    label: "Tables & QR",
    href: "/tables",
    icon: QrCode,
    iconColor: "text-foreground",
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ClipboardList,
    iconColor: "text-foreground",
  },
  {
    label: "Staff",
    href: "/staff",
    icon: Users,
    iconColor: "text-foreground",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    iconColor: "text-foreground",
  },
];

function NavCollapsibleItem({
  item,
}: {
  item: NavItem & { children: NavChild[] };
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(() =>
    location.pathname.startsWith(item.href),
  );
  const isActive = location.pathname.startsWith(item.href);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.label}
            onClick={() => navigate(item.href)}
          >
            <item.icon className={item.iconColor} />
            <span>{item.label}</span>
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton
                  isActive={location.pathname === child.href}
                  onClick={() => navigate(child.href)}
                >
                  <child.icon className="size-3.5" />
                  <span>{child.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              return (
                <NavCollapsibleItem
                  key={item.href}
                  item={item as NavItem & { children: NavChild[] }}
                />
              );
            }

            const isActive =
              location.pathname.startsWith(item.href) &&
              (item.href !== "/" || location.pathname === "/");

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.label}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className={item.iconColor} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
