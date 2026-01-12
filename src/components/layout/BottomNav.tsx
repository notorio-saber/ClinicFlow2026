import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Settings, Shield } from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="h-6 w-6">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  );
}

export function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAdminRole();

  const navItems = [
    { to: "/", icon: <LayoutDashboard className="h-6 w-6" />, label: "Início" },
    { to: "/patients", icon: <Users className="h-6 w-6" />, label: "Pacientes" },
    { to: "/settings", icon: <Settings className="h-6 w-6" />, label: "Config" },
  ];

  if (isAdmin) {
    navItems.push({
      to: "/admin",
      icon: <Shield className="h-6 w-6" />,
      label: "Admin",
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
          />
        ))}
      </div>
    </nav>
  );
}
