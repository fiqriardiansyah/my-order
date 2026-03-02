import {
  ArrowLeft,
  CreditCard,
  Search,
  Store,
  User,
  Users,
} from "lucide-react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ProfilePage from "./profile";
import RestaurantsPage from "./restaurants";
import MembersPage from "./members";
import PlansPage from "./plans";

const SETTING_MENU = [
  { id: "profile", label: "Profile", icon: User, path: "/setting/profile" },
  {
    id: "restaurants",
    label: "Restaurants",
    icon: Store,
    path: "/setting/restaurants",
  },
  { id: "members", label: "Members", icon: Users, path: "/setting/members" },
  { id: "plans", label: "Plans", icon: CreditCard, path: "/setting/plans" },
] as const;

export default function SettingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1">
      <aside className="flex w-64 shrink-0 flex-col border-r">
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <span className="text-sm font-semibold">Settings</span>
          </div>
          <Button variant="ghost" size="icon" className="size-8">
            <Search className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-2">
          {SETTING_MENU.map(({ id, label, icon: Icon, path }) => (
            <NavLink
              key={id}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="plans" element={<PlansPage />} />
        </Routes>
      </div>
    </div>
  );
}
