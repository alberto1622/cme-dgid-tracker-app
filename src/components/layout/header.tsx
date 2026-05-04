"use client";

import { Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  agent: "Agent",
  user: "Utilisateur",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-danger/15 text-danger",
  agent: "bg-amber-500/15 text-amber-700",
  user: "bg-primary/15 text-primary",
};

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = session?.user?.role ?? "user";
  const name = session?.user?.name ?? "Utilisateur";
  const email = session?.user?.email ?? "";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-14 shrink-0 bg-card border-b border-border flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger-foreground rounded-full" />
        </button>

        {/* Role badge */}
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[role]}`}
        >
          {ROLE_LABELS[role]}
        </span>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <span className="hidden sm:inline">{name}</span>
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-foreground hover:bg-danger/10 rounded-md transition-colors"
                >
                  <LogOut size={14} />
                  Se deconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}