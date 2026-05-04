"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Map,
  BarChart3,
  CreditCard,
  Settings,
  Package,
  Clock,
  Users,
  ParkingCircle,
  CalendarCheck,
  Banknote,
  Receipt,
  PanelLeftClose,
  PanelLeft,
  Building2,
  GitMerge,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type NavItem = {
  href?: string;
  icon?: React.ComponentType<{ size?: number }>;
  label: string;
  type?: "separator";
  minRole?: "user" | "agent" | "admin";
};

const ROLE_LEVEL: Record<string, number> = {
  user: 0,
  agent: 1,
  admin: 2,
};

// const menuItems = [
//     { icon: LayoutDashboard, label: "Tableau de Bord", path: "/" },
//     { icon: Building2, label: "Entités", path: "/entities" },
//     { icon: FileSearch, label: "Analyse Croisée", path: "/analysis" },
//     { icon: Map, label: "Plan Cadastral", path: "/map" },
//     { icon: Link2, label: "Matching Intelligent", path: "/matching" },
//     { icon: GitMerge, label: "Gestion Doublons", path: "/doublons" },
//     { icon: AlertTriangle, label: "Alertes", path: "/alerts" },
//     { icon: FileText, label: "Rapports", path: "/reports" },
//     { icon: Upload, label: "Import", path: "/import" },
//     { icon: Bot, label: "Assistant IA", path: "/assistant" },
//   ];

const links: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Tableau de bord",
    minRole: "admin",
  },
  {
    href: "/entities",
    icon: Building2,
    label: "Entités",
    minRole: "user",
  },
  {
    href: "/analytics",
    icon: BarChart3,
    label: "Analytics",
    minRole: "user",
  },
  {
    href: "/matching",
    icon: Link2,
    label: "Matching Intelligent",
    minRole: "user",
  },
  {
    href: "/doublons",
    icon: GitMerge,
    label: "Gestion Doublons",
    minRole: "user",
  },
  {
    href: "/alerts",
    icon: AlertTriangle,
    label: "Alertes",
    minRole: "user",
  },
  { label: "Administration", type: "separator", minRole: "admin" },
  {
    href: "/admin/users",
    icon: Users,
    label: "Utilisateurs",
    minRole: "admin",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Administration",
    minRole: "admin",
  },
];

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role ?? "user";
  const userLevel = ROLE_LEVEL[userRole] ?? 0;

  const visibleLinks = links.filter((item) => {
    if (!item.minRole) return true;
    return userLevel >= (ROLE_LEVEL[item.minRole] ?? 0);
  });

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-primary transition-all duration-300 ease-in-out",
        "fixed lg:static inset-y-0 left-0 z-50",
        open ? "w-56" : "w-16",
        !open && "max-lg:-translate-x-full",
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/20">
        {open ? (
          <Link href="/" className="flex items-center gap-3">
            <Image
              width={20}
              height={20}
              loading="eager"
                src="/dgid-logo.png"
              alt="logo DGID"
              style={{ width: "auto", height: "auto" }}
            />
            <p className="text-white font-bold text-xs leading-tight">DGID</p>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <Image
              width={28}
              height={28}
              loading="eager"
              src="/dgid-logo.png"
              alt="logo DGID"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title={open ? "Reduire le menu" : "Agrandir le menu"}
        >
          {open ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {visibleLinks.map((item, i) => {
          if (item.type === "separator") {
            return open ? (
              <p
                key={i}
                className="text-white/40 text-[10px] font-semibold uppercase px-2 pt-4 pb-1"
              >
                {item.label}
              </p>
            ) : (
              <div key={i} className="my-2 border-t border-white/10" />
            );
          }
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
              title={!open ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm transition-colors",
                open ? "px-3 py-2" : "px-0 py-2 justify-center",
                active
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.icon && <item.icon size={16} />}
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role indicator */}
      <div className="p-3 border-t border-white/20">
        {open ? (
          <p className="text-white/50 text-[11px]">
            Connecte :{" "}
            <span className="text-white font-medium">{userRole}</span>
          </p>
        ) : (
          <div className="w-6 h-6 mx-auto rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold uppercase">
              {userRole[0]}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}