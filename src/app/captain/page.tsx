"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { Gavel, Users, Trophy, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function CaptainPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "captain") router.push("/login");
  }, [user, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    toast.success("Logged out");
    router.push("/login");
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Premium Header */}
      <div style={{ 
        padding: "2.5rem 1.5rem", 
        background: `linear-gradient(180deg, rgba(99,102,241,0.1) 0%, rgba(10,11,15,0) 100%), url("/bg.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderBottom: "1px solid var(--color-border)",
        position: "relative"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(10, 11, 15, 0.6)", backdropFilter: "blur(2px)" }} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
             <h2 style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Welcome back</h2>
             <h1 style={{ fontSize: "1.75rem", fontWeight: 900 }}>Capt. {user?.name.split(" ")[0]}</h1>
          </div>
          <button onClick={logout} className="btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: "50%", color: "var(--color-danger)", borderColor: "rgba(239,68,68,0.2)" }}>
            <LogOut size={18} />
          </button>
        </div>

        {/* Team Quick Info Card */}
        <div className="card-elevated animate-slide-up" style={{ padding: "1.25rem", background: "var(--color-bg-surface)", position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", right: "-10%", top: "-10%", opacity: 0.1 }}>
              <Trophy size={100} color="var(--color-accent)" />
           </div>
           <div style={{ position: "relative", zIndex: 1 }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-accent)" }}>{user?.hostel}</h3>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                 <div>
                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Current Roster</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 900 }}>8 Players</div>
                 </div>
                 <div style={{ width: 1, background: "var(--color-border)", margin: "0.25rem 0" }} />
                 <div>
                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Remaining Purse</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--color-success)" }}>₹845</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div style={{ padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 800, marginBottom: "1.25rem", fontSize: "1rem" }}>Quick Access</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {[
            { 
              href: "/captain/auction", 
              icon: Gavel, 
              title: "Live Auction Hall", 
              desc: "Join the room and start bidding", 
              color: "var(--color-accent)",
              bg: "rgba(245, 158, 11, 0.1)"
            },
            { 
              href: "/captain/team", 
              icon: Trophy, 
              title: "Manage My Team", 
              desc: "View your roster and spendings", 
              color: "var(--color-primary)",
              bg: "rgba(99, 102, 241, 0.1)"
            },
            { 
              href: "/captain/standings", 
              icon: Users, 
              title: "League Standings", 
              desc: "Check other teams progress", 
              color: "var(--color-success)",
              bg: "rgba(16, 185, 129, 0.1)"
            },
          ].map(({ href, icon: Icon, title, desc, color, bg }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className="mobile-card-item" style={{ padding: "1.25rem", background: "var(--color-bg-card)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "var(--radius-lg)", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={26} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.25rem", color: "white" }}>{title}</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>{desc}</p>
                </div>
                <ChevronRight size={20} color="var(--color-text-muted)" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
