import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  QrCode,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
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

export function NavMain() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.label}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className={item.iconColor} />
                  <span className="">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
