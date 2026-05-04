"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Building2,
  Database,
  FileText,
  GitMerge,
  LayoutDashboard,
  Map,
  PanelLeft,
  PanelLeftClose,
  TrendingUp,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";

type AppRole = "user" | "admin";

type NavItem = {
  href?: string;
  icon?: React.ComponentType<{ size?: number }>;
  label: string;
  type?: "separator";
  minRole?: AppRole;
};

const ROLE_LEVEL: Record<AppRole, number> = { user: 0, admin: 1 };

const links: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/entites", icon: Building2, label: "Entités" },
  { href: "/analyses", icon: BarChart3, label: "Analyses" },
  { href: "/cadastreMap", icon: Map, label: "Carte cadastrale" },
  { href: "/Reports", icon: FileText, label: "Rapports" },
  { href: "/alert", icon: AlertTriangle, label: "Alertes" },
  { href: "/assistant", icon: Bot, label: "Assistant IA" },
  { label: "Outils", type: "separator" },
  { href: "/duplicates", icon: GitMerge, label: "Doublons" },
  { href: "/MatchingTool", icon: TrendingUp, label: "Matching" },
  { label: "Administration", type: "separator", minRole: "admin" },
  { href: "/import", icon: Upload, label: "Import", minRole: "admin" },
];

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role as AppRole) ?? "user";
  const userLevel = ROLE_LEVEL[userRole] ?? 0;

  const visibleLinks = links.filter((item) => {
    if (!item.minRole) return true;
    return userLevel >= ROLE_LEVEL[item.minRole];
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
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/20">
        {open ? (
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              width={32}
              height={32}
              loading="eager"
              src="/dakar-mairie.png"
              alt="logo"
              style={{ width: "auto", height: "auto" }}
            />
            <div>
              <p className="text-white font-bold text-xs leading-tight">CME — DGID</p>
              <p className="text-white/60 text-[10px]">Tracker immobilier</p>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <Database size={28} color="white" />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title={open ? "Réduire" : "Agrandir"}
        >
          {open ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {visibleLinks.map((item, i) => {
          if (item.type === "separator") {
            return open ? (
              <p key={i} className="text-white/40 text-[10px] font-semibold uppercase px-2 pt-4 pb-1">
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

      <div className="p-3 border-t border-white/20">
        {open ? (
          <p className="text-white/50 text-[11px]">
            Connecté : <span className="text-white font-medium">{userRole}</span>
          </p>
        ) : (
          <div className="w-6 h-6 mx-auto rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold uppercase">{userRole[0]}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
