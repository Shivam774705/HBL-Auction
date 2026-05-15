"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, UserCircle, ShieldCheck, Hammer,
  DollarSign, Calendar, LogOut, Menu, X, Trophy, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/captains", label: "Captains", icon: Users },
  { href: "/admin/players", label: "Players", icon: UserCircle },
  { href: "/admin/teams", label: "Teams", icon: ShieldCheck },
  { href: "/admin/auction", label: "Auction Control", icon: Hammer },
  { href: "/admin/pricing", label: "Pricing Rules", icon: DollarSign },
  { href: "/admin/fixtures", label: "Fixtures", icon: Calendar },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    toast.success("Logged out");
    router.push("/login");
  }

  const activePageLabel = NAV.find(n => isActive(n.href, n.exact))?.label || "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)", overflowX: "hidden" }}>
      {/* Mobile Top Bar */}
      <div className="mobile-only" style={{ 
        position: "fixed", top: 0, left: 0, right: 0, height: 64, 
        background: "rgba(17, 18, 24, 0.8)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border)", 
        display: "flex", alignItems: "center", padding: "0 1.25rem", zIndex: 100 
      }}>
        <div style={{ fontWeight: 800, fontSize: "1.2rem", fontFamily: "var(--font-display)" }}>{activePageLabel}</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--color-text-muted)" }}>
             <LogOut size={20} />
          </button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, border: "2px solid var(--color-border-bright)" }}>
            {user?.name?.[0]}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: sidebarOpen ? 260 : 72,
          minHeight: "100vh",
          background: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 1100,
          overflowX: "hidden",
        }}
      >
        {/* Logo & Toggle */}
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.75rem", minHeight: 68 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🏸</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>HBL Auction</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Admin Panel</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex" }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: active ? "white" : "var(--color-text-secondary)",
                  background: active ? "var(--color-primary)" : "transparent",
                  boxShadow: active ? "var(--shadow-glow-primary)" : "none",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>{user?.name?.[0]}</div>
          {sidebarOpen && (
            <>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Admin</div>
              </div>
              <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><LogOut size={16} /></button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", position: "relative" }} className="admin-main-content">
        <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav mobile-only">
        {NAV.slice(0, 5).map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} className={`bottom-nav-item ${active ? "active" : ""}`}>
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .admin-main-content { 
            padding-top: 64px !important; 
            padding-bottom: calc(var(--mobile-nav-height) + 2rem) !important;
          }
          .admin-main-content > div { padding: 1.25rem !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
